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
- **Abas:** "Todos", os grupos de inscrição e "Produtos Avulsos".
  - **Todos** vem primeiro e é a aba inicial, com **uma linha por pessoa**: a
    inscrição e as compras avulsas dela juntas (`porPessoa`).
    - **Valor:** somado.
    - **Produtos:** os de todos os pagamentos ("Inclui compra avulsa" quando há).
    - **Método, status e origem:** o valor quando todos coincidem; senão
      "Vários", "1 de 2 pagos" (em laranja) e "Várias". A exportação sai com o
      mesmo texto.
    - **Ações:** quem tem mais de um pagamento vê no menu cada um, identificado
      ("Inscrição Cursilhistas · R$ 100,00", "Compra avulsa · R$ 50,00"), com
      Editar e Ver histórico. O modal recebe sempre o pagamento de verdade,
      nunca a linha somada.

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
- **Conferir no gateway** (só perfil de desenvolvimento): pergunta ao gateway o
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
