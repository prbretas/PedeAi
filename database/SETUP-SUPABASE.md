# Setup do Supabase - PedeAí

## 1. Criar conta no Supabase

1. Acesse https://supabase.com e crie uma conta gratuita
2. Crie um novo projeto (ex: "sabor-express")
3. Anote a **senha do banco** (vai precisar depois)
4. Aguarde o projeto ser criado (~2 min)

## 2. Criar as tabelas

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `schema.sql` e execute
4. Depois cole o conteúdo do arquivo `seed.sql` e execute

## 3. Pegar as credenciais

Vá em **Settings → API** e copie:
- **Project URL** → ex: `https://abc123xyz.supabase.co`
- **anon public key** → a chave longa que começa com `eyJ...`

## 4. Configurar no n8n

No n8n, vá em **Settings → Variables** e crie:
- `SUPABASE_URL` = sua Project URL
- `SUPABASE_KEY` = sua anon public key

Ou se preferir, substitua diretamente nos workflows:
- Onde tem `{{$env.SUPABASE_URL}}` → cole sua URL
- Onde tem `{{$env.SUPABASE_KEY}}` → cole sua key

## 5. Importar os workflows

Importe no n8n:
- `workflow-chatbot-lanchonete.json` → Chatbot IA (será renomeado para pedeai)
- `workflow-pedidos.json` → Receber pedidos e salvar no Supabase
- `workflow-produtos-api.json` → CRUD de produtos via Supabase

Ative todos os workflows.

## 6. Configurar no Admin

1. Acesse `admin.html` (login: admin / admin123)
2. Na aba Config, cole as Production URLs dos 3 webhooks
3. Pronto! O site vai buscar produtos do Supabase

## Estrutura das tabelas

| Tabela | Descrição |
|--------|-----------|
| produtos | Cardápio (nome, preço, imagem_url, categoria, ativo) |
| clientes | Cadastro (nome, telefone, endereço) |
| pedidos | Pedidos (status, pagamento, total, entrega) |
| pedido_itens | Itens de cada pedido |

## Segurança (opcional)

Para produção, configure Row Level Security (RLS) no Supabase:
- produtos: SELECT público, INSERT/UPDATE/DELETE só autenticado
- clientes: INSERT público, SELECT/UPDATE só autenticado
- pedidos: INSERT público, SELECT/UPDATE só autenticado
