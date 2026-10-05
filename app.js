// Armazenamento de dados local (localStorage)
let clientes = JSON.parse(localStorage.getItem('agendaqui_clientes')) || [];
let servicos = JSON.parse(localStorage.getItem('agendaqui_servicos')) || [];
let agendamentos = JSON.parse(localStorage.getItem('agendaqui_agendamentos')) || [];

// Elementos do DOM
const formCliente = document.getElementById('form-cliente');
const formServico = document.getElementById('form-servico');
const formAgendamento = document.getElementById('form-agendamento');

const selectCliente = document.getElementById('select-cliente');
const selectServico = document.getElementById('select-servico');
const tabelaAgendamentos = document.getElementById('tabela-agendamentos');
const alertBox = document.getElementById('alert-box');
const totalAgendamentosElem = document.getElementById('total-agendamentos');
const emptyStateElem = document.getElementById('empty-state');

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
  atualizarSelects();
  renderizarAgendamentos();
});

// Função para exibir alertas na tela
function exibirAlerta(mensagem, tipo = 'danger') {
  alertBox.textContent = mensagem;
  alertBox.className = `alert alert-${tipo}`;
  
  setTimeout(() => {
    alertBox.className = 'alert hidden';
  }, 4000);
}

// Cadastrar Cliente
formCliente.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome-cliente').value.trim();
  const telefone = document.getElementById('telefone-cliente').value.trim();

  const novoCliente = { id: Date.now(), nome, telefone };
  clientes.push(novoCliente);
  
  localStorage.setItem('agendaqui_clientes', JSON.stringify(clientes));
  
  formCliente.reset();
  atualizarSelects();
  exibirAlerta('Cliente cadastrado com sucesso!', 'success');
});

// Cadastrar Serviço
formServico.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome-servico').value.trim();
  const preco = parseFloat(document.getElementById('preco-servico').value);

  const novoServico = { id: Date.now(), nome, preco };
  servicos.push(novoServico);
  
  localStorage.setItem('agendaqui_servicos', JSON.stringify(servicos));
  
  formServico.reset();
  atualizarSelects();
  exibirAlerta('Serviço cadastrado com sucesso!', 'success');
});

// Atualizar os selects do formulário de agendamento
function atualizarSelects() {
  selectCliente.innerHTML = '<option value="">Selecione um cliente...</option>';
  selectServico.innerHTML = '<option value="">Selecione um serviço...</option>';

  clientes.forEach(c => {
    selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });

  servicos.forEach(s => {
    selectServico.innerHTML += `<option value="${s.id}">${s.nome} - R$ ${s.preco.toFixed(2)}</option>`;
  });
}

// Criar Agendamento e Identificar Conflitos de Horário
formAgendamento.addEventListener('submit', (e) => {
  e.preventDefault();

  const clienteId = parseInt(selectCliente.value);
  const servicoId = parseInt(selectServico.value);
  const data = document.getElementById('data-agendamento').value;
  const hora = document.getElementById('hora-agendamento').value;

  // Validação: Verificação de conflito de horário
  const conflito = agendamentos.some(item => item.data === data && item.hora === hora);

  if (conflito) {
    exibirAlerta(`Ops! Já existe um atendimento agendado para o dia ${formatarData(data)} às ${hora}h.`, 'danger');
    return;
  }

  const clienteObj = clientes.find(c => c.id === clienteId);
  const servicoObj = servicos.find(s => s.id === servicoId);

  const novoAgendamento = {
    id: Date.now(),
    cliente: clienteObj.nome,
    servico: servicoObj.nome,
    preco: servicoObj.preco,
    data,
    hora
  };

  agendamentos.push(novoAgendamento);
  localStorage.setItem('agendaqui_agendamentos', JSON.stringify(agendamentos));

  formAgendamento.reset();
  renderizarAgendamentos();
  exibirAlerta('Agendamento realizado com sucesso!', 'success');
});

// Renderizar Agendamentos na Tabela
function renderizarAgendamentos() {
  tabelaAgendamentos.innerHTML = '';

  // Ordena os agendamentos por data e hora
  agendamentos.sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

  if (agendamentos.length === 0) {
    emptyStateElem.style.display = 'block';
  } else {
    emptyStateElem.style.display = 'none';
  }

  totalAgendamentosElem.textContent = `${agendamentos.length} agendamento(s)`;

  agendamentos.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${formatarData(item.data)}</strong> às ${item.hora}h</td>
      <td>${item.cliente}</td>
      <td>${item.servico}</td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td>
        <button class="btn btn-danger" onclick="removerAgendamento(${item.id})">Cancelar</button>
      </td>
    `;
    tabelaAgendamentos.appendChild(tr);
  });
}

// Remover / Cancelar Agendamento
function removerAgendamento(id) {
  agendamentos = agendamentos.filter(item => item.id !== id);
  localStorage.setItem('agendaqui_agendamentos', JSON.stringify(agendamentos));
  renderizarAgendamentos();
  exibirAlerta('Agendamento removido.', 'success');
}

// Função Utilitária para Formatar Data no padrão brasileiro (DD/MM/AAAA)
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}