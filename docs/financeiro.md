# Financeiro (/admin/financeiro)

Módulo financeiro da igreja, no menu do painel como um grupo com duas telas: **Lançamentos** (o livro-caixa) e **Dizimistas**. "Financeiro" leva direto para Lançamentos.

Regras de servidor: `docs/financeiro.md` no `ic-backend`.

## Quem acessa e de qual igreja

- Admin e financeiro (`ADMIN_AREA_ROLES`, com `RequireRole` nas rotas), além de dev e super admin.
- O financeiro é **sempre de uma igreja**: o seletor no topo (`ChurchScopeBar` com `useIgrejaSelecionada(true)`, o mesmo de Integrações) não tem "Todas". Com uma igreja só, ela já vem escolhida; com várias e nenhuma escolhida, a tela pede a escolha. A escolha é a mesma dos outros módulos.

## Lançamentos (`/admin/financeiro/lancamentos`)

- **Cards:** entradas, saídas, saldo (vermelho se negativo) e dízimos — do **período inteiro**. Os filtros recortam só a tabela.
- **Filtros:** período (`SeletorDeIntervalo` só com datas; abre no mês corrente até hoje), tipo, categoria (as do tipo escolhido), origem (manual ou banco) e busca por descrição, pagador ou dizimista (vai ao servidor depois de uma pausa na digitação).
- **Botões:** "Importar do banco" (só com a Pluggy configurada e ligada na igreja) e "Novo lançamento". No celular, os dois ocupam a linha inteira, como os campos.
- **Tabela:** data, descrição (o importado mostra a conta e o pagador embaixo, com o ícone de banco), categoria (chip verde na entrada, vermelho na saída), dizimista, forma e valor (`+` verde / `−` vermelho — o sinal não depende só da cor). Na exportação, saída sai negativa. Editar em todos; apagar só no manual (no importado o botão fica desligado, com a explicação).
- **Novo / editar** (`modalLancamento.tsx`): entrada ou saída, valor (máscara de centavos: digita só números e o campo mostra `R$ 12,50`), data, categoria, forma, descrição e dizimista (só em entrada; a lista é a dos membros da igreja; no dízimo, a ajuda lembra que ligado ao dizimista ele conta no total do ano dele). No importado, tipo, valor, data e forma ficam travados, com um aviso dizendo de que conta e pagador veio.
- **Importar:** o toast diz quantos lançamentos entraram, ou que não havia nada novo. A importação pode rodar quantas vezes quiser sem duplicar.
- Mais de 5.000 lançamentos no período: aviso para encurtar o período.

## Dizimistas (`/admin/financeiro/dizimistas`)

- **Os dizimistas são os membros:** a tela lista todos os membros da igreja — todo membro é um dizimista em potencial. Não há cadastro de dizimista: quem entra e sai da lista é o admin, no módulo Membros. Sem nenhum membro, um aviso diz isso.
- **Cards:** membros (dizimistas em potencial), quantos dizimaram no mês (com o valor), total do ano (quantos dizimaram) e média por quem dizimou no ano.
- **Filtros:** busca por nome ou CPF (na lista já carregada), "Dízimo em {ano}" (todos, dizimaram, não dizimaram) e ano dos números (o atual e os quatro anteriores).
- **Tabela por mês** (`listaDizimosPorMes.tsx`), com as famílias juntas (o mesmo desenho da tela de Membros: famílias em sequência, faixa da cor, fundo leve e o nome com ícone na primeira linha; depois quem não tem família — por isso as colunas não se reordenam por clique). Cada membro numa linha: família, membro (foto, nome, CPF — `celulasDoDizimista.tsx`), contato (celular e e-mail), dízimo (o valor; a dica do cabeçalho explica), quanto dizimou em cada mês do ano (Jan a Dez, sem "R$" para as doze colunas caberem; traço no mês sem dízimo; vazio no mês que ainda não chegou), o total do ano e o lápis. A última linha, destacada, é o **total da igreja** em cada mês (de todos os membros, sem os filtros). É a única visão: a visão por ano (meses em pontos e último dízimo) saiu. Com 18 colunas a tabela passa da largura numa tela de 1366px e rola na horizontal; numa de 1600px cabe inteira.
- **Valor do dízimo** (o lápis da linha, `modalDizimista.tsx`): a única coisa que se edita aqui, com a mesma máscara de centavos do lançamento. Com valor, a ajuda do campo diz a regra: na importação do banco, um Pix dele com esse valor é dízimo, e com outro valor é oferta (ligada a ele). Apagar o campo tira o valor: todo Pix dele entra como dízimo.

## Código

- Telas: `src/pages/admin/financeiro/{lancamentos,dizimistas}`, rotas em `src/pages/admin/financeiro/routes`.
- `src/features/admin/financeiro`: `api.ts` (hooks; mexer em lançamento recarrega os dizimistas e vice-versa, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
