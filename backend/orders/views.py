import json
from decimal import Decimal
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Maridaje, Pedido, Producto, Sede, TasaCambio
from .serializers import (
    PedidoCreateSerializer,
    PedidoSerializer,
    ProductoSerializer,
    SedeSerializer,
)
from .services import enviar_notificacion_telegram, obtener_tasa_bcv

User = get_user_model()


# --- VISTA PARA SEDES ---
class SedeListView(APIView):
    """
    Retorna la lista de sedes activas para consumirlas desde el frontend.
    """
    def get(self, request):
        sedes = Sede.objects.filter(activa=True)
        return Response(SedeSerializer(sedes, many=True, context={'request': request}).data, status=status.HTTP_200_OK)


class TasaCambioView(APIView):
    def get(self, request):
        tasa = TasaCambio.obtener_tasa_activa()
        
        if tasa is None:
            return Response({
                'tasa': 36.50,
                'fecha_actualizacion': None
            }, status=status.HTTP_200_OK)

        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            valor_bs = obtener_tasa_bcv()
            tasa = TasaCambio.objects.create(valor_bs=valor_bs, es_activa=True)
        except Exception as exc:
            return Response({'detail': f'No se pudo actualizar la tasa desde el BCV: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'tasa': float(tasa.valor_bs),
            'fecha_actualizacion': getattr(tasa, 'fecha_creacion', None)
        }, status=status.HTTP_200_OK)


class ProductoListView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(activo=True).select_related('categoria').prefetch_related('maridajes', 'sedes')
        
        tasa = TasaCambio.obtener_tasa_activa()
        if tasa is None:
            return Response(
                {'detail': 'No existe una tasa de cambio activa configurada en la base de datos.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        return Response(ProductoSerializer(productos, many=True, context={'request': request}).data)


# --- VISTA: CREAR PRODUCTO ---
class CrearProductoView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        data = request.data
        nombre = data.get('nombre')
        precio_usd = data.get('precio_usd')
        descripcion = data.get('descripcion', '')
        categoria_nombre = data.get('categoria', 'Licores')
        
        stock = data.get('stock', 0)
        imagen_file = request.FILES.get('imagen') or data.get('imagen')
        sede_id = data.get('sede_id')

        if not nombre or not precio_usd:
            return Response({'error': 'Nombre y precio en USD son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                categoria_obj, _ = Categoria.objects.get_or_create(nombre=categoria_nombre)

                producto = Producto.objects.create(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_usd=Decimal(str(precio_usd)),
                    categoria=categoria_obj,
                    stock=int(stock),
                    imagen=imagen_file if hasattr(imagen_file, 'read') else None,
                    activo=True
                )

                if sede_id:
                    sede = Sede.objects.filter(pk=sede_id).first() if str(sede_id).isdigit() else Sede.objects.filter(id_slug=sede_id).first()
                    if sede:
                        producto.sedes.add(sede)

                maridajes_raw = data.get('maridajes')
                if maridajes_raw:
                    if isinstance(maridajes_raw, str):
                        try:
                            maridajes_list = json.loads(maridajes_raw)
                        except json.JSONDecodeError:
                            maridajes_list = [m.strip() for m in maridajes_raw.split(',') if m.strip()]
                    else:
                        maridajes_list = maridajes_raw

                    tipos_validos = [choice[0] for choice in Maridaje.TipoMaridaje.choices]

                    for item in maridajes_list:
                        if isinstance(item, dict):
                            tipo_item = item.get('tipo', 'frituras')
                            nombre_item = item.get('nombre', 'Pasapalo')
                        else:
                            tipo_item = item if item in tipos_validos else 'frituras'
                            nombre_item = dict(Maridaje.TipoMaridaje.choices).get(tipo_item, 'Pasapalo')

                        Maridaje.objects.create(
                            producto=producto,
                            tipo=tipo_item,
                            nombre=nombre_item
                        )

            return Response({
                'message': 'Producto creado con éxito.',
                'producto': ProductoSerializer(producto, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Error al crear el producto: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CrearPedidoView(APIView):
    """
    Soporta GET (listar pedidos) y POST (crear nuevo pedido).
    """
    def get(self, request):
        pedidos = Pedido.objects.all().select_related(
            'repartidor', 'comprobante', 'sede',
        ).prefetch_related('detalles__producto').order_by('-id')
        serializer = PedidoSerializer(pedidos, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PedidoCreateSerializer(data=request.data, context={'request': request})
        
        # 1. Valida la estructura recibida del frontend
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Intenta guardar el pedido dentro de la transacción atómica
            with transaction.atomic():
                pedido = serializer.save()
                respuesta_data = PedidoSerializer(pedido, context={'request': request}).data

            # 3. Notificación vía Telegram tras el commit exitoso en la BD
            try:
                transaction.on_commit(lambda: enviar_notificacion_telegram(pedido))
            except Exception as tel_err:
                print(f"Error enviando notificación de Telegram: {tel_err}")

            return Response(respuesta_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Captura errores inesperados de la base de datos o modelos para dar visibilidad en la respuesta HTTP
            return Response(
                {'detail': f'Error interno al procesar el pedido: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PedidoDetalleView(APIView):
    """
    Permite obtener un pedido específico por ID.
    """
    def get(self, request, pk):
        try:
            pedido = Pedido.objects.select_related('repartidor', 'comprobante', 'sede').prefetch_related('detalles__producto').get(pk=pk)
        except Pedido.DoesNotExist:
            return Response({'detail': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PedidoSerializer(pedido, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- VISTAS DE AUTENTICACIÓN ---
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get("email", "")
        
        return Response({
            "token": "token_dummy_login_12345",
            "user": {
                "id": 1,
                "email": email,
                "nombre": email.split("@")[0] if "@" in email else "Usuario",
                "rol": "CLIENTE",
            },
            "message": "Login exitoso"
        }, status=status.HTTP_200_OK)


class RegistroView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        try:
            data = request.data
            email = data.get("email", "")
            
            es_proveedor = "nombreComercio" in data or "rif" in data or data.get("rol") == "PROVEEDOR"
            rol = "PROVEEDOR" if es_proveedor else "CLIENTE"
            nombre = data.get("nombreComercio") or data.get("nombre") or (email.split("@")[0] if "@" in email else "Usuario")

            sede_creada_id = None

            if rol == "PROVEEDOR":
                direccion = data.get('direccion', 'Dirección no especificada')
                foto_local = request.FILES.get('foto_local') or request.FILES.get('imagen') or data.get('foto_local')

                slug_base = slugify(nombre) or "sede-proveedor"
                slug_final = slug_base
                contador = 1
                
                while Sede.objects.filter(id_slug=slug_final).exists():
                    slug_final = f"{slug_base}-{contador}"
                    contador += 1

                sede_obj = Sede.objects.create(
                    id_slug=slug_final,
                    nombre=nombre,
                    direccion=direccion,
                    imagen=foto_local if hasattr(foto_local, 'read') else None,
                    tiempo_estimado='10-15 MIN',
                    distancia='1.2 km',
                    activa=True
                )
                sede_creada_id = sede_obj.id

            return Response({
                "token": "token_dummy_registro_12345",
                "user": {
                    "id": 1,
                    "email": email,
                    "nombre": nombre,
                    "rol": rol,
                    "sede_id": sede_creada_id
                },
                "message": "Registro completado con éxito"
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Error interno en el servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )