from django.urls import path
from .views import CrearPedidoView, ProductoListView, TasaCambioView

urlpatterns = [
    path('tasa/', TasaCambioView.as_view(), name='tasa-activa'),
    path('tasa/actualizar-bcv/', TasaCambioView.as_view(), name='tasa-actualizar-bcv'),
    path('productos/', ProductoListView.as_view(), name='productos-activos'),
    path('pedidos/', CrearPedidoView.as_view(), name='crear-pedido'),
]