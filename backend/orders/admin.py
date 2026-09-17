from django.contrib import admin
from django.contrib import messages
from .models import Categoria, ComprobantePago, DetallePedido, Maridaje, Pedido, Producto, TasaCambio

admin.site.register(TasaCambio)
admin.site.register(Categoria)
admin.site.register(ComprobantePago)


# --- INLINE Y ADMIN PARA PRODUCTO ---
class MaridajeInline(admin.TabularInline):
    model = Maridaje
    extra = 1  # Fila vacía para agregar un nuevo maridaje rápidamente


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio_usd', 'stock', 'activo')
    list_filter = ('categoria', 'activo')
    search_fields = ('nombre', 'descripcion')
    inlines = [MaridajeInline]


# --- INLINE Y ADMIN PARA PEDIDO ---
class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1
    # Dejamos editable el precio por si se quiere ajustar o ver, pero se rellenará solo al guardar
    fields = ('producto', 'cantidad', 'precio_unitario_usd')


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    inlines = [DetallePedidoInline]

    list_display = ('id', 'nombre_cliente', 'estado', 'monto_total_usd', 'monto_total_bs', 'metodo_pago', 'fecha_creacion')
    list_filter = ('estado', 'metodo_pago', 'fecha_creacion')
    search_fields = ('nombre_cliente', 'telefono', 'id')
    ordering = ('-fecha_creacion',)

    readonly_fields = ('monto_total_usd', 'monto_total_bs', 'tasa_cambio_usada', 'fecha_creacion')

    # Al poner solo los datos de cliente arriba, el inline de productos quedará en el medio
    # y los totales se ubicarán al final.
    fieldsets = (
        ('Información del Cliente y Estado', {
            'fields': ('nombre_cliente', 'telefono', 'direccion_entrega', 'referencia_ubicacion', 'metodo_pago', 'estado', 'fecha_creacion')
        }),
        ('Totales Calculados Automáticamente', {
            'fields': ('tasa_cambio_usada', 'monto_total_usd', 'monto_total_bs'),
        }),
    )

    def save_related(self, request, form, formsets, change):
        """
        Garantiza que primero se guarden el Pedido y los Productos sin dar Error 500,
        y luego calcula los totales automáticamente.
        """
        # 1. Guarda los inlines (DetallePedido) primero
        super().save_related(request, form, formsets, change)

        pedido = form.instance
        
        # 2. Asignar Tasa de Cambio
        tasa = TasaCambio.objects.filter(es_activa=True).order_by('-id').first()
        if tasa:
            pedido.tasa_cambio_usada = tasa.valor_bs
        else:
            pedido.tasa_cambio_usada = pedido.tasa_cambio_usada or 0

        # 3. Recorrer los productos guardados para fijar precio unitario y calcular total
        total_usd = 0
        for detalle in pedido.detalles.all():
            if detalle.producto:
                # Asigna el precio del producto si no se ingresó uno manual
                if not detalle.precio_unitario_usd:
                    detalle.precio_unitario_usd = getattr(detalle.producto, 'precio_usd', 0) or getattr(detalle.producto, 'precio', 0) or 0
                    detalle.save()
                total_usd += detalle.precio_unitario_usd * detalle.cantidad

        # 4. Actualizar totales del pedido
        pedido.monto_total_usd = total_usd
        pedido.monto_total_bs = total_usd * pedido.tasa_cambio_usada
        pedido.save()