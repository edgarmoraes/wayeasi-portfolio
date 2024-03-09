// Botão de Retornar
document.getElementById('retornar-button').addEventListener('click', function() {
    let selectedRows = document.querySelectorAll('.checkbox-personalizado:checked');
    let dataToSend = [];
    
    selectedRows.forEach(function(checkbox) {
        let row = checkbox.closest('.row-lancamentos');
        let debito = row.querySelector('.debito-row').textContent.trim();
        let credito = row.querySelector('.credito-row').textContent.trim();
        dataToSend.push({
            id: checkbox.getAttribute('data-id'),
            vencimento: row.querySelector('.vencimento-row').textContent,
            descricao: row.querySelector('.descricao-row').textContent,
            valor: debito || credito, // Usa débito se disponível, senão credito
            conta_contabil: row.getAttribute('data-conta-contabil'),
            parcela_atual: row.getAttribute('parcela-atual'),
            parcelas_total: row.getAttribute('parcelas-total'),
            natureza: debito ? 'Débito' : 'Crédito',
            uuid_correlacao: row.getAttribute('data-uuid-correlacao'),
            uuid_correlacao_parcelas: row.getAttribute('data-uuid-correlacao-parcelas')
        });
    });

    fetch('/realizado/processar_retorno/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSend)
    }).then(response => response.json())
      .then(data => {
          if(data.status === 'success') {
              // Remove as linhas da tabela no frontend
              selectedRows.forEach(checkbox => {
                  let row = checkbox.closest('.row-lancamentos');
                  row.remove();
              });
              // Recarrega a página para refletir as mudanças no backend
              window.location.reload();
          }
      }).catch(error => console.error('Erro ao processar retorno:', error));
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
  // Seleciona apenas as checkboxes com a classe '.checkbox-personalizado'
  const checkboxes = document.querySelectorAll('input[type="checkbox"].checkbox-personalizado');
  const botoesAcoes = document.querySelector('.botoes-acoes');
  const tabelaLancamentos = document.querySelector('.conteudo-tabela-lancamentos');
  const cancelarButton = document.querySelector('.cancelar-button');
    
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
});


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


document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.row-lancamentos').forEach(row => {
      row.addEventListener('dblclick', function() {
          abrirModalEdicao(this);
      });
  });

  // Adiciona lógica para fechar o modal e resetar o formulário com a tecla Esc
  document.addEventListener('keydown', function(event) {
      if (event.key === "Escape") {
          const modal = document.getElementById('modal-realizado');
          if (modal.open) {
              fecharModal(modal);
          }
      }
  });
});

function abrirModalEdicao(row) {
  const id = row.getAttribute('data-id-row');
  const vencimento = row.querySelector('.vencimento-row').textContent.trim();
  const descricao = row.querySelector('.descricao-row').textContent.trim();
  const observacao = row.querySelector('.obs-row').textContent.split('Tags:')[0].trim().replace(/\s+/g, ' ');
  const valor = row.querySelector('.debito-row').textContent.trim() || row.querySelector('.credito-row').textContent.trim();
  const contaContabil = row.getAttribute('data-conta-contabil');
  const tags = row.querySelector('.obs-row').textContent.trim().split('Tags:')[1];
  const parcelaAtual = row.getAttribute('parcela-atual');
  const parcelasTotal = row.getAttribute('parcelas-total');
  const uuid = row.getAttribute('data-uuid-correlacao');
  const uuidParcelas = row.getAttribute('data-uuid-correlacao-parcelas');

  preencherDadosModalRealizado(id, vencimento, descricao, observacao, valor, contaContabil, tags, parcelaAtual, parcelasTotal, uuid, uuidParcelas);

  document.getElementById('modal-realizado').showModal();
  document.body.style.overflow = 'hidden';
  document.body.style.marginRight = '17px';
  document.querySelector('.nav-bar').style.marginRight = '17px';
}

function preencherDadosModalRealizado(id, vencimento, descricao, observacao, valor, contaContabil, tags, parcelaAtual, parcelasTotal, uuid, uuidParcelas) {
  document.querySelector('.modal-form-realizado [name="lancamento_id_realizado"]').value = id;
  document.getElementById('data-realizado').value = formatarDataParaInput(vencimento);
  document.getElementById('descricao-realizado').value = descricao;
  document.getElementById('observacao-realizado').value = observacao;
  document.getElementById('valor-realizado').value = "R$ "+valor;
  document.getElementById('conta-contabil-realizado').value = contaContabil;
  document.getElementById('parcelas-realizado').value = `${parcelaAtual}/${parcelasTotal}`;
  document.querySelector('.modal-form-realizado [name="uuid_realizado"]').value = uuid;
  document.querySelector('.modal-form-realizado [name="uuid_parcelas_realizado"]').value = uuidParcelas;

  // Limpa o container de tags antes de adicionar novas
  const tagContainer = document.getElementById('tag-container-realizado');
  tagContainer.innerHTML = '';
  tags && tags.split(',').forEach(tag => {
      if (tag.trim()) {
          adicionarTag(tag.trim(), 'tag-container-realizado');
      }
  });
}

function formatarDataParaInput(data) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}


function adicionarTag(tag, containerId) {
  const container = document.getElementById(containerId);
  const tagElement = document.createElement('span');
  tagElement.classList.add('tag');
  tagElement.textContent = tag;
  container.appendChild(tagElement);
}

// Função para fechar o modal e voltar às configurações iniciais
function fecharModal(modal) {
  modal.close();
  document.body.style.overflow = '';
  document.body.style.marginRight = '';
  document.querySelector('.nav-bar').style.marginRight = '';
  const form = document.querySelector(".modal-form-realizado");
  form.reset();
  document.getElementById('tag-container-realizado').innerHTML = ''; // Limpa as tags
}

document.querySelector('.modal-fechar-realizado').addEventListener('click', function() {
  const modal = document.getElementById('modal-realizado');
  fecharModal(modal);
});

// Edição de realizado
document.addEventListener('DOMContentLoaded', function() {
  const formRealizado = document.querySelector('.modal-form-realizado');

  formRealizado.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede a submissão padrão do formulário

      const lancamentoId = document.querySelector('[name="lancamento_id_realizado"]').value;
      const dataRealizado = document.getElementById('data-realizado').value;
      const descricaoRealizado = document.getElementById('descricao-realizado').value;
      const observacaoRealizado = document.getElementById('observacao-realizado').value;
      const uuid = document.querySelector('[name="uuid_realizado"]').value;
      const uuidParcelas = document.querySelector('[name="uuid_parcelas_realizado"]').value;

      const hoje = new Date();
      const dataRealizadoDate = new Date(dataRealizado);
      hoje.setHours(0, 0, 0, 0);

      if (dataRealizadoDate > hoje) {
          alert('A data não pode ser futura. Por favor, selecione a data de hoje ou uma anterior.');
          return;
      }

      if (uuid !== 'None' && uuidParcelas === 'None') {
        atualizarDataLancamentosRelacionados(uuid, dataRealizado)
            .then(response => response.json()) // Garantir que estamos processando a resposta como JSON
            .then(data => {
                console.log('Lançamentos relacionados atualizados:', data);
                return atualizarLancamento(lancamentoId, dataRealizado, descricaoRealizado, observacaoRealizado);
            })
            .then(response => response.json())
            .then(data => {
                console.log('Lançamento atualizado com sucesso:', data);
                window.location.reload();
            })
            .catch(error => console.error('Erro:', error));
    } else {
        atualizarLancamento(lancamentoId, dataRealizado, descricaoRealizado, observacaoRealizado)
            .then(response => response.json())
            .then(data => {
                console.log('Lançamento atualizado com sucesso:', data);
                window.location.reload();
            })
            .catch(error => console.error('Erro ao atualizar o lançamento:', error));
    }
  });
});

function atualizarDataLancamentosRelacionados(uuid, novaData) {
  return fetch(`/realizado/atualizar-lancamentos-uuid/${uuid}/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name="csrfmiddlewaretoken"]').value
      },
      body: JSON.stringify({ novaData: novaData })
  });
}

function atualizarLancamento(lancamentoId, dataRealizado, descricaoRealizado, observacaoRealizado) {
  const dados = { vencimento: dataRealizado, descricao: descricaoRealizado, observacao: observacaoRealizado };
  const url = `/realizado/atualizar-lancamento/${lancamentoId}/`;

  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name="csrfmiddlewaretoken"]').value
      },
      body: JSON.stringify(dados)
  })
  .then(response => response.json())
  .then(data => {
      console.log('Lançamento atualizado com sucesso:', data);
      window.location.reload();
  })
  .catch(error => console.error('Erro ao atualizar o lançamento:', error));
}


















// 1. Definições de Funções Básicas
function toggleDropdownMeses(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-meses").classList.toggle("show");
}

function updateButtonTextMeses() {
  const totalMeses = document.querySelectorAll('#dropdown-content-meses .mes-checkbox').length;
  const totalSelecionados = document.querySelectorAll('#dropdown-content-meses .mes-checkbox:checked').length;
  const buttonText = document.getElementById('dropdown-button-meses');
  buttonText.textContent = totalSelecionados === 0 ? 'Selecione' : 
                           totalSelecionados === totalMeses ? 'Todos Selecionados' : 
                           `${totalSelecionados} Selecionado(s)`;
}

function selectAllMeses(event) {
  event.stopPropagation();
  document.querySelectorAll('#dropdown-content-meses .mes-checkbox').forEach(checkbox => checkbox.checked = true);
  updateButtonTextMeses();
  filtrarTabela();
}

function deselectAllMeses(event) {
  event.stopPropagation();
  document.querySelectorAll('#dropdown-content-meses .mes-checkbox').forEach(checkbox => checkbox.checked = false);
  updateButtonTextMeses();
  filtrarTabela();
}

// Função para alternar a visibilidade do dropdown de bancos
function toggleDropdownBancos(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-bancos").classList.toggle("show");
}

// Função para marcar todos os checkboxes dos bancos
function selectAllBancos(event) {
  event.stopPropagation();
  document.querySelectorAll('#dropdown-content-bancos .banco-checkbox').forEach(checkbox => {
    checkbox.checked = true;
  });
  coletarBancosSelecionados(); // Atualiza a lista de bancos selecionados e aplica a filtragem
  updateButtonBancosText(); // Atualiza o texto do botão
}

// Função para desmarcar todos os checkboxes dos bancos
function deselectAllBancos(event) {
  event.stopPropagation();
  document.querySelectorAll('#dropdown-content-bancos .banco-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  coletarBancosSelecionados(); // Atualiza a lista de bancos selecionados e aplica a filtragem
  updateButtonBancosText(); // Atualiza o texto do botão
}

// Função para atualizar o texto do botão de bancos
function updateButtonBancosText() {
  const totalBancos = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox').length;
  const totalSelecionados = document.querySelectorAll('#dropdown-content-bancos .banco-checkbox:checked').length;
  const buttonText = document.getElementById('dropdown-button-bancos');
  buttonText.textContent = totalSelecionados === 0 ? 'Selecione' : 
                           totalSelecionados === totalBancos ? 'Todos Selecionados' : 
                           `${totalSelecionados} Selecionado(s)`;
}

// Função para alternar a visibilidade do dropdown de natureza
function toggleDropdownNatureza(event) {
  event.stopPropagation();
  document.getElementById("dropdown-content-natureza").classList.toggle("show");
}

// Função para marcar todos os checkboxes da natureza
function selectAllNatureza(event) {
  if (event) event.stopPropagation();
  document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').forEach(checkbox => {
    checkbox.checked = true;
  });
  coletarNaturezasSelecionadas();
  updateButtonNaturezaText();
}

// Função para desmarcar todos os checkboxes da natureza
function deselectAllNatureza(event) {
  if (event) event.stopPropagation();
  document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  coletarNaturezasSelecionadas();
  updateButtonNaturezaText();
}

// Função para atualizar o texto do botão de natureza
function updateButtonNaturezaText() {
  const totalNaturezas = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').length;
  const totalSelecionados = document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox:checked').length;
  const buttonText = document.getElementById('dropdown-button-natureza');
  buttonText.textContent = totalSelecionados === 0 ? 'Selecione' : 
                           totalSelecionados === totalNaturezas ? 'Todos Selecionados' : 
                           `${totalSelecionados} Selecionado(s)`;
}

let naturezasSelecionadas = [];

function coletarNaturezasSelecionadas() {
  naturezasSelecionadas = Array.from(document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox:checked')).map(el => el.value);
  filtrarTabela();
}

// 2. Lógica de Seleção de Mês
function selecionarMesAtualEfiltrar() {
  let today = new Date();
  let month = today.getMonth(); // Mês atual como número (0-11)
  let year = today.getFullYear();

  const checkboxes = document.querySelectorAll('#dropdown-content-meses .mes-checkbox');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  let found = false;

  while (!found) {
      const currentMonthYear = `${meses[month]}/${year}`;
      for (const checkbox of checkboxes) {
          if (checkbox.value.toLowerCase() === currentMonthYear.toLowerCase()) {
              checkbox.checked = true;
              found = true;
              break;
          }
      }
      // Se não encontrou, retrocede um mês e ajusta o ano se necessário
      if (!found) {
          month--;
          if (month < 0) {
              month = 11;
              year--;
              // Se ajustamos o ano, atualizamos a data "today" para garantir que não voltaremos no tempo indefinidamente
              today = new Date(year, month, 1);
          }
          // Se retrocedemos para antes da data mais antiga disponível, paramos de procurar
          if (today < new Date(document.querySelector('.mes-checkbox').value)) {
              break;
          }
      }
  }

  if (!found) {
      console.error('Nenhum checkbox correspondente aos meses anteriores encontrado.');
  } else {
      updateButtonTextMeses();
      filtrarTabela();
  }
}

function formatarDataParaMesAno(data) {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const partesData = data.split('/');
  const mes = parseInt(partesData[1], 10) - 1; // Converte 'mm' para índice de array (0-11)
  const ano = partesData[2]; // 'aaaa'
  return `${meses[mes]}/${ano}`; // Retorna 'mmm/aaaa'
}

// 3. Inicialização e Event Listeners
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('#dropdown-content-meses .mes-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
          updateButtonTextMeses();
          filtrarTabela();
      });
  });

  document.addEventListener('click', event => {
      if (!event.target.closest("#dropdown-content-meses") && !event.target.closest("#dropdown-button-meses")) {
          document.getElementById("dropdown-content-meses").classList.remove("show");
      }
  });

  selecionarMesAtualEfiltrar();
});

document.addEventListener("DOMContentLoaded", function() {
  // Event listeners para os bancos, similar aos meses
  document.querySelectorAll('.banco-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateButtonBancosText();
    });
  });

  // Event listener para fechar dropdowns ao clicar fora
  document.addEventListener('click', event => {
    if (!event.target.closest("#dropdown-content-bancos") && !event.target.closest("#dropdown-button-bancos")) {
      document.getElementById("dropdown-content-bancos").classList.remove("show");
    }
  });

  coletarBancosSelecionados(); // Isso irá filtrar a tabela de bancos ao carregar a página
  updateButtonBancosText();
  atualizarSaldoTotalBancos();

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

let bancosSelecionados = [];

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateButtonNaturezaText();
      coletarNaturezasSelecionadas();
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest("#dropdown-content-natureza") && !event.target.closest("#dropdown-button-natureza")) {
      document.getElementById("dropdown-content-natureza").classList.remove("show");
    }
  });
});

function coletarBancosSelecionados() {
  bancosSelecionados = Array.from(document.querySelectorAll('.banco-checkbox:checked')).map(el => el.value);
  
  // Aplica a filtragem na tabela de lançamentos
  filtrarTabela();

  // Aplica a filtragem na tabela de bancos
  const linhasTabelaBancos = document.querySelectorAll('.tabela-bancos .row-bancos');
  linhasTabelaBancos.forEach(linha => {
    const idBanco = linha.getAttribute('data-banco-id');
    if (bancosSelecionados.length === 0 || bancosSelecionados.includes(idBanco)) {
      linha.style.display = ''; // Mostra a linha se o banco está selecionado ou se nenhum banco está selecionado.
    } else {
      linha.style.display = 'none'; // Oculta a linha se o banco não está selecionado.
    }
  });

  // Atualiza o saldo total dos bancos visíveis
  atualizarSaldoTotalBancos();
}

// Certifique-se de adicionar o listener para a seleção de bancos
document.querySelectorAll('.banco-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', coletarBancosSelecionados);
});

// Aplica a filtragem inicial com base no estado dos checkboxes dos bancos
coletarBancosSelecionados();

// 4. Filtragem da Tabela Adaptada para Incluir Naturezas
function filtrarTabela() {
  const contaContabilSelecionada = document.getElementById('contas-contabeis').value;
  const inputInicio = document.getElementById('data-inicio').value;
  const inputFim = document.getElementById('data-fim').value;
  
  // Alterado para coletar naturezas de um conjunto de checkboxes ao invés de um único dropdown
  const naturezasSelecionadas = Array.from(document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox:checked')).map(el => el.value.toLowerCase().trim());
  
  const mesesSelecionados = Array.from(document.querySelectorAll('.mes-checkbox:checked')).map(el => el.value);
  const inputDescricao = document.getElementById('caixa-pesquisa').value.toLowerCase();
  const inputTags = document.getElementById('caixa-pesquisa-tags').value.toLowerCase();

  const dataInicio = inputInicio ? new Date(inputInicio + "T00:00:00") : null;
  const dataFim = inputFim ? new Date(inputFim + "T23:59:59") : null;

  let mesesExibidos = new Set();

  document.querySelectorAll('.row-lancamentos').forEach(function(row) {
    const contaContabil = row.getAttribute('data-conta-contabil');
    const dataTexto = row.querySelector('.vencimento-row').textContent;
    const partesData = dataTexto.split('/');
    const dataLancamento = new Date(partesData[2], partesData[1] - 1, partesData[0]);
    const natureza = row.getAttribute('data-natureza').toLowerCase().trim();

    const descricao = row.querySelector('.descricao-row').textContent.toLowerCase();
    const observacao = row.querySelector('.obs-row').textContent.toLowerCase();
    const tags = row.querySelector('.tags-row') ? row.querySelector('.tags-row').textContent.toLowerCase() : "";
    const mesAno = formatarDataParaMesAno(dataTexto);
    const idBancoLancamento = row.getAttribute('data-banco-id-liquidacao');
    const bancoMatch = bancosSelecionados.length === 0 || bancosSelecionados.includes(idBancoLancamento);

    const descricaoMatch = descricao.includes(inputDescricao);
    const observacaoMatch = observacao.includes(inputDescricao) && !tags.includes(inputDescricao);
    const tagsMatch = tags.includes(inputTags);

    const contaContabilMatch = !contaContabilSelecionada || contaContabil === contaContabilSelecionada;
    const dataMatch = (!dataInicio || dataLancamento >= dataInicio) && (!dataFim || dataLancamento <= dataFim);
    
    // Adaptado para verificar se a natureza da linha está dentro das naturezas selecionadas
    const naturezaMatch = naturezasSelecionadas.length === 0 || naturezasSelecionadas.includes(natureza);
    
    const mesMatch = mesesSelecionados.length === 0 || mesesSelecionados.includes(mesAno);

    if (contaContabilMatch && dataMatch && naturezaMatch && mesMatch && (descricaoMatch || observacaoMatch) && tagsMatch && bancoMatch) {
      row.style.display = "";
      let dataFormatadaParaConjunto = partesData[1] + "/" + partesData[2]; // Formato MM/YYYY
      mesesExibidos.add(dataFormatadaParaConjunto);
    } else {
      row.style.display = "none";
    }
  });

  document.querySelectorAll('.linha-total-mes').forEach(row => {
    let textoMesAno = row.cells[1].textContent;
    let mesAno = textoMesAno.match(/\d{2}\/\d{4}$/);
    if (mesAno && mesesExibidos.has(mesAno[0])) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  atualizarSaldoTotalBancos();
}

document.getElementById('caixa-pesquisa').addEventListener('input', filtrarTabela);
document.getElementById('caixa-pesquisa-tags').addEventListener('input', filtrarTabela);
document.getElementById('contas-contabeis').addEventListener('change', filtrarTabela);
document.getElementById('data-inicio').addEventListener('change', filtrarTabela);
document.getElementById('data-fim').addEventListener('change', filtrarTabela);
document.getElementById('natureza').addEventListener('change', filtrarTabela);
document.querySelectorAll('.mes-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', filtrarTabela);
});

// Lembre-se de adicionar listeners para os checkboxes de natureza
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('#dropdown-content-natureza .natureza-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', filtrarTabela);
  });
});

// Inicializa listeners de mudança para os checkboxes dos bancos
document.querySelectorAll('.banco-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', coletarBancosSelecionados);
});

// 5. Saldo total dos bancos
function atualizarSaldoTotalBancos() {
  let novoSaldoTotal = 0;
  const linhasBancos = document.querySelectorAll('.tabela-bancos .row-bancos');

  linhasBancos.forEach(linha => {
    const idBanco = linha.getAttribute('data-banco-id');
    if (bancosSelecionados.length === 0 || bancosSelecionados.includes(idBanco)) {
      let valorSaldoTexto = linha.querySelector('.saldo-banco-row').textContent;
      valorSaldoTexto = valorSaldoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
      const valorSaldo = parseFloat(valorSaldoTexto);
      novoSaldoTotal += valorSaldo;
    }
  });

  // Atualiza o saldo total global e na interface
  saldoTotal = novoSaldoTotal;
  const saldoTotalFormatado = saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.querySelector('.saldo-total-banco-row').textContent = saldoTotalFormatado;

  // Chama a função para atualizar os saldos das linhas com o novo saldo total
  atualizarSaldosDasLinhas();
}

// Função para atualizar os saldos de cada linha na tabela de lançamentos
function atualizarSaldosDasLinhas() {
  let saldoAtual = saldoTotal;

  // Obtém todas as linhas de lançamento e as converte para um array
  const linhas = Array.from(document.querySelectorAll('.row-lancamentos'));

  // Itera sobre as linhas de lançamento de baixo para cima
  for (let i = linhas.length - 1; i >= 0; i--) {
    const linha = linhas[i];
    const idBancoLancamento = linha.getAttribute('data-banco-id-liquidacao');

    // Se um único banco está selecionado e esta linha não pertence a ele, pular para a próxima
    if (bancosSelecionados.length === 1 && bancosSelecionados[0] !== idBancoLancamento) {
      continue;
    }

    // Obter a natureza da linha e ajustar o saldo
    const natureza = linha.getAttribute('data-natureza').trim();
    let valor = 0;

    if (natureza === 'Crédito') {
      const valorCredito = linha.querySelector('.credito-row').textContent;
      valor = parseFloat(valorCredito.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      saldoAtual -= valor; // Crédito subtrai do saldo
    } else if (natureza === 'Débito') {
      const valorDebito = linha.querySelector('.debito-row').textContent;
      valor = parseFloat(valorDebito.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
      saldoAtual += valor; // Débito soma ao saldo
    }
    
    // Atualizar o saldo da linha
    linha.querySelector('.saldo-row').textContent = saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

// Adicionar event listeners para atualizar o saldo quando a seleção de bancos mudar
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.banco-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      coletarBancosSelecionados();
      atualizarSaldoTotalBancos(); // Isso irá recalcular o saldo total e atualizar as linhas de lançamento
    });
  });

  // Chamada inicial para configurar o saldo
  coletarBancosSelecionados();
  atualizarSaldoTotalBancos();
});