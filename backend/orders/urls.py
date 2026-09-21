from django.urls import path
from .views import (
    CrearPedidoView,
    PedidoDetalleView,
    ProductoListView,
    SedeListView,  # <-- Importamos la nueva vista de sedes
    TasaCambioView,
)

urlpatterns = [
    path('sedes/', SedeListView.as_view(), name='sedes-activas'),  # <-- Nueva ruta agregada
    path('tasa/', TasaCambioView.as_view(), name='tasa-activa'),
    path('tasa/actualizar-bcv/', TasaCambioView.as_view(), name='tasa-actualizar-bcv'),
    path('productos/', ProductoListView.as_view(), name='productos-activos'),
    path('pedidos/', CrearPedidoView.as_view(), name='pedidos-list-create'),
    path('pedidos/<int:pk>/', PedidoDetalleView.as_view(), name='pedido-detalle'),
]