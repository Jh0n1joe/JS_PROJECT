from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models, transaction


class TasaCambio(models.Model):
	valor_bs = models.DecimalField(max_digits=14, decimal_places=6)
	es_activa = models.BooleanField(default=False)
	fecha = models.DateTimeField(auto_now_add=True)
	fecha_registro = models.DateTimeField(auto_now_add=True)

	@classmethod
	def obtener_tasa_activa(cls):
		# Retorna la tasa de cambio activa más reciente
		return cls.objects.filter(es_activa=True).order_by('-fecha').first()

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
	categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='productos')
	stock = models.PositiveIntegerField(default=0)
	precio_usd = models.DecimalField(max_digits=10, decimal_places=2)
	activo = models.BooleanField(default=True)
	imagen = models.URLField(max_length=500, blank=True, null=True)

	def __str__(self):
		return self.nombre

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


class Pedido(models.Model):
	class MetodoPago(models.TextChoices):
		PAGO_MOVIL = 'PAGO_MOVIL', 'Pago móvil'
		EFECTIVO = 'EFECTIVO', 'Efectivo'

	class Estado(models.TextChoices):
		PENDIENTE = 'PENDIENTE', 'Pendiente'
		CONFIRMADO = 'CONFIRMADO', 'Confirmado'
		EN_CAMINO = 'EN_CAMINO', 'En camino'
		ENTREGADO = 'ENTREGADO', 'Entregado'
		CANCELADO = 'CANCELADO', 'Cancelado'

	nombre_cliente = models.CharField(max_length=150)
	telefono = models.CharField(max_length=30)
	direccion_entrega = models.TextField()
	referencia_ubicacion = models.TextField(blank=True)
	monto_total_usd = models.DecimalField(max_digits=12, decimal_places=2)
	tasa_cambio_usada = models.DecimalField(max_digits=14, decimal_places=6)
	monto_total_bs = models.DecimalField(max_digits=16, decimal_places=2)
	metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices)
	estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
	fecha_creacion = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ('-fecha_creacion',)

	def __str__(self):
		return f'Pedido #{self.pk} - {self.nombre_cliente}'


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    # Permitir que en el formulario quede vacío temporalmente
    precio_unitario_usd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    def save(self, *args, **kwargs):
        # Si no se colocó un precio manual, asigna el precio actual del producto
        if not self.precio_unitario_usd and self.producto:
            self.precio_unitario_usd = getattr(self.producto, 'precio_usd', 0) or getattr(self.producto, 'precio', 0)
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['pedido', 'producto'], name='detalle_producto_unico')
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
from django.db import models

# Create your models here.
