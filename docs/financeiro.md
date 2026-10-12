# Financeiro (/admin/financeiro)

Módulo financeiro da igreja, no menu do painel como um grupo com três telas: **Conciliação**, **Lançamentos** (o livro-caixa) e **Dizimistas**. "Financeiro" leva direto para Lançamentos.

Regras de servidor: `docs/financeiro.md` no `ic-backend`.

## Quem acessa e de qual igreja

- Admin e financeiro (`ADMIN_AREA_ROLES`, com `RequireRole` nas rotas), além de dev e super admin.
- O financeiro é **sempre de uma igreja**: o seletor no topo (`ChurchScopeBar` com `useIgrejaSelecionada(true)`, o mesmo de Integrações) não tem "Todas". Com uma igreja só, ela já vem escolhida; com várias e nenhuma escolhida, a tela pede a escolha. A escolha é a mesma dos outros módulos.

## Conciliação (`/admin/financeiro/conciliacao`)

O extrato do banco (Pluggy) contra os lançamentos manuais, no jeito de um diff do git (`diffDaConciliacao.tsx`).

- **Duas tabelas lado a lado:** extrato do banco à esquerda, manuais à direita, cada par na mesma linha (altura fixa, para alinhar) e as duas **rolando juntas** — rolar uma rola a outra. A rolagem é das tabelas, a página fica parada. Passar o mouse acende a linha dos dois lados.
- **Linhas:** sugerido (azul, ícone de elo, botão de conciliar na ponta da linha), só de um lado (laranja, com o lado que falta hachurado e uma caixinha) e conciliado (verde, botão de desfazer na linha). Sugeridos primeiro, conciliados por último.
- **Conciliar à mão:** marcar a caixinha de um do banco e de um manual; a barra de seleção (`BarraDeSelecao`) oferece "Conciliar o par". Marcado um lado, só o mesmo tipo (entrada/saída) pode ser marcado do outro.
- **Barra:** período (`SeletorDeIntervalo` só com datas, mês corrente até hoje), "Importar do banco" (com a Pluggy ligada; sem ela, um aviso) e "Conciliar sugestões (n)".
- **Cards:** conciliados, sugeridos, só no banco e só manual (com o saldo de cada um).
- **Celular:** não cabem duas tabelas: vira o diff unificado, o banco em cima do manual em cada par, com um vão entre os pares.
- Conciliar ou desfazer recarrega Lançamentos e Dizimistas: o manual conciliado sai dos totais (vale o do banco).

## Lançamentos (`/admin/financeiro/lancamentos`)

- **Cards:** entradas, saídas, saldo (vermelho se negativo) e dízimos — do **período inteiro**. Os filtros recortam só a tabela.
- **Filtros:** período (`SeletorDeIntervalo` só com datas; abre no mês corrente até hoje), tipo, categoria (as do tipo escolhido), origem (manual ou banco), conciliação (conciliados ou pendentes) e busca por descrição, pagador ou dizimista (vai ao servidor depois de uma pausa na digitação).
- **Botões:** "Importar do banco" (só com a Pluggy configurada e ligada na igreja) e "Novo lançamento", juntos à direita (quando a barra não cabe numa linha, os dois descem juntos). No celular, os dois ocupam a linha inteira, como os campos.
- **Tabela:** data, descrição (o importado mostra a conta e o pagador embaixo, com o ícone de banco), categoria (chip verde na entrada, vermelho na saída), dizimista, forma, conciliação (chip "Conciliado" verde ou "Pendente" laranja) e valor (`+` verde / `−` vermelho — o sinal não depende só da cor). Na exportação, saída sai negativa. Editar em todos; apagar só no manual (no importado o botão fica desligado, com a explicação).
- **Novo / editar** (`modalLancamento.tsx`): entrada ou saída, valor (máscara de centavos: digita só números e o campo mostra `R$ 12,50`), data, categoria, forma, descrição e dizimista (só em entrada; a lista é a dos membros da igreja; no dízimo, a ajuda lembra que ligado ao dizimista ele conta no total do ano dele). No importado, tipo, valor, data e forma ficam travados, com um aviso dizendo de que conta e pagador veio.
- **Importar:** o toast diz quantos lançamentos entraram, ou que não havia nada novo. A importação pode rodar quantas vezes quiser sem duplicar.
- Mais de 5.000 lançamentos no período: aviso para encurtar o período.

## Dizimistas (`/admin/financeiro/dizimistas`)

- **Os dizimistas são os membros:** a tela lista todos os membros da igreja — todo membro é um dizimista em potencial. Não há cadastro de dizimista: quem entra e sai da lista é o admin, no módulo Membros. Sem nenhum membro, um aviso diz isso.
- **Cards:** membros (dizimistas em potencial), quantos dizimaram no mês (com o valor), total do ano (quantos dizimaram) e média por quem dizimou no ano.
- **Filtros:** busca por nome ou CPF (na lista já carregada), "Dízimo em {ano}" (todos, dizimaram, não dizimaram) e ano dos números (o atual e os quatro anteriores).
- **Tabela por mês** (`listaDizimosPorMes.tsx`), com as famílias juntas (o mesmo desenho da tela de Membros: famílias em sequência, faixa da cor, fundo leve e, na primeira linha, só o ícone — o nome da família fica na dica do ícone, para a coluna ser estreita (56px, com o ícone no cabeçalho); depois quem não tem família — por isso as colunas não se reordenam por clique). Cada membro numa linha: família, membro (foto, nome, CPF — `celulasDoDizimista.tsx`), dízimo (o valor, que é também o botão de editar: clicar nele, ou no lápis ao lado, abre o valor do dízimo; a dica do cabeçalho explica), quanto dizimou em cada mês do ano (Jan a Dez, com "R$"; traço no mês sem dízimo; vazio no mês que ainda não chegou) e o total do ano. A última linha, destacada, é o **total da igreja** em cada mês (de todos os membros, sem os filtros). É a única visão: a visão por ano (meses em pontos e último dízimo) saiu. Com 16 colunas (cada mês com 108px, para caber "R$ 12.345,67") a tabela passa da largura das telas comuns e rola na horizontal.
- **Importar planilha** (botão na barra, só para o admin desta igreja, ou dev e super admin — `modalPlanilhaDeDizimos.tsx`, leitura em `planilha.ts` com o `xlsx` que o projeto já tem): a primeira aba precisa de um cabeçalho com "Nome" e os meses (Jan a Dez); valores como "R$ 1.600,20" ou número. Ficam de fora as linhas sem nome ("-"), a de total e as sem valor no ano; a linha "Anônimo" (o nome pode estar na coluna do número) já vem como sem vínculo. Escolhe-se o ano (abre no da tela). A prévia mostra cada linha com o total do ano e um select de quem é: os candidatos (nome, CPF pela metade e "vira membro" / "já é membro" / "membro de X", este desligado), "Sem vínculo (não é usuário)" — o dízimo entra sem dizimista, com o nome da planilha na descrição e no pagador — e "Não importar". Padrão de cada linha: a pessoa escolhida pelo sistema; **sem vínculo** quando não há nenhum candidato (chip **Não encontrado**); "Não importar" quando há homônimos sem desempate (chip **Escolha**: a pessoa decide). Escolhida sem o nome igual: chip **Confira**. Essas linhas vêm primeiro. O botão diz quantas linhas entram e o texto, quanto somam. Depois, um toast com os dízimos lançados, os novos membros e os que já existiam; os que ficaram de fora (membro de outra igreja) num aviso que não some sozinho. Celular: tela cheia, um campo por linha.
- **Valor do dízimo** (clicar no valor da coluna Dízimo, `modalDizimista.tsx`): a única coisa que se edita aqui, com a mesma máscara de centavos do lançamento. Com valor, a ajuda do campo diz a regra: na importação do banco, um Pix dele com esse valor é dízimo, e com outro valor é oferta (ligada a ele). Apagar o campo tira o valor: todo Pix dele entra como dízimo.

## Código

- Telas: `src/pages/admin/financeiro/{conciliacao,lancamentos,dizimistas}`, rotas em `src/pages/admin/financeiro/routes`.
- `src/features/admin/financeiro`: `api.ts` (hooks; mexer em lançamento ou conciliação recarrega lançamentos, dizimistas e conciliação, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
