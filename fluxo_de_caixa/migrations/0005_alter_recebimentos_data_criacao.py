# Generated by Django 5.0.1 on 2024-01-10 02:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fluxo_de_caixa', '0004_recebimentos_natureza'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recebimentos',
            name='data_criacao',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]