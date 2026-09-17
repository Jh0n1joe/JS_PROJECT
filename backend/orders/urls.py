from django.urls import path
from .views import CrearPedidoView, ProductoListView, TasaCambioView

urlpatterns = [
    path('tasa/', TasaCambioView.as_view(), name='tasa-activa'),
    path('tasa/actualizar-bcv/', TasaCambioView.as_view(), name='tasa-actualizar-bcv'),
    path('productos/', ProductoListView.as_view(), name='productos-activos'),
    # Esta ruta maneja POST (crear) y GET (listar historial)
    path('pedidos/', CrearPedidoView.as_view(), name='pedidos-list-create'),
]