from django.contrib import admin, messages
# 1. Agregamos 'Sede' a las importaciones
from .models import Categoria, ComprobantePago, DetallePedido, Maridaje, Pedido, Producto, Repartidor, Sede, TasaCambio

admin.site.register(TasaCambio)
admin.site.register(Categoria)
admin.site.register(ComprobantePago)


# --- ADMIN PARA SEDE ---
@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'id_slug', 'direccion', 'tiempo_estimado', 'activa')
    list_filter = ('activa',)
    search_fields = ('nombre', 'id_slug')


# --- ADMIN PARA REPARTIDOR ---
@admin.register(Repartidor)
class RepartidorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'vehiculo', 'telefono', 'calificacion', 'activo')
    list_filter = ('activo', 'vehiculo')
    search_fields = ('nombre', 'telefono')


# --- INLINE Y ADMIN PARA PRODUCTO ---
class MaridajeInline(admin.TabularInline):
    model = Maridaje
    extra = 1  # Fila vacía para agregar un nuevo maridaje rápidamente


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio_usd', 'stock', 'activo')
    list_filter = ('categoria', 'activo', 'sedes')
    search_fields = ('nombre', 'descripcion')
    inlines = [MaridajeInline]
    # Activa la interfaz con dos columnas (Disponibles / Elegidas) para las Sedes
    filter_horizontal = ('sedes',)


# --- INLINE Y ADMIN PARA PEDIDO ---
class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1
    fields = ('producto', 'cantidad', 'precio_unitario_usd')


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    inlines = [DetallePedidoInline]

    list_display = (
        'id', 
        'nombre_cliente', 
        'estado', 
        'tiempo_estimado', 
        'repartidor', 
        'monto_total_usd', 
        'monto_total_bs', 
        'metodo_pago', 
        'fecha_creacion'
    )
    # Permite cambiar el estado, tiempo estimado y repartidor directamente desde la lista
    list_editable = ('estado', 'tiempo_estimado', 'repartidor')
    list_filter = ('estado', 'metodo_pago', 'fecha_creacion', 'repartidor')
    search_fields = ('nombre_cliente', 'telefono', 'id')
    ordering = ('-fecha_creacion',)

    readonly_fields = ('monto_total_usd', 'monto_total_bs', 'tasa_cambio_usada', 'fecha_creacion')

    fieldsets = (
        ('Información del Cliente y Estado', {
            'fields': (
                'nombre_cliente', 
                'telefono', 
                'direccion_entrega', 
                'referencia_ubicacion', 
                'metodo_pago', 
                'estado', 
                'fecha_creacion'
            )
        }),
        ('Asignación de Delivery y Tracking', {
            'fields': ('repartidor', 'tiempo_estimado'),
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
        super().save_related(request, form, formsets, change)

        pedido = form.instance
        
        # 1. Asignar Tasa de Cambio si aún no posee una
        if not pedido.tasa_cambio_usada:
            tasa = TasaCambio.objects.filter(es_activa=True).order_by('-id').first()
            pedido.tasa_cambio_usada = tasa.valor_bs if tasa else 0

        # 2. Recorrer los productos guardados para fijar precio unitario y calcular total
        total_usd = 0
        for detalle in pedido.detalles.all():
            if detalle.producto:
                if not detalle.precio_unitario_usd:
                    detalle.precio_unitario_usd = getattr(detalle.producto, 'precio_usd', 0) or getattr(detalle.producto, 'precio', 0) or 0
                    detalle.save()
                total_usd += detalle.precio_unitario_usd * detalle.cantidad

        # 3. Actualizar totales del pedido
        pedido.monto_total_usd = total_usd
        pedido.monto_total_bs = total_usd * pedido.tasa_cambio_usada
        pedido.save()