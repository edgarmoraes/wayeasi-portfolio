// Evitar bancos iguais e datas futuras no processo de transferência
document.addEventListener("DOMContentLoaded", function() {
  const formularioTransferencia = document.querySelector(".modal-form-transferencias");

  formularioTransferencia.addEventListener("submit", function(e) {
      const bancoSaidaId = document.getElementById("banco-saida").value;
      const bancoEntradaId = document.getElementById("banco-entrada").value;
      const dataTransferencia = new Date(document.getElementById("data-transferencias").value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Ajusta a data de hoje para meia-noite para garantir a comparação correta

      // Verifica se o banco de saída é igual ao banco de entrada
      if (bancoSaidaId === bancoEntradaId) {
          e.preventDefault(); // Impede o envio do formulário
          alert("O banco de saída não pode ser igual ao banco de entrada. Por favor, selecione bancos diferentes.");
          return; // Interrompe a execução do evento
      }

      // Verifica se a data de transferência é maior que a data atual
      if (dataTransferencia > hoje) {
          e.preventDefault(); // Impede o envio do formulário
          alert("A data da transferência não pode ser futura. Por favor, selecione a data de hoje ou uma data passada.");
      }
  });
});

// Função para formatar o valor de texto para número
function formatarValor(valorTexto) {
  // Remove pontos e substitui vírgula por ponto para conversão para número
  // Garante que o valorTexto é uma string antes de fazer as substituições
  valorTexto = valorTexto.toString();
  var valorNumerico = valorTexto.replace(/\./g, '').replace(',', '.');
  return parseFloat(valorNumerico);
}

// Função para atualizar o saldo do banco selecionado
function atualizarSaldoBanco() {
  // Inicializar o valor total a liquidar
  let valorTotalLiquidar = 0;
  
  // Obter o valor total a liquidar dos lançamentos selecionados
  document.querySelectorAll('.row-lancamentos').forEach(row => {
    const checkbox = row.querySelector('.checkbox-personalizado');
    if (checkbox && checkbox.checked) {
      const credito = row.querySelector('.credito-row').textContent.trim();
      const debito = row.querySelector('.debito-row').textContent.trim();

      if (credito) {
        valorTotalLiquidar += formatarValor(credito);
      }
      if (debito) {
        valorTotalLiquidar -= formatarValor(debito);
      }
    }
  });

  // Iterar por todos os checkboxes dos bancos
  document.querySelectorAll('.checkbox-personalizado-liquidacao').forEach(checkbox => {
    if (checkbox.checked) {
      // Encontrar o elemento de saldo inicial do banco correspondente
      let saldoInicialEl = checkbox.closest('.row-bancos').querySelector('[name="saldo_inicial"]');
      let saldoInicial = formatarValor(saldoInicialEl.textContent);
      
      // Calcular o novo saldo
      let novoSaldo = saldoInicial + valorTotalLiquidar;

      // Atualizar o elemento do saldo no formulário
      document.querySelector('[name="saldo-liquidacao"]').textContent = novoSaldo.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  });
}

// Adicionar evento listener para as checkboxes dos bancos para atualizar o saldo quando uma checkbox é alterada
document.querySelectorAll('.checkbox-personalizado-liquidacao').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
    atualizarSaldoBanco();
    calcularTotal(); // Recalcular o total a liquidar se necessário
  });
});

// Chamar a função atualizarSaldoBanco inicialmente para definir o saldo correto
atualizarSaldoBanco();

// Campo de liquidação parcial
document.addEventListener('DOMContentLoaded', function() {
  const containerLancamentosSelecionados = document.getElementById('lancamentos-selecionados');

  // Ouvinte de evento para capturar 'change' em checkboxes 'botao-parcial'
  // dentro do contêiner de lançamentos selecionados
  containerLancamentosSelecionados.addEventListener('change', function(event) {
    if (event.target.classList.contains('botao-parcial')) {
      // Manipula a visibilidade da seção 'valor-parcial-liquidacao' com base no estado do checkbox
      const lancamentoSelecionado = event.target.closest('.lancamentos-selecionados');
      const secaoValorParcial = lancamentoSelecionado.querySelector('.valor-parcial-liquidacao');
      secaoValorParcial.style.display = event.target.checked ? 'block' : 'none';
      
      atualizarEstadoColunas();
    }
  });
  
  // Função para atualizar o estado das colunas baseada nos checkboxes 'botao-parcial'
  function atualizarEstadoColunas() {
    const todosBotoesParcial = document.querySelectorAll('.botao-parcial');
    const algumAtivado = Array.from(todosBotoesParcial).some(checkbox => checkbox.checked);
    const labelParcial = document.querySelector('.label-parcial');
    
    // Seleciona todos os elementos que devem ter suas colunas ajustadas
    const elementosParaAjustar = document.querySelectorAll('.lancamentos-selecionados, .label-lancamentos-selecionados');

    // Adiciona ou remove a classe 'ativo' com base no estado dos checkboxes
    elementosParaAjustar.forEach(el => {
      if (algumAtivado) {
        el.classList.add('ativo');
        if (labelParcial) labelParcial.style.display = 'block';
      } else {
        el.classList.remove('ativo');
        if (labelParcial) labelParcial.style.display = 'none';
      }
    });
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const botaoLiquidacao = document.getElementById('liquidar-button');
  const modalLiquidacao = document.getElementById('modal-liquidacoes');

  botaoLiquidacao.addEventListener('click', function() {
      modalLiquidacao.showModal(); // Abre o modal

      // Esconde todos os campos de valor parcial inicialmente
      document.querySelectorAll('.valor-parcial-liquidacao').forEach(campo => {
          campo.style.display = 'none'; // Esconde todos os campos de valor parcial inicialmente
      });

      let algumBotaoParcialAtivado = false;

      // Busca todos os checkboxes marcados na tabela de lançamentos
      const checkboxesMarcadas = document.querySelectorAll('.tabela-lancamentos .checkbox-personalizado:checked');

      checkboxesMarcadas.forEach(checkbox => {
          const uuid = checkbox.getAttribute('data-uuid-row'); // Pega o UUID do lançamento
          const id = checkbox.getAttribute('data-id'); // Pega o ID do lançamento

          if (uuid !== "None") {
              const botaoParcial = document.querySelector(`#botao-parcial-${id}`);
              if (botaoParcial) {
                  botaoParcial.checked = true; // Ativa o checkbox
                  algumBotaoParcialAtivado = true; // Indica que pelo menos um botão parcial foi ativado

                  // Adiciona classe 'travado' para prevenir desmarcação
                  botaoParcial.classList.add('travado');

                  // Encontra o campo de valor parcial específico para este lançamento e o torna visível
                  const secaoValorParcial = document.querySelector(`#valor-parcial-liquidacao-${id}`);
                  if (secaoValorParcial) {
                      secaoValorParcial.style.display = 'block'; // Mostra o campo de valor parcial específico
                  }
              }
          }
      });

      // Prevenir desmarcação dos botões parciais 'travados'
      document.querySelectorAll('.botao-parcial.travado').forEach(botao => {
          botao.addEventListener('click', function(event) {
              event.preventDefault();
          });
      });

      // Garante que a seção de valor parcial seja visível para botões parciais ativos
      document.querySelectorAll('.botao-parcial').forEach(botao => {
          const lancamentoSelecionado = botao.closest('.lancamentos-selecionados');
          if (botao.checked) {
              const secaoValorParcial = lancamentoSelecionado.querySelector('.valor-parcial-liquidacao');
              if (secaoValorParcial) {
                  secaoValorParcial.style.display = 'block';
              }
          }
      });

      // Atualiza as classes 'ativo' conforme necessário
      atualizarClassesAtivo(algumBotaoParcialAtivado);
  });

  // Função para atualizar as classes 'ativo'
  function atualizarClassesAtivo(ativado) {
      const labelLancamentosSelecionados = document.querySelectorAll('.lancamentos-selecionados, .label-lancamentos-selecionados');
      const labelParcial = document.querySelector('.label-parcial');
      labelLancamentosSelecionados.forEach(el => {
          el.classList.toggle('ativo', ativado);
          labelParcial.style.display = ativado ? 'block' : 'none';
      });
  }

  // Opcional: Adiciona um ouvinte de eventos para fechar o modal no botão de cancelar, se houver
  const botaoFechar = modalLiquidacao.querySelector('.modal-fechar-liquidacoes');
  if (botaoFechar) {
      botaoFechar.addEventListener('click', function() {
          modalLiquidacao.close(); // Fecha o modal
      });
  }
});

// Passa informações do fluxo para o modal de liquidação
document.addEventListener('DOMContentLoaded', function() {
  inicializarAtualizacaoDeLancamentos();
});

function inicializarAtualizacaoDeLancamentos() {
  document.querySelectorAll('.tabela-lancamentos .checkbox-personalizado')
      .forEach(checkbox => checkbox.addEventListener('change', atualizarLancamentosSelecionados));
}

function atualizarLancamentosSelecionados() {
  const container = document.getElementById('lancamentos-selecionados');
  limparContainer(container);
  const checkboxesMarcadas = buscarCheckboxesMarcadas();
  checkboxesMarcadas.forEach(criarLancamentoSelecionadoElemento);
}

function buscarCheckboxesMarcadas() {
  return document.querySelectorAll('.tabela-lancamentos .checkbox-personalizado:checked');
}

function limparContainer(container) {
  container.innerHTML = '';
}

function criarLancamentoSelecionadoElemento(checkbox) {
  const lancamentoDados = extrairDadosLancamento(checkbox);
  const div = montarDivLancamento(lancamentoDados);
  document.getElementById('lancamentos-selecionados').appendChild(div);
  configurarEstadoInicialValor(div, lancamentoDados.id);
}

function extrairDadosLancamento(checkbox) {
  const row = checkbox.closest('.row-lancamentos');
  const id = checkbox.getAttribute('data-id');
  return {
      id: id,
      descricao: row.querySelector('.descricao-row').textContent,
      vencimento: row.querySelector('.vencimento-row').textContent,
      observacao: extrairObservacao(row),
      valor: extrairValor(row),
      natureza: extrairNatureza(row)
  };
}

function extrairObservacao(row) {
  let observacao = row.querySelector('.obs-row').textContent.trim();
  return observacao.split('Tags:')[0].trim();
}

function extrairValor(row) {
  const valorDebito = row.querySelector('.debito-row').textContent;
  const valorCredito = row.querySelector('.credito-row').textContent;
  return valorDebito || valorCredito;
}

function extrairNatureza(row) {
  return row.querySelector('.debito-row').textContent ? "Débito" : "Crédito";
}

function montarDivLancamento({id, descricao, vencimento, observacao, valor, natureza}) {
  const div = document.createElement('div');
  div.classList.add('lancamentos-selecionados');
  div.innerHTML = `
    <section class="modal-flex data-liquidacao">
        <input class="modal-data data-liquidacao" id="data-liquidacao-${id}" type="date" name="data-liquidacao-${id}" value="${formatarDataParaInput(vencimento)}" required>
    </section>
    <section class="modal-flex">
        <input class="modal-descricao" id="descricao-liquidacao-${id}" maxlength="100" type="text" name="descricao-liquidacao-${id}" value="${descricao}" readonly style="background-color: #B5B5B5; color: #FFFFFF;">
    </section>
    <section class="modal-flex">
        <input class="modal-obs" id="observacao-liquidacao-${id}" maxlength="100" type="text" name="observacao-liquidacao-${id}" value="${observacao}">
    </section>
    <section class="modal-flex">
        <input class="modal-valor valor-liquidacao-total" id="valor-liquidacao-${id}" type="text" name="valor-liquidacao-${id}" oninput="formatarCampoValor(this)" value="R$ ${valor}" readonly required style="background-color: #B5B5B5; color: #FFFFFF;">
    </section>
    <section class="modal-flex natureza-liquidacao">
        <input class="modal-natureza" id="natureza-liquidacao-${id}" type="text" name="natureza-liquidacao-${id}" value="${natureza}" readonly style="background-color: #B5B5B5; color: #FFFFFF;">
    </section>
    <section class="modal-botao-parcial">
      <div>
      <label class="form-switch"><input id="botao-parcial-${id}" class="botao-parcial" type="checkbox"><i></i></label>
      </div>
    </section>
    <section class="modal-flex valor-parcial-liquidacao" style="display:none;">
      <input class="modal-valor valor-parcial" id="valor-parcial-liquidacao-${id}" type="text" name="valor-parcial-liquidacao-${id}" oninput="formatarCampoValor(this)" value="R$ " required>
    </section>
    `;
  ajustarDataDeLiquidacaoSeNecessario(div, id, vencimento);
  return div;
}
  
function configurarEstadoInicialValor(div, id) {
    const botaoParcial = div.querySelector('.botao-parcial');
    botaoParcial.addEventListener('change', function() {
        const campoValorParcial = div.querySelector('.valor-parcial-liquidacao');
        campoValorParcial.style.display = botaoParcial.checked ? 'block' : 'none';
    });
}

function ajustarDataDeLiquidacaoSeNecessario(div, id, vencimentoOriginal) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera o horário para comparar apenas as datas
  const dataVencimento = converterDataStringParaDate(formatarDataParaInput(vencimentoOriginal));

  if (dataVencimento > hoje) {
    const campoDataLiquidacao = div.querySelector(`#data-liquidacao-${id}`);
    campoDataLiquidacao.value = formatarDataAtualParaInput();
  }
}

function formatarDataAtualParaInput() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // getMonth() retorna mês de 0 a 11
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function converterDataStringParaDate(dataString) {
  const partes = dataString.split('-');
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function formatarValorDecimal(valor) {
    valor = valor.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(valor);
    return !isNaN(numero) ? numero.toFixed(2) : '0.00';
}


// Botão de Liquidar
document.getElementById('salvar-liquidacao').addEventListener('click', async function(event) {
  event.preventDefault();
  
  const liquidacaoSelecionada = document.querySelector('.checkbox-personalizado-liquidacao:checked');
  if (!liquidacaoSelecionada) {
    alert('Por favor, selecione um banco para a liquidação antes de prosseguir.');
    return;
  }

  const nomeBancoSelecionado = liquidacaoSelecionada.closest('.row-bancos').querySelector('.banco-liquidacao').getAttribute('data-nome-banco');
  const idBancoSelecionado = liquidacaoSelecionada.closest('.row-bancos').querySelector('.banco-liquidacao').getAttribute('data-id-banco');
  let selectedRows = document.querySelectorAll('.checkbox-personalizado:checked');
  let dataToSend = [];
  let hoje = new Date();
  
  hoje.setHours(0, 0, 0, 0);

  for (let checkbox of selectedRows) {
    let row = checkbox.closest('.row-lancamentos');
    let id = checkbox.getAttribute('data-id');

    let campoData = document.getElementById(`data-liquidacao-${id}`);
    let dataLiquidacao = new Date(campoData.value);
    if (dataLiquidacao > hoje) {
      alert('A data de liquidação não pode ser maior do que hoje.');
      campoData.focus();
      return;
    }

    let botaoParcial = document.getElementById(`botao-parcial-${id}`);
    let campoValorParcial = document.getElementById(`valor-parcial-liquidacao-${id}`);
    let valorParcial = 0;

    if (campoValorParcial && campoValorParcial.value) {
      // Remover o prefixo 'R$ ' e todos os pontos usados como separadores de milhar
      let valorFormatado = campoValorParcial.value.replace('R$ ', '').replace(/\./g, '');
      // Substituir a vírgula por ponto para o separador decimal
      valorFormatado = valorFormatado.replace(',', '.');
      // Converter para float
      valorParcial = parseFloat(valorFormatado);
    }

    if (botaoParcial.checked && (valorParcial <= 0 || isNaN(valorParcial))) {
      alert('Por favor, preencha o valor parcial para realizar uma liquidação parcial.');
      campoValorParcial.focus();
      return;
    }
    
    let campoValorTotal = document.getElementById(`valor-liquidacao-${id}`);
    let valorTotal = parseFloat(campoValorTotal.value.replace(/\D/g, '').replace(',', '.'));
    if (valorParcial > valorTotal) {
      alert('O valor parcial não pode ser maior que o valor total da liquidação.');
      campoValorParcial.focus();
      return;
    }
    
    let campoObservacao = document.getElementById(`observacao-liquidacao-${id}`);


    let itemData = {
      id: id,
      vencimento: row.querySelector('.vencimento-row').textContent,
      descricao: row.querySelector('.descricao-row').textContent,
      observacao: campoObservacao ? campoObservacao.value : '',
      valor: campoValorTotal.value,
      conta_contabil: row.getAttribute('data-conta-contabil'),
      parcela_atual: row.getAttribute('parcela-atual'),
      parcelas_total: row.getAttribute('parcelas-total'),
      natureza: row.querySelector('.debito-row').textContent ? 'Débito' : 'Crédito',
      data_liquidacao: campoData ? campoData.value : '',
      banco_liquidacao: nomeBancoSelecionado,
      banco_id_liquidacao: idBancoSelecionado,
      valor_parcial: valorParcial > 0 ? valorParcial : undefined,
    };

    dataToSend.push(itemData);
  }

  if (dataToSend.length > 0) {
    try {
      const response = await fetch('/fluxo_de_caixa/processar_liquidacao/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();

      if (data.status === 'success') {
        window.location.reload();
      } else {
        console.error('Operação não foi bem-sucedida:', data);
      }
    } catch (error) {
      console.error('Erro na operação:', error);
    }
  }
});



// Selecionar uma checkbox de cada vez no modal de liquidação
document.addEventListener('DOMContentLoaded', function() {
  // Seleciona todas as checkboxes dentro da tabela de bancos para liquidação
  const checkboxes = document.querySelectorAll('.checkbox-personalizado-liquidacao');

  // Adiciona um ouvinte de eventos a cada checkbox
  checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
          // Quando uma checkbox é marcada, desmarca todas as outras
          if (this.checked) {
              checkboxes.forEach(function(box) {
                  // Desmarca todas as checkboxes exceto a que acionou o evento
                  if (box !== checkbox) {
                      box.checked = false;
                  }
              });
              // Após ajustar as checkboxes, atualiza o saldo
              atualizarSaldoBanco();
          }
      });
  });
});


// Mobile Buttons
function toggleFilters() {
  var formulario = document.getElementById('formulario-filtros');
  formulario.classList.toggle('show-filters');
}

function toggleBanks() {
  var formulario = document.getElementById('box-grid-bancos');
  formulario.classList.toggle('show-filters');
}

function toggleNav() {
  var navBar = document.querySelector('.nav-bar');
  if (navBar.style.left === '0px') {
      navBar.style.left = '-100%';
  } else {
      navBar.style.left = '0px';
  }
}

// Apagar lançamentos da Tabela
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('apagar-button').addEventListener('click', function() {
      var idsSelecionados = [];
      var checkboxesSelecionadas = document.querySelectorAll('.checkbox-personalizado:checked');
      checkboxesSelecionadas.forEach(function(checkbox) {
          idsSelecionados.push(checkbox.getAttribute('data-id'));
      });

      fetch('/fluxo_de_caixa/deletar_entradas/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCsrfToken()
          },
          body: JSON.stringify({ids: idsSelecionados})
      })
      .then(response => {
          if (!response.ok) {
              throw response;
          }
          return response.json();
      })
      .then(data => {
          if (data.status === 'success') {
              checkboxesSelecionadas.forEach(function(checkbox) {
                  var linhaParaRemover = checkbox.closest('tr');
                  linhaParaRemover.remove();
              });
              window.location.reload();
          } else {
              // Trata casos em que a operação não é bem-sucedida
              alert(data.message); // Exibe a mensagem de erro do servidor
              // Desmarca todas as checkboxes selecionadas
              desmarcarCheckboxes(checkboxesSelecionadas);
          }
      })
      .catch(error => {
          error.json().then(errorMessage => {
              console.error('Erro:', errorMessage);
              alert(errorMessage.message); // Exibe a mensagem de erro para o usuário
              // Desmarca todas as checkboxes selecionadas
              desmarcarCheckboxes(checkboxesSelecionadas);
          });
      });
  });
});

function getCsrfToken() {
  return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

function desmarcarCheckboxes(checkboxes) {
  checkboxes.forEach(function(checkbox) {
      checkbox.checked = false;
  });
}

// Selecionar checkboxes com o shift clicado
document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('checkbox-personalizado')) return;
  let checkboxAtual = e.target;

  if (e.shiftKey && ultimoCheckboxClicado) {
      let checkboxes = Array.from(document.querySelectorAll('.checkbox-personalizado'));
      let startIndex = checkboxes.indexOf(ultimoCheckboxClicado);
      let endIndex = checkboxes.indexOf(checkboxAtual);
      let inverterSelecao = checkboxAtual.checked;

      for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
          // Verificar se a linha da tabela onde o checkbox está localizado é visível
          let tr = checkboxes[i].closest('tr');
          if (tr && tr.style.display !== 'none') {
              checkboxes[i].checked = inverterSelecao;
          }
      }
  }

  ultimoCheckboxClicado = checkboxAtual;
});

// Aparecer barra de botões
document.addEventListener('DOMContentLoaded', function () {
  const checkboxes = document.querySelectorAll('.checkbox-personalizado');
    const botoesAcoes = document.querySelector('.botoes-acoes');
    const tabelaLancamentos = document.querySelector('.conteudo-tabela-lancamentos');
    const cancelarButton = document.querySelector('.cancelar-button');
    const apagarButton = document.querySelector('.apagar-button');
    
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
            const algumaCheckboxMarcada = Array.from(checkboxes).some(checkbox => checkbox.checked);

            if (algumaCheckboxMarcada) {
                // Pelo menos uma checkbox marcada, exibir os botões e adicionar a margem
                botoesAcoes.style.display = 'flex';
                botoesAcoes.classList.add('mostrar');
                tabelaLancamentos.style.marginBottom = '6.5rem';
              } else {
                // Nenhuma checkbox marcada, ocultar os botões e remover a margem
                botoesAcoes.classList.remove('mostrar');
                tabelaLancamentos.style.marginBottom = '0';
              }
            });
          });
          
          cancelarButton.addEventListener('click', function () {
            checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
          });
          
          // Ocultar os botões e remover a margem
          botoesAcoes.classList.remove('mostrar');
          tabelaLancamentos.style.marginBottom = '0';
        });

          apagarButton.addEventListener('click', function () {
            botoesAcoes.classList.remove('mostrar');
            tabelaLancamentos.style.marginBottom = '0';
        });
});
      
      
// Modais
function abrirModal(openBtn, modal) {
  openBtn.addEventListener('click', () => {
    modalAberto = modal;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = '17px';
    document.querySelector('.nav-bar').style.marginRight = '17px';
  });
}

function fecharModal(closeBtn, modal, formSelector, tagInputId, tagsHiddenInputId, tagContainerId) {
  closeBtn.addEventListener('click', () => {
    fechar(modal, formSelector, tagInputId, tagsHiddenInputId, tagContainerId);
  });
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fechar(modal, formSelector, tagInputId, tagsHiddenInputId, tagContainerId);
    }
  });

  modal.addEventListener('close', () => {
    fechar(modal, formSelector, tagInputId, tagsHiddenInputId, tagContainerId);
  });
}

function fechar(modal, formSelector, tagInputId, tagsHiddenInputId, tagContainerId) {
  modal.close();
  modalAberto = null;
  document.body.style.overflow = '';
  document.body.style.marginRight = '';
  document.querySelector('.nav-bar').style.marginRight = '';
  document.querySelector(formSelector).reset();

  // Verifica se o tagContainer existe antes de tentar manipulá-lo
  const tagContainer = document.getElementById(tagContainerId);
  if (tagContainer) {
      while (tagContainer.firstChild) {
          tagContainer.removeChild(tagContainer.firstChild);
      }
  }

  // Verifica se o tagInput existe antes de tentar manipulá-lo
  const tagInput = document.getElementById(tagInputId);
  if (tagInput) {
      tagInput.value = '';
  }

  // Verifica se o tagsHiddenInput existe antes de tentar manipulá-lo
  const tagsHiddenInput = document.getElementById(tagsHiddenInputId);
  if (tagsHiddenInput) {
      tagsHiddenInput.value = '';
  }

  // Oculta as seções de liquidação parcial e remove a classe 'ativo' dos elementos ajustáveis
  const secoesValorParcial = document.querySelectorAll('.valor-parcial-liquidacao');
  secoesValorParcial.forEach(secao => {
    secao.style.display = 'none';
  });

  const elementosParaAjustar = document.querySelectorAll('.lancamentos-selecionados, .label-lancamentos-selecionados');
  elementosParaAjustar.forEach(el => {
    el.classList.remove('ativo');
  });

  const labelParcial = document.querySelector('.label-parcial');
  if (labelParcial) labelParcial.style.display = 'none';

  // Desmarca todos os checkboxes 'botao-parcial'
  const todosBotoesParcial = document.querySelectorAll('.botao-parcial');
  todosBotoesParcial.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Atualiza o estado das colunas para refletir a remoção da classe 'ativo'
  atualizarEstadoColunas();
}


// Elementos do DOM
const openModalRecebimentos = document.querySelector('.recebimentos');
const openModalPagamentos = document.querySelector('.pagamentos');
const openModalTransferencias = document.querySelector('.transferencias');
const openModalLiquidacoes = document.querySelector('.liquidar-button');

const closeModalRecebimentos = document.querySelector('.modal-fechar-recebimentos');
const closeModalPagamentos = document.querySelector('.modal-fechar-pagamentos');
const closeModalTransferencias = document.querySelector('.modal-fechar-transferencias');
const closeModalLiquidacoes = document.querySelector('.modal-fechar-liquidacoes');

const modalRecebimentos = document.querySelector('.modal-recebimentos');
const modalPagamentos = document.querySelector('.modal-pagamentos');
const modalTransferencias = document.querySelector('.modal-transferencias');
const modalLiquidacoes = document.querySelector('.modal-liquidacoes');

// Event Listeners
abrirModal(openModalRecebimentos, modalRecebimentos, ".modal-form-recebimentos", 'tagInput-recebimentos', 'tagsHiddenInput-recebimentos', 'tag-container-recebimentos');
fecharModal(closeModalRecebimentos, modalRecebimentos, ".modal-form-recebimentos", 'tagInput-recebimentos', 'tagsHiddenInput-recebimentos', 'tag-container-recebimentos', "parcelas-section-recebimentos");

abrirModal(openModalPagamentos, modalPagamentos, ".modal-form-pagamentos", 'tagInput-pagamentos', 'tagsHiddenInput-pagamentos', 'tag-container-pagamentos');
fecharModal(closeModalPagamentos, modalPagamentos, ".modal-form-pagamentos", 'tagInput-pagamentos', 'tagsHiddenInput-pagamentos', 'tag-container-pagamentos', "parcelas-section-pagamentos");

abrirModal(openModalTransferencias, modalTransferencias, ".modal-form-transferencias");
fecharModal(closeModalTransferencias, modalTransferencias, ".modal-form-transferencias");

abrirModal(openModalLiquidacoes, modalLiquidacoes, ".modal-form-liquidacoes");
fecharModal(closeModalLiquidacoes, modalLiquidacoes, ".modal-form-liquidacoes");


// Evento para editar lançamentos ao clicar duas vezes nas células da tabela
// Variáveis Globais
let estaEditando = false;

// Event Listeners Principais
document.addEventListener('DOMContentLoaded', function() {
    configurarEventosModais();
    configurarEventosTabela();
});

function configurarEventosModais() {
    // Fechar modais ao pressionar a tecla Escape
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            fecharModais();
        }
    });

    // Configuração do fechamento do modal
    document.getElementById('modal-recebimentos').onclose = function() {
        onModalClose('recebimentos');
    };
    document.getElementById('modal-pagamentos').onclose = function() {
        onModalClose('pagamentos');
    };
}

function configurarEventosTabela() {
    // Evento para editar lançamentos ao clicar duas vezes nas células da tabela
    document.querySelectorAll('.row-lancamentos td:not(.checkbox-row)').forEach(cell => {
        cell.addEventListener('dblclick', function() {
            handleCellDoubleClick(cell);
        });
    });
}

// Funções de Eventos de Tabela
function handleCellDoubleClick(cell) {
  const row = cell.closest('.row-lancamentos');
  abrirModalEdicao(row);
}

// Funções de Manipulação de Modais
function abrirModalEdicao(row) {
  const natureza = row.getAttribute('data-natureza');

  if (natureza === 'Crédito') {
      abrirModalRecebimentosEdicao(row);
  } else if (natureza === 'Débito') {
      abrirModalPagamentosEdicao(row);
  }
}

function fecharModais() {
    if (document.getElementById('modal-recebimentos').open) {
        var form = document.querySelector(".modal-form-recebimentos"); // Adapte o seletor conforme necessário
        form.reset(); // Reseta o formulário
        document.getElementById('modal-recebimentos').close();
    }
    if (document.getElementById('modal-pagamentos').open) {
        var form = document.querySelector(".modal-form-pagamentos"); // Adapte o seletor conforme necessário
        form.reset(); // Reseta o formulário
        document.getElementById('modal-pagamentos').close();
    }
}

function abrirModalRecebimentosEdicao(row) {
    estaEditando = true;
    preencherDadosModal(row, 'recebimentos');
    mostrarParcelasRecebimentos(row);
    document.getElementById('modal-recebimentos').showModal();
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = '17px';
    document.querySelector('.nav-bar').style.marginRight = '17px';
}

function abrirModalPagamentosEdicao(row) {
    estaEditando = true;
    preencherDadosModal(row, 'pagamentos');
    mostrarParcelasPagamentos(row);
    document.getElementById('modal-pagamentos').showModal();
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = '17px';
    document.querySelector('.nav-bar').style.marginRight = '17px';
}

function onModalClose(tipo) {
    estaEditando = false;
    limparCamposModal(tipo);
    redefinirCampoParcelas(tipo);
}

// Funções Auxiliares de Modais
function preencherDadosModal(row, tipo) {
    const parcelasTotalOriginais = row.getAttribute('parcelas-total');
    document.getElementById(`parcelas-total-originais-${tipo}`).value = parcelasTotalOriginais;

    const vencimento = row.querySelector('.vencimento-row').textContent.trim();
    document.getElementById(`data-${tipo}`).value = formatarDataParaInput(vencimento);

    const valor = row.querySelector(`.${tipo === 'recebimentos' ? 'credito' : 'debito'}-row`).textContent.trim();
    document.getElementById(`valor-${tipo}`).value = "R$ "+valor;

    document.getElementById(`descricao-${tipo}`).value = row.querySelector('.descricao-row').textContent.trim();
    document.getElementById(`observacao-${tipo}`).value = row.querySelector('.obs-row').childNodes[0].textContent.trim();

    const tagsString = extrairTags(row);
    adicionarTagsAoContainer(tagsString, tipo);

    document.getElementById(`conta-contabil-${tipo}`).value = row.dataset.contaContabil;

    const lancamentoId = row.querySelector('.checkbox-personalizado').getAttribute('data-id');
    document.querySelector(`[name="lancamento_id_${tipo}"]`).value = lancamentoId;

    const uuid = row.querySelector('.checkbox-personalizado').getAttribute('data-uuid-row');
    document.querySelector(`[name="uuid_${tipo}"]`).value = uuid;

      // Bloqueia a edição do campo 'valor' caso o 'data-uuid-row' seja diferente de 'none'
    if (uuid !== 'None') {
      var element = document.getElementById(`valor-${tipo}`);
      element.readOnly = true;
      element.style.backgroundColor = '#B5B5B5';
      element.style.color = '#FFFFFF';
    } else {
        document.getElementById(`valor-${tipo}`).readOnly = false;
        document.getElementById(`valor-${tipo}`).style.backgroundColor = '#F4F2F2';
        document.getElementById(`valor-${tipo}`).style.color = '#202020';
    }

    simularEnter(`tagInput-${tipo}`);
}

function adicionarTagsAoContainer(tagsString, tipo) {
  const containerId = `tag-container-${tipo}`;
  const hiddenInputId = `tagsHiddenInput-${tipo}`;
  const tagContainer = document.getElementById(containerId);

  // Limpa as tags existentes no container para evitar duplicação
  while (tagContainer.firstChild) {
      tagContainer.removeChild(tagContainer.firstChild);
  }

  // Divide a string de tags e adiciona cada tag individualmente
  const tags = tagsString.split(',');
  tags.forEach(tag => {
      if (tag.trim()) {
          addTag(tag.trim(), containerId, hiddenInputId);
      }
  });
}

function limparCamposModal(tipo) {
    const inputs = document.querySelectorAll(`.modal-form-${tipo} input`);
    inputs.forEach(input => {
        if (input.type !== 'submit' && input.name !== 'csrfmiddlewaretoken') {
            input.value = '';
        }
    });
}

function redefinirCampoParcelas(tipo) {
    var select = document.getElementById(`recorrencia-${tipo}`);
    var input = document.getElementById(`parcelas-${tipo}`);
    var section = document.getElementById(`parcelas-section-${tipo}`);

    section.style.display = select.value === 'sim' ? 'block' : 'none';
    input.value = select.value === 'sim' ? '' : '1';
    input.disabled = false;
}

// Função para mostrar campo de recorrência
function mostrarParcelasRecebimentos(row) {
  var select = document.getElementById('recorrencia-recebimentos');
  var section = document.getElementById('parcelas-section-recebimentos');
  var input = document.getElementById('parcelas-recebimentos');

  section.style.display = select.value === 'sim' ? 'block' : 'none';
  if (estaEditando) {
      var parcelasTotal = row.getAttribute('parcelas-total') ? parseInt(row.getAttribute('parcelas-total')) : 1;
      var parcelaAtual = row.getAttribute('parcela-atual') ? parseInt(row.getAttribute('parcela-atual')) : 1;

      input.value = parcelaAtual;
      input.disabled = parcelasTotal > 1;
  } else {
      input.value = select.value === 'sim' ? '' : '1';
      input.disabled = false;
  }
}

function mostrarParcelasPagamentos(row) {
  var select = document.getElementById('recorrencia-pagamentos');
  var section = document.getElementById('parcelas-section-pagamentos');
  var input = document.getElementById('parcelas-pagamentos');

  section.style.display = select.value === 'sim' ? 'block' : 'none';
  if (estaEditando) {
      var parcelasTotal = row.getAttribute('parcelas-total') ? parseInt(row.getAttribute('parcelas-total')) : 1;
      var parcelaAtual = row.getAttribute('parcela-atual') ? parseInt(row.getAttribute('parcela-atual')) : 1;

      input.value = parcelaAtual;
      input.disabled = parcelasTotal > 1;
  } else {
      input.value = select.value === 'sim' ? '' : '1';
      input.disabled = false;
  }
}


// Funções de Formatação e Utilidades
function desformatarNumero(valorFormatado) {
  return valorFormatado.replace(/\./g, '').replace(',', '.');
}

function formatarDataParaInput(data) {
  const partes = data.split('/');
  return partes.reverse().join('-');
}

function simularEnter(elementId) {
  const event = new KeyboardEvent('keydown', {'key': 'Enter'});
  document.getElementById(elementId).dispatchEvent(event);
}

function extrairTags(row) {
  const tagsContainer = row.querySelector('.d-block');
  return tagsContainer ? tagsContainer.textContent.trim().replace(/^Tags:\s*/, '') : '';
}


// Função para formatar o valor de um campo como moeda brasileira
function formatarCampoValor(input) {
  // Extrair apenas os números do valor do campo
  let valorNumerico = input.value.replace(/\D/g, '');

  // Converter o valor numérico para float para manipulação
  let valorFloat = parseFloat(valorNumerico) / 100;

  // Formatar o número para incluir separador de milhar '.' e decimal ','
  let valorFormatado = valorFloat.toFixed(2) // Garantir duas casas decimais
    .replace('.', ',') // Substituir ponto por vírgula para separador decimal
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adicionar '.' como separador de milhar

  // Atualizar o valor do campo, mantendo o "R$" fixo na frente
  input.value = valorNumerico ? `R$ ${valorFormatado}` : 'R$ 0,00';

  // Tratar caso especial quando o campo é limpo para mostrar 'R$ 0,00'
  if (input.value === 'R$ 0,00') {
    input.value = 'R$ 0,00';
  }
}


// Verifica se a tecla 'Shift' foi pressionada juntamente com 'D'
document.addEventListener('keydown', function(event) {
  if (event.shiftKey && event.key === 'D') {
      var elementoFocado = document.activeElement;
      if (elementoFocado && elementoFocado.type === 'date') {
          var dataAtual = new Date().toISOString().split('T')[0];
          elementoFocado.value = dataAtual;
          event.preventDefault();
          moverParaProximoCampo(elementoFocado);
      }
  }
});

function moverParaProximoCampo(campoAtual) {
  var form = campoAtual.form;
  var index = Array.prototype.indexOf.call(form, campoAtual) + 1; // Começa no próximo elemento
  var proximoCampo;

  // Percorre os campos subsequentes do formulário até encontrar um que seja editável
  while (index < form.elements.length) {
      proximoCampo = form.elements[index];
      if (proximoCampo && !proximoCampo.disabled && !proximoCampo.readOnly && !proximoCampo.hidden && proximoCampo.tabIndex >= 0) {
          proximoCampo.focus();
          break; // Sai do loop assim que encontra um campo editável
      }
      index++; // Move para o próximo campo no formulário
  }
}


// Tags
function initializeTagInputs(inputId, containerId, hiddenInputId) {
    document.getElementById(inputId).addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        addTag(this.value.trim(), containerId, hiddenInputId);
        this.value = ''; // Limpar o campo de entrada após adicionar uma tag
      }
    });
  }

  function addTag(tag, containerId, hiddenInputId) {
    if (tag !== '') {
      const tagContainer = document.getElementById(containerId);
      const tagElement = document.createElement('div');
      const tagText = document.createElement('span');
      const tagInput = document.createElement('input');

      tagElement.classList.add('tag');
      tagText.textContent = tag;
      tagElement.appendChild(tagText);

      tagInput.value = tag;
      tagInput.addEventListener('blur', function() {
        saveTagEdit(tagInput, tagText);
        updateHiddenInput(containerId, hiddenInputId);
      });

      tagInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          saveTagEdit(tagInput, tagText);
          updateHiddenInput(containerId, hiddenInputId);
        }
      });
      
      tagElement.addEventListener('click', function() {
        let singleClick = true;
        
        setTimeout(function() {
            if (singleClick) {
                tagInput.style.display = 'inline';
                tagText.style.display = 'none';
                tagInput.focus();
            }
        }, 500); // Tempo de intervalo para contar o click único
    
        tagElement.addEventListener('dblclick', function() {
          const isBeingEdited = tagInput.style.display === 'inline';
      
          setTimeout(() => {
              if (!isBeingEdited) {
                  this.remove();
                  updateHiddenInput(containerId, hiddenInputId);
              }
          }, 250); // Ajuste o tempo conforme necessário
      });
    });

      tagElement.appendChild(tagInput);
      tagContainer.appendChild(tagElement);
      updateHiddenInput(containerId, hiddenInputId);
    }
  }

  function saveTagEdit(tagInput, tagText) {
    tagText.textContent = tagInput.value;
    tagInput.style.display = 'none';
    tagText.style.display = 'inline';
  }

  function updateHiddenInput(containerId, hiddenInputId) {
    const tagsHiddenInput = document.getElementById(hiddenInputId);
    const tagElements = document.querySelectorAll(`#${containerId} .tag span`);
    const tagsArray = Array.from(tagElements).map(tag => tag.textContent);
    tagsHiddenInput.value = tagsArray.join(',');
  }

  // Initialize for recebimentos
  initializeTagInputs('tagInput-recebimentos', 'tag-container-recebimentos', 'tagsHiddenInput-recebimentos');
  
  // Initialize for pagamentos
  initializeTagInputs('tagInput-pagamentos', 'tag-container-pagamentos', 'tagsHiddenInput-pagamentos');


// Soma de valores no campo de liquidar
function calcularTotal() {
  let total = 0;

  // Somar os valores apenas das linhas com checkboxes selecionadas
  document.querySelectorAll('.row-lancamentos').forEach(row => {
      const checkbox = row.querySelector('.checkbox-personalizado');

      if (checkbox && checkbox.checked) {
          const credito = row.querySelector('.credito-row').textContent.trim();
          const debito = row.querySelector('.debito-row').textContent.trim();

          if (credito) {
              total += formatarValor(credito);
          }

          if (debito) {
              total -= formatarValor(debito);
          }
      }
  });

  // Atualizar o campo de total a liquidar
  const totalFormatado = total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
  });
  document.querySelector('.total-liquidar-row label').textContent = totalFormatado;
}

function formatarValor(valorTexto) {
  // Remove pontos e substitui vírgula por ponto para conversão para número
  return parseFloat(valorTexto.replace(/\./g, '').replace(',', '.'));
}

// Adicionar evento listener para as checkboxes para recalcular o total quando uma checkbox é alterada
document.querySelectorAll('.checkbox-personalizado').forEach(checkbox => {
  checkbox.addEventListener('change', calcularTotal);
});

// Chamar a função calcularTotal inicialmente
calcularTotal();




// Filtro de meses e bancos
document.addEventListener("DOMContentLoaded", function() {
  const meses = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];

  const today = new Date();
  let currentMonthIndex = today.getMonth(); // Obtém o índice do mês atual (0-11)
  const currentYear = today.getFullYear();

  // Função para marcar checkboxes de meses anteriores e o mês atual
  function marcarMesesAnterioresAteAtual(index) {
      const checkboxesMeses = document.querySelectorAll('#dropdown-content-meses .mes-checkbox');
      checkboxesMeses.forEach(checkbox => {
          const [mesCheckbox, anoCheckbox] = checkbox.value.split('/');
          const mesIndex = meses.indexOf(mesCheckbox);
          const ano = parseInt(anoCheckbox, 10);
          if ((ano < currentYear) || (ano === currentYear && mesIndex <= index)) {
              checkbox.checked = true;
          }
      });
      updateButtonTextMeses();
      filtrarTabela();
  }

  // Função para encontrar e marcar o mês atual ou o próximo mês disponível
  function encontrarEMarcarMesAtualOuProximo() {
      const checkboxesMeses = document.querySelectorAll('#dropdown-content-meses .mes-checkbox');
      let mesAtualOuProximoEncontrado = false;
      let tentativas = 0;

      while (!mesAtualOuProximoEncontrado && tentativas < 12) {
          const mesAnoProcurado = `${meses[currentMonthIndex]}/${currentYear}`;
          for (const checkbox of checkboxesMeses) {
              if (checkbox.value === mesAnoProcurado) {
                  mesAtualOuProximoEncontrado = true;
                  marcarMesesAnterioresAteAtual(currentMonthIndex);
                  break;
              }
          }

          if (!mesAtualOuProximoEncontrado) {
              currentMonthIndex = (currentMonthIndex + 1) % 12;
              if (currentMonthIndex === 0) {
                  // Se passar por todos os meses e começar um novo ciclo, aumenta o ano
                  currentYear++;
              }
          }
          tentativas++;
      }

      if (!mesAtualOuProximoEncontrado) {
          console.error('Nenhum mês válido encontrado. Considere revisar os valores dos checkboxes.');
      }
  }

  encontrarEMarcarMesAtualOuProximo();

  // Adiciona listeners para checkboxes de meses
  document.querySelectorAll('#dropdown-content-meses .mes-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          updateButtonTextMeses();
          filtrarTabela();
      });
  });

  // Adiciona listeners para checkboxes de bancos
  document.querySelectorAll('#dropdown-content-bancos .banco-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          updateButtonTextBancos();
          filtrarBancos();
      });
  });

  // Adiciona listeners para checkboxes de natureza
  document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        updateButtonTextNatureza();
        filtrarTabela();
    });
  });

  // Listener para fechar os dropdowns ao clicar fora
  document.addEventListener('click', function(event) {
      if (!event.target.closest("#dropdown-content-meses") && !event.target.closest("#dropdown-button-meses")) {
          document.getElementById("dropdown-content-meses").classList.remove("show");
      }
      if (!event.target.closest("#dropdown-content-bancos") && !event.target.closest("#dropdown-button-bancos")) {
          document.getElementById("dropdown-content-bancos").classList.remove("show");
      }
      if (!event.target.closest("#dropdown-content-natureza") && !event.target.closest("#dropdown-button-natureza")) {
        document.getElementById("dropdown-content-natureza").classList.remove("show");
    }
  });

  // Inicializa a filtragem para configurar a visualização inicial com base nos filtros padrão
  filtrarBancos();

  document.querySelectorAll('.saldo-total-row').forEach(function(cell) {
    // Extrai o texto, remove o símbolo de moeda e espaços, substitui a vírgula por ponto e verifica se é negativo
    var saldoTexto = cell.textContent.replace(/\s/g, ''); // Remove espaços
    var saldo = parseFloat(saldoTexto.replace('.', '').replace(',', '.')); // Remove pontos e troca vírgulas por pontos antes de converter

      // Verifica se o número é negativo e altera a cor do texto
      if (!isNaN(saldo) && saldo < 0) {
          cell.style.color = '#740000'; // Cor vermelha
      }
      else {
        cell.style.color = '#000acf';
    }
  });
});


// Funções para manipular os eventos de abertura dos dropdowns
function toggleDropdownMeses(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-meses").classList.toggle("show");
}

function toggleDropdownBancos(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-bancos").classList.toggle("show");
}

function toggleDropdownNatureza(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-natureza").classList.toggle("show");
}

// Funções para selecionar e desmarcar todos os checkboxes
function selectAllMeses(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-meses .mes-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = true);
  updateButtonTextMeses();
  filtrarTabela();
}

function deselectAllMeses(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-meses .mes-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  updateButtonTextMeses();
  filtrarTabela();
}

function selectAllBancos(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = true);
  updateButtonTextBancos();
  filtrarBancos();
}

function deselectAllBancos(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  updateButtonTextBancos();
  filtrarBancos();
}

function selectAllNatureza(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = true);
  updateButtonTextNatureza();
  filtrarTabela();
}

function deselectAllNatureza(event) {
  event.stopPropagation();
  const checkboxes = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  updateButtonTextNatureza();
  filtrarTabela();
}

// Funções para atualizar o texto dos botões de dropdown
function updateButtonTextMeses() {
  const selectedCount = document.querySelectorAll('#dropdown-content-meses .mes-checkbox:checked').length;
  const totalOptions = document.querySelectorAll('#dropdown-content-meses .mes-checkbox').length;
  const buttonText = selectedCount === 0 ? "Selecione" : 
                     selectedCount === totalOptions ? "Todos Selecionados" : 
                     `${selectedCount} Selecionado(s)`;
  document.getElementById('dropdown-button-meses').textContent = buttonText;
}

function updateButtonTextBancos() {
  const selectedCount = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox:checked').length;
  const totalOptions = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox').length;
  const buttonText = selectedCount === 0 ? "Selecione" : 
                     selectedCount === totalOptions ? "Todos Selecionados" : 
                     `${selectedCount} Selecionado(s)`;
  document.getElementById('dropdown-button-bancos').textContent = buttonText;
}

function updateButtonTextNatureza() {
  const selectedCount = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox:checked').length;
  const totalOptions = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').length;
  const buttonText = selectedCount === 0 ? "Crédito, Débito" : 
                     selectedCount === totalOptions ? "Crédito, Débito" : 
                     `${selectedCount} Selecionado(s)`;
  document.getElementById('dropdown-button-natureza').textContent = buttonText;
}

// Filtros
function filtrarTabela() {
  const totalCheckboxesMeses = document.querySelectorAll('#dropdown-content-meses .mes-checkbox').length;
  const checkboxesMesesSelecionados = document.querySelectorAll('#dropdown-content-meses .mes-checkbox:checked');
  const totalCheckboxesNatureza = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').length;
  const checkboxesNaturezaSelecionados = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox:checked');
  
  var intervalosMesesSelecionados = Array.from(checkboxesMesesSelecionados).map(checkbox => ({
      inicio: new Date(checkbox.getAttribute('data-inicio-mes')),
      fim: new Date(checkbox.getAttribute('data-fim-mes'))
  }));

  let naturezasSelecionadas = Array.from(checkboxesNaturezaSelecionados).map(checkbox => checkbox.value);

  let selecionarTodosMeses = checkboxesMesesSelecionados.length === 0 || checkboxesMesesSelecionados.length === totalCheckboxesMeses;
  let selecionarTodaNatureza = checkboxesNaturezaSelecionados.length === 0 || checkboxesNaturezaSelecionados.length === totalCheckboxesNatureza;

  var dataInicio = document.getElementById("data-inicio").value;
  var dataFim = document.getElementById("data-fim").value;
  var filtroDescricao = document.getElementById("caixa-pesquisa").value.toUpperCase();
  var filtroTags = document.getElementById("caixa-pesquisa-tags").value.toUpperCase();
  var filtroContaContabil = document.getElementById("contas-contabeis").value.toUpperCase();

  var dataInicioObj = dataInicio ? new Date(dataInicio) : null;
  var dataFimObj = dataFim ? new Date(dataFim) : null;
  let mesesAnosVisiveis = new Set();
  
  var trLancamentos = document.querySelectorAll("#tabela-lancamentos .row-lancamentos");
  
  trLancamentos.forEach(function(linha) {
      var descricao = linha.querySelector(".descricao-row").textContent.toUpperCase();
      var observacao = linha.querySelector(".obs-row").textContent.toUpperCase();
      var contaContabil = linha.getAttribute('data-conta-contabil').toUpperCase();
      var dataVencimento = new Date(linha.querySelector(".vencimento-row").textContent.split('/').reverse().join('-'));
      var tags = linha.querySelector(".d-block") ? linha.querySelector(".d-block").textContent.toUpperCase() : "";

      var debitoCelula = linha.querySelector(".debito-row").textContent.trim();
      var naturezaLancamento = debitoCelula === "" ? "Crédito" : "Débito";

      var descricaoObservacaoMatch = descricao.includes(filtroDescricao) || observacao.includes(filtroDescricao);
      var tagMatch = filtroTags === "" || tags.includes(filtroTags);
      var contaContabilMatch = filtroContaContabil === "" || contaContabil.includes(filtroContaContabil);
      var mesMatch = selecionarTodosMeses || intervalosMesesSelecionados.some(intervalo => {
        var dataVencimento = new Date(linha.querySelector(".vencimento-row").textContent.split('/').reverse().join('-'));
        return dataVencimento >= intervalo.inicio && dataVencimento <= intervalo.fim;
      });
      var naturezaLancamento = linha.getAttribute('data-natureza');
      var naturezaMatch = selecionarTodaNatureza || naturezasSelecionadas.includes(naturezaLancamento);
      var dataMatch = (!dataInicioObj || dataVencimento >= dataInicioObj) && (!dataFimObj || dataVencimento <= dataFimObj);

      if (descricaoObservacaoMatch && tagMatch && contaContabilMatch && mesMatch && naturezaMatch && dataMatch) {
        linha.style.display = "";

        // Adiciona o mês/ano ao conjunto de meses/anos visíveis se a linha estiver visível
        let mesAno = new Date(linha.querySelector(".vencimento-row").textContent.split('/').reverse().join('-')).toLocaleString('default', { month: '2-digit', year: 'numeric' });
        mesesAnosVisiveis.add(mesAno);
      } else {
        linha.style.display = "none";
      }
  });

  // Filtrar as linhas 'linha-total-mes'
  document.querySelectorAll("#tabela-lancamentos .linha-total-mes").forEach(row => {
    let textoMesAno = row.querySelector("td:nth-child(2)").textContent;
    let mesAnoMatch = textoMesAno.match(/\d{2}\/\d{4}$/); // Captura MM/YYYY
    if (mesAnoMatch && mesesAnosVisiveis.has(mesAnoMatch[0])) {
        row.style.display = "";
    } else {
        row.style.display = "none";
    }
  });

  calcularSaldoAcumulado();
}

// Event listeners para os elementos de filtro
document.getElementById('caixa-pesquisa').addEventListener('keyup', filtrarTabela);
document.getElementById('caixa-pesquisa-tags').addEventListener('keyup', filtrarTabela);
document.getElementById('contas-contabeis').addEventListener('change', filtrarTabela);
document.getElementById('data-inicio').addEventListener('change', filtrarTabela);
document.getElementById('data-fim').addEventListener('change', filtrarTabela);

// Adiciona ouvintes de evento para os checkboxes de meses para refiltrar a tabela quando eles mudam
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.dropdown-options input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', filtrarTabela);
  });
  // Inicializa a tabela com o filtro aplicado
  filtrarTabela();
});


// Calcula o saldo total dos bancos, sem filtragem
document.addEventListener("DOMContentLoaded", function() {
  atualizarSaldoTotalBancos();
});

function atualizarSaldoTotalBancos() {
  var linhasBanco = document.querySelectorAll(".row-bancos");
  var saldoTotal = 0;

  linhasBanco.forEach(function(linha) {
    var celulaSaldo = linha.querySelector(".saldo-banco-row");
    if (celulaSaldo) {
      var saldo = parseSaldo(celulaSaldo.textContent);
      saldoTotal += saldo;
    }
  });

  // Formata o saldo total como moeda
  var saldoFormatado = formatarComoMoeda(saldoTotal);

  // Atualiza o saldo total na interface do usuário
  var saldoTotalBancoRow = document.querySelector(".saldo-total-banco-row");
  if (saldoTotalBancoRow) {
    saldoTotalBancoRow.textContent = saldoFormatado;
  }

  // Atualiza o saldo total no campo de liquidação
  var saldoTotalBancoLiquidacaoRow = document.querySelector(".saldo-total-banco-liquidacao-row");
  if (saldoTotalBancoLiquidacaoRow) {
    saldoTotalBancoLiquidacaoRow.textContent = saldoFormatado;
  }

  // Atualizar os saldos do fluxo de caixa com o novo saldo total
  atualizarSaldosFluxoCaixa(saldoTotal);
}

// Função para atualizar os saldos do fluxo de caixa
function atualizarSaldosFluxoCaixa(saldoInicial) {
  var linhasFluxoCaixa = document.querySelectorAll("#tabela-lancamentos .row-lancamentos");
  var saldoAtual = saldoInicial;

  linhasFluxoCaixa.forEach(function(linha) {
    var debitoCelula = linha.querySelector(".debito-row");
    var creditoCelula = linha.querySelector(".credito-row");
    var debito = debitoCelula && debitoCelula.textContent ? parseSaldo(debitoCelula.textContent) : 0;
    var credito = creditoCelula && creditoCelula.textContent ? parseSaldo(creditoCelula.textContent) : 0;
    
    saldoAtual += credito - debito;
    
    var saldoCelula = linha.querySelector(".saldo-row");
    if (saldoCelula) {
      saldoCelula.textContent = formatarComoMoeda(saldoAtual);
    }
    else {
      linha.style.display = "none"; 
    }
  });
}

// Calcular o saldo total dos bancos que estão sendo filtrados
function filtrarBancos() {
  console.log
  var checkboxesBancosSelecionados = document.querySelectorAll('.dropdown-options .banco-checkbox:checked');
  var bancosSelecionados = Array.from(checkboxesBancosSelecionados).map(checkbox => checkbox.value);
  var todosSelecionados = bancosSelecionados.length === 0 || bancosSelecionados.includes('Todos');

  var tabelaBancos = document.getElementById("box-grid-bancos").querySelector("tbody");
  var linhas = tabelaBancos.querySelectorAll(".row-bancos");

  var saldoTotal = 0;

  linhas.forEach(linha => {
      var bancoLinhaId = linha.getAttribute("data-banco-id");
      
      if (todosSelecionados || bancosSelecionados.includes(bancoLinhaId)) {
          linha.style.display = ""; // Mostra a linha
          var saldoBanco = parseSaldo(linha.querySelector(".saldo-banco-row").textContent);
          saldoTotal += saldoBanco;
      } else {
          linha.style.display = "none"; // Esconde a linha
      }
  });

  var saldoTotalBancoRow = document.querySelector(".saldo-total-banco-row");
  if (saldoTotalBancoRow) {
      saldoTotalBancoRow.textContent = formatarComoMoeda(saldoTotal);
  }

  // Agora atualizarSaldosFluxoCaixa é chamada dentro do escopo de filtrarBancos
  // Remova ou comente esta linha se não deseja atualizar saldos de fluxo de caixa baseado na filtragem de bancos
atualizarSaldosFluxoCaixa(saldoTotal);
}

// Calcular saldo no fluxo de caixa
function calcularSaldoAcumulado() {
  // Obtem o saldo inicial total dos bancos.
  var saldoTotalBancoRow = document.querySelector(".saldo-total-banco-row");
  var saldoInicial = saldoTotalBancoRow ? parseSaldo(saldoTotalBancoRow.textContent) : 0;
  var saldoAtual = saldoInicial;
  
  // Seleciona todas as linhas visíveis do fluxo de caixa.
  var linhasFluxoCaixa = document.querySelectorAll("#tabela-lancamentos .row-lancamentos");
  
  linhasFluxoCaixa.forEach(function(linha) {
    if (linha.style.display !== "none") {
      var debitoCelula = linha.querySelector(".debito-row");
      var creditoCelula = linha.querySelector(".credito-row");
      var debito = debitoCelula && debitoCelula.textContent ? parseSaldo(debitoCelula.textContent) : 0;
      var credito = creditoCelula && creditoCelula.textContent ? parseSaldo(creditoCelula.textContent) : 0;
      
      // Calcula o saldo atual baseado no saldo anterior, créditos e débitos.
      saldoAtual += credito - debito;
      
      // Atualiza a célula de saldo da linha atual.
      var saldoCelula = linha.querySelector(".saldo-row");
      if (saldoCelula) {
        saldoCelula.textContent = formatarComoMoeda(saldoAtual);
      }
    }
  });
}

function parseSaldo(valorSaldo) {
  var numero = valorSaldo.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
  return parseFloat(numero) || 0;
}

function formatarComoMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.saldo-total-row').forEach(function(cell) {
      var saldoTexto = cell.textContent;
      // Remove caracteres de formatação exceto o sinal de menos, ponto e vírgula
      var saldoNumerico = saldoTexto.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.');
      // Converte para float
      var saldo = parseFloat(saldoNumerico);

      // Verifica se o número é negativo
      if (saldo < 0) {
          cell.style.color = '#740000'; // Muda a cor para vermelho
      }
  });
});
