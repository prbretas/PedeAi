// ========================================
// LOGIN
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
  loadEmpresa();
  loadProducts();
  loadPedidos();
  loadPromos();
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
// EMPRESA CONFIG
// ========================================
function loadEmpresa() {
  const emp = JSON.parse(localStorage.getItem('empresa_config') || '{}');
  document.getElementById('empNome').value = emp.nome || '';
  document.getElementById('empTelefone').value = emp.telefone || '';
  document.getElementById('empEndereco').value = emp.endereco || '';
  document.getElementById('empLogo').value = emp.logo_url || '';
  document.getElementById('empImagem').value = emp.imagem_url || '';
  document.getElementById('empHorario').value = emp.horario || 'Seg-Sáb 11h-23h | Dom 16h-22h';
  document.getElementById('empTempoEntrega').value = emp.tempo_entrega || '30-45 min';
  document.getElementById('empTaxaEntrega').value = emp.taxa_entrega || 5;
  document.getElementById('empGratisAcima').value = emp.entrega_gratis_acima || 50;
  document.getElementById('empInstagram').value = emp.link_instagram || '';
  document.getElementById('empFacebook').value = emp.link_facebook || '';
  document.getElementById('empWhatsapp').value = emp.link_whatsapp || '';
  document.getElementById('empPix').checked = emp.aceita_pix !== false;
  document.getElementById('empCredito').checked = emp.aceita_credito !== false;
  document.getElementById('empDebito').checked = emp.aceita_debito !== false;
  document.getElementById('empDinheiro').checked = emp.aceita_dinheiro !== false;
  document.getElementById('empChavePix').value = emp.chave_pix || '';
}

function saveEmpresa() {
  const emp = {
    nome: document.getElementById('empNome').value,
    telefone: document.getElementById('empTelefone').value,
    endereco: document.getElementById('empEndereco').value,
    logo_url: document.getElementById('empLogo').value,
    imagem_url: document.getElementById('empImagem').value,
    horario: document.getElementById('empHorario').value,
    tempo_entrega: document.getElementById('empTempoEntrega').value,
    taxa_entrega: parseFloat(document.getElementById('empTaxaEntrega').value) || 5,
    entrega_gratis_acima: parseFloat(document.getElementById('empGratisAcima').value) || 50,
    link_instagram: document.getElementById('empInstagram').value,
    link_facebook: document.getElementById('empFacebook').value,
    link_whatsapp: document.getElementById('empWhatsapp').value,
    aceita_pix: document.getElementById('empPix').checked,
    aceita_credito: document.getElementById('empCredito').checked,
    aceita_debito: document.getElementById('empDebito').checked,
    aceita_dinheiro: document.getElementById('empDinheiro').checked,
    chave_pix: document.getElementById('empChavePix').value
  };
  localStorage.setItem('empresa_config', JSON.stringify(emp));
  // Sync payment config for the site
  localStorage.setItem('payment_config', JSON.stringify({
    pix: emp.aceita_pix, credito: emp.aceita_credito,
    debito: emp.aceita_debito, dinheiro: emp.aceita_dinheiro,
    pixKey: emp.chave_pix
  }));
  showAdminToast('Empresa salva! O site será atualizado.');
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
// PRODUTOS CRUD
// ========================================
function getProductsFromStorage() {
  return JSON.parse(localStorage.getItem('produtos') || '[]');
}

function saveProductsToStorage(prods) {
  localStorage.setItem('produtos', JSON.stringify(prods));
}

function loadProducts() {
  let prods = getProductsFromStorage();
  if (prods.length === 0) {
    prods = [
      { id: 1, nome: 'X-Burguer', preco: 18.00, imagem_url: 'img/x-burguer.jpg', descricao: 'Pão, hambúrguer, queijo', categoria: 'lanche' },
      { id: 2, nome: 'X-Salada', preco: 20.00, imagem_url: 'img/x-salada.jpg', descricao: 'Pão, hambúrguer, queijo, alface', categoria: 'lanche' },
      { id: 3, nome: 'X-Bacon', preco: 22.00, imagem_url: 'img/x-bacon.jpg', descricao: 'Pão, hambúrguer, queijo, bacon', categoria: 'lanche' },
      { id: 4, nome: 'X-Tudo', preco: 28.00, imagem_url: 'img/x-tudo.jpg', descricao: 'Pão, 2 hambúrgueres, tudo', categoria: 'lanche' },
      { id: 5, nome: 'Batata Frita', preco: 15.00, imagem_url: 'img/batata-frita.jpg', descricao: 'Porção generosa', categoria: 'acompanhamento' },
      { id: 6, nome: 'Refrigerante', preco: 7.00, imagem_url: 'img/refrigerante.jpg', descricao: 'Coca, Guaraná, Sprite', categoria: 'bebida' },
    ];
    saveProductsToStorage(prods);
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
      <td>${p.categoria || '-'}</td>
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

function editProduct(id) {
  const prods = getProductsFromStorage();
  const p = prods.find(x => x.id === id);
  if (!p) return;
  document.getElementById('productForm').style.display = 'block';
  document.getElementById('productFormTitle').textContent = 'Editar Produto';
  document.getElementById('prodEditId').value = p.id;
  document.getElementById('prodImagem').value = p.imagem_url || '';
  document.getElementById('prodNome').value = p.nome;
  document.getElementById('prodPreco').value = p.preco;
  document.getElementById('prodDesc').value = p.descricao || '';
  document.getElementById('prodCategoria').value = p.categoria || 'lanche';
}

function saveProduct() {
  const prods = getProductsFromStorage();
  const editId = document.getElementById('prodEditId').value;
  const produto = {
    id: editId ? parseInt(editId) : Date.now(),
    imagem_url: document.getElementById('prodImagem').value || 'img/placeholder.svg',
    nome: document.getElementById('prodNome').value,
    preco: parseFloat(document.getElementById('prodPreco').value),
    descricao: document.getElementById('prodDesc').value,
    categoria: document.getElementById('prodCategoria').value
  };
  if (editId) {
    const idx = prods.findIndex(p => p.id === parseInt(editId));
    if (idx > -1) prods[idx] = produto;
  } else {
    prods.push(produto);
  }
  saveProductsToStorage(prods);
  renderProductsTable(prods);
  closeProductForm();
  showAdminToast(editId ? 'Produto atualizado!' : 'Produto criado!');
}

function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  let prods = getProductsFromStorage();
  prods = prods.filter(p => p.id !== id);
  saveProductsToStorage(prods);
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
    const data = new Date(p.data || p.created_at).toLocaleString('pt-BR');
    const itensStr = (p.itens || []).map(i => `${i.quantidade}x ${i.nome}`).join(', ');
    return `
      <div class="pedido-card">
        <div class="pedido-card-header">
          <span class="pedido-id">#${p.id}</span>
          <span class="pedido-status status-${p.status}">${p.status}</span>
        </div>
        <div class="pedido-data">${data}</div>
        <div class="pedido-cliente">👤 ${p.cliente?.nome || 'N/A'} · 📱 ${p.cliente?.telefone || ''}</div>
        <div class="pedido-itens">📋 ${itensStr || 'Sem itens'}</div>
        <div class="pedido-total">Total: R$ ${(p.total || 0).toFixed(2)}</div>
        <div class="pedido-actions">
          <select onchange="updatePedidoStatus(${p.id}, this.value)">
            <option value="confirmado" ${p.status==='confirmado'?'selected':''}>✅ Confirmado</option>
            <option value="preparando" ${p.status==='preparando'?'selected':''}>👨‍🍳 Preparando</option>
            <option value="entrega" ${p.status==='entrega'?'selected':''}>🛵 Saiu p/ Entrega</option>
            <option value="entregue" ${p.status==='entregue'?'selected':''}>✔️ Entregue</option>
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
// PROMOÇÕES
// ========================================
function getPromos() {
  return JSON.parse(localStorage.getItem('promocoes') || '[]');
}

function savePromos(promos) {
  localStorage.setItem('promocoes', JSON.stringify(promos));
}

function loadPromos() {
  const promos = getPromos();
  renderPromos(promos);
}

function renderPromos(promos) {
  const container = document.getElementById('promosList');
  if (promos.length === 0) {
    container.innerHTML = '<p class="hint-text">Nenhuma promoção cadastrada.</p>';
    return;
  }
  container.innerHTML = promos.map(p => `
    <div class="pedido-card" style="border-left:4px solid var(--yellow);">
      <div class="pedido-card-header">
        <span class="pedido-id">🎉 ${p.titulo}</span>
        <span class="pedido-status ${p.ativo ? 'status-entregue' : 'status-confirmado'}">${p.ativo ? 'Ativa' : 'Inativa'}</span>
      </div>
      <div class="pedido-itens">${p.descricao || ''}</div>
      <div class="pedido-cliente">Tipo: ${p.tipo} | Valor: ${p.tipo === 'percentual' ? p.valor + '%' : 'R$ ' + p.valor} ${p.codigo ? '| Código: ' + p.codigo : ''}</div>
      <div class="pedido-actions">
        <button class="btn-edit" onclick="editPromo(${p.id})">✏️</button>
        <button class="btn-delete" onclick="deletePromo(${p.id})">🗑️</button>
        <button class="btn-secondary" onclick="togglePromo(${p.id})">${p.ativo ? 'Desativar' : 'Ativar'}</button>
      </div>
    </div>
  `).join('');
}

function openPromoForm() {
  document.getElementById('promoForm').style.display = 'block';
  document.getElementById('promoFormTitle').textContent = 'Nova Promoção';
  document.getElementById('promoEditId').value = '';
  document.getElementById('promoTitulo').value = '';
  document.getElementById('promoDesc').value = '';
  document.getElementById('promoTipo').value = 'percentual';
  document.getElementById('promoValor').value = '';
  document.getElementById('promoCodigo').value = '';
}

function closePromoForm() {
  document.getElementById('promoForm').style.display = 'none';
}

function editPromo(id) {
  const promos = getPromos();
  const p = promos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('promoForm').style.display = 'block';
  document.getElementById('promoFormTitle').textContent = 'Editar Promoção';
  document.getElementById('promoEditId').value = p.id;
  document.getElementById('promoTitulo').value = p.titulo;
  document.getElementById('promoDesc').value = p.descricao || '';
  document.getElementById('promoTipo').value = p.tipo;
  document.getElementById('promoValor').value = p.valor;
  document.getElementById('promoCodigo').value = p.codigo || '';
}

function savePromo() {
  const promos = getPromos();
  const editId = document.getElementById('promoEditId').value;
  const promo = {
    id: editId ? parseInt(editId) : Date.now(),
    titulo: document.getElementById('promoTitulo').value,
    descricao: document.getElementById('promoDesc').value,
    tipo: document.getElementById('promoTipo').value,
    valor: parseFloat(document.getElementById('promoValor').value),
    codigo: document.getElementById('promoCodigo').value.toUpperCase(),
    ativo: true
  };
  if (editId) {
    const idx = promos.findIndex(p => p.id === parseInt(editId));
    if (idx > -1) promos[idx] = { ...promos[idx], ...promo };
  } else {
    promos.push(promo);
  }
  savePromos(promos);
  renderPromos(promos);
  closePromoForm();
  showAdminToast('Promoção salva!');
}

function deletePromo(id) {
  if (!confirm('Excluir promoção?')) return;
  let promos = getPromos().filter(p => p.id !== id);
  savePromos(promos);
  renderPromos(promos);
}

function togglePromo(id) {
  const promos = getPromos();
  const p = promos.find(x => x.id === id);
  if (p) p.ativo = !p.ativo;
  savePromos(promos);
  renderPromos(promos);
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

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('admin_logged') === 'true') {
    showAdmin();
  }
});
