-- ================================================
-- SCHEMA DO BANCO - PedeAí
-- Executar no SQL Editor do Supabase
-- ================================================

-- Tabela de Configuração da Empresa
CREATE TABLE empresa (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL DEFAULT 'Minha Lanchonete',
  logo_url VARCHAR(500) DEFAULT '',
  imagem_url VARCHAR(500) DEFAULT '',
  telefone VARCHAR(20) DEFAULT '',
  endereco VARCHAR(255) DEFAULT '',
  horario VARCHAR(150) DEFAULT 'Seg-Sáb 11h-23h | Dom 16h-22h',
  tempo_entrega VARCHAR(50) DEFAULT '30-45 min',
  raio_entrega VARCHAR(50) DEFAULT '5km',
  taxa_entrega DECIMAL(10,2) DEFAULT 5.00,
  entrega_gratis_acima DECIMAL(10,2) DEFAULT 50.00,
  link_facebook VARCHAR(500) DEFAULT '',
  link_instagram VARCHAR(500) DEFAULT '',
  link_whatsapp VARCHAR(500) DEFAULT '',
  chave_pix VARCHAR(255) DEFAULT '',
  aceita_pix BOOLEAN DEFAULT true,
  aceita_credito BOOLEAN DEFAULT true,
  aceita_debito BOOLEAN DEFAULT true,
  aceita_dinheiro BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir config padrão
INSERT INTO empresa (nome) VALUES ('PedeAí');

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

-- Tabela de Promoções
CREATE TABLE promocoes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  tipo VARCHAR(20) DEFAULT 'percentual',
  valor DECIMAL(10,2) NOT NULL,
  codigo VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE,
  data_fim DATE,
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
  desconto DECIMAL(10,2) DEFAULT 0,
  cupom_usado VARCHAR(50),
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
