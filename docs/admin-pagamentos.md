# Admin: pagamentos e pedidos de produtos (aba Financeiro / Pedidos de Produtos)

As abas "Financeiro" e "Pedidos de Produtos" do painel de detalhes do evento
(`/admin/eventos/:id/detalhes/pagamentos` e `/produtos`). Cobrem cada cobrança
gerada — inscrição ou compra avulsa na loja — e a entrega dos produtos
comprados. As regras de servidor (adapters de gateway, credenciais, webhooks,
conciliação automática) estão em `ic-backend/docs/pagamentos.md` — aqui só o
que aparece na tela.

## Quem vê

A aba Financeiro é a única, além de Inscritos, que aparece também para quem só
tem perfil financeiro na igreja do evento (não administra) — ver
`docs/admin-inscritos.md`, seção "Abas do painel".

## Aba Financeiro

- **Cards de resumo** (`CardsPayments`): montante total, receita realizada
  (soma de pagamentos `PAID`) e receita pendente (soma do resto), vindos da
  mesma consulta da tabela.
  - **Esconder valores:** botão com olho na linha das abas, ao lado do "Abrir
    check-in", só na aba Financeiro (`BotaoEsconderValores`). Troca os três
    valores por "R$ ••••••", como no app do banco, para a tela aberta em
    reunião ou projetor. Só os cards: a tabela continua com os valores. O
    estado fica na página (`useValoresEscondidos`) e desce para os cards; é
    lembrado entre visitas, por usuário
    (`useFiltroSalvo('financeiro:esconderValores')`).
- **Abas:** "Todos", os grupos de inscrição e "Produtos Avulsos".
  - **Todos** vem primeiro e é a aba inicial, com **uma linha por pessoa**: a
    inscrição e as compras avulsas dela juntas (`porPessoa`).
    - **Valor:** somado.
    - **Produtos:** os de todos os pagamentos ("Inclui compra avulsa" quando há).
    - **Método, status e origem:** o valor quando todos coincidem; senão
      "Vários", "1 de 2 pagos" (em laranja) e "Várias". A exportação sai com o
      mesmo texto.
    - **Ações:** o menu é o mesmo de sempre (Editar, Estornar, Ver
      histórico). Quando a pessoa tem mais de um pagamento, os modais de
      edição e de histórico abrem com **abas**, uma por pagamento
      ("Inscrição Cursilhistas", "Compra avulsa"), e trocar de aba troca o
      pagamento exibido (`AbasDosPagamentos`). O modal recebe sempre o
      pagamento de verdade, nunca a linha somada.

    As outras abas continuam com uma linha por pagamento.
  - **Grupos de inscrição:** uma aba por grupo, como na aba Inscritos.
  - **Produtos Avulsos:** compra de produto sem grupo.

  "Todos" e "Produtos Avulsos" são botões em superfície própria, no mesmo
  desenho, um de cada lado da régua de grupos, porque não são grupos. Até
  09/10/2026 a tela abria no primeiro grupo e não havia como ver todos juntos.
- **Busca:** nome, CPF ou id exato (bipagem do crachá lê o id do usuário, não
  o do pagamento).
- **Colunas:**
  - **Método:** Pix, Cartão de Crédito/Débito, Dinheiro, Boleto, Outro.
  - **Status:** Pago, Em análise, Recusado, Cancelado, Aguardando,
    Reembolsado.
  - **Origem** (`receivedFrom`): "Aguardando pagamento" (`PENDING`, nasce
    assim), "Gateway de pagamento" (`SYSTEM`, confirmado pelo retorno do
    gateway) ou "Lançamento manual" (`EXTERNAL`).
  - **Produtos:** cada linha é uma compra; ingresso e produtos comprados junto
    aparecem na mesma célula.
- **Exportar:** CSV nativo da grade (`GridToolbarExport`), respeitando a
  seleção/filtro atual.
- **Conferir no gateway** (só perfil de desenvolvimento, e só quando a igreja
  do evento tem cobrança online de pé: módulo de cobrança ligado e gateway
  ativo — o `church.chargesOnline` que vem junto do evento; sem isso não há
  cobrança para conferir): pergunta ao gateway o
  status de cada cobrança pendente do evento. Existe para não esperar a
  conferência automática (roda sozinha de tempos em tempos) quando o retorno
  do gateway se perdeu. Fica fora do alcance de quem administra porque cada
  clique gera uma chamada ao gateway por cobrança pendente — num evento
  grande isso vira uma rajada de chamadas na conta da igreja.
- **Ações por linha** (menu de três pontos):
  - **Editar:** abre o modal de detalhes/edição do pagamento.
  - **Extornar:** presente no menu mas **desativado** (sem ação) — não
    implementado ainda.
  - **Ver histórico:** linha do tempo da cobrança.

Arquivos: `src/features/admin/events/components/listPayments.tsx`, `cardsPayments.tsx`, `src/features/admin/events/api/postReconcilePayments.tsx`.

## Editar pagamento (`ModalPayment`)

- **Pagamento vindo do checkout (`receivedFrom === 'SYSTEM'`): não edita à
  mão.** Status e método ficam bloqueados, com aviso de que os dados vêm do
  gateway e são reconferidos a cada retorno — mudar aqui criaria uma verdade
  paralela que a próxima notificação do gateway desfaria sem avisar. Só o
  desconto aplicado também trava nesse caso.
- **Lançamento manual continua editável** — é o motivo de existir: cobrança
  que nunca passou por um checkout (dinheiro na secretaria, PIX fora do
  sistema) só se resolve à mão.
- **Comprovante:** anexo de imagem (PNG/JPG) ou PDF, até o tipo aceito ser
  conferido tanto no seletor de arquivo quanto no arraste. Comprovante
  existente pode ser reaberto em nova aba (`ModalReceiptView`, com download).
- **Validação ao marcar "Pago":** exige comprovante anexado **ou** código da
  transação preenchido — não aceita os dois em branco.
- **Desconto aplicado:** só aparece para pagamento de inscrição; compra
  avulsa de produto não tem desconto.

Arquivos: `src/features/admin/events/components/modalPayments.tsx`, `modalReceiptView.tsx`, `src/features/admin/events/api/putPayment.tsx`.

## Histórico do pagamento (`ModalPaymentHistory`)

- Linha do tempo do mais recente para o mais antigo, cada passo com o que
  mudou (de → para, só os campos relevantes ao financeiro: valor, método,
  status, desconto, comprovante — nunca a linha inteira) e a origem: pelo
  painel, retorno do gateway, conferência automática ou pelo sistema.
- Existe ao lado de Editar e Extornar como a terceira pergunta antes de mexer
  no dinheiro: quem já baixou isso, quando, e se foi gente ou a conferência
  automática.

Arquivo: `src/features/admin/events/components/modalPaymentHistory.tsx`, `src/features/admin/events/api/getPaymentLogs.tsx`.

## Aba Pedidos de Produtos

- **Cards de resumo** (`CardsProductOrders`): compras, peças vendidas,
  aguardando pagamento e a entregar (com o total já entregue). Some por
  completo quando o evento não tem venda nenhuma. A lista de produtos do
  evento, com foto, é clicável — filtra a tabela abaixo por aquele produto
  clicando de novo no mesmo item para voltar a "todos".
- **Filtros:** busca (nome, CPF ou produto), produto e status do pagamento.
- **Exportar** (menu na barra, **PDF**), sempre com o que os filtros deixam
  na tela — a mesma regra da tabela (`filtrarPedidos`). Filtrando por "Pago",
  por exemplo, o pedido ao fornecedor conta só o que foi pago. Com um produto
  filtrado, o arquivo leva só os itens dele (na tela a compra aparece
  inteira).
  - **A cara do evento** (`PdfDoEvento`, `src/features/admin/events/pdfDoEvento.tsx`,
    com `@react-pdf/renderer`, o mesmo dos outros PDFs do sistema):
    - **Faixa de abertura:** a **capa** do evento de ponta a ponta, com um véu
      escuro para o texto ler em qualquer foto; por cima, a **logo** num quadro
      branco e, em branco, o nome do evento, a igreja e o período. Capa e logo
      vêm da consulta com imagens, a mesma dos crachás. Sem capa, a faixa é da
      cor principal do evento.
    - **Cores do evento** (`data.colors.primary`): tingem o título do
      relatório, o cabeçalho da tabela (fundo clareado da mesma cor) e os
      subtotais e o total. Sem paleta, ou com uma cor inválida, fica o índigo
      do sistema.
    - Embaixo da faixa: o que é o relatório, os filtros que valeram
      ("Filtros: nenhum" quando não há) e "Exportado em … por …". Quem abre o
      arquivo depois sabe que ele é o recorte da tela, e não "tudo".
  - **Tabela:** cabeçalho das colunas repetido em toda página, linhas finas
    entre os itens, quantidades alinhadas à direita, subtotal e total em
    negrito, e rodapé com o nome do evento, a contagem e "Página X de Y". O
    negrito é pela família (`Helvetica-Bold`): com a fonte embutida do
    react-pdf o `fontWeight` sozinho não muda nada.
  - **Com comprador** (`relatorioComComprador`, página deitada — são nove
    colunas): uma linha por item — comprador, CPF, e-mail, produto, variação,
    quantidade, compra (avulsa ou com a inscrição), pagamento e quando foi
    entregue —, terminando no total de peças. Para conferir e entregar.
  - **Para pedido** (`relatorioParaPedido`, página em pé): produto, variação e
    quantidade somada de todas as compras, sem ninguém. Com mais de um
    produto, cada um com mais de uma variação ganha subtotal; no fim, o total.
    A lista para encomendar do fornecedor.
  - **Ordem das variações** (`compararVariacoes`): tamanho de roupa do menor ao
    maior (PP, P, M, G, GG, XG...) — em ordem alfabética, G vinha antes de M e
    P; o resto (cores, "Única", números) segue o alfabeto, número em ordem
    numérica.
  - Sem compra nenhuma nos filtros, um aviso no lugar de um arquivo vazio.
- **Uma linha por compra**, com todos os itens dentro — quem leva duas
  camisas paga uma vez só.
- **Coluna Compra:** "Avulsa" (comprada solta na loja) ou "Com a inscrição".
- **Coluna Status do pagamento:** clicar leva para a aba Financeiro já com a
  pessoa na busca (por CPF, ou nome se não tiver CPF).
- **Entrega:**
  - Botão "Registrar entrega" só libera com o pagamento `PAID` — o servidor
    recusa do mesmo jeito; o controle existe para impedir entregar antes de
    receber.
  - Já entregue, a coluna mostra a data/hora com um botão para **desfazer o
    registro**, ao lado do que ele desfaz.

Arquivos: `src/features/admin/events/components/listProductOrders.tsx`, `cardsProductOrders.tsx`, `src/features/admin/events/api/patchProductsDelivery.tsx`.

## Ponto encontrado, fora do escopo desta tarefa

- Em `modalPaymentHistory.tsx`, o rótulo de origem `WEBHOOK` está fixo como
  "Retorno do PagBank" (`ORIGEM`), mesmo com o sistema hoje suportando mais de
  um gateway por igreja (ver `ic-backend/docs/pagamentos.md`). Vale conferir
  se o rótulo deveria ser genérico ("Retorno do gateway").
