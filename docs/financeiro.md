# Tesouraria (/admin/tesouraria)

Módulo financeiro da igreja, no menu do painel como o grupo **Tesouraria**, com três filhos:

- **Administrativa** (`/admin/tesouraria/administrativa`): a administração financeira da própria igreja, numa tela com três abas — **Conciliação**, **Dízimos** e **Lançamentos**. Cada aba é uma rota (`.../conciliacao`, `.../dizimos`, `.../lancamentos`), e o cabeçalho é o mesmo nas três ("Tesouraria administrativa"). O grupo e a administrativa abrem na primeira aba.
- **Eventos** (`/admin/tesouraria/eventos`): uma tesouraria por evento — **MVP com dados de exemplo**, ver abaixo.
- **Congregações** (`/admin/tesouraria/congregacoes`): uma tesouraria por congregação, com as mesmas abas da administrativa — **MVP com dados de exemplo**, todo o fluxo em [tesouraria-congregacoes.md](tesouraria-congregacoes.md).

As abas são `AbasDaTesouraria` (`components/abasDaTesouraria.tsx`), as mesmas na administrativa, no evento e na congregação.

Regras de servidor: `docs/financeiro.md` no `ic-backend`.

## Quem acessa e de qual igreja

- Admin e financeiro (`ADMIN_AREA_ROLES`, com `RequireRole` nas rotas), além de dev e super admin.
- O financeiro é **sempre de uma igreja**: o seletor no topo (`ChurchScopeBar` com `useIgrejaSelecionada(true)`, o mesmo de Integrações) não tem "Todas". Com uma igreja só, ela já vem escolhida; com várias e nenhuma escolhida, a tela pede a escolha. A escolha é a mesma dos outros módulos.

## Administrativa › Conciliação (`/admin/tesouraria/administrativa/conciliacao`)

O extrato do banco (Pluggy) contra os lançamentos manuais, no jeito de um diff do git (`diffDaConciliacao.tsx`).

- **Duas tabelas lado a lado:** extrato do banco à esquerda, manuais à direita, cada par na mesma linha (altura fixa, para alinhar) e as duas **rolando juntas** — rolar uma rola a outra. A rolagem é das tabelas, a página fica parada. Passar o mouse acende a linha dos dois lados.
- **Linhas:** sugerido (azul, ícone de elo, botão de conciliar na ponta da linha), só de um lado (laranja, com o lado que falta hachurado e uma caixinha) e conciliado (verde, botão de desfazer na linha). Sugeridos primeiro, conciliados por último.
- **Conciliar à mão:** marcar a caixinha de um do banco e de um manual; a barra de seleção (`BarraDeSelecao`) oferece "Conciliar o par". Marcado um lado, só o mesmo tipo (entrada/saída) pode ser marcado do outro.
- **Barra:** período (`SeletorDeIntervalo` só com datas, mês corrente até hoje), "Importar do banco" (com a Pluggy ligada; sem ela, um aviso) e "Conciliar sugestões (n)".
- **Cards:** conciliados, sugeridos, só no banco e só manual (com o saldo de cada um).
- **Celular:** não cabem duas tabelas: vira o diff unificado, o banco em cima do manual em cada par, com um vão entre os pares.
- Conciliar ou desfazer recarrega Lançamentos e Dizimistas: o manual conciliado sai dos totais (vale o do banco).

## Administrativa › Lançamentos (`/admin/tesouraria/administrativa/lancamentos`)

- **Cards:** entradas, saídas, saldo (vermelho se negativo) e dízimos — do **período inteiro**. Os filtros recortam só a tabela.
- **Filtros:** período (`SeletorDeIntervalo` só com datas; abre no mês corrente até hoje), tipo, categoria (as do tipo escolhido), origem (manual ou banco), conciliação (conciliados ou pendentes) e busca por descrição, pagador ou dizimista (vai ao servidor depois de uma pausa na digitação).
- **Botões:** "Importar do banco" (só com a Pluggy configurada e ligada na igreja) e "Novo lançamento", juntos à direita (quando a barra não cabe numa linha, os dois descem juntos). No celular, os dois ocupam a linha inteira, como os campos.
- **Tabela:** data, descrição (o importado mostra a conta e o pagador embaixo, com o ícone de banco), categoria (chip verde na entrada, vermelho na saída), dizimista, forma, conciliação (chip "Conciliado" verde ou "Pendente" laranja) e valor (`+` verde / `−` vermelho — o sinal não depende só da cor). Na exportação, saída sai negativa. Editar em todos; apagar só no manual (no importado o botão fica desligado, com a explicação).
- **Novo / editar** (`modalLancamento.tsx`): entrada ou saída, valor (máscara de centavos: digita só números e o campo mostra `R$ 12,50`), data, categoria, forma, descrição e dizimista (só em entrada; a lista é a dos membros da igreja; no dízimo, a ajuda lembra que ligado ao dizimista ele conta no total do ano dele). No importado, tipo, valor, data e forma ficam travados, com um aviso dizendo de que conta e pagador veio.
- **Importar:** o toast diz quantos lançamentos entraram, ou que não havia nada novo. A importação pode rodar quantas vezes quiser sem duplicar.
- Mais de 5.000 lançamentos no período: aviso para encurtar o período.

## Administrativa › Dízimos (`/admin/tesouraria/administrativa/dizimos`)

- **Os dizimistas são os membros:** a tela lista todos os membros da igreja — todo membro é um dizimista em potencial. Não há cadastro de dizimista: quem entra e sai da lista é o admin, no módulo Membros. Sem nenhum membro, um aviso diz isso.
- **Cards:** membros (dizimistas em potencial), quantos dizimaram no mês (com o valor), total do ano (quantos dizimaram) e média por quem dizimou no ano.
- **Filtros:** busca por nome ou CPF (na lista já carregada), "Dízimo em {ano}" (todos, dizimaram, não dizimaram) e ano dos números (o atual e os quatro anteriores).
- **Tabela por mês** (`listaDizimosPorMes.tsx`), com as famílias juntas (o mesmo desenho da tela de Membros: famílias em sequência, faixa da cor, fundo leve e, na primeira linha, só o ícone — o nome da família fica na dica do ícone, para a coluna ser estreita (56px, com o ícone no cabeçalho); depois quem não tem família — por isso as colunas não se reordenam por clique). Cada membro numa linha: família, membro (foto, nome, CPF — `celulasDoDizimista.tsx`), dízimo (o valor, que é também o botão de editar: clicar nele, ou no lápis ao lado, abre o valor do dízimo; a dica do cabeçalho explica), quanto dizimou em cada mês do ano (Jan a Dez, com "R$"; traço no mês sem dízimo; vazio no mês que ainda não chegou) e o total do ano. A última linha, destacada, é o **total da igreja** em cada mês (de todos os membros, sem os filtros). É a única visão: a visão por ano (meses em pontos e último dízimo) saiu. Com 16 colunas (cada mês com 108px, para caber "R$ 12.345,67") a tabela passa da largura das telas comuns e rola na horizontal.
- **Importar planilha** (botão na barra, só para o admin desta igreja, ou dev e super admin — `modalPlanilhaDeDizimos.tsx`, leitura em `planilha.ts` com o `xlsx` que o projeto já tem): a primeira aba precisa de um cabeçalho com "Nome" e os meses (Jan a Dez); valores como "R$ 1.600,20" ou número. Ficam de fora as linhas sem nome ("-"), a de total e as sem valor no ano; a linha "Anônimo" (o nome pode estar na coluna do número) já vem como sem vínculo. Escolhe-se o ano (abre no da tela). A prévia mostra cada linha com o total do ano e um select de quem é: os candidatos (nome, CPF pela metade e "vira membro" / "já é membro" / "membro de X", este desligado), "Sem vínculo (não é usuário)" — o dízimo entra sem dizimista, com o nome da planilha na descrição e no pagador — e "Não importar". Padrão de cada linha: a pessoa escolhida pelo sistema; **sem vínculo** quando não há nenhum candidato (chip **Não encontrado**); "Não importar" quando há homônimos sem desempate (chip **Escolha**: a pessoa decide). Escolhida sem o nome igual: chip **Confira**. Essas linhas vêm primeiro. O botão diz quantas linhas entram e o texto, quanto somam. Depois, um toast com os dízimos lançados, os novos membros e os que já existiam; os que ficaram de fora (membro de outra igreja) num aviso que não some sozinho. Celular: tela cheia, um campo por linha.
- **Valor do dízimo** (clicar no valor da coluna Dízimo, `modalDizimista.tsx`): a única coisa que se edita aqui, com a mesma máscara de centavos do lançamento. Com valor, a ajuda do campo diz a regra: na importação do banco, um Pix dele com esse valor é dízimo, e com outro valor é oferta (ligada a ele). Apagar o campo tira o valor: todo Pix dele entra como dízimo.

## Eventos (`/admin/tesouraria/eventos`) — MVP

**Dados de exemplo:** nada vem da API ainda (`features/admin/financeiro/tesouraria/dados.ts`), e um aviso no topo diz isso. O que se cria ou distribui fica em memória e some ao recarregar a página. A igreja do seletor não muda os números.

**O modelo é o de uma conta por tesouraria** (Configurações › Integrações, "Bancos divididos por tesouraria"). A tesouraria de Eventos tem a sua conta, e ela é uma só para todos os eventos. O extrato chega pelo Pluggy e fica salvo; cada movimento é distribuído para a tesouraria do evento a que pertence. Ninguém lança à mão para depois conciliar: o que veio do banco já é o lançamento. Os ingressos são a exceção — vêm das inscrições pagas no sistema, não do extrato.

- **Só existe tesouraria de evento que foi criada aqui.** Evento cadastrado não ganha uma sozinho.
- **Lista** (`listaDeTesourarias.tsx`, a mesma das congregações): um card por tesouraria, no acabamento dos cards das Igrejas e dos `StatusCards` — aro e tinta suave na cor da situação (verde aberta, neutra encerrada), ícone num quadrado da mesma cor (calendário para evento do sistema, confete para o de fora) e o card sobe um pouco no hover. No card: o chip da situação, o nome, o período, "Evento do sistema" ou "Fora do sistema" (ícone de elo ligado ou cortado), e entradas, saídas e resultado em linhas (resultado negativo em vermelho, com o sinal). "Abrir tesouraria" fica no rodapé, como "Abrir painel" na igreja. A barra do topo diz quantos movimentos da conta de Eventos ainda estão a distribuir, e quanto somam.
- **Nova tesouraria** (`modalNovaTesouraria.tsx`): ou **evento do sistema** (escolhido na lista; um evento tem uma tesouraria só, e o que já tem aparece desligado), ou **evento fora do sistema** — nome e data opcional, para um jantar de confraternização, uma rifa.
- **A tesouraria de um evento** (`/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`, abas com endereço; sem aba, abre na Conciliação):
  - **Conciliação** (`distribuicaoDaConta.tsx`, o mesmo da congregação) é **distribuir o extrato**. À esquerda, **A distribuir**: os movimentos da conta que não estão em nenhum evento — os mesmos em todas as tesourarias de evento. Marca-se o que é deste evento (a caixinha ou o clique na linha) e **Trazer para este evento**, na barra que aparece no pé. À direita, **Neste evento**: o que já foi trazido, cada um com a sua categoria (entra "Sem categoria", e escolhe-se na própria linha) e o **devolver**, que manda de volta para a distribuir. Cards: neste evento (com o saldo), a distribuir (com o saldo da conta) e sem categoria.
  - **Lançamentos** (`lancamentosDaTesouraria.tsx`, o mesmo da congregação): os ingressos pagos no sistema e os movimentos distribuídos para o evento. Cards (entradas, saídas, resultado, ingressos), entradas e saídas por categoria (valor, porcentagem e barra; cores `COR_ENTRADA`/`COR_SAIDA`, validadas para daltonismo — as do tema não passavam) e a tabela, com abas Todos, Entradas e Saídas. Só leitura.
- **Para virar dado de verdade:** os movimentos da conta de Eventos salvos no servidor (a importação do Pluggy, como a da administrativa), com a tesouraria de evento (nula enquanto está a distribuir) e a categoria; e a tabela das tesourarias de evento.

## Em aberto

Perguntas que ainda esperam resposta. As das congregações estão em [tesouraria-congregacoes.md](tesouraria-congregacoes.md#em-aberto).

- **Ingressos contados duas vezes:**
  - Hoje os ingressos do evento vêm das inscrições pagas no sistema.
  - Se o repasse do PagBank cair na conta de Eventos e alguém distribuir esse repasse para o evento, o mesmo dinheiro conta duas vezes.
  - Os ingressos devem vir só da conta, ou o repasse deve ser marcado para não ser distribuído?
- **Movimento que não é de nenhum evento, ou que é de dois:**
  - Uma tarifa do banco não é de evento nenhum.
  - Um gasto que serve a dois eventos teria o valor dividido entre eles.
  - Ainda não há opção para nenhum dos dois casos.
- **A conciliação da Administrativa:**
  - Ela é a real, feita pelo outro dev, e continua formando par entre lançamento manual e banco.
  - Se o modelo "o banco é a fonte" (distribuir o extrato, sem lançamento manual para parear) também vale para ela, a mudança é no código real e no backend.

## Código

- Telas: `src/pages/admin/financeiro/{conciliacao,lancamentos,dizimistas,eventos,congregacoes}` (o nome das pastas ficou "financeiro"; as rotas são `/admin/tesouraria/...`), rotas em `src/pages/admin/financeiro/routes`.
- Tesourarias de eventos e de congregações (MVP): `src/features/admin/financeiro/tesouraria` (`dados.ts` e `components/`).
- `src/features/admin/financeiro`: `api.ts` (hooks; mexer em lançamento ou conciliação recarrega lançamentos, dizimistas e conciliação, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
