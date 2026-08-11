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

## Como tudo se conecta (arquitetura)

```
                        ┌──────────────────────────────────┐
                        │         SUPABASE (banco)          │
                        │  tabelas: produtos, clientes,     │
                        │  pedidos, pedido_itens             │
                        └────────────┬─────────────────────┘
                                     │ REST API
                                     ▼
┌─────────────┐    HTTP POST    ┌─────────────────────────────┐
│  SITE HTML  │ ──────────────► │         n8n (3 workflows)    │
│  (cliente)  │ ◄────────────── │                              │
└─────────────┘    JSON resp    │  1. webhook/chat → Groq IA   │
                                │  2. webhook/pedido → Supabase│
                                │  3. webhook/produtos → Supa. │
                                └─────────────────────────────┘
```

**Cada workflow é independente.** Eles NÃO se comunicam entre si.
O site (HTML) é quem chama cada webhook conforme a ação do usuário.

---

## Pré-requisitos (contas gratuitas)

| Serviço | URL | Para quê |
|---------|-----|----------|
| n8n Cloud | https://app.n8n.cloud | Automação dos workflows |
| Groq | https://console.groq.com | API de IA para o chatbot |
| Supabase | https://supabase.com | Banco de dados na nuvem |

---

## ETAPA 1: Configurar o Groq (IA do Chatbot)

1. Acesse https://console.groq.com
2. Crie uma conta (pode usar Google)
3. Vá em **API Keys** → **Create API Key**
4. Copie a chave (começa com `gsk_...`)
5. Guarde — vai usar na ETAPA 3

---

## ETAPA 2: Configurar o Supabase (Banco de Dados)

### 2.1 Criar o projeto
1. Acesse https://supabase.com → crie conta
2. Clique em **New Project**
3. Nome: `PedeAi`
4. Escolha uma senha para o banco
5. Região: escolha a mais próxima
6. Aguarde ~2 minutos

### 2.2 Criar as tabelas
1. No painel do Supabase, clique em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `database/schema.sql` do projeto, copie TODO o conteúdo
4. Cole no SQL Editor e clique **Run**
5. Deve aparecer "Success" — está certo!

### 2.3 Inserir produtos iniciais
1. No SQL Editor, clique em **New Query** novamente
2. Abra o arquivo `database/seed.sql`, copie e cole
3. Clique **Run**
4. Agora tem 10 produtos no banco

### 2.4 Pegar as credenciais do Supabase

1. No menu lateral, vá em **Integrations** → **Data API**
2. Na aba **Overview**, copie a URL (sem o `/rest/v1/`):
   - **SUPABASE_URL** = `https://mwfjicgnxcvhcgamkskd.supabase.co`
3. Clique na aba **Settings** (ao lado de Overview)
4. Copie a chave **anon (public)** — é a que começa com `eyJ...`
   - **SUPABASE_KEY** = `eyJhbGciOi...` (a chave longa)

> **Alternativa:** Settings (engrenagem) → API Keys → copie a "anon" key

---

## ETAPA 3: Configurar o n8n (Workflows)

### 3.1 Criar variáveis de ambiente no n8n

**IMPORTANTE: Faça isso ANTES de importar os workflows!**

1. No n8n, vá em **Settings** (engrenagem no canto inferior esquerdo)
2. Clique em **Variables**
3. Crie as variáveis:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://mwfjicgnxcvhcgamkskd.supabase.co` |
| `SUPABASE_KEY` | Sua anon key (eyJ...) |

### 3.2 Importar os 3 workflows

Cada workflow é um arquivo JSON independente. Importe um por vez:

**Workflow 1 — Chatbot (Zeca com IA)**
1. No n8n, clique em **+ Add workflow** → **Import from File**
2. Selecione: `workflow-chatbot-lanchonete.json`
3. Abra o nó **"Chamar Groq LLM"**
4. No header Authorization, substitua `SUA_API_KEY_GROQ` pela sua chave Groq:
   - Deve ficar: `Bearer gsk_xxxxxxxxxxxxxxx`
5. **Ative o workflow** (toggle superior direito)
6. Copie a **Production URL** do nó Webhook (ex: `https://...n8n.cloud/webhook/chat`)

**Workflow 2 — Pedidos**
1. Importe: `workflow-pedidos.json`
2. Nenhuma configuração extra necessária (usa as variáveis de ambiente)
3. **Ative o workflow**
4. Copie a **Production URL** (ex: `https://...n8n.cloud/webhook/pedido`)

**Workflow 3 — Produtos (API CRUD)**
1. Importe: `workflow-produtos-api.json`
2. Nenhuma configuração extra necessária
3. **Ative o workflow**
4. Copie a **Production URL** (ex: `https://...n8n.cloud/webhook/produtos`)

### 3.3 Resumo — o que cada workflow faz

| Arquivo | Webhook path | Função |
|---------|-------------|--------|
| `workflow-chatbot-lanchonete.json` | `/webhook/chat` | Recebe mensagem → envia para Groq → retorna resposta da IA |
| `workflow-pedidos.json` | `/webhook/pedido` | Recebe pedido → salva cliente + pedido + itens no Supabase |
| `workflow-produtos-api.json` | `/webhook/produtos` | Recebe ação → lista/cria/atualiza/exclui produtos no Supabase |

**Os workflows NÃO se comunicam entre si.** Cada um é chamado separadamente pelo site.

### 3.4 Onde colocar a API key do Groq

A chave do Groq vai APENAS no workflow do chatbot:
- Nó: **"Chamar Groq LLM"**
- Campo: Headers → Authorization → Value
- Formato: `Bearer gsk_SUA_CHAVE_AQUI`

A chave do Supabase vai nas **variáveis de ambiente** do n8n (não precisa editar nenhum nó manualmente).

---

## ETAPA 4: Rodar o Site (Frontend)

### 4.1 Servir os arquivos com servidor local

O site NÃO pode ser aberto com duplo clique (file://). Precisa de um servidor:

```bash
cd "C:\Users\philippe.bretas\Documents\KIRO REP\AULA-N8N-03082026"
python -m http.server 8080
```

Acesse: **http://localhost:8080**

### 4.2 Configurar as URLs dos webhooks no admin

1. Acesse **http://localhost:8080/admin.html**
2. Login: `admin` / `admin123`
3. Na aba **⚙️ Config**, cole as 3 Production URLs que você copiou:
   - Webhook Chat → URL do workflow chatbot
   - Webhook Pedido → URL do workflow pedidos
   - Webhook Produtos → URL do workflow produtos
4. Clique **Salvar Configurações**

**Pronto! O site agora está conectado ao n8n, que por sua vez está conectado ao Supabase e ao Groq.**

---

## ETAPA 5: Testar

### Chatbot
1. No site, clique no botão 💬 (canto inferior direito)
2. Digite "oi" — o Zeca deve responder

### Cardápio
- Os produtos devem carregar do Supabase automaticamente
- Se não aparecerem, o fallback local é exibido

### Fazer um pedido
1. Adicione produtos ao carrinho
2. Clique "Finalizar Pedido"
3. Preencha os dados e confirme
4. Verifique no Supabase → Table Editor → tabela `pedidos`

### Admin
1. Acesse `/admin.html`
2. Crie/edite/exclua produtos
3. Acompanhe pedidos e mude o status

---

## Resumo visual das credenciais

```
┌────────────────────────────────────────────────┐
│  ONDE FICA CADA CHAVE                           │
├────────────────────────────────────────────────┤
│  Groq (gsk_...)     → nó "Chamar Groq LLM"     │
│                       no workflow do chatbot     │
│                                                  │
│  Supabase URL       → variável n8n SUPABASE_URL │
│  Supabase Key       → variável n8n SUPABASE_KEY │
│                                                  │
│  Production URLs    → admin.html (aba Config)    │
│  dos 3 webhooks       salva no localStorage      │
└────────────────────────────────────────────────┘
```

---

## Estrutura dos Arquivos

```
PedeAí/
├── index.html                      ← Site do cliente (cardápio + carrinho)
├── admin.html                      ← Painel do admin (login: admin/admin123)
├── cliente_chat.html               ← Chat standalone (versão alternativa)
├── css/
│   ├── style.css                   ← Visual estilo iFood (vermelho/branco)
│   └── admin.css                   ← Estilos do admin
├── js/
│   ├── app.js                      ← Lógica do site (carrinho, chat, pedidos)
│   └── admin.js                    ← Lógica do admin (CRUD, login)
├── img/
│   └── placeholder.svg             ← Imagem padrão quando produto sem foto
├── database/
│   ├── schema.sql                  ← Cria tabelas no Supabase
│   ├── seed.sql                    ← Insere produtos iniciais
│   └── SETUP-SUPABASE.md           ← Guia rápido do Supabase
├── workflow-chatbot-lanchonete.json ← Workflow n8n: chatbot com Groq
├── workflow-pedidos.json            ← Workflow n8n: salvar pedidos
├── workflow-produtos-api.json       ← Workflow n8n: CRUD produtos
├── GUIA-COMPLETO.md                 ← Este arquivo
├── historico-implementacoes.md      ← Registro do que foi feito
└── melhoriasdoprojeto.md            ← Ideias futuras
```

---

## Solução de Problemas

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| "Failed to fetch" | Workflow inativo ou CORS | Ative o workflow. Se persistir, adicione header `Access-Control-Allow-Origin: *` no nó Webhook |
| Produtos não carregam | URL do webhook errada | Verifique a URL no admin → Config |
| Chatbot repete saudação | Sem histórico | Use via localhost (não file://) |
| Pedido não salva no Supabase | Variáveis n8n erradas | Confirme SUPABASE_URL e SUPABASE_KEY em Settings → Variables |
| Erro 401 no Supabase | Key inválida | Copie novamente a anon key do Supabase |

---

## Como Adaptar para Outro Cliente

1. **Produtos:** Edite via admin.html ou Supabase direto
2. **Visual:** Mude cores em `css/style.css` (variáveis CSS no `:root`)
3. **Chatbot:** Atualize o prompt no workflow chatbot (nome, cardápio, horários)
4. **Imagens:** Coloque fotos na pasta `img/` ou use URLs externas
5. **Pagamento:** Configure via admin (aba Pagamentos)

---

## Credenciais Padrão

| Item | Valor |
|------|-------|
| Admin login | `admin` |
| Admin senha | `admin123` |

⚠️ Para produção, altere no `js/admin.js` (variáveis `DEFAULT_USER` e `DEFAULT_PASS`).

---

## Custos

| Serviço | Plano gratuito |
|---------|---------------|
| n8n Cloud | Trial 14 dias, depois ~€20/mês (ou self-hosted grátis) |
| Groq | 30 req/min, 14.400 req/dia |
| Supabase | 500MB banco, 50K req/mês |
