// ========================================
// ADMIN - Login simples (credenciais em localStorage)
// ========================================
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'admin123';

function doLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;

  const savedUser = localStorage.getItem('admin_user') || DEFAULT_USER;
  const savedPass = localStorage.getItem('admin_pass') || DEFAULT_PASS;

  if (user === savedUser && pass === savedPass) {
    localStorage.setItem('admin_logged', 'true');
    showAdmin();
  } else {
    alert('Usuário ou senha incorretos');
  }
}

function doLogout() {
  localStorage.removeItem('admin_logged');
  location.reload();
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  loadAdminConfig();
  loadProducts();
  loadPedidos();
  loadPaymentConfig();
}

// ========================================
// TABS
// ========================================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// ========================================
// CONFIG WEBHOOKS
// ========================================
function loadAdminConfig() {
  document.getElementById('adminCfgChat').value = localStorage.getItem('cfg_chat') || '';
  document.getElementById('adminCfgOrder').value = localStorage.getItem('cfg_order') || '';
  document.getElementById('adminCfgProducts').value = localStorage.getItem('cfg_products') || '';
}

function saveAdminConfig() {
  localStorage.setItem('cfg_chat', document.getElementById('adminCfgChat').value.trim());
  localStorage.setItem('cfg_order', document.getElementById('adminCfgOrder').value.trim());
  localStorage.setItem('cfg_products', document.getElementById('adminCfgProducts').value.trim());
  showAdminToast('Configurações salvas!');
}

// ========================================
// PRODUTOS CRUD (via Supabase webhook)
// ========================================
function getProductsUrl() {
  return localStorage.getItem('cfg_products') || '';
}

async function getProducts() {
  const url = getProductsUrl();
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listar' })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.log('Erro ao buscar produtos remotos:', err);
    }
  }
  // Fallback localStorage
  return JSON.parse(localStorage.getItem('produtos') || '[]');
}

function saveProducts(prods) {
  localStorage.setItem('produtos', JSON.stringify(prods));
}

async function loadProducts() {
  let prods = await getProducts();
  
  // Se não há produtos, carregar padrão
  if (prods.length === 0) {
    prods = [
      { id: 1, nome: 'X-Burguer', preco: 18.00, imagem_url: 'img/x-burguer.jpg', descricao: 'Pão, hambúrguer, queijo, alface e tomate', categoria: 'lanche' },
      { id: 2, nome: 'X-Salada', preco: 20.00, imagem_url: 'img/x-salada.jpg', descricao: 'Pão, hambúrguer, queijo, alface, tomate e maionese', categoria: 'lanche' },
      { id: 3, nome: 'X-Bacon', preco: 22.00, imagem_url: 'img/x-bacon.jpg', descricao: 'Pão, hambúrguer, queijo, bacon crocante', categoria: 'lanche' },
      { id: 4, nome: 'X-Tudo', preco: 28.00, imagem_url: 'img/x-tudo.jpg', descricao: 'Pão, 2 hambúrgueres, queijo, bacon, ovo', categoria: 'lanche' },
      { id: 5, nome: 'Batata Frita', preco: 15.00, imagem_url: 'img/batata-frita.jpg', descricao: 'Porção generosa', categoria: 'acompanhamento' },
      { id: 6, nome: 'Onion Rings', preco: 17.00, imagem_url: 'img/onion-rings.jpg', descricao: 'Anéis de cebola empanados', categoria: 'acompanhamento' },
      { id: 7, nome: 'Refrigerante Lata', preco: 7.00, imagem_url: 'img/refrigerante.jpg', descricao: 'Coca, Guaraná ou Sprite', categoria: 'bebida' },
      { id: 8, nome: 'Suco Natural', preco: 10.00, imagem_url: 'img/suco-natural.jpg', descricao: 'Laranja, limão ou maracujá', categoria: 'bebida' },
      { id: 9, nome: 'Água', preco: 4.00, imagem_url: 'img/agua.jpg', descricao: 'Água mineral 500ml', categoria: 'bebida' },
      { id: 10, nome: 'Milk Shake', preco: 16.00, imagem_url: 'img/milk-shake.jpg', descricao: 'Chocolate, morango ou baunilha', categoria: 'bebida' }
    ];
    saveProducts(prods);
  }

  renderProductsTable(prods);
}

function renderProductsTable(prods) {
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = prods.map(p => `
    <tr>
      <td><img src="${p.imagem_url || 'img/placeholder.svg'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.src='img/placeholder.svg'"></td>
      <td>${p.nome}</td>
      <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
      <td>${p.descricao || p.desc || ''}</td>
      <td>
        <button class="btn-edit" onclick="editProduct(${p.id})" title="Editar">✏️</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})" title="Excluir">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openProductForm() {
  document.getElementById('productForm').style.display = 'block';
  document.getElementById('productFormTitle').textContent = 'Novo Produto';
  document.getElementById('prodEditId').value = '';
  document.getElementById('prodImagem').value = '';
  document.getElementById('prodNome').value = '';
  document.getElementById('prodPreco').value = '';
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodCategoria').value = 'lanche';
}

function closeProductForm() {
  document.getElementById('productForm').style.display = 'none';
}

async function editProduct(id) {
  const prods = await getProducts();
  const p = prods.find(x => x.id === id);
  if (!p) return;

  document.getElementById('productForm').style.display = 'block';
  document.getElementById('productFormTitle').textContent = 'Editar Produto';
  document.getElementById('prodEditId').value = p.id;
  document.getElementById('prodImagem').value = p.imagem_url || '';
  document.getElementById('prodNome').value = p.nome;
  document.getElementById('prodPreco').value = p.preco;
  document.getElementById('prodDesc').value = p.descricao || p.desc || '';
  document.getElementById('prodCategoria').value = p.categoria || 'lanche';
}

async function saveProduct() {
  const editId = document.getElementById('prodEditId').value;
  const url = getProductsUrl();

  const produto = {
    id: editId ? parseInt(editId) : undefined,
    imagem_url: document.getElementById('prodImagem').value || 'img/placeholder.svg',
    nome: document.getElementById('prodNome').value,
    preco: parseFloat(document.getElementById('prodPreco').value),
    descricao: document.getElementById('prodDesc').value,
    categoria: document.getElementById('prodCategoria').value
  };

  if (url) {
    try {
      const action = editId ? 'atualizar' : 'criar';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...produto })
      });
    } catch (err) {
      console.log('Erro ao salvar produto remoto:', err);
    }
  }

  // Também salva local como cache
  const prods = await getProducts();
  if (editId) {
    const idx = prods.findIndex(p => p.id === parseInt(editId));
    if (idx > -1) prods[idx] = { ...prods[idx], ...produto };
  } else {
    produto.id = Date.now();
    prods.push(produto);
  }
  saveProducts(prods);
  renderProductsTable(prods);
  closeProductForm();
  showAdminToast(editId ? 'Produto atualizado!' : 'Produto criado!');
}

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  const url = getProductsUrl();

  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'excluir', id })
      });
    } catch (err) {
      console.log('Erro ao excluir produto remoto:', err);
    }
  }

  let prods = await getProducts();
  prods = prods.filter(p => p.id !== id);
  saveProducts(prods);
  renderProductsTable(prods);
  showAdminToast('Produto excluído');
}

// ========================================
// PEDIDOS
// ========================================
function loadPedidos(filter) {
  let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  pedidos.sort((a, b) => b.id - a.id);

  if (filter && filter !== 'todos') {
    pedidos = pedidos.filter(p => p.status === filter);
  }

  renderPedidos(pedidos);
}

function filterPedidos(status) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  loadPedidos(status);
}

function renderPedidos(pedidos) {
  const container = document.getElementById('pedidosList');

  if (pedidos.length === 0) {
    container.innerHTML = '<p class="hint-text">Nenhum pedido encontrado.</p>';
    return;
  }

  container.innerHTML = pedidos.map(p => {
    const data = new Date(p.data).toLocaleString('pt-BR');
    const itensStr = (p.itens || []).map(i => `${i.quantidade}x ${i.nome}`).join(', ');
    return `
      <div class="pedido-card">
        <div class="pedido-card-header">
          <span class="pedido-id">#${p.id}</span>
          <span class="pedido-status status-${p.status}">${p.status}</span>
        </div>
        <div class="pedido-data">${data}</div>
        <div class="pedido-cliente">👤 ${p.cliente?.nome || 'N/A'} · 📱 ${p.cliente?.telefone || 'N/A'}</div>
        <div class="pedido-itens">📋 ${itensStr || 'Sem itens'}</div>
        <div class="pedido-total">Total: R$ ${(p.total || 0).toFixed(2)}</div>
        <div class="pedido-actions">
          <select onchange="updatePedidoStatus(${p.id}, this.value)">
            <option value="confirmado" ${p.status==='confirmado'?'selected':''}>Confirmado</option>
            <option value="preparando" ${p.status==='preparando'?'selected':''}>Preparando</option>
            <option value="entrega" ${p.status==='entrega'?'selected':''}>Saiu p/ Entrega</option>
            <option value="entregue" ${p.status==='entregue'?'selected':''}>Entregue</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function updatePedidoStatus(pedidoId, newStatus) {
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (pedido) {
    pedido.status = newStatus;
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    showAdminToast(`Pedido #${pedidoId} → ${newStatus}`);
  }
}

// ========================================
// PAGAMENTOS CONFIG
// ========================================
function loadPaymentConfig() {
  const cfg = JSON.parse(localStorage.getItem('payment_config') || '{}');
  document.getElementById('payPix').checked = cfg.pix !== false;
  document.getElementById('payCredito').checked = cfg.credito !== false;
  document.getElementById('payDebito').checked = cfg.debito !== false;
  document.getElementById('payDinheiro').checked = cfg.dinheiro !== false;
  document.getElementById('pixKey').value = cfg.pixKey || '';
}

function savePaymentConfig() {
  const cfg = {
    pix: document.getElementById('payPix').checked,
    credito: document.getElementById('payCredito').checked,
    debito: document.getElementById('payDebito').checked,
    dinheiro: document.getElementById('payDinheiro').checked,
    pixKey: document.getElementById('pixKey').value.trim()
  };
  localStorage.setItem('payment_config', JSON.stringify(cfg));
  showAdminToast('Config de pagamento salva!');
}

// ========================================
// TOAST & INIT
// ========================================
function showAdminToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('admin_logged') === 'true') {
    showAdmin();
  }
});
