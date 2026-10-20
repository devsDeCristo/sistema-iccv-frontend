# Ingresso

A inscrição da pessoa num evento, desenhada como ingresso. Aparece na página
inicial (ingressos ativos) e em Minhas Inscrições (histórico). Clicar abre o
modal de detalhes.

## Dados

- **Fonte:** `useGetPayments` → `/users/:id/payments` (`paymentsWithRoles`). Cada item é um evento com:
  - `registeredRoles` (inscrições confirmadas), cada uma com `price` (preço do ingresso) e `amount` (o valor cobrado de fato no pagamento dela: ingresso + produtos, com desconto; nulo sem pagamento);
  - `waitlistRoles` (lista de espera);
  - `productPurchases` (compras avulsas na loja);
  - a liberação de menor (`minorApprovalStatus`, `signedTermUrl`, `minorApprovalRejectionReason`);
  - `modulePayment`, que diz se a igreja do evento recebe pelo site.
- **Data do evento:** não vem nesses dados. Quem tem o evento do catálogo passa a data pela prop `periodo`.
- **Pagamentos em aberto (`pagamentosEmAberto`, `src/features/myRegisters/utils.ts`):**
  - conta inscrições confirmadas e compras na loja cujo status não é `PAID`, `IN_ANALYSIS`, `CANCELED` nem `REFUNDED`;
  - a lista de espera não conta, porque não há o que pagar enquanto a vaga não sai.

## O ingresso (`EventCard`)

- **Parte principal:**
  - capa do evento com filtro preto de 38% e véu que escurece para a direita (o mesmo tratamento do cartaz do catálogo), e a logo;
  - "INGRESSO" na cor do evento e o nome do evento;
  - a data (quando vem `periodo`) ou o local;
  - os tipos de ingresso ("grupo · regra") em chips, com os da lista de espera marcados;
  - o chip de liberação de menor, quando houver.
- **Picote:** linha tracejada com dois furos que são recortes de verdade (máscara CSS em cada metade, como no `ModalIngresso`): cada metade perde um quarto de círculo nos cantos do lado do picote, e os dois quartos formam a meia-lua. O papel do ingresso é transparente e a sombra é `drop-shadow`, que segue o recorte: ela contorna a curva dos furos (claro e escuro), onde a sombra de caixa das superfícies passava reto. Antes os furos eram círculos inteiros pintados na cor do fundo, que passavam da borda e apareciam como bolinha solta.
- **Canhoto:**
  - um selo com ícone: inscrição confirmada, lista de espera ou compra na loja;
  - o status do pagamento: "Tudo pago" (verde, `chips.success`) ou "N pendente(s)" (laranja, `chips.alert`).
- **Sem botões:** o ingresso inteiro é clicável, inclusive por teclado (Enter ou espaço), e abre o modal de detalhes.

### Variações

- **Normal** (Minhas Inscrições): horizontal, com o canhoto à direita, a partir de `sm`. No celular o canhoto desce para baixo.
- **`compacto`** (home): sempre vertical, com capa e medidas menores, e o canhoto em uma linha só (selo + "Confirmada" à esquerda, status à direita).

Arquivo: `src/features/myRegisters/components/cards.tsx` (`EventCard`).

## Modal de detalhes (`ModalIngresso`)

Modal informativo, também em formato de ingresso. Os furos do picote são
transparentes de verdade, feitos com máscara CSS, porque atrás do modal está o
fundo escurecido.

O modal usa `scroll="body"`: quem rola é a página, e o ingresso inteiro desce
junto. Antes, no celular, com várias compras o ingresso passava da altura da
tela, o Dialog espremia a parte de cima e o fim da lista sumia debaixo do
picote.

- **Topo:** capa, nome do evento e data ou local.
- **Pendências:** o que ainda trava a inscrição, com o que fazer.
  - Termo do responsável não enviado → botão "Anexar termo".
  - Termo enviado, aguardando aprovação da organização → botão "Reenviar termo".
  - Termo recusado, com o motivo → botão "Reenviar termo".
  - Lista de espera, dizendo em quais grupos a vaga ainda não está garantida.
  - Pagamento em aberto. Se a igreja não recebe pelo site, orienta a acertar com a organização.
- **Cada linha:** como numa nota — o título, uma linha pontilhada e o **valor na outra ponta** (com o título em duas linhas, os pontos seguem a última); embaixo, o chip de status (com a data, nas compras) e os produtos. **No celular** o nome ocupa a largura toda e os pontos e o valor descem para a linha do chip ("Aguardando ······ R$ 350,00"), com a data embaixo — ao lado de um nome quebrado em várias linhas sobrava pouco para os pontos. O valor fica em negrito no tamanho do texto e na cor do status (laranja pendente, verde pago — a mesma do chip; azul na lista de espera). O destaque é pela cor, não pelo tamanho.
- **Inscrições:** cada grupo · regra com o valor (o cobrado, `amount`; sem pagamento, o `price`; zero aparece como "Grátis") e os produtos comprados junto, cada um com o valor (preço unitário × quantidade). Lista de espera mostra o preço do ingresso.
- **Compras na loja:** o título é o produto ("Camiseta Oficial do Retiro 2027 (Normal (GG)) ×1"), e não mais "Compra de 27/09/2026"; a data vai ao lado do chip ("Comprado em 27/09/2026"). Compra com mais de um produto tem "N produtos" no título e cada produto embaixo, com o seu valor. O valor da linha é o da compra (`amount`).
- **Canhoto:** o status geral — "Tudo pago" ou "N pagamentos pendentes · R$ X", com a soma do que falta (`valorEmAberto`, em `utils.ts`, a mesma régua de `pagamentosEmAberto`) — e os botões "Ver evento" e "Pagar".

### Certificado

- Botão **Certificado** no canhoto, antes de "Ver evento", quando
  `certificateAvailable` (certificado ligado no evento, a pessoa fez check-in e
  o evento terminou). Baixa `GET /events/:id/certificates/me/pdf` pela fila de
  PDF. O certificado traz um QR e um código que abrem a página pública
  `/certificado/:codigo`, que confirma nome, evento, igreja, período e carga
  horária, sem login e sem CPF.

### Pagar

- O botão só aparece quando há pagamento em aberto **e** a igreja recebe pelo site (`modulePayment`).
- Ele **fecha** o modal de detalhes e **abre o modal de pagamento** (`ModalPayment`), onde a pessoa escolhe o que levar ao checkout. O `ModalPayment` é o fluxo de pagamento de sempre e não deve ganhar papel de tela de detalhes.

Arquivos: `src/features/myRegisters/components/modalIngresso.tsx` e `src/features/myRegisters/components/modalPayment.tsx`.
