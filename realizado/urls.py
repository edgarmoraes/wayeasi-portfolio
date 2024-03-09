from django.urls import path
from . import views

app_name = 'realizado'

urlpatterns = [
    path('', views.realizado, name='realizado'),
    path('meses_filtro_realizado/', views.meses_filtro_realizado, name='meses_filtro_realizado'),
    path('processar_retorno/', views.processar_retorno, name='processar_retorno'),
    path('atualizar-lancamento/<int:id>/', views.atualizar_lancamento, name='atualizar_lancamento'),
    path('atualizar-lancamentos-uuid/<str:uuid>/', views.atualizar_lancamentos_por_uuid, name='atualizar_lancamentos_por_uuid'),
]
