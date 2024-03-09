from celery import task
from .models import TabelaTemporaria

@task
def remover_entradas_antigas():
    TabelaTemporaria.remover_antigos()