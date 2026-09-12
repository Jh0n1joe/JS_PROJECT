from decimal import Decimal, InvalidOperation
import logging
from html import escape
import os

import requests
from bs4 import BeautifulSoup
from django.conf import settings


BCV_URL = 'https://www.bcv.org.ve/'
logger = logging.getLogger(__name__)

def obtener_tasa_bcv():
 """Obtiene el tipo de cambio USD/VES publicado por el BCV."""
 try:
  response = requests.get(
   BCV_URL,
   headers={'User-Agent': 'Mozilla/5.0'},
   timeout=15,
  )
  response.raise_for_status()
 except requests.RequestException as exc:
  raise RuntimeError(f'No fue posible consultar el BCV: {exc}') from exc

 soup = BeautifulSoup(response.text, 'html.parser')
 valor_element = soup.select_one('#dolar .centrado strong, #dolar strong')
 if valor_element is None:
  raise RuntimeError('No se encontró la tasa del dólar en la respuesta del BCV.')

 valor_texto = valor_element.get_text(strip=True).replace('Bs.', '').replace('Bs', '').strip()
 if ',' in valor_texto:
  valor_texto = valor_texto.replace('.', '').replace(',', '.')
 else:
  valor_texto = valor_texto.replace(' ', '')
 try:
  valor = Decimal(valor_texto)
 except InvalidOperation as exc:
  raise RuntimeError(f'La tasa recibida desde el BCV no es válida: {valor_texto}') from exc
 if valor <= 0:
  raise RuntimeError('El BCV devolvió una tasa no válida.')
 return valor


def enviar_notificacion_telegram(pedido):
 """Notifica un pedido confirmado sin afectar su persistencia si Telegram falla."""
 token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
 chat_id = getattr(settings, 'TELEGRAM_CHAT_ID', '')
 token = token or os.getenv('TELEGRAM_BOT_TOKEN', '')
 chat_id = chat_id or os.getenv('TELEGRAM_CHAT_ID', '')
 if not token or not chat_id:
  logger.warning('Telegram no configurado; se omite la notificación del pedido %s.', pedido.pk)
  return False

 detalles = pedido.detalles.select_related('producto').all()
 lineas = [
  f'{detalle.cantidad} x {escape(detalle.producto.nombre)} = '
  f'{detalle.precio_unitario_usd * detalle.cantidad:.2f} USD'
  for detalle in detalles
 ]
 comprobante = ''
 if pedido.metodo_pago == pedido.MetodoPago.PAGO_MOVIL:
  pago = getattr(pedido, 'comprobante', None)
  if pago:
   comprobante = (
    f'\n<b>Comprobante:</b> {escape(pago.banco_origen)} | '
    f'Referencia: {escape(pago.numero_referencia)}'
   )

 mensaje = (
  f'<b>NUEVO PEDIDO #{pedido.pk}</b>\n'
  f'<b>Fecha:</b> {pedido.fecha_creacion:%d/%m/%Y %H:%M}\n\n'
  f'<b>Cliente:</b> {escape(pedido.nombre_cliente)}\n'
  f'<b>Teléfono:</b> {escape(pedido.telefono)}\n'
  f'<b>Dirección:</b> {escape(pedido.direccion_entrega)}\n'
  f'<b>Referencia:</b> {escape(pedido.referencia_ubicacion or "N/A")}\n\n'
  f'<b>Productos:</b>\n{"\n".join(lineas)}\n\n'
  f'<b>Total USD:</b> {pedido.monto_total_usd:.2f}\n'
  f'<b>Total Bs:</b> {pedido.monto_total_bs:.2f}\n'
  f'<b>Tasa usada:</b> {pedido.tasa_cambio_usada:.6f}\n'
  f'<b>Método de pago:</b> {pedido.get_metodo_pago_display()}'
  f'{comprobante}'
 )

 try:
  response = requests.post(
   f'https://api.telegram.org/bot{token}/sendMessage',
   json={'chat_id': chat_id, 'text': mensaje, 'parse_mode': 'HTML'},
   timeout=10,
  )
  response.raise_for_status()
  return True
 except Exception:
  logger.exception('Falló la notificación Telegram del pedido %s.', pedido.pk)
  return False