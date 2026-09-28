# Loja do evento (`/eventos/:id/produtos`)

Loja de produtos vinculados a um evento (camisa, caneca, etc.): cadastro pelo admin, compra dentro da inscrição (oferta pós-inscrição, ver `docs/inscricao-no-evento.md`) e compra avulsa pela página própria. As regras de estoque e permissão aplicadas pelo servidor estão no repositório `ic-backend`, `docs/loja-e-produtos.md` — este documento cobre só o que a tela faz e mostra.

## Cadastro (admin)

Formulário de produtos dentro do cadastro/edição do evento, um acordeão por produto.

- **Campos do produto:** nome, preço (compartilhado por todas as variantes) e descrição opcional (até 300 caracteres).
- **Fotos:** até `MAXIMO_DE_FOTOS` (5) por produto, redimensionadas no navegador antes do envio (`reduzirFotoParaDataUrl`) e limitadas a `TAMANHO_MAXIMO_DA_FOTO` (~700 KB em data URL) — o mesmo teto do servidor, conferido aqui só para não subir o formulário inteiro à toa. A primeira foto da lista é sempre a capa; dá para trocar a capa clicando em "Tornar capa" numa miniatura, ou remover fotos uma a uma.
- **Variantes:** nome (ex.: "P", "M", "Único") e estoque opcional — vazio é sem limite, não zero. Produto sem nenhuma variante não pode ser comprado; o formulário orienta criar ao menos uma ("Único") quando não há escolha real.
- **Produto/variante já vendido:** não pode ser removido (botão desabilitado com tooltip). Baixar o estoque abaixo do que já foi vendido é permitido, mas mostra aviso — a venda que já ocorreu não é desfeita, só as próximas param.
- **Quem pode comprar (`publicStore`):** rádio "Restrita" (padrão — só quem tem inscrição confirmada) ou "Pública" (qualquer pessoa com cadastro no sistema). Só aparece quando há ao menos um produto cadastrado.

Arquivo: `src/features/admin/events/components/formProducts.tsx`. Tipos e helpers: `src/features/admin/events/products.ts`, `src/features/admin/events/types.ts`.

## Página pública da loja (`/eventos/:id/produtos`)

Vitrine isolada, acessível pelo card "Loja do evento" na página do evento (`docs/pagina-do-evento.md`) sempre que existe produto com variante disponível.

- **Produtos exibidos:** só os que têm ao menos uma variante `temDisponivel` (estoque nulo/indefinido, ou maior que zero). Sem nenhum, a página mostra "Nenhum produto disponível" com botão de voltar.
- **Loja pública ou restrita:** `compraRestrita = !inscrito && !event.data.publicStore`. `inscrito` é ter alguma inscrição **confirmada** (`present`) neste evento — estar só na lista de espera não conta.
  - Loja pública: qualquer pessoa logada compra, inscrita ou não.
  - Loja restrita (padrão): quem não está inscrito confirmado vê a vitrine inteira, mas um aviso substitui a sacola ("As compras desta loja são exclusivas para quem tem inscrição confirmada...") e a compra fica bloqueada. O servidor recusa do mesmo jeito se a chamada chegar lá.
- **Compra é sempre pagamento próprio**, separado de qualquer inscrição — mesmo que a inscrição ainda esteja em aberto, a compra avulsa não entra nela (isso só acontece na oferta logo após a inscrição, com `attachToRegistration: true`).

Arquivo: `src/pages/events/products/index.tsx`.

## A vitrine (`ProductOffer`)

Componente compartilhado entre a compra avulsa e a oferta pós-inscrição.

- Cada produto é um cartão com foto (carrossel se houver mais de uma), preço em etiqueta sobre a imagem, nome e descrição.
- A escolha de variante e quantidade acontece num diálogo à parte (`VariantPickerDialog`), não no cartão — quantidade é por variante (dá para levar uma P e uma G na mesma compra), com limite de `QUANTIDADE_MAXIMA_POR_ITEM` (20) por item e respeitando o estoque restante.
- **Sacola:** faixa fixa no rodapé com o total de itens e valor, com os botões de pular/voltar e de confirmar. Vira um aviso (sem sacola) quando a compra está bloqueada (`bloqueio`, usado pela loja restrita).
- Produto sem nenhuma variante com estoque aparece com o botão "Esgotado", desabilitado.

Arquivo: `src/features/events/components/productOffer.tsx`, `src/features/events/components/variantPickerDialog.tsx`.

## Compra e pagamento

`usePostBuyEventProducts` (`POST /events/:eventId/users/:userId/products`) registra a compra e devolve um `paymentId`. A partir daí:

- **Igreja que recebe pelo site** (`modulePayment`/`chargesOnline`): a tela abre o checkout automaticamente com esse `paymentId` (`usePostCreateCheckoutEvent`), sempre por link hospedado do gateway, nunca checkout transparente.
- **Igreja sem pagamento online:** a compra fica registrada e a tela avisa que o valor é combinado diretamente com a organização, sem tentar abrir checkout.
- **Erro 503 ao criar o checkout** (`ehPagamentoForaDoSite`): tratado como o mesmo aviso acima — não é falha, é a igreja não recebendo pelo site; a compra continua válida e disponível para pagamento depois em Minhas Inscrições.
- **Falha no item** (ex.: variante esgotou entre a escolha e o envio): o servidor recusa e a tela recarrega o evento para atualizar o estoque, sem perder a seleção da sacola que ainda for válida.

Arquivos: `src/features/admin/events/api/postBuyEventProducts.tsx`, `src/features/admin/events/api/postCreateCheckoutEvent.tsx`. Regras de estoque e de quem pode comprar no servidor: `ic-backend`, `docs/loja-e-produtos.md`.
