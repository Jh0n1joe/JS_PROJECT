from decimal import Decimal, InvalidOperation

import requests
from bs4 import BeautifulSoup


BCV_URL = 'https://www.bcv.org.ve/'


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