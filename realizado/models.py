import uuid
from django.db import models
from fluxo_de_caixa.models import Bancos

class Tabela_realizado(models.Model):
    fluxo_id = models.IntegerField(null=True, blank=True)
    vencimento = models.DateField()
    descricao = models.CharField(max_length = 100)
    observacao = models.CharField(max_length = 100)
    valor = models.DecimalField(max_digits=13, decimal_places=2)
    conta_contabil = models.CharField(max_length = 100)
    parcela_atual = models.IntegerField()
    parcelas_total = models.IntegerField()
    tags = models.CharField(max_length = 100)
    natureza = models.CharField(max_length=50)
    original_data_criacao = models.DateTimeField(null=True, blank=True)
    data_liquidacao = models.DateTimeField()
    banco_liquidacao = models.CharField(max_length=255, null=True, blank=True)
    banco_id_liquidacao = models.IntegerField(null=True, blank=True)
    uuid_correlacao = models.UUIDField(null=True, blank=True)
    uuid_correlacao_parcelas = models.UUIDField(null=True, blank=True)

    _skip_update_saldo = False

    def save(self, *args, **kwargs):
        if not self._skip_update_saldo:
            self.atualizar_saldo_banco()
        super().save(*args, **kwargs)
    
    def atualizar_saldo_banco(self):
        banco = Bancos.objects.get(id=self.banco_id_liquidacao)  # Modificado para usar ID
        if self.natureza == 'Crédito':
            banco.saldo_atual += self.valor
        else:  # Débito
            banco.saldo_atual -= self.valor
        banco.save()
        pass

class Totais_mes_realizado(models.Model):
    inicio_mes = models.DateField(null=True, blank=True)
    fim_mes = models.DateField(null=True, blank=True)
    data_formatada = models.CharField(max_length=255, unique=True)
    total_credito = models.DecimalField(max_digits=13, decimal_places=2, default=0)
    total_debito = models.DecimalField(max_digits=13, decimal_places=2, default=0)
    saldo_mensal = models.DecimalField(max_digits=13, decimal_places=2, default=0)

    def __str__(self):
        return self.data_formatada