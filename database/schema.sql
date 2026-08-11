-- ================================================
-- SCHEMA DO BANCO - PedeAí
-- Executar no SQL Editor do Supabase
-- ================================================

-- Tabela de Produtos
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  preco DECIMAL(10,2) NOT NULL,
  imagem_url VARCHAR(500) DEFAULT '',
  categoria VARCHAR(50) DEFAULT 'lanche',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL UNIQUE,
  endereco VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  status VARCHAR(20) DEFAULT 'confirmado',
  entrega VARCHAR(20) DEFAULT 'entrega',
  pagamento VARCHAR(20) DEFAULT 'pix',
  troco_para DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  taxa_entrega DECIMAL(10,2) DEFAULT 5.00,
  total DECIMAL(10,2),
  endereco_entrega VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Itens do Pedido
CREATE TABLE pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER REFERENCES produtos(id),
  nome_produto VARCHAR(100),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2)
);
