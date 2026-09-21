from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction


class Sede(models.Model):
    id_slug = models.SlugField(max_length=50, unique=True, help_text="Ej: barcelona-centro, lecheria-plaza")
    nombre = models.CharField(max_length=150)
    direccion = models.TextField()
    tiempo_estimado = models.CharField(max_length=30, default='10-15 MIN')
    distancia = models.CharField(max_length=30, default='1.2 km')
    activa = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'sede'
        verbose_name_plural = 'sedes'

    def __str__(self):
        return self.nombre


class Repartidor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=30)
    vehiculo = models.CharField(max_length=100, default='Moto Bera - Placa AB123C')
    calificacion = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    foto_url = models.URLField(max_length=500, blank=True, null=True)
    latitud_actual = models.FloatField(default=10.1333)
    longitud_actual = models.FloatField(default=-64.7000)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'repartidor'
        verbose_name_plural = 'repartidores'

    def __str__(self):
        return f'{self.nombre} ({self.vehiculo})'


class TasaCambio(models.Model):
    valor_bs = models.DecimalField(max_digits=14, decimal_places=6)
    es_activa = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-fecha',)
        verbose_name = 'tasa de cambio'
        verbose_name_plural = 'tasas de cambio'

    def __str__(self):
        return f'1 USD = {self.valor_bs} Bs'

    @classmethod
    def obtener_tasa_activa(cls):
        return cls.objects.filter(es_activa=True).order_by('-fecha').first()

    def clean(self):
        if self.valor_bs <= Decimal('0'):
            raise ValidationError({'valor_bs': 'La tasa debe ser mayor que cero.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        with transaction.atomic():
            if self.es_activa:
                type(self).objects.filter(es_activa=True).exclude(pk=self.pk).update(es_activa=False)
            return super().save(*args, **kwargs)


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ('nombre',)
        verbose_name = 'categoría'
        verbose_name_plural = 'categorías'

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='productos')
    stock = models.PositiveIntegerField(default=0)
    precio_usd = models.DecimalField(max_digits=10, decimal_places=2)
    precio_anterior_usd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    descuento_porcentaje = models.IntegerField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    imagen = models.URLField(max_length=500, blank=True, null=True)
    
    # Sedes donde el producto tiene stock / disponibilidad
    sedes = models.ManyToManyField(Sede, related_name='productos', blank=True)

    class Meta:
        ordering = ('nombre',)
        verbose_name = 'producto'
        verbose_name_plural = 'productos'

    def __str__(self):
        return self.nombre

    @property
    def precio_bs(self):
        tasa = TasaCambio.obtener_tasa_activa()
        if tasa is None:
            raise TasaCambio.DoesNotExist('No existe una tasa de cambio activa configurada.')
        return (self.precio_usd * tasa.valor_bs).quantize(Decimal('0.01'))


class Maridaje(models.Model):
    class TipoMaridaje(models.TextChoices):
        CHOCOLATE = 'chocolate', 'Chocolate / Dulces'
        HUMO = 'humo', 'Humo'
        FRITURAS = 'frituras', 'Frituras / Pasapalos'
        FRUTOS_SECOS = 'frutos_secos', 'Frutos Secos'

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='maridajes')
    tipo = models.CharField(max_length=30, choices=TipoMaridaje.choices)
    nombre = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'maridaje'
        verbose_name_plural = 'maridajes'

    def __str__(self):
        return f'{self.nombre} ({self.tipo}) - {self.producto.nombre}'


class Pedido(models.Model):
    class MetodoPago(models.TextChoices):
        PAGO_MOVIL = 'PAGO_MOVIL', 'Pago móvil'
        ZELLE = 'ZELLE', 'Zelle'
        EFECTIVO = 'EFECTIVO', 'Efectivo USD'

    class Estado(models.TextChoices):
        RECIBIDO = 'RECIBIDO', 'Recibido'
        PREPARANDO = 'PREPARANDO', 'Preparando'
        EN_CAMINO = 'EN_CAMINO', 'En camino'
        ENTREGADO = 'ENTREGADO', 'Entregado'
        CANCELADO = 'CANCELADO', 'Cancelado'

    # Sede desde la que se despacho el pedido
    sede = models.ForeignKey(Sede, on_delete=models.PROTECT, related_name='pedidos', null=True, blank=True)
    
    nombre_cliente = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30)
    direccion_entrega = models.TextField()
    referencia_ubicacion = models.TextField(blank=True)
    monto_total_usd = models.DecimalField(max_digits=12, decimal_places=2)
    tasa_cambio_usada = models.DecimalField(max_digits=14, decimal_places=6)
    monto_total_bs = models.DecimalField(max_digits=16, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.RECIBIDO)
    tiempo_estimado = models.CharField(max_length=30, default='15-25 MIN')
    
    repartidor = models.ForeignKey(Repartidor, on_delete=models.SET_NULL, null=True, blank=True, related_name='pedidos')
    latitud_destino = models.FloatField(null=True, blank=True)
    longitud_destino = models.FloatField(null=True, blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-fecha_creacion',)

    def __str__(self):
        return f'Pedido #{self.pk} - {self.nombre_cliente}'


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='detalles_pedido')
    cantidad = models.PositiveIntegerField(default=1)

    precio_unitario_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    def save(self, *args, **kwargs):
        if self.precio_unitario_usd is None and self.producto_id:
            self.precio_unitario_usd = self.producto.precio_usd
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('pedido', 'producto'),
                name='detalle_producto_unico_por_pedido',
            )
        ]

    def __str__(self):
        return f'{self.cantidad} x {self.producto.nombre}'


class ComprobantePago(models.Model):
    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name='comprobante',
        null=True,
        blank=True,
    )
    numero_referencia = models.CharField(max_length=100)
    banco_origen = models.CharField(max_length=100)
    monto_pagado_bs = models.DecimalField(max_digits=16, decimal_places=2)
    captura_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f'Comprobante {self.numero_referencia}'