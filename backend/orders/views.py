from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Pedido, Producto, Sede, TasaCambio
from .serializers import (
    PedidoCreateSerializer,
    PedidoSerializer,
    ProductoSerializer,
    SedeSerializer,
)
from .services import enviar_notificacion_telegram, obtener_tasa_bcv


# --- VISTA PARA SEDES ---
class SedeListView(APIView):
    """
    Retorna la lista de sedes activas para consumirlas desde el frontend.
    """
    def get(self, request):
        sedes = Sede.objects.filter(activa=True)
        return Response(SedeSerializer(sedes, many=True).data, status=status.HTTP_200_OK)


class TasaCambioView(APIView):
    def get(self, request):
        tasa = TasaCambio.obtener_tasa_activa()
        
        if tasa is None:
            return Response({
                'tasa': 36.50,
                'fecha_actualizacion': None
            }, status=status.HTTP_200_OK)

        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            valor_bs = obtener_tasa_bcv()
            tasa = TasaCambio.objects.create(valor_bs=valor_bs, es_activa=True)
        except Exception as exc:
            return Response({'detail': f'No se pudo actualizar la tasa desde el BCV: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=status.HTTP_200_OK)


class ProductoListView(APIView):
    def get(self, request):
        # Se agrega .prefetch_related('sedes') para que el ProductoSerializer arme 'sedes_disponibles' sin hacer N+1 queries
        productos = Producto.objects.filter(activo=True).select_related('categoria').prefetch_related('maridajes', 'sedes')
        
        tasa = TasaCambio.obtener_tasa_activa()
        if tasa is None:
            return Response(
                {'detail': 'No existe una tasa de cambio activa configurada en la base de datos.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        return Response(
            ProductoSerializer(
                productos,
                many=True,
                context={'request': request},
            ).data
        )


class CrearPedidoView(APIView):
    """
    Soporta GET (listar pedidos con relaciones optimizadas) 
    y POST (crear nuevo pedido).
    """
    def get(self, request):
        pedidos = Pedido.objects.all().select_related('repartidor', 'comprobante', 'sede').prefetch_related('detalles__producto').order_by('-id')
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            pedido = serializer.save()
            respuesta = Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

        transaction.on_commit(lambda: enviar_notificacion_telegram(pedido))
        
        return respuesta


class PedidoDetalleView(APIView):
    """
    Permite obtener o actualizar un pedido específico por ID (/api/pedidos/<pk>/)
    ideal para la vista de tracking individual.
    """
    def get(self, request, pk):
        try:
            pedido = Pedido.objects.select_related('repartidor', 'comprobante', 'sede').prefetch_related('detalles__producto').get(pk=pk)
        except Pedido.DoesNotExist:
            return Response({'detail': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data, status=status.HTTP_200_OK)