# 🍸 Delivery 24/7 — Venezuela

Plataforma MVP para la venta y entrega de licores, hielo y combos en Venezuela. El proyecto combina un frontend moderno en React/TypeScript con una API backend en Django 5 y Django REST Framework (DRF).

> **Estado:** Fase MVP en desarrollo  
> **Moneda de referencia:** USD  
> **Conversión:** USD → VES mediante una tasa de cambio activa  
> **Zona horaria del negocio:** Venezuela  

---

## 📚 Tabla de contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos](#-requisitos)
- [Configuración rápida](#-configuración-rápida)
- [Variables de entorno](#-variables-de-entorno)
- [Ejecución en desarrollo](#-ejecución-en-desarrollo)
- [Datos iniciales](#-datos-iniciales)
- [API](#-api)
- [Flujo de pedidos](#-flujo-de-pedidos)
- [Modelo de datos](#-modelo-de-datos)
- [Imágenes de productos](#-imágenes-de-productos)
- [Telegram](#-telegram)
- [Base de datos](#-base-de-datos)
- [Despliegue](#-despliegue)
- [Validaciones](#-validaciones)
- [Solución de problemas](#-solución-de-problemas)
- [Próximos pasos](#-próximos-pasos)

---

## 📝 Descripción

El sistema permite:

1. Consultar un catálogo de productos activos.
2. Mostrar precios en USD y su equivalente en bolívares.
3. Mantener una tasa de cambio manual o actualizarla desde el BCV.
4. Gestionar carrito y checkout desde el frontend.
5. Crear pedidos con control transaccional de inventario.
6. Registrar comprobantes de Pago Móvil.
7. Consultar el historial y estado de pedidos.
8. Notificar nuevos pedidos mediante Telegram.
9. Consultar sedes activas y disponibilidad logística.

El backend es la fuente de verdad para precios, tasa, stock, totales y creación de pedidos. El frontend no debe calcular ni persistir por su cuenta los totales finales del pedido.

---

## ✨ Características

### Catálogo

- Categorías y productos activos.
- Precio base en USD usando `DecimalField`.
- Precio calculado en VES con la tasa activa.
- Imágenes mediante URL, compatible con Supabase Storage.
- Stock por producto.
- Descripción, precio anterior y porcentaje de descuento.
- Disponibilidad por sede.
- Maridajes de productos.

### Pedidos

- Carrito administrado en React/Zustand.
- Creación de pedidos mediante `POST /api/pedidos/`.
- Descuento de inventario dentro de una transacción.
- Bloqueo de filas con `select_for_update()` para evitar sobreventa.
- Congelamiento del precio unitario en cada detalle.
- Registro de la tasa usada al momento de comprar.
- Cálculo backend de `monto_total_usd` y `monto_total_bs`.
- Métodos de pago:
  - Pago Móvil.
  - Zelle.
  - Efectivo USD.

### Pago Móvil

Cuando el método es Pago Móvil, el frontend exige exactamente cuatro dígitos numéricos. El backend vuelve a validar la regla y guarda la referencia en `ComprobantePago.numero_referencia`.

### Notificaciones

La notificación de Telegram se programa con `transaction.on_commit()`. Por lo tanto:

- Solo se intenta notificar después de confirmar el pedido.
- Un error de Telegram no revierte ni bloquea el pedido.
- Las credenciales no se guardan en el repositorio.

---

## 🏗️ Arquitectura

```text
┌────────────────────────────┐
│ React + TypeScript + Vite  │
│ frontend/                  │
└──────────────┬─────────────┘
               │ HTTP / JSON
               ▼
┌────────────────────────────┐
│ Django 5 + DRF             │
│ backend/                   │
│ /api/                      │
└──────────────┬─────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
 PostgreSQL/Supabase   Telegram
 o SQLite local        Bot API
```

### Principios importantes

- Los montos financieros se manejan con `Decimal`, no con `float`.
- La tasa usada se copia al pedido y no cambia retroactivamente.
- El precio unitario se copia a `DetallePedido`.
- El stock se valida y descuenta en una única transacción.
- Las credenciales se leen desde variables de entorno.
- El frontend consume la API de Django para el checkout.

---

## 📁 Estructura del proyecto

```text
JS_PROJECT/
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── orders/
│   │   ├── management/commands/seed_data.py
│   │   ├── migrations/
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   └── db.sqlite3
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── imagenes-productos/
└── README.md
```

---

## ✅ Requisitos

### Backend

- Python 3.12 o superior.
- `pip`.
- Entorno virtual recomendado.
- PostgreSQL opcional para producción.

### Frontend

- Node.js 20 o superior.
- npm.

---

## 🚀 Configuración rápida

### 1. Clonar el repositorio

```powershell
git clone <URL_DEL_REPOSITORIO>
cd JS_PROJECT
```

### 2. Crear y activar el entorno Python

En Windows PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Si PowerShell bloquea la activación:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

También puede ejecutarse directamente sin activar el entorno:

```powershell
.\.venv\Scripts\python.exe manage.py check
```

### 3. Instalar dependencias frontend

Desde la raíz:

```powershell
cd frontend
npm install
```

### 4. Aplicar migraciones

```powershell
cd ..\backend
python manage.py migrate
```

### 5. Cargar datos iniciales

```powershell
python manage.py seed_data
```

### 6. Iniciar ambos servicios

Terminal 1 — backend:

```powershell
cd backend
python manage.py runserver
```

Terminal 2 — frontend:

```powershell
cd frontend
npm run dev
```

URLs locales habituales:

| Servicio | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://127.0.0.1:8000` |
| Admin Django | `http://127.0.0.1:8000/admin/` |

---

## 🔐 Variables de entorno

El backend carga automáticamente `backend/.env` mediante `python-dotenv`.

### Backend — `backend/.env`

```env
SECRET_KEY=cambia-esta-clave-en-produccion
DEBUG=True

# Separar varios valores con comas
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# PostgreSQL/Supabase. Si se omite, se usa SQLite.
DATABASE_URL=postgresql://usuario:password@host:5432/base_de_datos

# Telegram, opcional en desarrollo
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Frontend — `frontend/.env.local`

```env
VITE_API_URL=http://127.0.0.1:8000

# Solo si se utiliza Supabase desde alguna funcionalidad del frontend
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Nunca subas `.env`, `.env.local`, tokens, contraseñas ni claves privadas al repositorio. Usa variables de entorno del proveedor de despliegue.

---

## ▶️ Ejecución en desarrollo

### Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

Comandos útiles:

```powershell
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### Frontend

```powershell
cd frontend
npm run dev
```

Scripts disponibles:

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor Vite de desarrollo |
| `npm run build` | Type-check y build de producción |
| `npm run lint` | Análisis estático con Oxlint |
| `npm run preview` | Servir el build localmente |

---

## 🌱 Datos iniciales

El comando `seed_data` crea o actualiza:

- Una tasa activa.
- Categoría `Licores`.
- Categoría `Hielo`.
- Categoría `Combos`.
- Cinco productos de prueba.

Tasa predeterminada:

```text
1 USD = 100.00 Bs
```

Para indicar otra tasa:

```powershell
python manage.py seed_data --tasa 365.50
```

El comando es idempotente para los productos incluidos: puede ejecutarse nuevamente sin duplicar esos registros.

---

## 🔌 API

Todas las rutas de negocio están bajo `/api/`.

### Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sedes/` | Lista sedes activas |
| `GET` | `/api/tasa/` | Devuelve la tasa activa |
| `POST` | `/api/tasa/actualizar-bcv/` | Consulta y guarda la tasa del BCV |
| `GET` | `/api/productos/` | Lista productos activos |
| `GET` | `/api/pedidos/` | Lista pedidos |
| `POST` | `/api/pedidos/` | Crea un pedido |
| `GET` | `/api/pedidos/<id>/` | Consulta un pedido |

### Consultar productos

```powershell
curl http://127.0.0.1:8000/api/productos/
```

Respuesta simplificada:

```json
[
  {
    "id": 1,
    "nombre": "Ron Añejo",
    "categoria": "Licores",
    "stock": 20,
    "precio_usd": "12.50",
    "precio_bs": "1250.00",
    "imagen": "https://..."
  }
]
```

Si no existe tasa activa, el endpoint responde `503 Service Unavailable`.

### Consultar tasa

```powershell
curl http://127.0.0.1:8000/api/tasa/
```

Respuesta:

```json
{
  "tasa": 100.0,
  "fecha_actualizacion": null
}
```

### Actualizar tasa desde el BCV

```powershell
curl -X POST http://127.0.0.1:8000/api/tasa/actualizar-bcv/
```

El backend consulta `https://www.bcv.org.ve/`, valida la respuesta y crea una nueva tasa activa. Si el BCV no responde o cambia su HTML, devuelve un error explícito.

### Crear un pedido

```powershell
curl -X POST http://127.0.0.1:8000/api/pedidos/ `
  -H "Content-Type: application/json" `
  -d '{
    "nombre_cliente": "Juan Pérez",
    "telefono": "04140000000",
    "direccion_entrega": "Av. Principal, Lechería",
    "referencia_ubicacion": "Casa azul, frente a la plaza",
    "metodo_pago": "PAGO_MOVIL",
    "items": [
      {
        "producto_id": 1,
        "cantidad": 2
      }
    ],
    "comprobante": "4821"
  }'
```

También se aceptan las claves defensivas `id` o `producto` para identificar el producto dentro de cada ítem, aunque el formato recomendado es `producto_id`.

Métodos de pago válidos:

```text
PAGO_MOVIL
ZELLE
EFECTIVO
```

Reglas del comprobante:

- `PAGO_MOVIL`: obligatorio, exactamente cuatro dígitos.
- `ZELLE`: no utiliza comprobante en el flujo actual.
- `EFECTIVO`: no debe incluir comprobante.

Ejemplo de respuesta `201 Created`:

```json
{
  "id": 1,
  "nombre_cliente": "Juan Pérez",
  "monto_total_usd": "28.00",
  "tasa_cambio_usada": "100.000000",
  "monto_total_bs": "2800.00",
  "metodo_pago": "PAGO_MOVIL",
  "estado": "RECIBIDO",
  "detalles": [],
  "comprobante": {
    "numero_referencia": "4821",
    "banco_origen": "PAGO_MOVIL",
    "monto_pagado_bs": "2800.00",
    "captura_url": null
  }
}
```

### Errores frecuentes de la API

| Código | Significado |
|---|---|
| `400` | Payload inválido, stock insuficiente o comprobante incorrecto |
| `404` | Pedido no encontrado |
| `503` | No existe una tasa activa al consultar productos |
| `500` | Fallo externo, por ejemplo BCV no disponible |

---

## 🛒 Flujo de pedidos

1. El usuario agrega productos al carrito.
2. El checkout envía datos del cliente y los ítems a Django.
3. El serializer valida método de pago, comprobante y cantidades.
4. Django abre una transacción.
5. Se bloquean los productos seleccionados.
6. Se comprueba que estén activos y tengan stock.
7. Se obtiene la tasa activa.
8. Se calculan los totales en USD y VES.
9. Se crea el pedido y sus detalles.
10. Se descuenta el stock.
11. Se registra el comprobante si corresponde.
12. Se confirma la transacción.
13. Se programa la notificación de Telegram.

Si falla cualquier validación antes de confirmar, el pedido no se crea y el stock no se descuenta.

---

## 🗃️ Modelo de datos

### `TasaCambio`

- `valor_bs`
- `es_activa`
- `fecha`
- `fecha_registro`

Solo una tasa debe permanecer activa. Al guardar una nueva tasa activa, las anteriores se desactivan.

### `Categoria`

- `nombre`
- `activa`

### `Producto`

- `nombre`
- `descripcion`
- `categoria`
- `stock`
- `precio_usd`
- `precio_anterior_usd`
- `descuento_porcentaje`
- `activo`
- `imagen`
- `sedes`

### `Pedido`

- Datos del cliente y entrega.
- `monto_total_usd`
- `tasa_cambio_usada`
- `monto_total_bs`
- `metodo_pago`
- `estado`
- `sede`
- `repartidor`
- coordenadas del destino.

### `DetallePedido`

- Producto.
- Cantidad.
- `precio_unitario_usd`.

El precio unitario se guarda para conservar el precio histórico del pedido, aunque el catálogo cambie posteriormente.

### `ComprobantePago`

- Pedido asociado.
- `numero_referencia`.
- `banco_origen`.
- `monto_pagado_bs`.
- `captura_url`.

---

## 🖼️ Imágenes de productos

El campo `Producto.imagen` es una URL opcional:

```text
https://<proyecto>.supabase.co/storage/v1/object/public/productos/ron-anejo.jpg
```

El frontend prioriza:

```ts
item.producto.imagen || item.producto.imagen_url
```

Esto permite compatibilidad temporal con datos antiguos que todavía utilicen `imagen_url`.

Para Supabase Storage:

1. Crea un bucket público llamado, por ejemplo, `productos`.
2. Sube la imagen.
3. Copia la URL pública en `Producto.imagen`.
4. Verifica que la URL sea accesible desde el navegador.

---

## 🤖 Telegram

La notificación se envía mediante:

```text
https://api.telegram.org/bot<TOKEN>/sendMessage
```

El mensaje incluye:

- Número del pedido.
- Fecha.
- Cliente.
- Teléfono.
- Dirección.
- Referencia de ubicación.
- Productos y cantidades.
- Totales USD y VES.
- Tasa usada.
- Método de pago.
- Referencia de Pago Móvil, cuando aplica.

Configuración:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-1001234567890
```

Si Telegram no está configurado, el pedido continúa funcionando y el backend registra que la notificación fue omitida.

---

## 🐘 Base de datos

### Desarrollo con SQLite

Si no se define `DATABASE_URL`, el proyecto usa:

```text
backend/db.sqlite3
```

Es suficiente para desarrollo local y pruebas rápidas.

### Producción con PostgreSQL/Supabase

Define `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

Luego ejecuta:

```powershell
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
```

Recomendaciones:

- No commitear la URL de conexión.
- Usar una contraseña rotada y segura.
- Confirmar que el proveedor permita conexiones desde el entorno de despliegue.
- Ejecutar migraciones antes de publicar una nueva versión.

---

## ☁️ Despliegue

El backend incluye un `Procfile` preparado para plataformas compatibles con Gunicorn:

```text
web: gunicorn config.wsgi:application
```

Comandos de despliegue típicos:

```powershell
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application
```

Variables mínimas de producción:

```env
SECRET_KEY=<secreto-fuerte>
DEBUG=False
ALLOWED_HOSTS=<dominio-backend>
CORS_ALLOWED_ORIGINS=https://<dominio-frontend>
DATABASE_URL=<url-postgresql>
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat-id>
```

Para el frontend:

```env
VITE_API_URL=https://<dominio-backend>
```

---

## 🧪 Validaciones

### Backend

```powershell
cd backend
python manage.py check
python manage.py makemigrations --check
python manage.py migrate
```

### Frontend

```powershell
cd frontend
npm run build
npm run lint
```

Antes de abrir un pull request se recomienda comprobar:

- Que no existan marcadores de conflicto de Git.
- Que las migraciones estén incluidas.
- Que el frontend apunte al backend correcto.
- Que Pago Móvil rechace referencias distintas de cuatro dígitos.
- Que no se creen pedidos con stock insuficiente.
- Que una caída de Telegram no genere un error de checkout.

---

## 🛠️ Solución de problemas

### `No module named 'django'`

El comando está usando un Python sin las dependencias del proyecto. Ejecuta:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```

O usa el ejecutable directamente:

```powershell
.\backend\.venv\Scripts\python.exe .\backend\manage.py runserver
```

### `can't open file ... manage.py`

`manage.py` está dentro de `backend`:

```powershell
cd backend
python manage.py runserver
```

### Error de CORS

Agrega el origen del frontend a `CORS_ALLOWED_ORIGINS`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Reinicia Django después de modificar `.env`.

### `No existe una tasa de cambio activa`

Carga datos iniciales:

```powershell
cd backend
python manage.py seed_data --tasa 100
```

### Error de columna inexistente en Supabase

El checkout debe crear pedidos en Django mediante:

```text
POST /api/pedidos/
```

No debe insertar pedidos directamente en una tabla Supabase antigua que no tenga el esquema actual. Si se cambia el modelo Django, ejecuta:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### Las imágenes no aparecen

Verifica:

1. Que el serializer devuelva `imagen`.
2. Que `Producto.imagen` contenga una URL completa.
3. Que el bucket de Supabase sea público o tenga una política de lectura.
4. Que la URL funcione directamente en el navegador.

### Telegram no envía mensajes

Comprueba:

- `TELEGRAM_BOT_TOKEN`.
- `TELEGRAM_CHAT_ID`.
- Que el bot esté agregado al chat.
- Que el bot tenga permisos para enviar mensajes.
- Que el servidor tenga salida HTTPS.

El pedido debe continuar creándose aunque Telegram falle.

---

## 📄 Licencia

Este proyecto es privado y se encuentra en desarrollo. Define la licencia correspondiente antes de distribuirlo públicamente.

