# PedeAI - Sistema de Pedidos com Chatbot IA

Sistema completo de pedidos para lanchonetes e estabelecimentos, com página de produtos,
carrinho de compras, checkout e chatbot inteligente (Perry) via n8n + Groq.

## Estrutura do Projeto

```
├── index.html                      ← Página principal do PedeAI
├── css/style.css                   ← Estilos
├── js/app.js                       ← Lógica (carrinho, chat, pedidos)
├── cliente_chat.html               ← Chat standalone (versão simples)
├── workflow-chatbot-lanchonete.json ← Workflow n8n do chatbot
├── workflow-pedidos.json            ← Workflow n8n para receber pedidos
└── README.md                       ← Este arquivo
```

## Como Usar

### 1. Importar os Workflows no n8n

Importe os dois arquivos JSON no n8n:
- `workflow-chatbot-lanchonete.json` → Chatbot com IA
- `workflow-pedidos.json` → Receber pedidos do site

### 2. Configurar API Key do Groq

No workflow do chatbot, nó "Chamar Groq LLM":
- Header `Authorization` → `Bearer gsk_SUA_CHAVE_AQUI`

### 3. Ativar os Workflows

Ative ambos os workflows (toggle no canto superior direito).

### 4. Configurar as URLs no Site

1. Abra `index.html` no navegador (via servidor local)
2. Dê **duplo clique** no texto do footer (horário/endereço)
3. Aparece a barra de configuração do DEV
4. Cole as Production URLs:
   - **Webhook Chat:** sua URL do webhook/chat
   - **Webhook Pedido:** sua URL do webhook/pedido
5. Clique "Salvar Config"

### 5. Rodar com servidor local

```bash
python -m http.server 8080
```
Acesse: `http://localhost:8080`

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| Cardápio visual | Grid de produtos com preço e descrição |
| Carrinho | Adicionar, remover, alterar quantidade |
| Checkout | Dados do cliente, endereço, pagamento |
| Chatbot Perry | Chat flutuante com IA (Groq) |
| Histórico | Chat mantém contexto da conversa |
| Pedido via webhook | Envia pedido completo para n8n |
| Config DEV | URLs configuráveis via painel oculto |

## Personalização para outros estabelecimentos

Para adaptar a outro cliente:
1. Edite o array `PRODUTOS` em `js/app.js`
2. Atualize o prompt de sistema no workflow JSON
3. Altere cores no CSS (variáveis de cor)
4. Mude nome da marca no HTML

## Persistência

- **Carrinho:** salvo no localStorage do navegador
- **Pedidos:** enviados ao n8n via webhook + salvo em localStorage
- **Para banco de dados real:** conecte o nó "Formatar Pedido" no n8n
  a um Google Sheets, Supabase, PostgreSQL, ou qualquer DB suportado
