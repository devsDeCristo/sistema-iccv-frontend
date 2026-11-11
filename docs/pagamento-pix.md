# Escolha da forma de pagamento e Pix na tela (PayPal)

Vale **só para a igreja que cobra pelo PayPal com a chave "Aceitar Pix"
ligada**. Em todos os outros gateways (PagBank, Mercado Pago, InfinitePay, Ton)
nada disto aparece: o inscrito vai direto para a página do gateway, que já
oferece Pix e cartão lado a lado.

O motivo está em `ic-backend docs/paypal.md`: no PayPal, Pix e cartão são
pedidos diferentes, e o PayPal não tem página para o Pix — devolve o código, e
quem mostra o QR é o sistema. É a única exceção à regra de "sempre checkout
hospedado", decidida em 10/11/2026, e não envolve dado de cartão.

## A pergunta

- **Onde mora:** dentro de `postCreateCheckoutEvent`
  (`src/features/admin/events/api/postCreateCheckoutEvent.tsx`), e não em cada
  tela. Três lugares abrem checkout — a inscrição, a loja do evento e Minhas
  Inscrições — e nenhum deles sabe qual gateway a igreja usa. Nenhum dos três
  foi alterado.
- **Como funciona:** a primeira chamada vai sem forma de pagamento. Se o
  servidor responde `choice` em vez de `link`, a pergunta é feita
  (`escolherFormaDePagamento`, em
  `src/features/events/components/escolherFormaDePagamento.ts`) e a chamada se
  repete com `method: 'PIX'` ou `'CREDIT_CARD'`. Aí vem o `link`, e as telas
  seguem como sempre (`window.open`).
- **O que a pergunta mostra, sempre:** a marca do gateway, a frase "O pagamento
  é processado pelo PayPal" e o que acontece em cada opção — Pix aqui mesmo,
  cartão ou conta PayPal no site do PayPal. O inscrito precisa saber para quem
  está pagando antes de escolher: é esse nome que aparece no app do banco e na
  fatura.
- **Pix recusado pelo PayPal** (conta sem Pix habilitado, dado inválido): o
  servidor responde 422 com "O Pix não está disponível agora. Escolha cartão ou
  conta PayPal.", que sai no aviso vermelho da tela; a pessoa paga de novo e
  escolhe cartão. Falha de rede continua com "não foi possível falar com o
  PayPal".
- **Fechar sem escolher** não é erro: não sai toast vermelho, e cada tela trata
  como pagamento que ficou para depois (o modal de Minhas Inscrições destrava;
  a inscrição e a loja seguem para onde já seguiam).
- **Por cima de tudo:** o alerta sobe a própria camada (`z-index`), porque abre
  em cima do modal de pagamentos e da tela de espera, que ficam acima da camada
  padrão do SweetAlert.
- O nome do gateway vem do servidor e entra na pergunta como **texto**, nunca
  como HTML.

## A tela do QR — `/eventos/:id/pagamento/pix/:referenceId`

Página em `src/pages/events/pix/index.tsx`; chamadas em
`src/features/events/api/pixCheckout.ts`. O link do checkout de Pix aponta para
cá — é o servidor que monta o endereço.

- **O código vem sempre do servidor**, pela referência do endereço
  (`GET /events/:eventId/users/:userId/payments/pix/:referenceId`). Nada do que
  é pago sai da URL nem é montado no navegador: um QR trocado na tela é
  dinheiro na conta de outra pessoa, e Pix não volta. O usuário é o da sessão;
  referência de outra pessoa responde 404 e a tela mostra "Pagamento não
  encontrado".
- **Cabeçalho fixo em todos os estados:** marca do gateway, "Processado pelo
  PayPal" e o aviso de que o recebedor pode aparecer com esse nome no app do
  banco. Abaixo, o evento e o valor.
- **Aguardando:** QR Code (sempre sobre fundo branco — no tema escuro o leitor
  do banco não engata num QR desenhado sobre cinza), o copia e cola com botão
  de copiar, a contagem regressiva da validade e o botão **Já paguei**.
- **A tela só lê.** Ela consulta o servidor a cada 5 segundos enquanto está
  aguardando, e vira "Pagamento confirmado" sozinha quando o aviso do gateway
  chega. A consulta para quando não há mais o que esperar (pago, expirado,
  substituído), porque a aba pode ficar aberta o dia inteiro. Sem toast de erro
  nessa consulta: uma falha de rede viraria uma pilha de avisos.
- **Já paguei** (`POST …/pix/:referenceId/check`): manda o servidor perguntar
  ao gateway na hora. É o que resolve o aviso que demora ou não chega. Se o
  gateway ainda não confirma, sai um aviso azul pedindo para aguardar. O
  servidor só pergunta ao PayPal uma vez a cada 15 s por cobrança; cliques
  dentro desse intervalo recebem o que já está no banco (protege o limite de
  chamadas da conta da igreja).
- **Os outros estados:**

  | Situação | Quando | O que a tela mostra |
  | --- | --- | --- |
  | Pago | `status: PAID` | "Pagamento confirmado" e voltar ao evento |
  | Em análise | `status: IN_ANALYSIS` (ex.: valor pago menor que o cobrado) | aviso de que a organização está conferindo |
  | Expirado | passou de `expiresAt` | sem QR; ir para Minhas Inscrições gerar outro, ou "Já paguei" |
  | Substituído | `active: false` — um pagamento novo tomou o lugar deste | sem QR (o código antigo ainda seria aceito pelo banco); usar o mais recente |
  | Encerrado | cancelado, recusado ou estornado | ir para Minhas Inscrições |

- **Para voltar ao QR depois de fechar a aba:** pagar de novo em Minhas
  Inscrições e escolher Pix. O servidor devolve o mesmo código enquanto ele
  tiver mais de 5 minutos de validade.

## Conferido em 10/11/2026

No navegador, com as respostas da API simuladas: a pergunta por cima do modal;
Pix e cartão enviando a forma certa e abrindo a aba certa; fechar a pergunta
sem erro; os seis estados da tela; a virada para "pago" pela consulta
automática e pelo "Já paguei"; e a largura de celular sem rolagem lateral. O
Pix de verdade, contra o PayPal, ainda não foi exercitado — ver "A confirmar no
sandbox" em `ic-backend docs/paypal.md`.
