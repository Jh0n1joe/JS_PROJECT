from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0013_remove_comprobantepago_captura_url'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'orders_repartidor'
                          AND column_name = 'foto'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'orders_repartidor'
                          AND column_name = 'foto_url'
                    ) THEN
                        ALTER TABLE orders_repartidor RENAME COLUMN foto TO foto_url;
                    END IF;
                END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
