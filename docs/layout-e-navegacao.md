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
- A régua não tem "Sair": ele fica só no menu da conta (avatar) da barra do topo.

### Recolher a régua

A régua fixa da tela grande pode ser recolhida, nas três áreas (admin, usuário
e configurações), por um ícone (`IconButton`, sem borda) no topo. Aberta, o
ícone é `MenuOpen` ("Recolher menu"), preso no canto da régua a 10px do topo e
da direita; recolhida, é o `Menu` ("Expandir menu"), centralizado no lugar do
traço.

- **Recolhida (65px):** só os ícones. O nome aparece numa dica ao passar o
  mouse (com "(em breve)" nos módulos anunciados). Os títulos das seções viram
  um traço curto e as etiquetas somem. Os canais (Disparadores › WhatsApp)
  ficam na mesma coluna, sem recuo.
- **Lembrada entre visitas:** a escolha fica no navegador, por usuário
  (`useFiltroSalvo('sidebar:recolhida')`).
- **Celular:** a gaveta não muda. Ela já abre e fecha, e não mostra o botão.

### Itens por perfil

**Painel (`admin`)**: três seções. **Administrador** reúne quem acessa e quem
administra; **Módulos**, o que se opera por evento ou por igreja;
**Manutenção**, no fim, os registros do sistema (dev e super admin). Cada seção tem seu título em caixa alta e só aparece se tiver
alguma linha para o perfil (`ConteudoNav` recebe uma lista de `secoes`).

| Seção | Item | Papéis que veem |
| --- | --- | --- |
| Administrador | Início | todos os quatro perfis do painel |
| Administrador | Usuários | `isAdminRole` (dev, super admin, admin) — financeiro não gerencia usuários |
| Administrador | Igrejas | `isSuperAdmin` (dev, super admin) |
| Módulos | Eventos | todos os quatro perfis do painel |
| Módulos | Notícias | `isAdminRole` — financeiro não publica |
| Módulos | Financeiro, Patrimônio, Loja | todos os perfis do painel — **em breve**: etiqueta "EM BREVE" em laranja, linha apagada e sem navegação (ainda não há tela) |
| Manutenção | Registro de Atividades | `isSuperAdmin` (dev, super admin) |
| Manutenção | Registro de Login | `isDev` apenas |

Módulo novo do sistema entra em `itensModulos`, e não no grupo Administrador.

**Etiquetas da linha:** "NOVO!" (`novo`), com degradê azul e violeta, estreia
uma tela. "EM BREVE" (`emBreve`), com degradê laranja e âmbar, anuncia um
módulo que ainda não existe: a linha não é link, não reage ao hover e o nome
fica com a cor de desabilitado. Quando a tela existir, troque `emBreve` por
`novo` e aponte o `link` para a rota.

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

Toda tela de uma feature que é por igreja tem o seletor de igreja **no canto
superior direito**, como `children` do `Header` ("Igreja selecionada" + o
alternador). É o mesmo lugar e o mesmo desenho em todas as telas, para
ninguém procurar a igreja de um jeito em cada uma. Nunca se deduz "a primeira
igreja" para super admin ou dev.

- **Componente `SeletorDeIgreja`** (`src/components/seletorDeIgreja`): o
  padrão das listagens (notícias, usuários, eventos, início). Por dentro usa o
  `ChurchScopeBar` das Configurações com a opção **"Todas as igrejas"**
  (`'all'`), que é o padrão. Esconde-se quando só há uma igreja e devolve
  "Todas" quando a escolha deixou de valer. As telas só passam `value` e
  `onChange`.
- **Uma escolha só para o painel inteiro (`useIgrejaEscolhida`):** fica no
  `localStorage` (`useFiltroSalvo`, separada por usuário). Escolher a Filial
  em Notícias abre Usuários, Eventos, Início e Configurações já na Filial, e
  continua assim ao voltar outro dia. As Configurações usam a mesma escolha;
  como lá a configuração é sempre de uma igreja, "Todas" faz a tela pedir uma.
- **Quais igrejas (`useIgrejasDoSeletor`):**
  - super admin e dev: todas (`useGetChurches`);
  - admin: as suas (`igrejasQueAdministra`);
  - `incluirFinanceiro: true`: também as igrejas onde a pessoa é financeira
    (início e eventos, telas que o financeiro usa).
- **Criação** (evento, notícia): a igreja é a primeira pergunta do
  formulário, obrigatória e sem sugestão. Isso é um campo do formulário, e não
  o seletor da tela.
- **Exceção:** a home de uma igreja aberta pela lista de igrejas já vem com a
  igreja na URL e não mostra o seletor.

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
