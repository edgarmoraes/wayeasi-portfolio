from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('fluxo_de_caixa/', include(('fluxo_de_caixa.urls', 'fluxo_de_caixa'))),
    path('realizado/', include(('realizado.urls', 'realizado'))),
    path('configuracoes/', include(('configuracoes.urls', 'configuracoes'), namespace='configuracoes')),
]
