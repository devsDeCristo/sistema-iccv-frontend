# Tesouraria das congregações (/admin/tesouraria/congregacoes) — MVP

Cada congregação da igreja tem a sua tesouraria: o dia a dia financeiro dela (dízimos, ofertas, aluguel, contas), no mesmo molde da tesouraria administrativa. No menu, é o terceiro filho de **Tesouraria** (Administrativa, Eventos, Congregações).

**Situação:** MVP só no front, com **dados de exemplo** (`features/admin/financeiro/tesouraria/dados.ts`). Nada vai à API; o que se cria ou distribui fica em memória e some ao recarregar a página. Um aviso no topo das telas diz isso. A igreja do seletor no topo não muda os números.

Quem acessa: admin e financeiro da igreja (`ADMIN_AREA_ROLES`), como o resto da Tesouraria — ver `docs/financeiro.md`.

## O modelo: uma conta por tesouraria

- Em Configurações › Integrações (Pluggy), com **bancos divididos por tesouraria**, cada banco diz de qual tesouraria é: Administrativa, Eventos ou Congregações (`docs/configuracoes.md`).
- O banco marcado como **Congregações** é a conta da tesouraria de Congregações, **uma só para todas as congregações** — como a de Eventos é uma só para todos os eventos. No exemplo: "Cora · Conta das congregações".
- O extrato dessa conta chega pelo Pluggy e fica salvo. Cada movimento é **distribuído** para a congregação a que pertence.
- **Ninguém lança à mão para depois conciliar:** o que veio do banco já é o lançamento. Conciliar, aqui, é distribuir e dar a categoria.

## O fluxo

### 1. Criar a congregação (e a tesouraria dela)

- Botão **Nova congregação** na lista (`modalNovaCongregacao.tsx`): **nome** (obrigatório) e **local** (bairro, distrito ou cidade; opcional).
- **Por enquanto, criar a tesouraria cria a congregação junto.** Ainda não existe cadastro de congregações. Quando existir, ele será um fluxo à parte (com os membros de cada congregação), e criar a tesouraria passa a ser escolher uma congregação já cadastrada, como a tesouraria de evento escolhe o evento.
- A congregação recém-criada não tem membros nem movimentos: a aba Dízimos avisa que os membros virão do cadastro de congregações.

### 2. A lista (`/admin/tesouraria/congregacoes`)

- Um card por congregação (`listaDeTesourarias.tsx`, o mesmo dos eventos, no acabamento dos cards das Igrejas): o chip com quantos membros, o nome, o local, e entradas, saídas e resultado em linhas (resultado negativo em vermelho, com o sinal). "Abrir tesouraria" fica no rodapé do card.
- A barra do topo diz quantos movimentos da conta das Congregações ainda estão **a distribuir**, e quanto somam.

### 3. A tesouraria da congregação (`/admin/tesouraria/congregacoes/:id`)

As **mesmas abas da administrativa** — Conciliação, Dízimos e Lançamentos —, cada uma com endereço próprio (`.../conciliacao`, `.../dizimos`, `.../lancamentos`). Sem aba, abre na Conciliação. O cabeçalho é o nome da congregação, com "Tesouraria da congregação · local".

#### Conciliação: distribuir o extrato

O mesmo componente da tesouraria de evento (`distribuicaoDaConta.tsx`, com `conta="CONGREGACOES"`).

- **Cards:** quantos movimentos estão nesta congregação (com o saldo), quantos estão a distribuir na conta (com o saldo) e quantos desta congregação estão sem categoria.
- **À esquerda, A distribuir:** os movimentos da conta que não estão em nenhuma congregação — os mesmos em todas. Marca-se o que é desta congregação (a caixinha ou o clique na linha) e usa-se **Trazer para esta congregação**, na barra que aparece no pé. Dá para marcar vários de uma vez.
- **À direita, Nesta congregação:** o que já foi trazido, cada um com a categoria (escolhida na própria linha) e o **devolver**, que manda o movimento de volta para a distribuir (e tira a categoria).
- **O reconhecimento do membro:** quando quem pagou (o pagador do Pix) é membro desta congregação, a linha a distribuir diz isso, em azul:
  - com o **valor do dízimo** dele: "Dízimo de membro desta congregação", e o movimento já entra como **Dízimos** ao ser trazido;
  - com outro valor: "Membro desta congregação", e entra sem categoria (pode ser oferta, campanha…).

  É a mesma regra da importação do banco na administrativa: um Pix do membro com o valor do dízimo é dízimo.

- O resto entra como **Sem categoria**, destacado em laranja até alguém escolher.
- **Categorias:**
  - entradas: Dízimos, Ofertas, Campanhas, Doações e Outras entradas;
  - saídas: Aluguel, Água e luz, Manutenção, Limpeza, Ação social e Outras saídas.

#### Dízimos

A mesma tabela da administrativa (`listaDizimosPorMes.tsx`): cada membro da congregação numa linha, com o valor do dízimo, quanto dizimou em cada mês do ano e o total. A última linha é o **Total da congregação**.

- **Cards:** membros (dizimistas em potencial), quantos dizimaram no mês (com o valor), total do ano (quantos dizimaram) e média por quem dizimou no ano.
- **De onde vêm os números:** o que foi distribuído para a congregação como **Dízimos** e pago pelo membro. Um dízimo sem membro identificado (um depósito em dinheiro classificado como Dízimos) conta só na linha do total.
- **Não tem** busca, filtro de "dizimaram / não dizimaram" nem troca de ano, que a administrativa tem: no exemplo só há 2026.
- **O valor do dízimo não se edita aqui:** o lápis só avisa que ele vem do cadastro do membro.

#### Lançamentos

- **Período:** o ano inteiro ou um dos meses com movimento. A congregação é tesouraria do dia a dia, por isso tem período (a de evento não tem).
- **Cards:** entradas, saídas, resultado e dízimos do período.
- **Entradas e saídas por categoria:** o valor, a porcentagem e a barra de cada categoria.
- **Tabela:** os lançamentos, com as abas Todos, Entradas e Saídas. Só leitura.

## Rotas

| Rota                                             | Tela                                   |
| ------------------------------------------------ | -------------------------------------- |
| `/admin/tesouraria/congregacoes`                 | lista das tesourarias das congregações |
| `/admin/tesouraria/congregacoes/:id`             | redireciona para `.../conciliacao`     |
| `/admin/tesouraria/congregacoes/:id/conciliacao` | distribuir o extrato                   |
| `/admin/tesouraria/congregacoes/:id/dizimos`     | dízimos por membro e por mês           |
| `/admin/tesouraria/congregacoes/:id/lancamentos` | lançamentos do período                 |

Todas com `RequireRole` em `ADMIN_AREA_ROLES` (`src/pages/admin/financeiro/routes`).

## Os dados de exemplo

- **Três congregações:**
  - **Vila Nova:** 6 membros, paga aluguel.
  - **São José:** 4 membros, tem prédio próprio, sem aluguel.
  - **Jardim das Flores:** 3 membros, paga aluguel. Fecha o ano no vermelho, de propósito, para mostrar o resultado negativo.
- **Cada membro tem o valor do dízimo,** e os Pix dele saem com esse valor.
- **O extrato é gerado:**
  - todo mês: dízimos (dia 3 em diante), oferta em dinheiro (dia 8), aluguel (dia 10), luz (dia 15) e água (dia 18);
  - alguns gastos de um mês só, como manutenção ou ação social.
- **Os meses em que um membro não dizima seguem uma regra fixa,** não o acaso, para os números não mudarem a cada recarga.
- **De janeiro a setembro de 2026 tudo já está distribuído.** Outubro (até o dia 12) está todo **a distribuir**.
- **Um Pix de R$ 50 de um membro,** fora do valor do dízimo dele, mostra o caso "Membro desta congregação" sem categoria.

## Código

- **Telas:** `src/pages/admin/financeiro/congregacoes/` (`index.tsx` é a lista; `tesouraria.tsx` são as abas). As rotas ficam em `src/pages/admin/financeiro/routes`.
- **Dados de exemplo:** `src/features/admin/financeiro/tesouraria/dados.ts`, na seção "congregações", e a conta em "as contas de Eventos e de Congregações".
- **Componentes da congregação:** `modalNovaCongregacao.tsx`, `dizimosDaCongregacao.tsx` e `lancamentosDaCongregacao.tsx`, todos em `src/features/admin/financeiro/tesouraria/components/`.
- **Componentes compartilhados com a tesouraria de evento** (na mesma pasta):
  - `distribuicaoDaConta.tsx` (a Conciliação; o que muda entre evento e congregação são os textos e o `reconhecer`);
  - `lancamentosDaTesouraria.tsx` (o card de destaque é Dízimos aqui e Ingressos no evento);
  - `listaDeTesourarias.tsx`.
- **Componentes compartilhados com a administrativa:**
  - `listaDizimosPorMes.tsx`: ganhou `rotuloDoTotal`, que por padrão é "Total da igreja";
  - `abasDaTesouraria.tsx`.

## Para virar dado de verdade

O que o servidor precisa ter (proposta; nada disso existe ainda):

1. **Congregação:** uma tabela da congregação, por igreja, com nome e local. No começo ela é criada junto com a tesouraria; depois ganha cadastro próprio.
2. **Membros da congregação:** a ligação do membro à congregação. Sem ela não há aba Dízimos.
3. **Tesouraria:** a tesouraria da congregação, ligada à congregação. Pode ser a mesma tabela da tesouraria de evento, com o tipo (evento ou congregação) e o evento ou a congregação.
4. **Divisão dos bancos:** salvar na integração Pluggy de qual tesouraria (Administrativa, Eventos ou Congregações) é cada banco. Hoje a escolha é só prévia, não vai ao servidor.
5. **Movimentos:** os movimentos importados da conta das Congregações ganham a tesouraria para onde foram (nula enquanto estão a distribuir) e a categoria.
6. **Dízimos:** o dízimo é um movimento com categoria Dízimos e o membro, como o lançamento de dízimo da administrativa. O reconhecimento usa o valor do dízimo do membro, a mesma regra da importação.

## Em aberto

- **Uma conta para todas as congregações, ou uma por congregação?** O MVP parte de uma só (o select da Pluggy tem "Congregações", no plural). Se cada congregação tiver conta própria, tudo o que entra numa conta já é daquela congregação: a Conciliação deixa de distribuir e vira só dar a categoria.
- **Dízimo na congregação e na administrativa:** o membro de uma congregação também é membro da igreja. O dízimo que vai para a congregação não pode aparecer de novo nos Dízimos da administrativa. Falta a regra de quem é dizimista de onde.
- **Repasse para a sede:** a congregação que manda parte do que arrecada para a igreja. É uma saída na congregação e uma entrada na administrativa, entre contas diferentes. Falta decidir como registrar, para não contar como gasto nem como receita nova da igreja.
- **Movimento que não é de nenhuma congregação** (tarifa do banco) **ou que é de várias** (uma compra dividida): ainda não há opção para nenhum dos dois.
- **Quem vê:** hoje admin e financeiro da igreja veem todas as congregações. Um tesoureiro só da congregação seria um perfil novo.

As perguntas de Eventos e da Administrativa (ingressos contados duas vezes, movimento sem evento ou de dois eventos, o modelo da conciliação da Administrativa) estão em [financeiro.md](financeiro.md#em-aberto).
