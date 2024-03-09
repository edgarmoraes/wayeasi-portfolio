// Modais
function abrirModal(openBtn, modal) {
  openBtn.addEventListener('click', () => {
    modalAberto = modal;
    modal.showModal();
    document.body.style.overflow = 'hidden';
  });
}

function fecharModal(closeBtn, modal, formSelector) {
  closeBtn.addEventListener('click', () => {
    fechar(modal, formSelector);
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fechar(modal, formSelector);
    }
  });

  modal.addEventListener('close', () => {
    fechar(modal, formSelector);
  });
}

function fechar(modal, formSelector) {
  modal.close();
  document.body.style.overflow = '';
  document.querySelectorAll(".modal-apagar-bancos").forEach(botao => botao.style.display = 'none');
  limparCamposModal()
  document.querySelector(formSelector).reset();
}

// Elementos do DOM
const openModalBancos = document.querySelector('.adicionar-bancos');

const closeModalBancos = document.querySelector('.modal-fechar-bancos');

const modalBancos = document.querySelector('.modal-bancos');

function limparCamposModal() {
  const inputs = document.querySelectorAll(`.modal-bancos input`);
  inputs.forEach(input => {
      if (input.type !== 'submit' && input.name !== 'csrfmiddlewaretoken') {
          input.value = '';
      }
  });
}

// Event Listeners
abrirModal(openModalBancos, modalBancos, ".modal-form-bancos");
fecharModal(closeModalBancos, modalBancos, ".modal-form-bancos");

// Função para formatar o valor de um campo como moeda brasileira
function formatarCampoValorBancos(input) {
  // Remover caracteres não numéricos
  let valor = input.value.replace(/\D/g, '');

  // Remover zeros à esquerda
  valor = valor.replace(/^0+/, '');

  // Adicionar o ponto decimal nas duas últimas casas decimais
  if (valor.length > 2) {
      valor = valor.slice(0, -2) + '.' + valor.slice(-2);
  } else if (valor.length === 2) {
      valor = '0.' + valor;
  } else if (valor.length === 1) {
      valor = '0.0' + valor;
  } else {
      valor = '0.00';
  }

  // Atualizar o valor do campo
  input.value = valor;
}

// Edição de banco
document.addEventListener('DOMContentLoaded', function () {
  var linhasBancos = document.querySelectorAll('.row-bancos');

  linhasBancos.forEach(function (linha) {
      linha.addEventListener('dblclick', function () {
          // Abra o modal aqui
          const modalBancos = document.querySelector('.modal-bancos');
          modalBancos.showModal();
          
          // Torna o botão de apagar visível
          document.querySelectorAll(".modal-apagar-bancos").forEach(botao => botao.style.display = 'block');

          // Preencha os campos do modal com os dados da linha clicada
          const banco = linha.querySelector('.banco-row').textContent;
          const agencia = linha.querySelector('.ag-row').textContent;
          const conta = linha.querySelector('.conta-row').textContent;
          const saldoInicial = linha.getAttribute('data-saldo-inicial').replace(',', '.');
          const idBanco = linha.getAttribute('data-id-banco');
          const statusBanco = linha.querySelector('.status-row').textContent.trim(); // Use trim() para remover espaços em branco

          document.getElementById('descricao-bancos').value = banco;
          document.getElementById('agencia-banco').value = agencia;
          document.getElementById('conta-banco').value = conta;
          document.getElementById('saldo-inicial').value = saldoInicial;
          document.querySelector('[name="id_banco"]').value = idBanco;
          const selectStatusBanco = document.querySelector('#status-banco');
          selectStatusBanco.value = statusBanco.toLowerCase() === 'ativo' ? 'ativo' : 'inativo';
      });
  });

  // Fechar o modal ao clicar no botão "Cancelar"
  var btnFechar = document.querySelector('.modal-fechar-bancos');
  btnFechar.addEventListener('click', function () {
      var modalBancos = document.querySelector('.modal-bancos');
      modalBancos.close();
      
      // Torna o botão de apagar invisível
      document.querySelectorAll(".modal-apagar-bancos").forEach(botao => botao.style.display = 'none');
  });
  document.querySelector('.modal-apagar-bancos').addEventListener('click', function () {
    const idBanco = document.querySelector('[name="id_banco"]').value; // Obtém o ID do banco a ser excluído
    if (!confirm("Tem certeza que deseja apagar este banco?")) return; // Confirmação antes de excluir
    
    fetch(`/configuracoes/verificar_e_excluir_banco/${idBanco}/`, {
      method: 'POST',
      headers: {
          'X-CSRFToken': getCsrfToken() // Inclui CSRF token
      },
    })
    .then(response => {
        if (!response.ok) throw new Error('Falha na requisição');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert("Banco excluído com sucesso.");
            window.location.reload(); // Recarrega a página para atualizar a lista de bancos
        } else {
            alert(data.error); // Exibe mensagem de erro retornada pelo servidor
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert("Falha ao tentar excluir o banco.");
    });

    // Torna o botão de apagar invisível novamente e fecha o modal
    this.style.display = 'none';
    document.querySelector('.modal-bancos').close();
});

// Função para obter CSRF token do cookie
function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}
});


document.querySelector('.modal-form-bancos').addEventListener('submit', function(e) {
  e.preventDefault();  // Impede o envio tradicional do formulário

  // Dados do formulário
  var formData = new FormData(this);

  // Requisição AJAX
  fetch('/configuracoes/salvar_banco/', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if(data.success) {
          // Feche o modal aqui
          document.querySelector('.modal-bancos').close();
          // Torna o botão de apagar invisível
          document.querySelectorAll(".modal-apagar-bancos").forEach(botao => botao.style.display = 'none');
          window.location.reload();
          // Atualize a lista de bancos aqui
      } else {
          alert("Houve um erro ao salvar as informações.");
      }
  })
  .catch(error => console.error('Error:', error));
});
