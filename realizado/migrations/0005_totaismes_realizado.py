# Generated by Django 5.0.1 on 2024-01-29 01:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('realizado', '0004_tabela_realizado_banco_liquidacao'),
    ]

    operations = [
        migrations.CreateModel(
            name='TotaisMes_realizado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('inicio_mes', models.DateField(blank=True, null=True)),
                ('fim_mes', models.DateField(blank=True, null=True)),
                ('data_formatada', models.CharField(max_length=255, unique=True)),
                ('total_credito', models.DecimalField(decimal_places=2, default=0, max_digits=13)),
                ('total_debito', models.DecimalField(decimal_places=2, default=0, max_digits=13)),
                ('saldo_mensal', models.DecimalField(decimal_places=2, default=0, max_digits=13)),
            ],
        ),
    ]
