from decimal import Decimal

from django.core.management.base import BaseCommand

from orders.models import Categoria, Producto, TasaCambio


class Command(BaseCommand):
    help = 'Carga la tasa de cambio y productos de prueba del MVP.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tasa',
            type=Decimal,
            default=Decimal('100.00'),
            help='Valor de 1 USD en bolívares (por defecto: 100.00).',
        )

    def handle(self, *args, **options):
        tasa, _ = TasaCambio.objects.update_or_create(
            es_activa=True,
            defaults={'valor_bs': options['tasa']},
        )

        productos = [
            ('Ron Añejo', 'Licores', Decimal('12.50'), 20),
            ('Whisky 12 años', 'Licores', Decimal('35.00'), 10),
            ('Cerveza six pack', 'Licores', Decimal('8.00'), 30),
            ('Bolsa de hielo', 'Hielo', Decimal('3.50'), 50),
            ('Combo fiesta', 'Combos', Decimal('45.00'), 8),
        ]

        for nombre, categoria_nombre, precio_usd, stock in productos:
            categoria, _ = Categoria.objects.get_or_create(nombre=categoria_nombre)
            Producto.objects.update_or_create(
                nombre=nombre,
                defaults={
                    'categoria': categoria,
                    'precio_usd': precio_usd,
                    'stock': stock,
                    'activo': True,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seed completado: tasa activa {tasa.valor_bs} Bs por USD y {len(productos)} productos.'
        ))