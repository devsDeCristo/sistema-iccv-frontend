# Membros (/admin/membros)

Os membros da igreja — o recorte, entre todos os usuários do sistema, de quem é dela — e as famílias. Os dizimistas do financeiro **são** estes membros: todo membro é um dizimista em potencial.

Regras de servidor: `docs/membros.md` no `ic-backend`.

## Quem acessa e de qual igreja

- Só o **admin da igreja** (`ADMIN_ROLES`, `RequireRole` na rota), além de dev e super admin. No menu, "Membros" fica na seção **Módulos**, só para esses perfis. O financeiro não vê a tela: ele vê os membros como dizimistas, na tela de Dizimistas.
- Sempre **uma igreja**, entre as que a pessoa administra (`ChurchScopeBar` com `useIgrejaSelecionada()`): com várias e nenhuma escolhida, a tela pede a escolha.

## Como alguém vira membro

- **Pedido da inscrição:** quem escolhe a igreja ao se cadastrar aparece na aba **Pedidos** (abas do sistema, `NavTabs`; o número de pedidos vai no rótulo, "Pedidos (3)"), com Aceitar e Recusar. Aceito, vira membro; recusado, o pedido some.
- **Adicionar membro:** busca qualquer pessoa do sistema pelo **CPF completo** ou por **pelo menos dois nomes** (ex.: Maria Souza). Cada resultado mostra o CPF pela metade e a situação: "Membro de ICCV Filial" (desligado: lá precisam tirar antes), "Já é membro desta igreja", "Pediu para entrar nesta igreja", "Disse ser de: Batista Central" (o "Outra" da inscrição) ou "Sem igreja".
- **Planilha de dízimos** (em Financeiro › Dizimistas, só o admin): quem a planilha liga e ainda não é membro de nenhuma igreja vira membro desta. Ver `docs/financeiro.md`.
- Uma pessoa é membro de **uma igreja só**.

## Aba Membros

- **Cards:** membros, famílias (com quantos membros estão em família), sem família e pedidos.
- **Filtros:** busca na lista (nome, CPF ou nome da família) e família (todos, em família, sem família).
- **Tabela, com as famílias juntas:** primeiro as famílias, uma depois da outra (pelo nome), com os membros de cada uma em linhas seguidas; depois quem não tem família. Cada família tem uma cor (pela ordem na tabela, então vizinhas nunca repetem): uma faixa dessa cor à esquerda liga as linhas dela, com o fundo levemente tingido, e o nome da família (clicável) aparece na primeira linha. Como a ordem é o que junta a família, as colunas não se reordenam por clique.
- **Colunas:** família, membro (foto, nome, CPF), contato, membro desde e o menu ⋮ (tirar da família; deixar de ser membro, com confirmação — perde também o valor do dízimo).
- **Juntar em família:** marcar membros na caixa de seleção abre a barra flutuante (`BarraDeSelecao`) com "Juntar em família". A janela (`modalFamilia.tsx`) cria uma **nova família** (o nome já vem sugerido pelo sobrenome do primeiro: "Família Mendes") ou junta a uma **família que já existe**. Quem estava em outra família sai dela; família que fica vazia some sozinha.
- **Família (clique no nome):** renomear ou desfazer (com confirmação; as pessoas continuam membros).

## Código

- Tela: `src/pages/admin/membros`, rota em `src/pages/admin/membros/routes`.
- `src/features/admin/membros/familias.ts` (`emBlocos`, cores, classe e `sx` do fundo) e `components/faixaDaFamilia.tsx`: o agrupamento das famílias, usado aqui e na tabela de Dizimistas, para as duas desenharem a família do mesmo jeito.
- `src/features/admin/membros`: `api.ts` (hooks; mexer em membro recarrega também os dizimistas, e o financeiro recarrega os membros), `types.ts` e `components/` (`listaDeMembros`, `listaDePedidos`, `modalAdicionarMembro`, `modalFamilia`).
