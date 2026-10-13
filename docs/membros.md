# Membros (/admin/membros)

Os membros da igreja — o recorte, entre todos os usuários do sistema, de quem é dela — e as famílias. Os dizimistas da tesouraria **são** estes membros: todo membro é um dizimista em potencial.

Regras de servidor: `docs/membros.md` no `ic-backend`.

## Quem acessa e de qual igreja

- **Quem mexe:** o **admin da igreja**, além de dev e super admin.
- **Quem só consulta:** a **tesouraria** da igreja e o **tesoureiro(a)** e o **admin de um evento** dela — os três veem a mesma tela. Sem a aba e o card de Pedidos, sem "Adicionar membro", sem marcar linhas, sem a coluna de ações nem os menus (do membro e da família), e sem aviso de "Só consulta" (até 13/10/2026 havia um, e o admin de evento tinha o menu ⋮ para abrir o cadastro). O seletor de igreja traz também as igrejas dos eventos deles. A rota aceita `ADMIN_AREA_ROLES` e o tesoureiro (`aceitaTesoureiro="BASICO"`); a API devolve a lista sem os pedidos.
- No menu, "Membros" fica na seção **Módulos**, para todos esses perfis.
- Sempre **uma igreja** (`ChurchScopeBar` com `useIgrejaSelecionada(true, undefined, true)`): as que a pessoa administra, as em que é tesouraria e as dos eventos de que é tesoureira. Com várias e nenhuma escolhida, a tela pede a escolha.

## Como alguém vira membro

- **Pedido da inscrição:** quem escolhe a igreja ao se cadastrar aparece na aba **Pedidos** (abas do sistema, `NavTabs`; o número de pedidos vai no rótulo, "Pedidos (3)"), com Aceitar e Recusar. Aceito, vira membro; recusado, o pedido some.
- **Adicionar membro:** busca qualquer pessoa do sistema pelo **CPF completo** ou por **pelo menos dois nomes** (ex.: Maria Souza). Cada resultado mostra o CPF pela metade e a situação: "Membro de ICCV Filial" (desligado: lá precisam tirar antes), "Já é membro desta igreja", "Pediu para entrar nesta igreja", "Disse ser de: Batista Central" (o "Outra" da inscrição) ou "Sem igreja".
- **Planilha de dízimos** (em Tesouraria › Administrativa › Dízimos, só o admin): quem a planilha liga e ainda não é membro de nenhuma igreja vira membro desta. Ver `docs/tesouraria.md`.
- Uma pessoa é membro de **uma igreja só**.

## Aba Membros

- **Cards:** membros, famílias (com quantos membros estão em família), sem família e pedidos.
- **Filtros:** busca na lista (nome, CPF ou nome da família) e família (todos, em família, sem família).
- **Tabela, com as famílias juntas:** primeiro as famílias, uma depois da outra (pelo nome), com os membros de cada uma em linhas seguidas; depois quem não tem família. Cada família tem uma cor (pela ordem na tabela, então vizinhas nunca repetem): uma faixa dessa cor à esquerda liga as linhas dela, com o fundo levemente tingido, e o nome da família (clicável) aparece na primeira linha. Como a ordem é o que junta a família, as colunas não se reordenam por clique.
- **Colunas:** família, membro (foto, nome, CPF), contato, **perfil** (chip Admin ou Tesouraria nesta igreja; traço sem perfil), membro desde e o menu ⋮ (ver cadastro — abre a edição do usuário, já que a tela de Usuários é só do super admin; permissão na igreja; tirar da família; deixar de ser membro, com confirmação — perde também o valor do dízimo).
- **Juntar em família:** marcar membros na caixa de seleção abre a barra flutuante (`BarraDeSelecao`) com "Juntar em família". A janela (`modalFamilia.tsx`) cria uma **nova família** (o nome já vem sugerido pelo sobrenome do primeiro: "Família Mendes") ou junta a uma **família que já existe**. Quem estava em outra família sai dela; família que fica vazia some sozinha.
- **Família (clique no nome):** renomear ou desfazer (com confirmação; as pessoas continuam membros).
- **Permissão na igreja** (só o admin): no menu ⋮ do membro, ou para vários de uma vez na barra de seleção (ao lado de "Juntar em família"). Abre a mesma janela da edição em massa da tela de Usuários (`ModalPermissaoEmMassa`, com `igrejaFixa`: sem escolher igreja). No topo, quem está sendo editado (com uma pessoa só: foto, nome e o perfil de agora; com várias, as fotos) e as opções em cartões com ícone — **Admin**, **Tesouraria** ou **Sem perfil nesta igreja**; a opção que a pessoa já tem leva a etiqueta "Atual", e salvar sem mudar fica desligado. **Só o perfil na igreja:** admin e tesoureiro(a) de evento se definem no cadastro do evento. Grava e grava em `PUT /users/permissions`, com as travas de lá (a própria permissão não muda por aqui; super admin e dev não têm perfil de igreja). Quem o servidor recusar aparece listado, com o motivo.

## Código

- Tela: `src/pages/admin/membros`, rota em `src/pages/admin/membros/routes`.
- `src/features/admin/membros/familias.ts` (`emBlocos`, cores, classe e `sx` do fundo) e `components/faixaDaFamilia.tsx`: o agrupamento das famílias, usado aqui e na tabela de Dizimistas, para as duas desenharem a família do mesmo jeito.
- `src/features/admin/membros`: `api.ts` (hooks; mexer em membro recarrega também os dizimistas, e a tesouraria recarrega os membros), `types.ts` e `components/` (`listaDeMembros`, `listaDePedidos`, `modalAdicionarMembro`, `modalFamilia`).
