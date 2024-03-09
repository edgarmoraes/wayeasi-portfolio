import json
from datetime import datetime
from django.db.models import Sum
from django.shortcuts import render
from django.dispatch import receiver
from django.http import JsonResponse
from dateutil.relativedelta import relativedelta
from django.views.decorators.csrf import csrf_exempt
from fluxo_de_caixa.models import Tabela_fluxo, Bancos
from .models import Tabela_realizado, Totais_mes_realizado
from django.db.models.signals import post_save, post_delete
from itertools import groupby

def realizado(request):
    if request.method == "GET":
        return exibir_realizado(request)

def exibir_realizado(request):
    bancos_ativos = Bancos.objects.filter(status=True)
    Tabela_realizado_list = Tabela_realizado.objects.all().order_by('data_liquidacao', '-valor', 'descricao')
    totais_mes_realizado = Totais_mes_realizado.objects.all().order_by('-fim_mes')

    # Convertendo QuerySet para lista para manipulação
    Tabela_realizado_list = list(Tabela_realizado_list)

    # Preparando a lista para incluir totais de cada mês
    lancamentos_com_totais = []

    for key, group in groupby(Tabela_realizado_list, key=lambda x: x.data_liquidacao.strftime('%Y-%m')):
        lista_grupo = list(group)
        lancamentos_com_totais.extend(lista_grupo)

        total_debito = sum(item.valor for item in lista_grupo if item.natureza == 'Débito')
        total_credito = sum(item.valor for item in lista_grupo if item.natureza == 'Crédito')
        saldo_total = total_credito - total_debito  # Cálculo do saldo total

        # Inserir o total do mês, incluindo agora o saldo
        lancamentos_com_totais.append({
            'data_liquidacao': datetime.strptime(key + "-01", '%Y-%m-%d'),
            'descricao': 'Total do Mês',
            'debito': total_debito,
            'credito': total_credito,
            'saldo': saldo_total,  # Incluindo o saldo no dicionário
            'is_total': True,
        })

    context = {
        'Tabela_realizado_list': lancamentos_com_totais,
        'totais_mes_realizado': totais_mes_realizado,  # Incluindo totais_mes_realizado no contexto
        'bancos': bancos_ativos,
    }
    return render(request, 'realizado.html', context)


def exibir_bancos(request):
    bancos = Bancos.objects.all()
    return render(request, 'realizado.html', {'bancos': bancos})


@receiver(post_save, sender=Tabela_realizado)
def save_update_data_unica_realizado(sender, instance, **kwargs):
    recalcular_totais_realizado()

@receiver(post_delete, sender=Tabela_realizado)
def delete_update_data_unica_realizado(sender, instance, **kwargs):
    recalcular_totais_realizado()

def recalcular_totais_realizado():
    # Apaga todos os registros existentes em Totais_mes_realizado
    Totais_mes_realizado.objects.all().delete()

    # Encontra todas as datas únicas de vencimento em Tabela_realizado
    datas_unicas = Tabela_realizado.objects.dates('data_liquidacao', 'month', order='ASC')

    for data_unica in datas_unicas:
        inicio_mes = data_unica
        fim_mes = inicio_mes + relativedelta(months=1, days=-1)

        # Calcula os totais de crédito e débito para cada mês
        total_credito = Tabela_realizado.objects.filter(
            vencimento__range=(inicio_mes, fim_mes),
            natureza='Crédito'
        ).aggregate(Sum('valor'))['valor__sum'] or 0

        total_debito = Tabela_realizado.objects.filter(
            vencimento__range=(inicio_mes, fim_mes),
            natureza='Débito'
        ).aggregate(Sum('valor'))['valor__sum'] or 0

        # Cria um novo registro em Totais_mes_realizado para cada mês
        Totais_mes_realizado.objects.create(
            data_formatada=inicio_mes.strftime('%b/%Y'),
            inicio_mes=inicio_mes,
            fim_mes=fim_mes,
            total_credito=total_credito,
            total_debito=total_debito,
            saldo_mensal=total_credito - total_debito
        )

def meses_filtro_realizado(request):
    totais_mes_realizado = Totais_mes_realizado.objects.all().order_by('data_formatada')
    context = {'totais_mes_realizado': totais_mes_realizado}
    return render(request, 'realizado.html', context)


@csrf_exempt
def processar_retorno(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'method not allowed'}, status=405)

    dados = json.loads(request.body)
    ids_selecionados = [item['id'] for item in dados]

    for item in dados:
        registro_original = Tabela_realizado.objects.filter(id=item['id']).first()
        if not registro_original:
            continue

        uuid_correlacao = registro_original.uuid_correlacao
        uuid_correlacao_parcelas = registro_original.uuid_correlacao_parcelas

        if not uuid_correlacao:
            criar_fluxo_com_registro(registro_original)
        elif uuid_correlacao and uuid_correlacao_parcelas is None:
            # Aqui é onde implementamos a lógica específica: Deletar todos os lançamentos em Tabela_realizado que compartilham o mesmo uuid_correlacao
            Tabela_realizado.objects.filter(uuid_correlacao=uuid_correlacao).delete()
        else:
            processar_lancamentos_com_uuids_selecionados(uuid_correlacao, uuid_correlacao_parcelas, ids_selecionados, registro_original)

    return JsonResponse({'status': 'success'})

def criar_fluxo_com_registro(registro):
    Tabela_fluxo.objects.create(
        vencimento=registro.vencimento,
        descricao=registro.descricao,
        observacao=registro.observacao,
        valor=registro.valor,
        conta_contabil=registro.conta_contabil,
        parcela_atual=registro.parcela_atual,
        parcelas_total=registro.parcelas_total,
        tags=registro.tags,
        natureza=registro.natureza,
        data_criacao=registro.original_data_criacao,
    )
    registro.delete()

def processar_lancamentos_com_uuids_selecionados(uuid_correlacao, uuid_correlacao_parcelas, ids_selecionados, registro_original):
    mais_registros = Tabela_realizado.objects.filter(uuid_correlacao=uuid_correlacao, uuid_correlacao_parcelas=uuid_correlacao_parcelas).exclude(id__in=ids_selecionados).exists()
    existe_no_fluxo = Tabela_fluxo.objects.filter(uuid_correlacao=uuid_correlacao).exists()

    registros_selecionados = Tabela_realizado.objects.filter(id__in=ids_selecionados, uuid_correlacao=uuid_correlacao, uuid_correlacao_parcelas=uuid_correlacao_parcelas)
    valor_total_selecionados = registros_selecionados.aggregate(Sum('valor'))['valor__sum'] or 0

    if mais_registros and existe_no_fluxo:
        unificar_lancamentos_no_fluxo(uuid_correlacao, valor_total_selecionados)
    elif not mais_registros and existe_no_fluxo:
        unificar_lancamentos_no_fluxo(uuid_correlacao, valor_total_selecionados, excluir_uuid=True)
    elif not mais_registros and not existe_no_fluxo:
        criar_fluxo_com_registro_unificado(registros_selecionados.first(), valor_total_selecionados, manter_uuid=False)
    elif mais_registros and not existe_no_fluxo:
        criar_fluxo_com_registro_unificado(registros_selecionados.first(), valor_total_selecionados, manter_uuid=True)

    registros_selecionados.delete()

def unificar_lancamentos_no_fluxo(uuid_correlacao, valor_total, excluir_uuid=False):
    fluxo = Tabela_fluxo.objects.get(uuid_correlacao=uuid_correlacao)
    fluxo.valor += valor_total
    if excluir_uuid:
        fluxo.uuid_correlacao = None
    fluxo.save()

def criar_fluxo_com_registro_unificado(registro, valor_total, manter_uuid=False):
    Tabela_fluxo.objects.create(
        vencimento=registro.vencimento,
        descricao=registro.descricao,
        observacao=registro.observacao,
        valor=valor_total,
        conta_contabil=registro.conta_contabil,
        parcela_atual=registro.parcela_atual,
        parcelas_total=registro.parcelas_total,
        tags=registro.tags,
        natureza=registro.natureza,
        data_criacao=registro.original_data_criacao,
        uuid_correlacao=registro.uuid_correlacao if manter_uuid else None
    )

@receiver(post_delete, sender=Tabela_realizado)
def atualizar_saldo_banco_apos_remocao(sender, instance, **kwargs):
    try:
        banco = Bancos.objects.get(id=instance.banco_id_liquidacao)  # Modificado para usar ID
        if instance.natureza == 'Crédito':
            banco.saldo_atual -= instance.valor  # Subtrai para créditos
        else:  # Débito
            banco.saldo_atual += instance.valor  # Adiciona para débitos
        banco.save()
    except Bancos.DoesNotExist:
        pass  # Tratar o caso em que o banco não é encontrado, se necessário

@csrf_exempt
def atualizar_lancamento(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lancamento = Tabela_realizado.objects.get(pk=id)
            
            # Assume que 'vencimento' é a chave no JSON que contém a data no formato 'YYYY-MM-DD'
            data_vencimento = data.get('vencimento', None)
            if data_vencimento:
                # Converte a data recebida para datetime, adicionando uma hora padrão se necessário
                data_vencimento = datetime.strptime(data_vencimento, '%Y-%m-%d').date()
                # Mantém a hora original da data_liquidacao ou define uma hora padrão (ex: meio-dia)
                hora_original = lancamento.data_liquidacao.time() if lancamento.data_liquidacao else datetime.time(12, 0)
                lancamento.data_liquidacao = datetime.combine(data_vencimento, hora_original)
            
            lancamento.descricao = data.get('descricao', lancamento.descricao)
            lancamento.observacao = data.get('observacao', lancamento.observacao)

            lancamento._skip_update_saldo = True
            
            lancamento.save()
            
            return JsonResponse({"message": "Lançamento atualizado com sucesso!"}, status=200)
        except Tabela_realizado.DoesNotExist:
            return JsonResponse({"error": "Lançamento não encontrado"}, status=404)
        except ValueError as e:
            # Captura erros na conversão da data
            return JsonResponse({"error": f"Erro ao processar a data: {str(e)}"}, status=400)

    return JsonResponse({"error": "Método não permitido"}, status=405)

@csrf_exempt
def atualizar_lancamentos_por_uuid(request, uuid):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            data_vencimento = data.get('novaData', None)
            if data_vencimento:
                data_vencimento = datetime.strptime(data_vencimento, '%Y-%m-%d').date()
                lancamentos = Tabela_realizado.objects.filter(uuid_correlacao=uuid)
                for lancamento in lancamentos:
                    hora_original = lancamento.data_liquidacao.time() if lancamento.data_liquidacao else datetime.time(12, 0)
                    lancamento.data_liquidacao = datetime.combine(data_vencimento, hora_original)
                    lancamento._skip_update_saldo = True
                    lancamento.save()
            
            return JsonResponse({"message": f"Lançamentos atualizados com sucesso para o UUID {uuid}!"}, status=200)
        except ValueError as e:
            return JsonResponse({"error": f"Erro ao processar a data: {str(e)}"}, status=400)
    return JsonResponse({"error": "Método não permitido"}, status=405)