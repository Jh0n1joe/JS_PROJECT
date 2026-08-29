from django.contrib import admin
from .models import Categoria, ComprobantePago, DetallePedido, Pedido, Producto, TasaCambio

admin.site.register(TasaCambio)
admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(ComprobantePago)

# Register your models here.
