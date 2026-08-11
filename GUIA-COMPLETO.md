# 🍔 PedeAí - Guia Completo de Instalação e Uso

## O que é o PedeAí?

Sistema de pedidos online para lanchonetes e pequenos estabelecimentos.
Inclui: página de cardápio, carrinho, checkout, chatbot com IA (Zeca) e painel admin.

**Tecnologias usadas:**
- Frontend: HTML + CSS + JavaScript puro (sem framework)
- Backend/Automação: n8n (workflows visuais)
- IA: Groq (API gratuita, modelo llama-3.3-70b-versatile)
- Banco de dados: Supabase (PostgreSQL na nuvem, gratuito)

---

## Pré-requisitos

Antes de começar, você precisa criar contas (todas gratuitas):

| Serviço | URL | Para quê |
|---------|-----|----------|
| n8n Cloud | https://n8n.io | Automação dos workflows |
| Groq | https://console.groq.com | API de IA para o chatbot |
| Supabase | https://supabase.com | Banco de dados na nuvem |

---

## ETAPA 1: Configurar o Groq (IA do Chatbot)

1. Acesse https://console.groq.com
2. Crie uma conta (pode usar Google)
3. Vá em **API Keys** → **Create API Key**
4. Copie a chave (começa com `gsk_...`)
5. Guarde essa chave — você vai usar no n8n

---

## ETAPA 2: Configurar o Supabase (Banco de Dados)

### 2.1 Criar o projeto
1. Acesse https://supabase.com → crie conta
2. Clique em **New Project**
3. Nome: `pedeai` (ou o que preferir)
4. Escolha uma senha para o banco
5. Região: escolha a mais próxima (ex: South America)
6. Aguarde ~2 minutos o projeto ser criado

### 2.2 Criar as tabelas
1. No painel do Supabase, clique em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `database/schema.sql` do projeto
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **Run** (botão verde)
6. Deve aparecer "Success. No rows returned" — está certo!

### 2.3 Inserir produtos iniciais
1. Ainda no SQL Editor, clique em **New Query**
2. Abra o arquivo `database/seed.sql`
3. Copie e cole no editor
4. Clique em **Run**
5. Agora você tem 10 produtos cadastrados

### 2.4 Copiar as credenciais
1. Vá em **Settings** (engrenagem no menu lateral)
2. Clique em **API**
3. Copie e anote:
   - **Project URL**: algo como `https://abc123xyz.supabase.co`
   - **anon public key**: a chave longa que começa com `eyJ...`

---

## ETAPA 3: Configurar o n8n (Workflows)

### 3.1 Criar variáveis de ambiente
1. No n8n, vá em **Settings** → **Variables**
2. Crie duas variáveis:
   - Nome: `SUPABASE_URL` → Valor: sua Project URL do Supabase
   - Nome: `SUPABASE_KEY` → Valor: sua anon public key do Supabase

### 3.2 Importar o workflow do Chatbot
1. No n8n, clique em **Add workflow** → **Import from File**
2. Selecione o arquivo `workflow-chatbot-lanchonete.json`
3. O workflow vai aparecer com 3 nós
4. Clique no nó **"Chamar Groq LLM"**
5. No campo Headers → Authorization → Value:
   - Substitua `SUA_API_KEY_GROQ` pela sua chave do Groq
   - Deve ficar: `Bearer gsk_xxxxxxx` (com Bearer na frente!)
6. **Ative o workflow** (toggle no canto superior direito)
7. Copie a **Production URL** que aparece no nó Webhook

### 3.3 Importar o workflow de Pedidos
1. Importe o arquivo `workflow-pedidos.json`
2. Os nós já usam `$env.SUPABASE_URL` e `$env.SUPABASE_KEY` (configurados na 3.1)
3. **Ative o workflow**
4. Copie a **Production URL** do nó Webhook

### 3.4 Importar o workflow de Produtos (API)
1. Importe o arquivo `workflow-produtos-api.json`
2. Também já usa as variáveis de ambiente
3. **Ative o workflow**
4. Copie a **Production URL** do nó Webhook

### 3.5 Resumo das URLs que você terá

| Workflow | URL (exemplo) | Função |
|----------|---------------|--------|
| Chatbot | `https://seu-n8n.app.n8n.cloud/webhook/chat` | Chat com IA |
| Pedidos | `https://seu-n8n.app.n8n.cloud/webhook/pedido` | Receber pedidos |
| Produtos | `https://seu-n8n.app.n8n.cloud/webhook/produtos` | CRUD produtos |

---

## ETAPA 4: Rodar o Site (Frontend)

### 4.1 Servir os arquivos localmente

O site NÃO pode ser aberto com duplo clique (file://). Precisa de um servidor local.

**Opção A — Python (recomendado, já vem no Windows com Anaconda):**
```bash
cd "C:\Users\philippe.bretas\Documents\KIRO REP\AULA-N8N-03082026"
python -m http.server 8080
```

**Opção B — Node.js:**
```bash
npx http-server . -p 8080
```

**Opção C — VS Code com Live Server:**
- Instale a extensão "Live Server"
- Clique com botão direito no `index.html` → "Open with Live Server"

Depois acesse: **http://localhost:8080**

### 4.2 Configurar as URLs dos webhooks

1. Acesse **http://localhost:8080/admin.html**
2. Login: `admin` / `admin123`
3. Na aba **⚙️ Config**, cole as 3 URLs:
   - Webhook Chat → a URL do workflow chatbot
   - Webhook Pedido → a URL do workflow pedidos
   - Webhook Produtos → a URL do workflow produtos
4. Clique **Salvar Configurações**

Pronto! O site está conectado ao n8n e ao Supabase.

---

## ETAPA 5: Testar o Sistema

### 5.1 Testar o Cardápio
- Acesse http://localhost:8080
- Os produtos devem aparecer no grid
- Se não aparecerem, verifique se o workflow de Produtos está ativo

### 5.2 Testar o Carrinho e Pedido
1. Clique em "+ Adicionar" em alguns produtos
2. Clique em "🛒 Carrinho" no menu
3. Clique "Finalizar Pedido"
4. Preencha nome, telefone, endereço
5. Escolha forma de pagamento
6. Se escolher "Dinheiro", aparece campo "Troco para quanto?"
7. Clique "✅ Confirmar Pedido"
8. Verifique no Supabase → Table Editor → tabela `pedidos`

### 5.3 Testar o Chatbot (Zeca)
1. Clique no botão 💬 (canto inferior direito)
2. Digite "oi" e envie
3. O Zeca deve responder como atendente
4. Teste: "qual o cardápio?", "vocês entregam?", "quero fazer um pedido"

### 5.4 Testar o Admin
1. Acesse http://localhost:8080/admin.html
2. Aba **📋 Produtos** → crie, edite ou exclua produtos
3. Aba **📦 Pedidos** → veja os pedidos feitos e altere o status
4. Aba **💳 Pagamentos** → ative/desative formas de pagamento

---

## Estrutura dos Arquivos

```
PedeAí/
├── index.html                      ← Site do cliente (cardápio + carrinho)
├── admin.html                      ← Painel do admin (produtos, pedidos)
├── cliente_chat.html               ← Chat standalone (versão alternativa)
├── css/
│   ├── style.css                   ← Estilos do site
│   └── admin.css                   ← Estilos do admin
├── js/
│   ├── app.js                      ← Lógica do site (carrinho, chat)
│   └── admin.js                    ← Lógica do admin (CRUD, login)
├── database/
│   ├── schema.sql                  ← Cria tabelas no Supabase
│   ├── seed.sql                    ← Insere produtos iniciais
│   └── SETUP-SUPABASE.md           ← Guia rápido do Supabase
├── workflow-chatbot-lanchonete.json ← Workflow n8n: chatbot IA
├── workflow-pedidos.json            ← Workflow n8n: receber pedidos
├── workflow-produtos-api.json       ← Workflow n8n: CRUD produtos
├── melhoriasdoprojeto.md            ← Ideias futuras
├── historico-implementacoes.md      ← O que já foi feito
└── GUIA-COMPLETO.md                 ← Este arquivo
```

---

## Fluxo de Dados (como tudo se conecta)

```
┌─────────────┐     POST /webhook/chat     ┌─────────────┐     API     ┌────────┐
│  Site HTML  │ ──────────────────────────► │    n8n      │ ──────────► │  Groq  │
│  (cliente)  │ ◄────────────────────────── │  (workflow) │ ◄────────── │  (IA)  │
└─────────────┘     resposta JSON           └─────────────┘             └────────┘

┌─────────────┐     POST /webhook/pedido    ┌─────────────┐   REST API  ┌──────────┐
│  Checkout   │ ──────────────────────────► │    n8n      │ ──────────► │ Supabase │
│  (pedido)   │ ◄────────────────────────── │  (workflow) │ ◄────────── │ (Postgres)│
└─────────────┘     confirmação             └─────────────┘             └──────────┘

┌─────────────┐     POST /webhook/produtos  ┌─────────────┐   REST API  ┌──────────┐
│  Admin/Site │ ──────────────────────────► │    n8n      │ ──────────► │ Supabase │
│ (produtos)  │ ◄────────────────────────── │  (workflow) │ ◄────────── │ (Postgres)│
└─────────────┘     lista produtos          └─────────────┘             └──────────┘
```

---

## Solução de Problemas

### Erro: "Failed to fetch"
- **Causa:** CORS ou workflow inativo
- **Solução:** Ative o workflow no n8n. Se persistir, no nó Webhook do n8n vá em Options → procure por "Response Headers" e adicione: `Access-Control-Allow-Origin: *`

### Produtos não aparecem no site
- **Causa:** Webhook de produtos não configurado ou inativo
- **Solução:** Verifique se a URL está correta no admin.html (aba Config) e se o workflow está ativo

### Chatbot repete saudação
- **Causa:** Histórico não está sendo enviado
- **Solução:** Verifique se está usando o `index.html` (que tem histórico) e não abrindo via file://

### Pedido não aparece no Supabase
- **Causa:** Variáveis de ambiente não configuradas
- **Solução:** No n8n → Settings → Variables → confirme que `SUPABASE_URL` e `SUPABASE_KEY` estão corretos

### Erro 401 no Supabase
- **Causa:** API key inválida ou expirada
- **Solução:** Vá no Supabase → Settings → API → copie a anon key novamente

---

## Como Adaptar para Outro Cliente

Para vender o PedeAí para outra lanchonete/trailer:

1. **Produtos:** Mude via admin.html ou diretamente no Supabase
2. **Nome/Visual:** Edite o `index.html` (nome, cores)
3. **Chatbot:** Atualize o prompt de sistema no workflow do n8n com:
   - Nome do estabelecimento
   - Cardápio atualizado
   - Horários
   - Endereço
   - Bairros atendidos
4. **Cores:** Edite as variáveis de cor em `css/style.css`
5. **Pagamento:** Configure via admin.html (aba Pagamentos)

---

## Credenciais Padrão

| Item | Valor |
|------|-------|
| Admin login | `admin` |
| Admin senha | `admin123` |

⚠️ Para produção, altere a senha no arquivo `js/admin.js` (variáveis `DEFAULT_USER` e `DEFAULT_PASS`).

---

## Custos

| Serviço | Plano | Limite gratuito |
|---------|-------|-----------------|
| n8n Cloud | Starter | 10 dias trial, depois ~€20/mês |
| Groq | Free | 30 req/min, 14.400 req/dia |
| Supabase | Free | 500MB banco, 50K req/mês |

**Para manter gratuito:** Você pode instalar o n8n self-hosted (no seu PC ou num servidor) em vez de usar o n8n Cloud.

---

## Próximos Passos (ideias futuras)

- [ ] Integração com WhatsApp (via n8n + Evolution API)
- [ ] Notificação por email quando novo pedido chegar
- [ ] Painel de dashboard com gráficos de vendas
- [ ] App PWA (instalar no celular)
- [ ] Sistema de cupons de desconto
- [ ] Avaliação do pedido pelo cliente
