# Layout e navegação

Estrutura comum a todas as telas logadas: barra do topo, régua lateral, área
de conteúdo com rolagem própria, e como o front decide o que cada papel
enxerga no menu e nas rotas. A garantia de verdade é sempre do servidor
(`RolesGuard`/`ChurchTenantGuard` na API) — o que está aqui é usabilidade.

## As três áreas (`AreaSideBar`)

| Área | Quem entra | Layout | Régua |
| --- | --- | --- | --- |
| `usuario` | qualquer pessoa logada | `<Layout isAdmin={false} />`, protegido por `authLoader` | Página Inicial, Minhas Inscrições, Eventos |
| `admin` | perfis do painel (`ADMIN_AREA_ROLES`: dev, super admin, admin, financeiro) | `<Layout isAdmin={true} />`, protegido por `authLoaderAdmin` | Início, Usuários, Igrejas, Eventos, Notícias, Registro de Atividades/Login, conforme o papel |
| `configuracoes` | quem administra alguma igreja (admin/super admin/dev) | `<Layout isAdmin area="configuracoes" />`, também com `authLoaderAdmin` | Pagamentos, Disparadores, Termos de Uso, conforme o papel |

`/perfil` fica fora das três réguas específicas: entra pela área `usuario` (mesma rota para admin e usuário comum, acessada pelo menu da conta).

Arquivos: `src/routes/index.tsx`, `src/pages/layout/index.tsx`, `src/components/sideBar/index.tsx`.

## Layout (`src/pages/layout/index.tsx`)

- Empilha, nessa ordem: `TermsGate` (aceite de termos, ver `docs/termos-de-uso.md`), barra do topo (`MenuAppBar`), e a linha régua lateral + conteúdo (`Outlet`).
- A área de conteúdo tem altura fixa (`100dvh` menos a altura da barra do topo) e rola por conta própria — é ela, e não a página inteira, que tem barra de rolagem.
- O usuário devolvido pelo `authLoader`/`authLoaderAdmin` alimenta o `UserProvider` (contexto usado pela barra do topo e pela régua).

## Barra do topo (`src/components/appBar`)

- **Marca** (logo + "ICCV Eventos"): clicável, leva para `/admin/inicio` (em rota de admin) ou `/home`.
- **Botão de menu** (☰): só aparece em telas menores que `lg`, abre a gaveta da régua lateral.
- **Alternância de tema** claro/escuro.
- **Menu da conta** (avatar): nome, e-mail, e:
  - **Meu perfil** → `/perfil`.
  - **Área do Administrador** → `/admin/inicio`, só quando `canAccessAdminArea` é verdadeiro e a pessoa está fora de rota `/admin`.
  - **Área do Usuário** → `/home`, só quando `canAccessAdminArea` é verdadeiro e a pessoa está dentro de rota `/admin` (permite alternar entre as duas áreas sem duas contas).
  - **Configurações** → `/configuracoes` (que redireciona para a primeira tela liberada), só para `isAdminRole` (admin, super admin ou dev).
  - **Sair**.

Arquivo: `src/components/appBar/index.tsx`.

## Campos de formulário (tema)

Todo campo com contorno (TextField, Select, Autocomplete, datas) tem o mesmo
visual, definido uma vez no tema (`MuiOutlinedInput` em `src/themes/index.tsx`):

- **Fundo:** `background.input`. O campo se destaca do Paper pelo tom, não por sombra.
- **Borda:** `divider` parado, `border` no hover, e a cor primária no foco, sem engrossar (engrossar empurra o texto um pixel e o campo "pula").
- **Raio:** 8px.
- **Erro e desabilitado:** ficam com o padrão do MUI.

O **editor de texto rico** (`ReactQuillEditor`, Quill) não é um
`OutlinedInput`, então segue o mesmo visual com CSS próprio
(`src/components/reactQuillEditor/index.tsx`):

- fundo, borda, hover, foco e raio iguais aos dos campos;
- ícones da barra em `text.secondary`, e o botão ativo na cor primária;
- prop `error` para a borda vermelha de validação.

Antes ele usava o visual "snow" do Quill, com borda clara e ícones pretos que
sumiam no tema escuro.

Não repita esse estilo no `sx` de cada tela: campo novo já nasce assim. Até
06/10/2026 ele vivia em `campoBuscaSx` (`listPageStyles.ts`) e só valia nas
buscas das listas do admin. O resto do sistema ficava com o contorno padrão do
MUI.

## Régua lateral (`src/components/sideBar`)

- Um só conteúdo de menu (`ConteudoNav`) para os dois formatos: fixa ao lado do conteúdo em telas `lg+`, dentro de uma gaveta (`Drawer`) nas menores.
- O item ativo é o que corresponde exatamente à rota atual (ou prefixo dela); itens com sub-itens ("filhos", hoje só "Disparadores › WhatsApp") só acendem no encaixe exato, não pelo prefixo, para não acender duas linhas ao mesmo tempo.
- "Sair" fica sempre no rodapé da régua, separado do menu do dia a dia.

### Itens por perfil

**Painel (`admin`)**

| Item | Papéis que veem |
| --- | --- |
| Início | todos os quatro perfis do painel |
| Usuários | `isAdminRole` (dev, super admin, admin) — financeiro não gerencia usuários |
| Igrejas | `isSuperAdmin` (dev, super admin) |
| Eventos | todos os quatro perfis do painel |
| Notícias | `isAdminRole` — financeiro não publica |
| Registro de Atividades / Registro de Login | `isDev` apenas |

**Configurações (`configuracoes`)**

| Item | Papéis que veem |
| --- | --- |
| Pagamentos | `isAdminRole` |
| Disparadores › WhatsApp | `isAdminRole` |
| Termos de Uso | `isSuperAdmin` — valem para a plataforma inteira, não por igreja |
| Voltar ao painel | todos |

**Usuário (`usuario`)**

Página Inicial, Minhas Inscrições, Eventos — sem distinção de papel (é a área de quem não é da organização).

Arquivo: `src/components/sideBar/index.tsx`.

## Papéis e permissões no front

- **Perfis (`Role`, `src/constants/roles.ts`):** `DEV` (-1), `SUPER_ADMIN` (1), `ADMIN` (2), `FINANCE` (3), `USER` (5). Os valores espelham `User.role` no backend.
- **Grupos:**
  - `SUPER_ADMIN_ROLES` = dev + super admin.
  - `ADMIN_ROLES` = `SUPER_ADMIN_ROLES` + admin (acesso total ao painel).
  - `ADMIN_AREA_ROLES` = `ADMIN_ROLES` + financeiro (quem entra no painel, com abas restritas).
  - `FINANCE_EVENT_TABS` = abas de detalhes do evento liberadas ao financeiro (`usuarios`, `pagamentos`).
- **`useRole()`:** lê o usuário guardado na sessão e devolve `role` (perfil efetivo — o mais alto entre os vínculos por igreja), `isAdmin`, `isSuperAdmin`, `isDev`, `isFinance`, `canAccessAdminArea`, `churchRoles` (perfil por igreja), `igrejasQueAdministra` e `perfilNaIgreja(churchId)`.
- **`RequireRole`:** componente de rota que esconde a tela de quem não tem o perfil exigido, redirecionando (padrão: `/admin/inicio`). É só usabilidade — quem garante é o `RolesGuard` da API.
- **`RequireEventRole`:** para telas que dependem da igreja do evento (editar, check-in, quadrante) — usa o papel da pessoa **naquela igreja específica**, e não o perfil efetivo geral, porque admin de uma igreja não deve mexer no evento de outra.

Arquivos: `src/constants/roles.ts`, `src/hooks/useRole.tsx`, `src/components/requireRole/index.tsx`.

### Seletor de igreja (multitenant)

Toda tela de uma feature que é por igreja tem um seletor de igreja. Nunca se
deduz "a primeira igreja" para super admin ou dev.

- **Hook `useIgrejasDoSeletor`** (`src/hooks/useIgrejasDoSeletor.ts`):
  - super admin e dev: todas as igrejas (`useGetChurches`);
  - admin: as suas (`igrejasQueAdministra`);
  - `mostraSeletor` é falso quando só há uma, e aí vale ela.
  - `incluirFinanceiro: true`: entram também as igrejas onde a pessoa é
    financeira (telas que o financeiro usa, como a home).
- **Listagens:** "Todas as igrejas" é o padrão, e cada linha mostra de qual
  igreja é.
- **Criação** (evento, notícia): a igreja é a primeira pergunta do
  formulário, obrigatória e sem sugestão. Na edição da notícia, o seletor
  também aparece, com a igreja atual.
- **Quem usa:** notícias (lista, calendário e formulário) e a home do painel
  (`/admin/inicio`, com `incluirFinanceiro`). Admin/usuários e
  admin/eventos têm a mesma regra escrita na própria página.

## Rotas (`src/routes/index.tsx`)

- **Públicas:** `/login`, `/esqueci-senha`, `/usuario/cadastrar`, `/termos`.
- **Qualquer caminho não mapeado** redireciona para `/login`.
- **Grupo admin** (`authLoaderAdmin`): `/admin/inicio`, `/admin/usuarios`, `/admin/usuario/:id/editar`, `/admin/usuario/cadastrar`, `/admin/igrejas`, `/admin/igrejas/:churchId`, `/admin/eventos` (+ cadastro, edição, detalhes, checkin, quadrante), `/admin/noticias`, `/admin/atividades`, `/admin/logins`.
- **Grupo configurações** (`authLoaderAdmin`, régua própria): `/configuracoes` (redireciona para `/configuracoes/pagamentos`), `/configuracoes/pagamentos`, `/configuracoes/disparadores` (redireciona para `/configuracoes/disparadores/whatsapp`), `/configuracoes/disparadores/whatsapp`, `/configuracoes/termos`.
- **Grupo usuário** (`authLoader`): `/home`, `/eventos` (redireciona para `/home`), `/historicoEventos`, `/eventos/:id`, `/eventos/:id/inscricao`, `/eventos/:id/produtos`, `/eventos/:id/quadrante`, `/minhasInscricoes`, `/perfil`.

Cada grupo tem `shouldRevalidate` restrito a mudança de caminho, para o loader de autenticação não rodar de novo a cada troca de query string.

## Ponto de atenção encontrado

- `src/pages/users/routes/index.tsx` está com todo o conteúdo comentado (rotas `/cadastrar-cursilho/:eventId` e `/cadastro-cursilho-work/participar`) — a função `RoutesUsers()` hoje não registra nenhuma rota. Como é código comentado (não removido), fica registrado aqui para quem for mexer: essas rotas estão desligadas em silêncio, não é um recurso ativo.

## Servidor

As permissões de verdade são cobradas no servidor: papéis, recorte por igreja
e os guards (`JwtAuthGuard`, `RolesGuard`, `EventTenantGuard`,
`ChurchTenantGuard`) estão no `ic-backend`, em `docs/autenticacao.md`. As
guardas de rota do front só evitam mostrar tela que a pessoa não pode usar.
