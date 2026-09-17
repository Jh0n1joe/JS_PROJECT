from django.urls import path
from .views import CrearPedidoView, PedidoDetalleView, ProductoListView, TasaCambioView

urlpatterns = [
    path('tasa/', TasaCambioView.as_view(), name='tasa-activa'),
    path('tasa/actualizar-bcv/', TasaCambioView.as_view(), name='tasa-actualizar-bcv'),
    path('productos/', ProductoListView.as_view(), name='productos-activos'),
    path('pedidos/', CrearPedidoView.as_view(), name='pedidos-list-create'),
    path('pedidos/<int:pk>/', PedidoDetalleView.as_view(), name='pedido-detalle'),  # <-- Nueva ruta agregada
]