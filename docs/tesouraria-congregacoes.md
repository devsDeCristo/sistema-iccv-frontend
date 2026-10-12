# Tesouraria das congregações (/admin/tesouraria/congregacoes)

Cada congregação da igreja tem a sua tesouraria, **só com entradas e saídas**: ofertas, doações, aluguel, contas. Não há dízimo nem membros na congregação. O registro é de controle: o dinheiro é todo da igreja central (o CNPJ é dela). No menu, é o terceiro filho de **Tesouraria** (Administrativa, Eventos, Congregações).

**Dados da API** (`eventosECongregacoes/api.ts`; regras no `docs/tesouraria.md` do `ic-backend`, seção "Tesourarias de evento e de congregação").

**Quem vê:** só a tesouraria da igreja e o admin (`ADMIN_AREA_ROLES`), que é quem fecha. O tesoureiro(a) de evento não entra aqui. Ver `docs/tesouraria.md`.

## O modelo: uma conta por tesouraria

- Em Configurações › Integrações (Pluggy), com **bancos divididos por tesouraria**, cada banco diz de qual tesouraria é: Administrativa, Eventos ou Congregações (`docs/configuracoes.md`).
- **Conta das congregações:** a ideia é a pessoa escolher entre **uma conta para todas** as congregações ou **uma conta por congregação**. O servidor pode já nascer aceitando as duas. No front a escolha aparece **travada em "uma para todas"** (a outra opção fica à vista, desligada, "em breve"), e é só com ela que o MVP funciona.
- O extrato chega pelo Pluggy e fica salvo. Cada movimento é **alocado** na congregação a que pertence — inteiro, ou em partes quando serve a mais de uma (rateio).
- **Sem banco de Congregações** (sem a divisão, ou nenhum banco escolhido para Congregações), a congregação distribui da conta única, a da Administrativa — e o que vai para ela sai dos totais de lá.
- **Ninguém lança à mão para depois conciliar:** o que veio do banco já é o lançamento. Conciliar, aqui, é alocar e dar a categoria.

## O fluxo

### 1. Criar a congregação (e a tesouraria dela)

- Botão **Nova congregação** na lista (`modalNovaCongregacao.tsx`): **nome** (obrigatório) e **local** (bairro, distrito ou cidade; opcional).
- **Por enquanto, criar a tesouraria cria a congregação junto.** Ainda não existe cadastro de congregações. Quando existir, ele será um fluxo à parte, e criar a tesouraria passa a ser escolher uma congregação já cadastrada, como a tesouraria de evento escolhe o evento.

### 2. A lista (`/admin/tesouraria/congregacoes`)

- **Aviso de não alocados** (`avisoNaoAlocados.tsx`), no topo: quantos lançamentos da conta das Congregações não estão em congregação nenhuma, e quanto somam, com o botão **Ver não alocados** (`/admin/tesouraria/congregacoes/nao-alocados`, a lista só leitura com o banco de cada um). Parte é trabalho por fazer; parte nunca será de congregação (uma tarifa do banco). Só aparece quando a conta tem banco próprio; com a conta única, o aviso da Administrativa basta.
- **Filtro** Abertas, Fechadas e Todas, com a contagem; abre em Abertas.
- **Cards** (`listaDeTesourarias.tsx`, o mesmo dos eventos): o chip **Aberta** ou **Fechada**, o nome, o local, e entradas, saídas e resultado em linhas (negativo em vermelho, com o sinal). "Abrir tesouraria" fica no rodapé.

### 3. A tesouraria da congregação (`/admin/tesouraria/congregacoes/:id`)

Duas abas com endereço próprio, **Conciliação** e **Lançamentos** (`.../conciliacao`, `.../lancamentos`); sem aba, abre na Conciliação. O cabeçalho é o nome da congregação, com "Tesouraria da congregação · local".

#### Fechamento

O mesmo do evento (`barraDoFechamento.tsx`): o admin e a tesouraria da igreja veem **Fechar tesouraria** (com confirmação). Fechada, um aviso diz quando e por quem, e nada mais entra, sai ou muda de categoria — a Conciliação fica só leitura. Só eles reabrem.

#### Conciliação

O mesmo componente da tesouraria de evento (`conciliacaoDaTesouraria.tsx`, com `conta="CONGREGACOES"`): o diff da Administrativa, com **o que veio do banco à esquerda** e **os lançamentos da congregação à direita**, cada par na mesma linha.

- A congregação não tem pagamentos nem lançamentos manuais: o lado direito é só o que foi **trazido do banco**.
- **Só no banco** (direita hachurada): o movimento da conta que não foi para congregação nenhuma — os mesmos em todas —, com o banco de cada um. Marca-se o que é desta (a caixinha ou o clique na linha) e usa-se **Trazer para esta congregação**, na barra do pé.
- **Rateio:** na mesma barra, ao lado, **Ratear e trazer** abre uma janela com uma aba por movimento marcado, cada uma com quanto vem para a congregação — o boleto do material de limpeza das três congregações, por exemplo. O resto continua no banco, para as outras.
- **Conciliado** (verde): o movimento trazido vira o lançamento da congregação na mesma linha, com a categoria (entra "Sem categoria", em laranja; escolhe-se na própria linha) e o **devolver**, que o manda de volta para o banco.
- **Cards:** conciliados, só no banco (com o saldo) e sem categoria.
- **Categorias:**
  - entradas: Ofertas, Campanhas, Doações e Outras entradas;
  - saídas: Aluguel, Água e luz, Manutenção, Limpeza, Ação social e Outras saídas.

#### Lançamentos

- **Período:** o ano inteiro ou um dos meses com movimento — a congregação é tesouraria do dia a dia.
- **Cards:** entradas, saídas e resultado do período.
- **Entradas e saídas por categoria:** o valor, a porcentagem e a barra de cada categoria.
- **Tabela:** os lançamentos, com as abas Todos, Entradas e Saídas. Só leitura.

## Rotas

| Rota                                             | Tela                                   |
| ------------------------------------------------ | -------------------------------------- |
| `/admin/tesouraria/congregacoes`                 | lista das tesourarias das congregações |
| `/admin/tesouraria/congregacoes/:id`             | redireciona para `.../conciliacao`     |
| `/admin/tesouraria/congregacoes/:id/conciliacao` | alocar o extrato                       |
| `/admin/tesouraria/congregacoes/:id/lancamentos` | lançamentos do período                 |

Todas com `RequireRole` em `ADMIN_AREA_ROLES` (`src/pages/admin/tesouraria/routes`).

## Código

- **Telas:** `src/pages/admin/tesouraria/congregacoes/` (`index.tsx` é a lista; `tesouraria.tsx` são as abas). As rotas ficam em `src/pages/admin/tesouraria/routes`.
- **Dados:** `src/features/admin/tesouraria/eventosECongregacoes/api.ts` (hooks) e `modelo.ts` (tipos, categorias e as contas da tela).
- **Componentes da congregação:** `modalNovaCongregacao.tsx` e `lancamentosDaCongregacao.tsx`, em `src/features/admin/tesouraria/eventosECongregacoes/components/`.
- **Componentes compartilhados com a tesouraria de evento** (na mesma pasta): `conciliacaoDaTesouraria.tsx`, `modalRateio.tsx`, `lancamentosDaTesouraria.tsx`, `listaDeTesourarias.tsx`, `avisoNaoAlocados.tsx` e `barraDoFechamento.tsx`.
- **No Pluggy:** a escolha travada da conta das congregações está em `src/features/settings/integrations/pluggyForm.tsx`.

## Em aberto

- **Uma conta por congregação:** com ela, tudo o que entra numa conta já é daquela congregação, e a Conciliação deixa de distribuir — vira só dar a categoria. Fica para quando a opção for destravada.
- **O destino do não alocado:** a tarifa do banco fica na conta das Congregações, só avisada, ou passa para a Administrativa?

As perguntas de Eventos e da Administrativa estão em [tesouraria.md](tesouraria.md#em-aberto).
