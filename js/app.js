// ========================================
// CONFIGURAÇÃO
// ========================================
function getConfig() {
  return {
    chatUrl: localStorage.getItem('cfg_chat') || '',
    orderUrl: localStorage.getItem('cfg_order') || '',
    productsUrl: localStorage.getItem('cfg_products') || ''
  };
}

function getEmpresa() {
  return JSON.parse(localStorage.getItem('empresa_config') || '{}');
}

// ========================================
// CARREGAR DADOS DA EMPRESA NO SITE
// ========================================
function renderEmpresaInfo() {
  const emp = getEmpresa();
  const brandName = document.getElementById('brandName');
  const footerInfo = document.getElementById('footerInfo');
  const footerName = document.getElementById('footerName');
  const socialLinks = document.getElementById('socialLinks');

  if (brandName && emp.nome) brandName.textContent = emp.nome;
  if (footerName && emp.nome) footerName.textContent = emp.nome;
  if (footerInfo) {
    footerInfo.textContent = `${emp.horario || ''} | 📍 ${emp.endereco || ''}`;
  }
  if (socialLinks) {
    let html = '';
    if (emp.link_instagram) html += `<a href="${emp.link_instagram}" target="_blank">📷 Instagram</a>`;
    if (emp.link_facebook) html += `<a href="${emp.link_facebook}" target="_blank">👍 Facebook</a>`;
    if (emp.link_whatsapp) html += `<a href="${emp.link_whatsapp}" target="_blank">💬 WhatsApp</a>`;
    socialLinks.innerHTML = html;
  }
}

// ========================================
// PRODUTOS
// ========================================
let PRODUTOS_CACHE = [];

async function getProdutos() {
  const config = getConfig();
  if (config.productsUrl && PRODUTOS_CACHE.length === 0) {
    try {
      const res = await fetch(config.productsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listar' })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        PRODUTOS_CACHE = data;
        return data;
      }
    } catch (err) { console.log('Fallback local:', err); }
  }
  if (PRODUTOS_CACHE.length > 0) return PRODUTOS_CACHE;

  // Fallback: usa localStorage (do admin)
  const local = JSON.parse(localStorage.getItem('produtos') || '[]');
  if (local.length > 0) return local;

  return [
    { id: 1, nome: 'X-Burguer', preco: 18.00, imagem_url: 'img/x-burguer.jpg', descricao: 'Pão, hambúrguer, queijo, alface', categoria: 'lanche' },
    { id: 2, nome: 'X-Bacon', preco: 22.00, imagem_url: 'img/x-bacon.jpg', descricao: 'Pão, hambúrguer, queijo, bacon', categoria: 'lanche' },
    { id: 3, nome: 'Batata Frita', preco: 15.00, imagem_url: 'img/batata-frita.jpg', descricao: 'Porção generosa', categoria: 'acompanhamento' },
    { id: 4, nome: 'Refrigerante', preco: 7.00, imagem_url: 'img/refrigerante.jpg', descricao: 'Coca, Guaraná, Sprite', categoria: 'bebida' },
  ];
}

// ========================================
// PROMOÇÕES BANNER
// ========================================
function renderPromos() {
  const promos = JSON.parse(localStorage.getItem('promocoes') || '[]').filter(p => p.ativo);
  const container = document.getElementById('promoBanner');
  if (!container || promos.length === 0) return;
  container.innerHTML = promos.map(p => `
    <div class="promo-badge">🎉 ${p.titulo} ${p.codigo ? '— use: <strong>' + p.codigo + '</strong>' : ''}</div>
  `).join('');
  container.style.display = 'block';
}

// ========================================
// CARRINHO
// ========================================
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let currentCategory = 'todos';

async function renderProducts(filterCat) {
  const grid = document.getElementById('productsGrid');
  let PRODUTOS = await getProdutos();
  
  // Render category filter
  renderCategoryFilter(PRODUTOS);
  
  if (filterCat && filterCat !== 'todos') {
    PRODUTOS = PRODUTOS.filter(p => p.categoria === filterCat);
  }
  
  grid.innerHTML = PRODUTOS.map(p => `
    <div class="product-card">
      <img class="product-img" src="${p.imagem_url || 'img/placeholder.svg'}" alt="${p.nome}" onerror="this.src='img/placeholder.svg'">
      <div class="product-card-body">
        <div class="product-name">${p.nome}</div>
        <div class="product-desc">${p.descricao || ''}</div>
        <div class="product-footer">
          <span class="product-price">R$ ${parseFloat(p.preco).toFixed(2)}</span>
          <button class="btn-add" onclick="addToCart(${p.id})">+ Adicionar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCategoryFilter(produtos) {
  const container = document.getElementById('categoryFilter');
  if (!container) return;
  const cats = [...new Set(produtos.map(p => p.categoria))];
  container.innerHTML = `<button class="cat-btn ${currentCategory === 'todos' ? 'active' : ''}" onclick="filterByCategory('todos')">Todos</button>` +
    cats.map(c => `<button class="cat-btn ${currentCategory === c ? 'active' : ''}" onclick="filterByCategory('${c}')">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`).join('');
}

function filterByCategory(cat) {
  currentCategory = cat;
  renderProducts(cat);
}

async function addToCart(productId) {
  const PRODUTOS = await getProdutos();
  const product = PRODUTOS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) { existing.qty++; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart();
  updateCartCount();
  showToast(`${product.nome} adicionado! 🛒`);
}

// Função pública para o chatbot adicionar itens ao carrinho
async function addToCartByName(nomeProduto, qty) {
  const PRODUTOS = await getProdutos();
  const product = PRODUTOS.find(p => p.nome.toLowerCase().includes(nomeProduto.toLowerCase()));
  if (!product) return false;
  const existing = cart.find(item => item.id === product.id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ ...product, qty }); }
  saveCart();
  updateCartCount();
  return true;
}

function removeFromCart(productId) {
  const idx = cart.findIndex(item => item.id === productId);
  if (idx > -1) {
    if (cart[idx].qty > 1) cart[idx].qty--;
    else cart.splice(idx, 1);
  }
  saveCart(); renderCart(); updateCartCount();
}

function increaseQty(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) item.qty++;
  saveCart(); renderCart(); updateCartCount();
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
}

function getDeliveryFee() {
  const emp = getEmpresa();
  const type = document.getElementById('deliveryType');
  if (type && type.value === 'retirada') return 0;
  const gratis = emp.entrega_gratis_acima || 50;
  return getSubtotal() >= gratis ? 0 : (emp.taxa_entrega || 5);
}

// ========================================
// MODAIS
// ========================================
function openCart() { renderCart(); document.getElementById('cartModal').classList.add('active'); }
function closeCart() { document.getElementById('cartModal').classList.remove('active'); }

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
    footer.style.display = 'none';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nome}</div>
        <div class="cart-item-price">R$ ${(item.preco * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="removeFromCart(${item.id})">−</button>
        <span>${item.qty}</span>
        <button onclick="increaseQty(${item.id})">+</button>
      </div>
    </div>
  `).join('');
  footer.style.display = 'block';
  document.getElementById('cartTotal').textContent = `R$ ${getSubtotal().toFixed(2)}`;
}

function openCheckout() {
  closeCart(); loadPaymentOptions(); renderCheckoutSummary();
  document.getElementById('checkoutModal').classList.add('active');
}
function closeCheckout() { document.getElementById('checkoutModal').classList.remove('active'); }

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  container.innerHTML = cart.map(item => `
    <div class="summary-total"><span>${item.qty}x ${item.nome}</span><span>R$ ${(item.preco * item.qty).toFixed(2)}</span></div>
  `).join('');
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const delivery = getDeliveryFee();
  const total = subtotal - discount + delivery;
  document.getElementById('checkSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('checkDiscount').textContent = discount > 0 ? `- R$ ${discount.toFixed(2)}` : 'R$ 0,00';
  document.getElementById('checkDelivery').textContent = delivery === 0 ? 'Grátis' : `R$ ${delivery.toFixed(2)}`;
  document.getElementById('checkTotal').textContent = `R$ ${total.toFixed(2)}`;
}

function toggleAddress() {
  const type = document.getElementById('deliveryType').value;
  document.getElementById('addressFields').style.display = type === 'entrega' ? 'block' : 'none';
  renderCheckoutSummary();
}

function toggleTroco() {
  const method = document.getElementById('paymentMethod').value;
  document.getElementById('trocoFields').style.display = method === 'dinheiro' ? 'block' : 'none';
}

function loadPaymentOptions() {
  const emp = getEmpresa();
  const select = document.getElementById('paymentMethod');
  if (!select) return;
  select.innerHTML = '';
  if (emp.aceita_pix !== false) select.innerHTML += '<option value="pix">PIX (online)</option>';
  if (emp.aceita_credito !== false) select.innerHTML += '<option value="credito">Cartão Crédito</option>';
  if (emp.aceita_debito !== false) select.innerHTML += '<option value="debito">Cartão Débito</option>';
  if (emp.aceita_dinheiro !== false) select.innerHTML += '<option value="dinheiro">Dinheiro</option>';
  if (select.innerHTML === '') select.innerHTML = '<option value="pix">PIX</option><option value="dinheiro">Dinheiro</option>';
}

// ========================================
// CUPOM DE DESCONTO
// ========================================
let appliedCoupon = null;

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  if (!code) return;
  const promos = JSON.parse(localStorage.getItem('promocoes') || '[]');
  const promo = promos.find(p => p.ativo && p.codigo && p.codigo.toUpperCase() === code);
  if (promo) {
    appliedCoupon = promo;
    showToast(`Cupom ${code} aplicado! 🎉`);
    document.getElementById('couponStatus').textContent = `✅ ${promo.titulo}`;
    document.getElementById('couponStatus').style.color = 'var(--green)';
  } else {
    appliedCoupon = null;
    document.getElementById('couponStatus').textContent = '❌ Cupom inválido';
    document.getElementById('couponStatus').style.color = 'var(--red)';
  }
  renderCheckoutSummary();
}

function getDiscount() {
  if (!appliedCoupon) return 0;
  const subtotal = getSubtotal();
  if (appliedCoupon.tipo === 'percentual') return subtotal * (appliedCoupon.valor / 100);
  if (appliedCoupon.tipo === 'fixo') return appliedCoupon.valor;
  if (appliedCoupon.tipo === 'frete_gratis') return 0; // handled in delivery
  return 0;
}

// ========================================
// ENVIAR PEDIDO
// ========================================
async function submitOrder(e) {
  e.preventDefault();
  const config = getConfig();
  const emp = getEmpresa();

  const pedido = {
    cliente: {
      nome: document.getElementById('clientName').value,
      telefone: document.getElementById('clientPhone').value,
      endereco: document.getElementById('clientAddress').value || 'Retirada na loja'
    },
    itens: cart.map(item => ({
      nome: item.nome, quantidade: item.qty,
      preco_unitario: item.preco, subtotal: item.preco * item.qty
    })),
    entrega: document.getElementById('deliveryType').value,
    pagamento: document.getElementById('paymentMethod').value,
    troco_para: document.getElementById('paymentMethod').value === 'dinheiro'
      ? parseFloat(document.getElementById('trocoValue').value) || 0 : null,
    cupom_usado: appliedCoupon ? appliedCoupon.codigo : null,
    subtotal: getSubtotal(),
    desconto: getDiscount(),
    taxa_entrega: getDeliveryFee(),
    total: getSubtotal() - getDiscount() + getDeliveryFee(),
    data: new Date().toISOString()
  };

  if (config.orderUrl) {
    try {
      await fetch(config.orderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    } catch (err) { console.log('Webhook offline:', err); }
  }

  // Salvar localmente
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  pedido.id = Date.now();
  pedido.status = 'confirmado';
  pedidos.push(pedido);
  localStorage.setItem('pedidos', JSON.stringify(pedidos));

  // Limpar
  cart = []; appliedCoupon = null;
  saveCart(); updateCartCount(); closeCheckout();

  // Confirmação visual
  showOrderConfirmation(pedido);
}

function showOrderConfirmation(pedido) {
  const emp = getEmpresa();
  const modal = document.getElementById('confirmModal');
  const body = document.getElementById('confirmBody');
  body.innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h3 style="margin-bottom:8px;">Pedido Confirmado!</h3>
      <p style="color:var(--gray);margin-bottom:16px;">Pedido #${pedido.id}</p>
      <div style="background:var(--bg);border-radius:12px;padding:16px;text-align:left;margin-bottom:16px;">
        <p><strong>Status:</strong> Em preparação 👨‍🍳</p>
        <p><strong>Tempo estimado:</strong> ${emp.tempo_entrega || '30-45 min'}</p>
        <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2)}</p>
        ${pedido.pagamento === 'dinheiro' && pedido.troco_para ? `<p><strong>Troco para:</strong> R$ ${pedido.troco_para.toFixed(2)}</p>` : ''}
      </div>
      <p style="font-size:13px;color:var(--gray);">Você receberá atualizações pelo chat.</p>
      <button class="btn-primary" onclick="closeConfirm()" style="margin-top:16px;">OK, Entendi!</button>
    </div>
  `;
  modal.classList.add('active');
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('active');
}

// ========================================
// CHAT (Zeca) + integração carrinho
// ========================================
let chatHistory = [];

function openChat() {
  document.getElementById('chatFloat').classList.add('active');
  document.getElementById('chatFab').style.display = 'none';
}
function closeChat() {
  document.getElementById('chatFloat').classList.remove('active');
  document.getElementById('chatFab').style.display = 'block';
}

function addChatMsg(text, type) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const config = getConfig();
  if (!config.chatUrl) {
    addChatMsg('⚠️ Chat não configurado. Contacte o estabelecimento.', 'bot');
    return;
  }
  addChatMsg(text, 'user');
  input.value = '';

  try {
    const emp = getEmpresa();
    const res = await fetch(config.chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: text,
        historico: chatHistory,
        empresa: emp.nome || 'PedeAí',
        carrinho: cart.map(i => `${i.qty}x ${i.nome}`).join(', ') || 'vazio'
      })
    });
    const data = await res.json();
    const resposta = data.resposta || data.output || JSON.stringify(data);
    addChatMsg(resposta, 'bot');

    // Detectar se o bot sugeriu adicionar ao carrinho
    if (data.adicionar_carrinho && Array.isArray(data.adicionar_carrinho)) {
      for (const item of data.adicionar_carrinho) {
        await addToCartByName(item.nome, item.qty || 1);
      }
      addChatMsg('✅ Itens adicionados ao seu carrinho!', 'bot');
    }

    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: resposta });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (err) {
    addChatMsg('❌ Erro ao conectar. Tente novamente.', 'bot');
  }
}

// ========================================
// TOAST & INIT
// ========================================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderEmpresaInfo();
  renderProducts();
  renderPromos();
  updateCartCount();
});
