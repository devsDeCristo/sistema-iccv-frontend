# Igrejas (`/admin/igrejas`)

A igreja é o tenant do sistema: cada uma tem painel próprio, e os eventos, os
inscritos e as notícias de uma não aparecem para o admin da outra. Este módulo
é a lista de igrejas do super admin — criar, renomear, definir a situação e o
líder espiritual, e (quando possível) remover.

## Quem pode acessar

A rota `/admin/igrejas` (lista) e `/admin/igrejas/:churchId` (home de uma
igreja específica) exigem `SUPER_ADMIN_ROLES` (`Role.DEV` ou
`Role.SUPER_ADMIN`), via `RequireRole`. Mexer nessa lista mexe no recorte de
todos os painéis, por isso nem o `Role.ADMIN` de uma igreja entra aqui — ele
não vê "Igrejas" no menu e, se forçar a URL, é redirecionado para
`/admin/inicio`.

O `RequireRole` do front é só usabilidade (esconder o item de menu e evitar a
tela piscando antes do 403); quem garante a restrição de fato é o backend em
`/churches`.

Arquivos: `src/pages/admin/churches/routes/index.tsx`, `src/components/requireRole/index.tsx`, `src/constants/roles.ts`.

## Lista de igrejas

Tabela (`DataGrid`) com busca por nome (contém, sem acento/caixa não
verificados no front — é `includes` simples em minúsculas) e estas colunas:

| Coluna | Conteúdo |
| --- | --- |
| Igreja | nome |
| Situação | chip com a situação (ver abaixo) |
| Eventos | `_count.events` da igreja |
| Administradores | `_count.users` — conta só quem entra no painel dela (admin e financeiro); inscrito não pertence a igreja nenhuma |

Ações por linha:

- **Abrir a home desta igreja:** leva para `/admin/igrejas/:churchId`, que
  renderiza a mesma `Home` que o admin daquela igreja vê ao entrar — não é uma
  tela separada, é a home real "de fora".
- **Editar:** abre o formulário preenchido.
- **Remover:** só habilitado quando a igreja não tem evento nem administrador
  vinculado (`_count.events === 0 && _count.users === 0`); com vínculo, o
  botão fica desabilitado com tooltip explicando o motivo ("Tem evento
  vinculado: removê-la apagaria os eventos junto" / "Tem administrador
  vinculado: mude o perfil deles antes"). Confirmação via modal
  (SweetAlert2) antes de excluir. O backend também recusa a remoção nesse
  caso e devolve o motivo na mensagem, que sobe como toast — a checagem do
  front é só para não deixar clicar à toa.

Arquivo: `src/features/admin/churches/index.tsx`.

## Cadastro de igreja

Formulário em modal (`Dialog`), mesmo componente para criar e editar.

| Campo | Regra |
| --- | --- |
| **Nome** | obrigatório, mínimo 3 caracteres (validado no front antes de enviar) |
| **Situação** | `ACTIVE`, `TEST` ou `INACTIVE` (ver tabela abaixo); igreja nova nasce sempre `ACTIVE` |
| **Líder espiritual** | opcional; busca por nome entre todos os usuários (`useGetUsers`, carregado só com o formulário aberto); pode ficar vazio (`null` desfaz o vínculo) |

- Enviar com Enter no campo nome também dispara o salvamento.
- Ao editar, o texto de ajuda do modal lembra que "o nome aparece na escolha
  da igreja ao criar evento e ao dar permissão"; ao criar, lembra que "ela
  nasce vazia: depois é só criar o admin e os eventos dela".
- Vincular alguém como líder espiritual **também o torna admin da igreja**
  (texto de ajuda do campo: "Assina o e-mail dos eventos desta igreja e vira
  admin dela"). O front não expõe aqui outros vínculos de admin — só o do
  líder; vincular outras pessoas como admin/financeiro de uma igreja é feito
  na tela de Usuários.

Arquivos: `src/features/admin/churches/index.tsx`, `src/features/admin/churches/api/saveChurch.ts`, `src/features/admin/churches/api/getChurches.ts`.

## Situação da igreja

| Situação | Selo | O que muda no sistema |
| --- | --- | --- |
| `ACTIVE` (Ativa) | verde (`chips.success`) | No ar: aparece no filtro de igrejas da home |
| `TEST` (Em teste) | laranja (`chips.alert`) | Em implantação: o painel funciona, mas ela não aparece no filtro da home |
| `INACTIVE` (Inativa) | cinza (`chips.canceled`) | Fora do ar: some do filtro da home; os dados continuam guardados (nada é apagado). Admin e financeiro dela viram usuários comuns: perdem a área de admin, ou ficam só com as outras igrejas ativas que administram. Reativar devolve o acesso |

O vocabulário e as cores acompanham de propósito o status do evento (Ativo /
Inativo / Teste), para não obrigar a aprender duas escalas diferentes.

Arquivo: `src/features/admin/churches/constants.ts`.

## Vínculo de administradores

- A igreja em si não guarda uma lista de admins editável nesta tela — só o
  líder espiritual, que vira admin automaticamente ao ser vinculado.
- O vínculo de outras pessoas como admin ou financeiro de uma igreja (o
  `role` por igreja) é gerenciado na tela de Usuários
  (`src/features/admin/users/components/modalEditRole.tsx`), que lista os
  vínculos `{ churchId, churchName, role }` de cada pessoa.
- Quem tem vínculo de admin numa igreja passa pelo `RequireEventRole` em
  qualquer evento dela (não pela lista de igrejas): a permissão efetiva é a
  mais alta entre os vínculos da pessoa, e a igreja do evento entra na conta
  para decidir se a rota abre.

Não confirmei no código desta pasta se há limite de quantas pessoas podem ser
líder espiritual/admin de uma mesma igreja, nem regra de que uma pessoa não
possa ser admin de mais de uma igreja — isso está fora de
`src/features/admin/churches` e `src/pages/admin/churches`.

Arquivos: `src/features/admin/churches/index.tsx`, `src/features/admin/users/components/modalEditRole.tsx`, `src/components/requireRole/index.tsx`.
