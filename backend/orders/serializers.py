from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import (
    Categoria,
    ComprobantePago,
    DetallePedido,
    Maridaje,
    Pedido,
    Producto,
    Repartidor,
    Sede,
    TasaCambio,
)


class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = ('id', 'id_slug', 'nombre', 'direccion', 'tiempo_estimado', 'distancia', 'activa')


class TasaCambioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasaCambio
        fields = ('id', 'valor_bs', 'es_activa', 'fecha', 'fecha_registro')


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre')


class MaridajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maridaje
        fields = ('id', 'tipo', 'nombre')


class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(source='categoria.nombre', read_only=True)
    precio_bs = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    maridajes = MaridajeSerializer(many=True, read_only=True)
    # Devuelve la lista de slugs de las sedes asociadas al producto (ej: ['barcelona-centro', 'lecheria-plaza'])
    sedes_disponibles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        source='sedes',
        slug_field='id_slug',
    )

    class Meta:
        model = Producto
        fields = (
            'id',
            'nombre',
            'descripcion',
            'categoria',
            'stock',
            'precio_usd',
            'precio_bs',
            'precio_anterior_usd',
            'descuento_porcentaje',
            'imagen',
            'maridajes',
            'sedes_disponibles',
        )


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
    captura_url = serializers.CharField(read_only=True, required=False, allow_null=True)

    class Meta:
        model = ComprobantePago
        fields = ('numero_referencia', 'banco_origen', 'monto_pagado_bs', 'captura_url')


class RepartidorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repartidor
        fields = (
            'id',
            'nombre',
            'telefono',
            'vehiculo',
            'calificacion',
            'foto_url',
            'latitud_actual',
            'longitud_actual',
        )


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    comprobante = ComprobantePagoSerializer(read_only=True)
    repartidor = RepartidorSerializer(read_only=True)
    sede = SedeSerializer(read_only=True)

    class Meta:
        model = Pedido
        fields = (
            'id',
            'sede',
            'nombre_cliente',
            'telefono',
            'direccion_entrega',
            'referencia_ubicacion',
            'monto_total_usd',
            'tasa_cambio_usada',
            'monto_total_bs',
            'metodo_pago',
            'estado',
            'tiempo_estimado',
            'repartidor',
            'fecha_creacion',
            'detalles',
            'comprobante',
        )


class PedidoCreateSerializer(serializers.ModelSerializer):
    sede_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    items = serializers.ListField(child=serializers.DictField(), write_only=True)
    comprobante = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        write_only=True,
        max_length=4,
    )

    class Meta:
        model = Pedido
        fields = (
            'sede_id',
            'nombre_cliente',
            'telefono',
            'direccion_entrega',
            'referencia_ubicacion',
            'metodo_pago',
            'items',
            'comprobante',
        )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('El pedido debe incluir al menos un producto.')
        return value

    def validate(self, attrs):
        metodo_pago = attrs.get('metodo_pago')
        comprobante = attrs.get('comprobante')

        if metodo_pago == Pedido.MetodoPago.PAGO_MOVIL:
            if not comprobante or not comprobante.isdigit() or len(comprobante) != 4:
                raise serializers.ValidationError({
                    'comprobante': 'Para Pago Móvil debes enviar exactamente 4 dígitos numéricos.'
                })
        elif comprobante:
            raise serializers.ValidationError({
                'comprobante': 'El comprobante solo aplica al método Pago Móvil.'
            })
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        numero_comprobante = validated_data.pop('comprobante', None)
        sede_id = validated_data.pop('sede_id', None)

        with transaction.atomic():
            tasa = TasaCambio.obtener_tasa_activa()
            tasa_valor = tasa.valor_bs if tasa else Decimal('36.50')
            total_usd = Decimal('0.00')
            items_con_precio = []
            productos_vistos = set()

            for item in items_data:
                try:
                    producto_id = int(item['producto_id'])
                    cantidad = int(item['cantidad'])
                except (KeyError, TypeError, ValueError) as exc:
                    raise serializers.ValidationError(
                        'Cada ítem debe incluir producto_id y cantidad válidos.'
                    ) from exc

                if cantidad <= 0:
                    raise serializers.ValidationError('La cantidad debe ser mayor que cero.')
                if producto_id in productos_vistos:
                    raise serializers.ValidationError('No se puede repetir un producto en el pedido.')

                producto = Producto.objects.select_for_update().filter(
                    pk=producto_id, activo=True,
                ).first()
                if producto is None:
                    raise serializers.ValidationError(
                        f'El producto ID {producto_id} no existe o está inactivo.'
                    )
                if producto.stock < cantidad:
                    raise serializers.ValidationError(
                        f'Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}.'
                    )

                productos_vistos.add(producto_id)
                total_usd += producto.precio_usd * cantidad
                items_con_precio.append((producto, cantidad))

            total_bs = (total_usd * tasa_valor).quantize(Decimal('0.01'))
            
            # Obtener instancia de Sede si se envió sede_id
            sede_obj = None
            if sede_id:
                sede_obj = Sede.objects.filter(pk=sede_id, activa=True).first()

            pedido = Pedido.objects.create(
                **validated_data,
                sede=sede_obj,
                monto_total_usd=total_usd,
                tasa_cambio_usada=tasa_valor,
                monto_total_bs=total_bs,
            )

            for producto, cantidad in items_con_precio:
                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto,
                    cantidad=cantidad,
                    precio_unitario_usd=producto.precio_usd,
                )
                producto.stock -= cantidad
                producto.save(update_fields=('stock',))

            ref_str = str(numero_comprobante).strip() if numero_comprobante is not None else ''
            if ref_str:
                ComprobantePago.objects.create(
                    pedido=pedido,
                    numero_referencia=ref_str,
                    banco_origen='PAGO_MOVIL',
                    monto_pagado_bs=total_bs,
                )

            return pedido