# Histórico de Implementações

## v1.0 - Chatbot Básico (concluído)
- Workflow n8n com 3 nós: Webhook → HTTP Request (Groq) → Respond
- Chat HTML standalone (cliente_chat.html)
- Modelo: llama-3.3-70b-versatile

## v2.0 - Página da Lanchonete (concluído)
- Página index.html com cardápio visual
- Carrinho de compras com +/- quantidade
- Checkout com dados do cliente (nome, telefone, endereço)
- Chat flutuante integrado (Zeca)
- Workflow de pedidos (workflow-pedidos.json)
- Histórico de conversa no chat
- Prompt de sistema melhorado (sem repetir saudação, conciso, com contexto)

## v3.0 - Sistema Completo (em desenvolvimento)
- Painel Admin com login para gerenciar produtos e pedidos
- Persistência de dados via webhooks n8n
- Cadastro de usuário (telefone + endereço)
- Sistema de pagamento (PIX online / pagamento na entrega com troco)
- Config de webhooks movida para o painel admin (não acessível ao cliente)
- CRUD de produtos pelo admin
- Gestão de pedidos (status: confirmado, preparando, saiu para entrega, entregue)

## v3.1 - Persistência Remota com Supabase (concluído)
- Banco PostgreSQL na nuvem via Supabase (plano gratuito)
- Schema SQL com 4 tabelas: produtos, clientes, pedidos, pedido_itens
- Workflow n8n para CRUD de produtos via Supabase REST API
- Workflow n8n de pedidos salva cliente + pedido + itens no Supabase
- Front busca produtos via webhook (fallback local se offline)
- Admin gerencia produtos via Supabase (criar, editar, desativar)
- URLs de webhook removidas do footer (só acessíveis via admin.html)
- Campo "troco para" quando pagamento em dinheiro
- Formas de pagamento configuráveis pelo admin
- Documentação de setup do Supabase (database/SETUP-SUPABASE.md)

## v3.2 - Imagens nos Produtos (concluído)
- Campo emoji removido, substituído por imagem_url (VARCHAR 500)
- Cards de produto exibem imagem real (foto do lanche)
- Placeholder SVG quando não há imagem
- Admin permite informar URL da imagem ao criar/editar produto
- Schema e seed SQL atualizados
- Workflows n8n atualizados para imagem_url

## v3.3 - Redesign visual estilo iFood (concluído)
- Layout branco, limpo e moderno
- Paleta de cores: vermelho (#ea1d2c), amarelo (#ffba00), verde (#50a773)
- Cards com sombra suave e hover elevado
- Header sticky com fundo branco
- Hero com gradiente vermelho
- Botões com bordas arredondadas e peso visual
- Chat flutuante com header vermelho
- Formulários com inputs de borda fina
- Toast de sucesso em verde
- Admin panel com visual claro e clean
- Responsivo para mobile
- UX/UI seguindo padrões de apps de delivery

## v4.0 - Sistema Completo com Admin Empresa (concluído)

### Bugs corrigidos:
- Fix: edição de produtos no admin (usava async desnecessário, simplificado para localStorage direto)
- Fix: config de pagamento do admin agora sincroniza com o site (empresa_config → payment_config)
- Fix: chatbot agora recebe dados da empresa dinamicamente

### Novas features:
- Painel Admin → aba "Empresa": editar nome, logo, telefone, endereço, horário, tempo entrega, taxa, redes sociais, formas de pagamento, chave PIX
- Site carrega dados da empresa dinamicamente (header, footer, redes sociais)
- Confirmação visual de pedido (modal com status, tempo estimado, número do pedido)
- Sistema de promoções/cupons: criar, editar, ativar/desativar promoções
- Cupom de desconto no checkout (percentual, valor fixo, frete grátis)
- Banner de promoções ativas no topo do site
- Chatbot envia dados da empresa e carrinho atual para contexto
- Chatbot pode adicionar itens ao carrinho (via campo adicionar_carrinho na resposta)
- Tabela empresa e promocoes no schema SQL
- Redes sociais visíveis no footer para o cliente

## v4.1 - Modal de produto, categorias, upload de imagem, Perry (concluído)

- Edição de produto abre em modal/popup (não mais inline no final da tela)
- Confirmação ao cancelar edição ("Descartar alterações?")
- Upload de imagem nos produtos (campo URL + input file com preview)
- Upload de imagem da empresa (logo e capa) — URL ou upload local
- CRUD completo de categorias (criar, excluir) no admin
- Filtro por categoria no site do cliente (botões tipo "Todos", "Lanche", "Bebida")
- Categorias dinâmicas no select de produto (vem do CRUD)
- Assistente renomeado de "Zeca" para "Perry" em todos os arquivos
- Prompt do chatbot no workflow atualizado para "Perry"

## v4.2 - Logo/Capa visíveis, Gestão financeira, Entregadores (concluído)

- Fix: Logo da empresa aparece no header (substitui emoji quando configurada)
- Fix: Imagem de capa aparece como background do hero section
- Chatbot já recebe dados dinâmicos (implementado no v4.1.1) — chave PIX, produtos, etc.
- Nova aba "💰 Gestão" no admin com:
  - Resumo de vendas do dia (total, qtd pedidos, ticket médio)
  - CRUD de entregadores (nome + valor por entrega)
  - Resumo de pagamentos a entregadores (baseado em entregas feitas)
- Hero section usa imagem de capa dinâmica com overlay escuro para legibilidade

## v4.3 - Bugs e correções do fluxo de pedidos (concluído)

- Fix: categorias agora aparecem na loja (usa categorias salvas + as dos produtos)
- Fix: pedidos chegam como "pendente" (admin precisa aprovar → "confirmado")
- Fix: WhatsApp agora é enviado pelo admin ao confirmar pedido (não mais pelo cliente)
- Novo: filtro de pedidos por data no admin (input date)
- Novo: botão de filtro "Pendentes" nos pedidos
- Novo: auto-refresh dos pedidos a cada 60 segundos
- Novo: nome dinâmico no h1 do admin ("Admin PedeAí - Hotdog da Joana")
- Novo: status "pendente" com badge visual
- Fix: cache de produtos é invalidado ao trocar categoria

## v4.4 - Roles, Entregador-Pedido, Edição (concluído)

- Sistema de roles: Admin (acesso total) vs Gestor (só pedidos, entregadores, gestão)
- Login com 2 usuários padrão: admin/admin123 e gestor/gestor123
- Gestor não vê: Empresa, Produtos, Categorias, Promoções, Config
- Linkar pedido ao entregador via select no card do pedido
- Resumo de entregadores agora mostra pedidos reais atribuídos (não mais distribuição igual)
- Editar entregador (botão ✏️ ao lado do nome)
- Pedido mostra nome do entregador atribuído
