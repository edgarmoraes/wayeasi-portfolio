# Generated by Django 5.0.1 on 2024-02-12 08:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('realizado', '0006_rename_totaismes_realizado_totais_mes_realizado'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tabela_realizado',
            name='data_liquidacao',
            field=models.DateTimeField(),
        ),
    ]
