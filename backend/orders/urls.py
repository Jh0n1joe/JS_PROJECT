from django.urls import path
from .views import (
    CrearPedidoView,
    CrearProductoView,
    LoginView,
    PedidoDetalleView,
    ProductoListView,
    RegistroView,
    SedeListView,
    TasaCambioView,
)

urlpatterns = [
    path('sedes/', SedeListView.as_view(), name='sedes-activas'),
    path('tasa/', TasaCambioView.as_view(), name='tasa-activa'),
    path('tasa/actualizar-bcv/', TasaCambioView.as_view(), name='tasa-actualizar-bcv'),
    path('productos/', ProductoListView.as_view(), name='productos-activos'),
    path('productos/crear/', CrearProductoView.as_view(), name='crear-producto'),
    path('pedidos/', CrearPedidoView.as_view(), name='pedidos-list-create'),
    path('pedidos/<int:pk>/', PedidoDetalleView.as_view(), name='pedido-detalle'),
    path('login/', LoginView.as_view(), name='login'),
    path('registro/', RegistroView.as_view(), name='registro'),
]