const API_URL = window.location.port === '3000' ? '' : 'http://localhost:3000';

const CATALOGO_FILMES = [
  { nome: 'Stranger Things', imagem: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg' },
  { nome: 'Round 6', imagem: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg' },
  { nome: 'Wandinha', imagem: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg' },
  { nome: 'La Casa de Papel', imagem: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg' },
  { nome: 'Alerta Vermelho', imagem: 'https://image.tmdb.org/t/p/w500/wdE6ewaKZHr62bLqCn7A2DiGShm.jpg' },
  { nome: 'Resgate', imagem: 'https://image.tmdb.org/t/p/w500/wlfDxbGEsW58vGhFljKkcR5IxDj.jpg' },
  { nome: 'Bridgerton', imagem: 'https://image.tmdb.org/t/p/w500/luoKpgVwi1E5nQsi7W0UuKHu2Rq.jpg' },
  { nome: 'One Piece: A Série', imagem: 'https://image.tmdb.org/t/p/w500/rVX05xRKS5JhEYQFObCi4lAnZT4.jpg' }
];

// ==========================================
// 1. LOGIN (index.html)
// ==========================================
const formLogin = document.getElementById('login-form');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value.trim();

    try {
      const res = await fetch(`${API_URL}/usuarios`);
      const usuarios = await res.json();

      const conta = usuarios.find(
        (u) => u.email.toLowerCase() === email && String(u.senha) === senha
      );

      if (!conta) {
        alert('E-mail ou senha incorretos!');
        return;
      }

      sessionStorage.setItem('usuarioLogado', JSON.stringify(conta));

      if (conta.tipo === 'admin' || email.includes('admin')) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'boas_vindas.html';
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor. Rode "node server.js" no terminal.');
    }
  });
}

// ==========================================
// 2. CADASTRO COMPLETO (cadastro.html)
// ==========================================
const formCadastro = document.getElementById('cadastro-form');
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoUsuario = {
      nome: document.getElementById('nome').value.trim(),
      sobrenome: document.getElementById('sobrenome').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      senha: document.getElementById('senha').value.trim(),
      rua: document.getElementById('rua').value.trim(),
      cep: document.getElementById('cep').value.trim(),
      cidade: document.getElementById('cidade').value.trim(),
      estado: document.getElementById('estado').value.trim().toUpperCase(),
      telefone: document.getElementById('telefone').value.trim(),
      tipo: 'usuario'
    };

    try {
      const resBusca = await fetch(`${API_URL}/usuarios`);
      const usuarios = await resBusca.json();

      if (usuarios.some((u) => u.email.toLowerCase() === novoUsuario.email)) {
        alert('Este e-mail já está cadastrado!');
        return;
      }

      if (usuarios.some((u) => u.cpf && u.cpf === novoUsuario.cpf)) {
        alert('Este CPF já está cadastrado!');
        return;
      }

      await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      });

      alert('Conta criada com sucesso! Faça login para continuar.');
      window.location.href = 'index.html';
    } catch (err) {
      alert('Erro ao cadastrar. Verifique se o servidor está rodando.');
    }
  });
}

// ==========================================
// 3. CATÁLOGO DE FILMES (boas_vindas.html)
// ==========================================
function carregarCatalogo() {
  const container = document.getElementById('listaFilmes');
  if (!container) return;

  const dadosSessao = sessionStorage.getItem('usuarioLogado');
  if (dadosSessao) {
    const user = JSON.parse(dadosSessao);
    const spanNome = document.getElementById('nomeUsuario');
    if (spanNome) {
      spanNome.innerText = user.sobrenome ? `${user.nome} ${user.sobrenome}` : user.nome;
    }

    if (user.tipo === 'admin' || user.email.includes('admin')) {
      const btnAdmin = document.getElementById('btn-ir-admin');
      if (btnAdmin) btnAdmin.style.display = 'inline-flex';
    }
  }

  container.innerHTML = CATALOGO_FILMES.map(
    (filme) => `
      <div class="quadrado">
        <img src="${filme.imagem}" alt="${filme.nome}">
        <p>${filme.nome}</p>
      </div>
    `
  ).join('');
}

// ==========================================
// 4. PAINEL ADMINISTRATIVO (admin.html)
// ==========================================
async function iniciarAdmin() {
  const tabelaUsuarios = document.getElementById('tabela-usuarios');
  if (!tabelaUsuarios) return;

  const dadosSessao = sessionStorage.getItem('usuarioLogado');
  if (!dadosSessao) {
    alert('Você precisa fazer login como administrador!');
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(dadosSessao);
  if (user.tipo !== 'admin' && !user.email.includes('admin')) {
    alert('Acesso restrito apenas para administradores!');
    window.location.href = 'boas_vindas.html';
    return;
  }

  const spanAdmin = document.getElementById('admin-nome');
  if (spanAdmin) spanAdmin.innerText = user.nome;

  listarUsuariosAdmin();
}

async function listarUsuariosAdmin() {
  const tbody = document.getElementById('tabela-usuarios');
  if (!tbody) return;

  const res = await fetch(`${API_URL}/usuarios`);
  const usuarios = await res.json();

  tbody.innerHTML = usuarios
    .map(
      (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nome} ${u.sobrenome || ''}</td>
        <td>${u.cpf || '-'}</td>
        <td>${u.email}</td>
        <td>${u.telefone || '-'}</td>
        <td>${u.cidade ? `${u.cidade}/${u.estado || ''} - ${u.rua || ''} (${u.cep || ''})` : '-'}</td>
        <td>${u.tipo === 'admin' ? '<strong style="color:#E50914;">Admin</strong>' : 'Assinante'}</td>
        <td>
          ${
            u.tipo !== 'admin'
              ? `<button onclick="excluirUsuario(${u.id})" style="width: auto; height: 34px; padding: 0 14px; margin: 0; font-size: 0.85rem;">Remover</button>`
              : '<span style="color:#737373;">Protegido</span>'
          }
        </td>
      </tr>
    `
    )
    .join('');
}

const formAddUsuario = document.getElementById('form-add-usuario');
if (formAddUsuario) {
  formAddUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const novoUsuario = {
      nome: document.getElementById('novo-nome').value.trim(),
      sobrenome: document.getElementById('novo-sobrenome').value.trim(),
      cpf: document.getElementById('novo-cpf').value.trim(),
      email: document.getElementById('novo-email').value.trim().toLowerCase(),
      senha: document.getElementById('novo-senha').value.trim(),
      telefone: document.getElementById('novo-telefone').value.trim(),
      cep: document.getElementById('novo-cep').value.trim(),
      rua: document.getElementById('novo-rua').value.trim(),
      cidade: document.getElementById('novo-cidade').value.trim(),
      estado: document.getElementById('novo-estado').value.trim().toUpperCase(),
      tipo: document.getElementById('novo-tipo').value
    };

    await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    });

    formAddUsuario.reset();
    listarUsuariosAdmin();
  });
}

async function excluirUsuario(id) {
  if (!confirm('Deseja remover este usuário?')) return;
  await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
  listarUsuariosAdmin();
}

function sair() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCatalogo();
  iniciarAdmin();
});