# Setup do Supabase - PedeAI

## 1. Criar conta e projeto

1. Acesse https://supabase.com e crie uma conta
2. Clique em **New Project** → nome: `PedeAi`
3. Escolha senha e região
4. Aguarde ~2 min

## 2. Criar as tabelas

1. Menu lateral → **SQL Editor** → **New Query**
2. Cole o conteúdo do `schema.sql` → clique **Run**
3. Nova query → cole o `seed.sql` → clique **Run**

## 3. Pegar as credenciais

### Project URL (SUPABASE_URL):
1. Menu lateral → **Integrations** → **Data API** → aba Overview
2. Copie a URL SEM o `/rest/v1/` no final
3. Exemplo: `https://mwfjicgnxcvhcgamkskd.supabase.co`

### Anon Key (SUPABASE_KEY):
1. Na mesma tela Data API → clique na aba **Settings**
2. Copie a chave marcada como **anon (public)**
3. É a chave longa que começa com `eyJ...`

## 4. Configurar no n8n

No n8n → **Settings** → **Variables** → crie:
- `SUPABASE_URL` = sua Project URL
- `SUPABASE_KEY` = sua anon key

Os workflows já usam essas variáveis automaticamente (`$env.SUPABASE_URL` e `$env.SUPABASE_KEY`).

## 5. Tabelas criadas

| Tabela | Campos principais |
|--------|-------------------|
| produtos | nome, descricao, preco, imagem_url, categoria, ativo |
| clientes | nome, telefone, endereco |
| pedidos | cliente_id, status, entrega, pagamento, total |
| pedido_itens | pedido_id, nome_produto, quantidade, preco_unitario |
