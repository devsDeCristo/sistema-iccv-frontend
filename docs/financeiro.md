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
- **Novo / editar** (`modalLancamento.tsx`): entrada ou saída, valor (máscara de centavos: digita só números e o campo mostra `R$ 12,50`), data, categoria, forma, descrição e dizimista (só em entrada; a lista é a dos dizimistas da igreja; no dízimo, a ajuda lembra que ligado ao dizimista ele conta no total do ano dele). No importado, tipo, valor, data e forma ficam travados, com um aviso dizendo de que conta e pagador veio.
- **Importar:** o toast diz quantos lançamentos entraram, ou que não havia nada novo. A importação pode rodar quantas vezes quiser sem duplicar.
- Mais de 5.000 lançamentos no período: aviso para encurtar o período.

## Dizimistas (`/admin/financeiro/dizimistas`)

- **Cards:** dizimistas ativos, quantos dizimaram no mês (com o valor), total do ano e média por dizimista ativo.
- **Filtros:** busca por nome ou CPF (na lista já carregada), situação (ativos, inativos, todos; abre em ativos) e ano dos números (o atual e os quatro anteriores).
- **Tabela:** dizimista (foto, nome, CPF), contato, dízimo (o valor combinado; a dica do cabeçalho explica), desde, meses do ano (doze pontos: verde com dízimo, cinza sem, mais apagado o mês que ainda não chegou, e a contagem "8/10"), último dízimo, total no ano e situação. Editar e tirar da lista.
- **Adicionar** (`modalDizimista.tsx`): o dizimista é sempre um usuário do sistema. Busca pelo nome (3+ letras) ou CPF completo, com foto e CPF pela metade; quem já é dizimista aparece desligado ("já é dizimista"). Opcionais: **valor do dízimo** (mesma máscara de centavos do lançamento), dizimista desde e observação. Com valor, a ajuda do campo diz a regra: na importação do banco, um Pix dele com esse valor é dízimo, e com outro valor é oferta (ligada a ele). Sem valor, todo Pix dele entra como dízimo.
- **Editar:** valor do dízimo (apagar o campo tira o valor), desde, observação e ativo. Desativado, sai da contagem de ativos e o Pix dele deixa de virar dízimo na importação; o histórico fica.
- **Tirar da lista:** com confirmação; os dízimos lançados continuam no livro-caixa (a confirmação sugere desativar para só parar de contar).

## Código

- Telas: `src/pages/admin/financeiro/{lancamentos,dizimistas}`, rotas em `src/pages/admin/financeiro/routes`.
- `src/features/admin/financeiro`: `api.ts` (hooks; mexer em lançamento recarrega os dizimistas e vice-versa, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
