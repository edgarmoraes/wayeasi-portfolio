import json
from decimal import Decimal
from django.shortcuts import render
from django.http import JsonResponse
from fluxo_de_caixa.models import Bancos
from realizado.models import Tabela_realizado
from django.db.models import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

def configuracoes(request):
    if request.method =="GET":
        return render(request, 'configuracoes.html')

def bancos_e_contas(request):
    if request.method =="GET":
        lista_bancos = Bancos.objects.all().order_by('id')

        context = {
            'bancos': lista_bancos,
        }
        return render(request, 'bancos_e_contas.html', context)
    
@csrf_exempt
def salvar_banco(request):
    # Retorna erro se não for uma requisição POST
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "Método não permitido."}, status=405)

    id_banco = request.POST.get('id_banco')
    descricao = request.POST.get('descricao')
    agencia = request.POST.get('agencia')
    conta = request.POST.get('conta')
    saldo_inicial = Decimal(request.POST.get('saldo-inicial').replace(',', '.'))
    status_banco = request.POST.get('status-banco') == 'ativo'

    try:
        if id_banco:  # Atualização
            banco = Bancos.objects.get(pk=id_banco)
        else:  # Criação
            banco = Bancos()
        
        banco.banco = descricao
        banco.agencia = agencia
        banco.conta = conta
        banco.saldo_inicial = saldo_inicial
        banco.status = status_banco
        banco.save()

        # Resposta JSON para atualização dinâmica
        return JsonResponse({"success": True, "id": banco.id})
    except ObjectDoesNotExist:
        # Banco não encontrado para atualização
        return JsonResponse({"success": False, "error": "Banco não encontrado."}, status=404)

@require_POST
def verificar_e_excluir_banco(request, idBanco):
    # Verifica se o banco está sendo utilizado na Tabela_realizado
    if Tabela_realizado.objects.filter(banco_id_liquidacao=idBanco).exists():
        # Banco está sendo utilizado, não pode ser excluído
        return JsonResponse({'success': False, 'error': 'Este banco está sendo utilizado e não pode ser excluído.'})

    try:
        # Tenta encontrar e excluir o banco
        banco = Bancos.objects.get(pk=idBanco)
        banco.delete()
        # Banco excluído com sucesso
        return JsonResponse({'success': True})
    except Bancos.DoesNotExist:
        # Banco não encontrado
        return JsonResponse({'success': False, 'error': 'Banco não encontrado.'})