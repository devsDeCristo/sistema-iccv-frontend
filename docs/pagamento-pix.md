# Escolha da forma de pagamento e Pix na tela

Vale para a igreja que cobra pelo **PayPal, Mercado Pago, PagBank ou Ton com o
Pix marcado** nas formas de pagamento (etapa Pagamento do cadastro). O Pix sai
do checkout do gateway e é pago aqui, com QR dinâmico criado pela API de
pedidos dele (valor e validade desta cobrança); as outras formas (cartão,
boleto, saldo) seguem no checkout. Com só o Pix marcado, não há pergunta: o
pedido sai direto em Pix. Sem Pix marcado, nada disto aparece. A InfinitePay
fica de fora: a API dela só gera link de checkout.

Começou no PayPal (10/11/2026), que não tem página para o Pix; em nov/2026 foi
estendido aos outros três — ver `ic-backend docs/pagamentos.md`, "Pix na tela
do sistema". Nenhum dado de cartão passa pelo sistema.

## A pergunta

- **Onde mora:** dentro de `postCreateCheckoutEvent`
  (`src/features/admin/events/api/postCreateCheckoutEvent.tsx`), e não em cada
  tela. Três lugares abrem checkout — a inscrição, a loja do evento e Minhas
  Inscrições — e nenhum deles sabe qual gateway a igreja usa. Nenhum dos três
  foi alterado.
- **Como funciona:** a primeira chamada vai sem forma de pagamento. Se o
  servidor responde `choice` em vez de `link`, a pergunta é feita (o
  `escolher` que a tela passa — obrigatório) e a chamada se repete com `method: 'PIX'` ou `'CREDIT_CARD'`. Aí vem o `link`, e as telas
  seguem como sempre (`window.open`).
- **O que a pergunta mostra, sempre:** a marca do gateway, a frase "Processado
  pelo {gateway}" e, em cada opção, como se paga e quando confirma — sem falar
  de onde a pessoa paga ("aqui", "no site do gateway"), que não é o que ela
  escolhe. Pix: "Pague pelo app do seu banco, com QR Code ou Pix Copia e Cola.
  A confirmação sai na hora." A outra: "Pague com {cartão ou boleto}. A
  confirmação sai assim que o pagamento for aprovado." No app, o Pix fala só em
  Copia e Cola (o QR não se lê no próprio celular). O nome da outra saída vem do servidor
  (`choice.checkoutLabel`), com o que a igreja ligou no checkout: "Cartão ou
  boleto", "Boleto", "Cartão ou conta PayPal". O app mostra o logo só no
  PayPal (é o único que ele tem em imagem); nos outros, o nome. O inscrito precisa saber para quem
  está pagando antes de escolher: é esse nome que aparece no app do banco e na
  fatura.
- **Pix recusado pelo gateway** (conta sem chave Pix, dado inválido, pedido
  que volta sem o código do QR): o servidor responde 422 com "O Pix não está
  disponível agora. Escolha outra forma de pagamento." (no PayPal, "Escolha
  cartão ou conta PayPal."), que sai no aviso vermelho da tela; a pessoa paga
  de novo e escolhe a outra saída. No checkout o gateway só escondia o Pix de
  conta sem chave; pela API a criação falha, e é este aviso que cobre isso. Falha de rede continua com "não foi possível falar com o
  PayPal".
- **Fechar sem escolher** não é erro: não sai toast vermelho, e cada tela trata
  como pagamento que ficou para depois (o modal de Minhas Inscrições destrava;
  a inscrição e a loja seguem para onde já seguiam).
- **A mesma pergunta nas três telas** (`OpcoesDaForma`, em
  `src/features/events/components/escolhaDaForma.tsx`): "Como você quer
  pagar?", o gateway que processa no alto e as duas saídas lado a lado (uma
  embaixo da outra no celular), cada uma um ingresso em pé — o mesmo desenho
  de Minhas Inscrições (`ingresso.ts`). "Voltar" desiste. O alerta do
  SweetAlert que fazia a pergunta saiu, e o `escolher` do
  `postCreateCheckoutEvent` ficou obrigatório para não voltar a existir outra
  versão.
- **Taxa de serviço:** com repasse ligado, cada opção mostra no canhoto o valor
  já com a taxa dela e, em destaque (chip de alerta com ícone de recibo),
  "inclui R$ x de taxa de serviço (y%)" (Pix com a taxa do Pix; a outra com a
  maior taxa das formas do checkout). O valor vem do total da tela (Minhas
  Inscrições) ou do `choice.amountCents` que o servidor manda com a pergunta
  (inscrição e loja) — as três telas mostram o mesmo número. A tela do QR mostra, abaixo do valor, o mesmo
  chip "inclui R$ x de taxa de serviço" (`serviceFeeCents`), no site e no app.
- **Só um modal ativo por vez:** em Minhas Inscrições a pergunta é uma etapa
  do próprio modal de pagamentos (o conteúdo troca). Na inscrição e na loja,
  que não têm modal aberto, ela abre num `ResponsiveModal` pelo
  `useEscolhaDaForma` (`useEscolhaDaForma.tsx`), que também diz quando está
  perguntando — a tela de espera da inscrição some nesse momento. No canhoto
  vai o valor quando a tela o conhece (Minhas Inscrições); na inscrição e na
  loja, "Escolher".
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
- **Duas colunas aguardando o pagamento:** a partir do tablet (`md`), o cartão
  vai a 880px, com o QR (240px) à esquerda e, à direita, evento e valor,
  instruções, código, "Copiar código Pix", prazo e "Já paguei" — numa coluna de
  460px a tela passava da altura e pedia rolagem. No celular é uma coluna, com
  o QR em cima. Os demais estados (pago, em análise, expirado,
  substituído, encerrado) são curtos e seguem no cartão de 460px.
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
