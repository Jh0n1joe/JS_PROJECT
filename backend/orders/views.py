from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Producto, TasaCambio
from .serializers import PedidoCreateSerializer, PedidoSerializer, ProductoSerializer
from .services import enviar_notificacion_telegram, obtener_tasa_bcv


class TasaCambioView(APIView):
    def get(self, request):
        tasa = TasaCambio.obtener_tasa_activa()
        
        if tasa is None:
            # En lugar de fallar con 503, se retorna una respuesta válida
            # o una tasa de respaldo para no bloquear la interfaz del cliente.
            return Response({
                'tasa': 36.50,
                'fecha_actualizacion': None
            }, status=200)

        # Devolvemos explícitamente la clave 'tasa' con un tipo float/decimal
        # para asegurar compatibilidad exacta con la interfaz Frontend (TasaCambio)
        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=200)

    def post(self, request):
        try:
            valor_bs = obtener_tasa_bcv()
            tasa = TasaCambio.objects.create(valor_bs=valor_bs, es_activa=True)
        except Exception as exc:
            return Response({'detail': f'No se pudo actualizar la tasa desde el BCV: {exc}'}, status=500)
        
        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=201)


class ProductoListView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(activo=True).select_related('categoria')
        
        tasa = TasaCambio.obtener_tasa_activa()
        if tasa is None:
            return Response(
                {'detail': 'No existe una tasa de cambio activa configurada en la base de datos.'},
                status=503,
            )
        
        return Response(ProductoSerializer(productos, many=True).data)


class CrearPedidoView(APIView):
    def post(self, request):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            pedido = serializer.save()
            respuesta = Response(PedidoSerializer(pedido).data, status=201)

        # Enviar notificación asíncrona una vez confirmada la transacción
        transaction.on_commit(lambda: enviar_notificacion_telegram(pedido))
        
        return respuesta