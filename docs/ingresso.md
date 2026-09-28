# Ingresso

A inscrição da pessoa num evento, desenhada como ingresso. Aparece na página
inicial (ingressos ativos) e em Minhas Inscrições (histórico). Clicar abre o
modal de detalhes.

## Dados

- **Fonte:** `useGetPayments` → `/users/:id/payments` (`paymentsWithRoles`). Cada item é um evento com:
  - `registeredRoles` (inscrições confirmadas);
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
- **Picote:** linha tracejada com dois furos na cor do fundo da página.
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

- **Topo:** capa, nome do evento e data ou local.
- **Pendências:** o que ainda trava a inscrição, com o que fazer.
  - Termo do responsável não enviado → botão "Anexar termo".
  - Termo enviado, aguardando aprovação da organização → botão "Reenviar termo".
  - Termo recusado, com o motivo → botão "Reenviar termo".
  - Lista de espera, dizendo em quais grupos a vaga ainda não está garantida.
  - Pagamento em aberto. Se a igreja não recebe pelo site, orienta a acertar com a organização.
- **Inscrições:** cada grupo · regra com o status do pagamento e os produtos comprados junto.
- **Compras na loja:** cada compra com a data, os produtos e o status.
- **Canhoto:** o status geral e os botões "Ver evento" e "Pagar".

### Pagar

- O botão só aparece quando há pagamento em aberto **e** a igreja recebe pelo site (`modulePayment`).
- Ele **fecha** o modal de detalhes e **abre o modal de pagamento** (`ModalPayment`), onde a pessoa escolhe o que levar ao checkout. O `ModalPayment` é o fluxo de pagamento de sempre e não deve ganhar papel de tela de detalhes.

Arquivos: `src/features/myRegisters/components/modalIngresso.tsx` e `src/features/myRegisters/components/modalPayment.tsx`.
