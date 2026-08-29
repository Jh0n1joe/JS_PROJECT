from rest_framework import serializers

from .models import Categoria, ComprobantePago, DetallePedido, Pedido, Producto, TasaCambio


class TasaCambioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasaCambio
        fields = ('id', 'valor_bs', 'es_activa', 'fecha', 'fecha_registro')


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre')


class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(source='categoria.nombre', read_only=True)
    precio_bs = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'categoria', 'stock', 'precio_usd', 'precio_bs')


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto = serializers.IntegerField(source='producto_id', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal_usd = serializers.SerializerMethodField()

    class Meta:
        model = DetallePedido
        fields = ('id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario_usd', 'subtotal_usd')

    def get_subtotal_usd(self, obj):
        return obj.precio_unitario_usd * obj.cantidad


class ComprobantePagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComprobantePago
        fields = ('numero_referencia', 'banco_origen', 'monto_pagado_bs', 'captura_url')


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    comprobante = ComprobantePagoSerializer(read_only=True)

    class Meta:
        model = Pedido
        fields = (
            'id', 'nombre_cliente', 'telefono', 'direccion_entrega', 'referencia_ubicacion',
            'monto_total_usd', 'tasa_cambio_usada', 'monto_total_bs', 'metodo_pago',
            'estado', 'fecha_creacion', 'detalles', 'comprobante',
        )


class PedidoCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True)
    comprobante = ComprobantePagoSerializer(required=False, write_only=True)

    class Meta:
        model = Pedido
        fields = (
            'nombre_cliente', 'telefono', 'direccion_entrega', 'referencia_ubicacion',
            'metodo_pago', 'items', 'comprobante',
        )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('El pedido debe incluir al menos un producto.')
        productos = []
        for item in value:
            producto_id = item.get('producto_id')
            cantidad = item.get('cantidad')
            if not isinstance(producto_id, int) or not isinstance(cantidad, int) or cantidad <= 0:
                raise serializers.ValidationError(
                    'Cada ítem debe tener producto_id entero y cantidad mayor que cero.'
                )
            productos.append(producto_id)
        if len(productos) != len(set(productos)):
            raise serializers.ValidationError('No repitas el mismo producto en un pedido.')
        return value

    def validate(self, attrs):
        metodo_pago = attrs['metodo_pago']
        if metodo_pago == Pedido.MetodoPago.PAGO_MOVIL and 'comprobante' not in attrs:
            raise serializers.ValidationError({'comprobante': 'Es obligatorio para Pago Móvil.'})
        if metodo_pago == Pedido.MetodoPago.EFECTIVO and 'comprobante' in attrs:
            raise serializers.ValidationError({'comprobante': 'Solo aplica para Pago Móvil.'})
        return attrs