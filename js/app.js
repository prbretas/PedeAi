// ========================================
// CONFIGURAÇÃO - URLs dos webhooks n8n
// ========================================
function getConfig() {
  return {
    chatUrl: localStorage.getItem('cfg_chat') || '',
    orderUrl: localStorage.getItem('cfg_order') || '',
    productsUrl: localStorage.getItem('cfg_products') || ''
  };
}

// ========================================
// CATÁLOGO DE PRODUTOS (carrega do Supabase via webhook n8n)
// ========================================
let PRODUTOS_CACHE = [];

async function getProdutos() {
  // Tenta buscar do webhook (Supabase)
  const config = getConfig();
  const productsUrl = config.productsUrl;

  if (productsUrl && PRODUTOS_CACHE.length === 0) {
    try {
      const res = await fetch(productsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listar' })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        PRODUTOS_CACHE = data;
        return data;
      }
    } catch (err) {
      console.log('Fallback para produtos padrão:', err);
    }
  }

  if (PRODUTOS_CACHE.length > 0) return PRODUTOS_CACHE;

  // Fallback: produtos padrão
  return [
    { id: 1, nome: 'X-Burguer', preco: 18.00, imagem_url: 'img/x-burguer.jpg', descricao: 'Pão, hambúrguer, queijo, alface e tomate', categoria: 'lanche' },
    { id: 2, nome: 'X-Salada', preco: 20.00, imagem_url: 'img/x-salada.jpg', descricao: 'Pão, hambúrguer, queijo, alface, tomate e maionese', categoria: 'lanche' },
    { id: 3, nome: 'X-Bacon', preco: 22.00, imagem_url: 'img/x-bacon.jpg', descricao: 'Pão, hambúrguer, queijo, bacon crocante e molho especial', categoria: 'lanche' },
    { id: 4, nome: 'X-Tudo', preco: 28.00, imagem_url: 'img/x-tudo.jpg', descricao: 'Pão, 2 hambúrgueres, queijo, bacon, ovo, presunto', categoria: 'lanche' },
    { id: 5, nome: 'Batata Frita', preco: 15.00, imagem_url: 'img/batata-frita.jpg', descricao: 'Porção generosa de batata frita sequinha', categoria: 'acompanhamento' },
    { id: 6, nome: 'Onion Rings', preco: 17.00, imagem_url: 'img/onion-rings.jpg', descricao: 'Anéis de cebola empanados e crocantes', categoria: 'acompanhamento' },
    { id: 7, nome: 'Refrigerante Lata', preco: 7.00, imagem_url: 'img/refrigerante.jpg', descricao: 'Coca-Cola, Guaraná ou Sprite', categoria: 'bebida' },
    { id: 8, nome: 'Suco Natural', preco: 10.00, imagem_url: 'img/suco-natural.jpg', descricao: 'Laranja, limão ou maracujá', categoria: 'bebida' },
    { id: 9, nome: 'Água', preco: 4.00, imagem_url: 'img/agua.jpg', descricao: 'Água mineral 500ml', categoria: 'bebida' },
    { id: 10, nome: 'Milk Shake', preco: 16.00, imagem_url: 'img/milk-shake.jpg', descricao: 'Chocolate, morango ou baunilha - 400ml', categoria: 'bebida' }
  ];
}

// ========================================
// CARRINHO
// ========================================
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

async function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const PRODUTOS = await getProdutos();
  grid.innerHTML = PRODUTOS.map(p => `
    <div class="product-card">
      <img class="product-img" src="${p.imagem_url || 'img/placeholder.svg'}" alt="${p.nome}" onerror="this.src='img/placeholder.svg'">
      <div class="product-card-body">
        <div class="product-name">${p.nome}</div>
        <div class="product-desc">${p.descricao || p.desc || ''}</div>
        <div class="product-footer">
          <span class="product-price">R$ ${parseFloat(p.preco).toFixed(2)}</span>
          <button class="btn-add" onclick="addToCart(${p.id})">+ Adicionar</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function addToCart(productId) {
  const PRODUTOS = await getProdutos();
  const product = PRODUTOS.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  
  saveCart();
  updateCartCount();
  showToast(`${product.nome} adicionado! 🛒`);
}

function removeFromCart(productId) {
  const idx = cart.findIndex(item => item.id === productId);
  if (idx > -1) {
    if (cart[idx].qty > 1) {
      cart[idx].qty--;
    } else {
      cart.splice(idx, 1);
    }
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function increaseQty(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) item.qty++;
  saveCart();
  renderCart();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
}

function getDeliveryFee() {
  const type = document.getElementById('deliveryType');
  if (type && type.value === 'retirada') return 0;
  return getSubtotal() >= 50 ? 0 : 5;
}

// ========================================
// MODAIS
// ========================================
function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
}

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
  closeCart();
  loadPaymentOptions();
  renderCheckoutSummary();
  document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('active');
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  container.innerHTML = cart.map(item => `
    <div class="summary-total">
      <span>${item.qty}x ${item.nome}</span>
      <span>R$ ${(item.preco * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = getSubtotal();
  const delivery = getDeliveryFee();
  document.getElementById('checkSubtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('checkDelivery').textContent = delivery === 0 ? 'Grátis' : `R$ ${delivery.toFixed(2)}`;
  document.getElementById('checkTotal').textContent = `R$ ${(subtotal + delivery).toFixed(2)}`;
}

function toggleAddress() {
  const type = document.getElementById('deliveryType').value;
  const fields = document.getElementById('addressFields');
  fields.style.display = type === 'entrega' ? 'block' : 'none';
  renderCheckoutSummary();
}

function toggleTroco() {
  const method = document.getElementById('paymentMethod').value;
  const trocoFields = document.getElementById('trocoFields');
  trocoFields.style.display = method === 'dinheiro' ? 'block' : 'none';
}

function loadPaymentOptions() {
  const cfg = JSON.parse(localStorage.getItem('payment_config') || '{}');
  const select = document.getElementById('paymentMethod');
  if (!select) return;
  
  select.innerHTML = '';
  if (cfg.pix !== false) select.innerHTML += '<option value="pix">PIX (online)</option>';
  if (cfg.credito !== false) select.innerHTML += '<option value="credito">Cartão Crédito</option>';
  if (cfg.debito !== false) select.innerHTML += '<option value="debito">Cartão Débito</option>';
  if (cfg.dinheiro !== false) select.innerHTML += '<option value="dinheiro">Dinheiro</option>';
  
  // Fallback se nenhum selecionado
  if (select.innerHTML === '') {
    select.innerHTML = '<option value="pix">PIX</option><option value="dinheiro">Dinheiro</option>';
  }
}

// ========================================
// ENVIAR PEDIDO (webhook n8n)
// ========================================
async function submitOrder(e) {
  e.preventDefault();

  const config = getConfig();
  const orderUrl = config.orderUrl;

  const pedido = {
    cliente: {
      nome: document.getElementById('clientName').value,
      telefone: document.getElementById('clientPhone').value,
      endereco: document.getElementById('clientAddress').value || 'Retirada na loja'
    },
    itens: cart.map(item => ({
      nome: item.nome,
      quantidade: item.qty,
      preco_unitario: item.preco,
      subtotal: item.preco * item.qty
    })),
    entrega: document.getElementById('deliveryType').value,
    pagamento: document.getElementById('paymentMethod').value,
    troco_para: document.getElementById('paymentMethod').value === 'dinheiro' 
      ? parseFloat(document.getElementById('trocoValue').value) || 0 
      : null,
    subtotal: getSubtotal(),
    taxa_entrega: getDeliveryFee(),
    total: getSubtotal() + getDeliveryFee(),
    data: new Date().toISOString()
  };

  if (orderUrl) {
    try {
      await fetch(orderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    } catch (err) {
      console.log('Webhook pedido não configurado ou offline:', err);
    }
  }

  // Salvar localmente também
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  pedido.id = Date.now();
  pedido.status = 'confirmado';
  pedidos.push(pedido);
  localStorage.setItem('pedidos', JSON.stringify(pedidos));

  // Limpar carrinho
  cart = [];
  saveCart();
  updateCartCount();
  closeCheckout();
  showToast('✅ Pedido confirmado! Tempo estimado: 30-45 min');
}

// ========================================
// CHAT FLUTUANTE (Zeca)
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
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const config = getConfig();
  if (!config.chatUrl) {
    addChatMsg('⚠️ Configure a URL do webhook (dê duplo clique no footer)', 'bot');
    return;
  }

  addChatMsg(text, 'user');
  input.value = '';

  try {
    const res = await fetch(config.chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: text,
        historico: chatHistory
      })
    });

    const data = await res.json();
    const resposta = data.resposta || data.output || JSON.stringify(data);
    addChatMsg(resposta, 'bot');

    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: resposta });

    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }
  } catch (err) {
    addChatMsg('❌ Erro ao conectar. Verifique se o workflow está ativo.', 'bot');
  }
}

// ========================================
// DEV CONFIG (removido do footer - agora é via admin.html)
// ========================================
function toggleDevConfig() {
  // Redireciona para o admin
  window.open('admin.html', '_blank');
}

function saveConfig() {
  // Mantido para retrocompatibilidade
  localStorage.setItem('cfg_chat', document.getElementById('cfgChat').value.trim());
  localStorage.setItem('cfg_order', document.getElementById('cfgOrder').value.trim());
}

// ========================================
// TOAST
// ========================================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartCount();
});
