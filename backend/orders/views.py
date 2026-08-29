from decimal import Decimal

from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ComprobantePago, DetallePedido, Pedido, Producto, TasaCambio
from .serializers import PedidoCreateSerializer, PedidoSerializer, ProductoSerializer, TasaCambioSerializer
from .services import enviar_notificacion_telegram, obtener_tasa_bcv


class TasaCambioView(APIView):
	def get(self, request):
		tasa = TasaCambio.obtener_tasa_activa()
		if tasa is None:
			return Response(
				{'detail': 'No existe una tasa de cambio activa configurada.'},
				status=503,
			)
		return Response(TasaCambioSerializer(tasa).data)

	def post(self, request):
		try:
			valor_bs = obtener_tasa_bcv()
			tasa = TasaCambio.objects.create(valor_bs=valor_bs, es_activa=True)
		except Exception as exc:
			return Response({'detail': f'No se pudo actualizar la tasa desde el BCV: {exc}'}, status=500)
		return Response(TasaCambioSerializer(tasa).data, status=201)


class ProductoListView(APIView):
	def get(self, request):
		productos = Producto.objects.filter(activo=True).select_related('categoria')
		if TasaCambio.obtener_tasa_activa() is None:
			return Response(
				{'detail': 'No existe una tasa de cambio activa configurada.'},
				status=503,
			)
		return Response(ProductoSerializer(productos, many=True).data)


class CrearPedidoView(APIView):
	def post(self, request):
		serializer = PedidoCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		with transaction.atomic():
			tasa = TasaCambio.obtener_tasa_activa()
			if tasa is None:
				return Response({'detail': 'No existe una tasa de cambio activa configurada.'}, status=400)

			items = data.pop('items')
			comprobante_data = data.pop('comprobante', None)
			productos = {}
			for item in items:
				producto = Producto.objects.select_for_update().filter(
					pk=item['producto_id'], activo=True,
				).first()
				if producto is None:
					return Response({'detail': f"El producto {item['producto_id']} no existe o está inactivo."}, status=400)
				if producto.stock < item['cantidad']:
					return Response(
						{'detail': f'Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}.'},
						status=400,
					)
				productos[producto.pk] = (producto, item['cantidad'])

			monto_total_usd = sum(
				(producto.precio_usd * cantidad for producto, cantidad in productos.values()),
				Decimal('0'),
			)
			pedido = Pedido.objects.create(
				monto_total_usd=monto_total_usd,
				tasa_cambio_usada=tasa.valor_bs,
				monto_total_bs=(monto_total_usd * tasa.valor_bs).quantize(Decimal('0.01')),
				**data,
			)
			for producto, cantidad in productos.values():
				DetallePedido.objects.create(
					pedido=pedido,
					producto=producto,
					cantidad=cantidad,
					precio_unitario_usd=producto.precio_usd,
				)
				producto.stock -= cantidad
				producto.save(update_fields=('stock',))
			if comprobante_data is not None:
				ComprobantePago.objects.create(pedido=pedido, **comprobante_data)
			respuesta = Response(PedidoSerializer(pedido).data, status=201)

		transaction.on_commit(lambda: enviar_notificacion_telegram(pedido))
		return respuesta

# Create your views here.
