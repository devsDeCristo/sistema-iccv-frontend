# Layout e navegação

Estrutura comum a todas as telas logadas: barra do topo, régua lateral, área
de conteúdo com rolagem própria, e como o front decide o que cada papel
enxerga no menu e nas rotas. A garantia de verdade é sempre do servidor
(`RolesGuard`/`ChurchTenantGuard` na API) — o que está aqui é usabilidade.

## As três áreas (`AreaSideBar`)

| Área            | Quem entra                                                                 | Layout                                                                  | Régua                                                                                                    |
| --------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `usuario`       | qualquer pessoa logada                                                     | `<Layout isAdmin={false} />`, protegido por `authLoader`                | Página Inicial, Minhas Inscrições, Eventos                                                               |
| `admin`         | perfis do painel (`ADMIN_AREA_ROLES`: dev, super admin, admin, tesouraria) | `<Layout isAdmin={true} />`, protegido por `authLoaderAdmin`            | Início, Usuários, Igrejas, Eventos, Notícias, Tesouraria, Registro de Atividades/Login, conforme o papel |
| `configuracoes` | quem administra alguma igreja (admin/super admin/dev)                      | `<Layout isAdmin area="configuracoes" />`, também com `authLoaderAdmin` | Pagamentos, Disparadores, Termos de Uso, conforme o papel                                                |

`/perfil` fica fora das três réguas específicas: entra pela área `usuario` (mesma rota para admin e usuário comum, acessada pelo menu da conta).

Arquivos: `src/routes/index.tsx`, `src/pages/layout/index.tsx`, `src/components/sideBar/index.tsx`.

## Layout (`src/pages/layout/index.tsx`)

- Empilha, nessa ordem: `TermsGate` (aceite de termos, ver `docs/termos-de-uso.md`), barra do topo (`MenuAppBar`), e a linha régua lateral + conteúdo (`Outlet`).
- A área de conteúdo tem altura fixa (`100dvh` menos a altura da barra do topo) e rola por conta própria — é ela, e não a página inteira, que tem barra de rolagem.
- O usuário devolvido pelo `authLoader`/`authLoaderAdmin` alimenta o `UserProvider` (contexto usado pela barra do topo e pela régua).

## Barra de rolagem

Uma só para o sistema inteiro, no tema (`MuiCssBaseline` em `src/themes/index.tsx`): fina (8px), sem trilho, com o polegar na cor do texto bem apagada (18%; 35% com o mouse em cima, onde o navegador permite). Vale para a página e para tudo que rola dentro dela (tabelas, modais, as duas colunas da Conciliação). Escreve as duas formas: `scrollbar-width`/`scrollbar-color` (Firefox e Chrome 121+) e `::-webkit-scrollbar` (Safari). Quem esconde a barra de propósito (o carrossel de imagens) ou tem a própria (as colunas de hora e minuto do seletor de intervalo, que só aparecem com o mouse em cima) segue com a sua.

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

## Cabeçalho das páginas (`src/components/header`)

- **Identidade do módulo (`modulo`):** nas telas principais de Membros,
  Eventos, Notícias e Tesouraria (administrativa, eventos e congregações), o
  `Header` recebe `modulo` e vira um cabeçalho próprio: o ícone do módulo num
  quadrado tingido na cor dele — o mesmo dos cards da home —, ao lado de
  título (24px, 700) e descrição num bloco fechado, a descrição colada no
  título, menor (14px) e na cor do módulo; a ação (o seletor de igreja) na
  mesma linha, à direita — no celular ela desce para baixo do bloco, porque
  ao lado dele a descrição quebrava em quatro linhas. O ícone e a cor vêm de
  `src/constants/identidadeDosModulos.ts` (`ICONE_DO_MODULO`, `corDoModulo`),
  os mesmos dos cards da home. Eventos ganhou a descrição "Inscrições,
  equipes, quartos, check-in e pagamentos". As telas internas (uma tesouraria
  de evento ou congregação, os não alocados) seguem com o cabeçalho comum.
- **Linha do título:** seta de voltar (`buttonBack`), título e, à direita, a ação da página (`children`). No celular a ação desce para baixo do título.
- **`description`:** texto embaixo do título (aceita elemento, não só texto).
- **`acaoAoLado`:** a ação fica ao lado do título também no celular, em vez de descer. Para ação pequena que encolhe, como o seletor de igreja (Eventos, Usuários, Notícias).
- **`compacto`:** cabeçalho baixo, para página com abas e tabela embaixo, onde cada pixel do topo sai da tabela. Título em 18px (600), descrição em 13px colada nele, seta centralizada na altura do bloco, 20px de margem embaixo. Título e descrição formam um bloco só, e a ação vai ao lado dele inteiro; no celular o bloco ocupa a linha e a ação desce. Usado na página do evento (`/admin/eventos/:id/detalhes/...`): nome do evento e, embaixo, o período com ícone de calendário ("31/10/26 – 01/11/26").

### Respiro da página (`src/components/pageStyle`)

`PageStyle` tem 32px de respiro em volta e aceita `sx` por cima. A página do evento usa `pt: 2` (16px no topo), para cabeçalho e abas subirem.

## Cards de resumo (`src/components/statusCards`)

A régua de cards no topo das listagens (Início, Usuários, Eventos, as abas do evento, Logs) é um componente só, `StatusCards`.

- **Colunas:** uma por card, até cinco lado a lado na tela grande; com cinco, três na média.
- **Celular:** dois por linha, e não um, que empilhava quatro cards e empurrava a lista para três telas abaixo. Com número ímpar, o último ocupa a linha toda. No celular o card também é mais baixo: número em 22px (16px nos de dinheiro, `compact`), ícone em 24px e menos respiro.
- **Colunas que encolhem:** a grade usa `minmax(0, 1fr)`, e não `1fr`. O `1fr` não encolhe abaixo do texto mais longo do card, e no celular uma legenda comprida ("Menores aguardando autorização") empurrava a segunda coluna para fora da tela. Agora título e legenda cortam com reticências.

## Barra de busca e filtros no celular (`barraLarguraCheiaNoCelularSx`)

O cartão de busca das listagens (Eventos, Usuários, Notícias, Igrejas, Registro de Atividades, Registro de Login e as abas do evento) usa `barraLarguraCheiaNoCelularSx`, de `src/components/listPageStyles.ts`. Abaixo de 600px, cada item da barra e cada campo, select, autocomplete ou grupo de botões de filtro ocupa a linha inteira; no grupo de botões (24 horas / 7 dias / 30 dias) os botões dividem a largura.

Antes, o campo pedia `width: 100%` de uma caixa que, na barra em linha com quebra, encolhia até o tamanho do conteúdo: no celular a busca, o select de status e o botão de criar ficavam estreitos, cada um de um tamanho. A regra força os filhos (`&&`, especificidade dobrada) porque cada tela dá larguras próprias para a tela grande; da tela média para cima, nada muda. Barra nova de listagem entra com `...barraLarguraCheiaNoCelularSx` no `sx` do `Paper`.

## Barra de seleção (`src/components/barraDeSelecao`)

Barra dos itens marcados numa tabela, usada em Usuários (editar permissão) e Eventos (mudar status). Flutua no pé da tela enquanto há algo marcado: a quantidade, uma ação (`acao`: `rotulo`, `rotuloCurto` para o celular, `icone`, `onClick`) e o X que limpa a seleção. Sem `acao`, para quem não pode agir, ela só conta e limpa.

- **Celular:** ocupa a largura, o botão usa o `rotuloCurto` e o texto "selecionados" corta antes de quebrar.
- **Não cobre a tabela no fim:** quem usa dá ao card da tabela margem embaixo enquanto há seleção — a altura da barra e a distância dela do fundo, mais 8px de folga, descontado o respiro do `PageStyle` (`{ xs: 5.5, sm: 6.5 }`). A página rola o bastante para tabela e paginação saírem de trás dela.
- **Leitor de tela:** é uma região com nome (`rotuloDaRegiao`, ex. "Usuários selecionados").

## Seletor de intervalo (`src/components/seletorDeIntervalo`)

Um campo só para escolher um intervalo com data, hora e minuto, para filtros de tempo. O campo mostra "05/10 22:44 – 07/10 23:59" (o ano só aparece quando não é o atual), "10/10 08:00 – 12:00" no mesmo dia, ou "… – agora". Ao clicar, abre um painel no jeito do DateTimePicker do MUI, em português:

- **Pontas em cima:** dois cartões, "Início" e "Fim", com data e hora. O marcado (borda e rótulo na cor primária) é o que o calendário e o relógio ajustam; clicar no outro troca. Em tela estreita a hora desce para a linha de baixo, e os dois cartões esticam juntos, com a mesma altura.
- **Calendário à esquerda:** o intervalo aparece como uma faixa contínua entre as pontas, que ficam em círculo cheio. Escolher o dia do início mantém a hora que ele tinha e passa sozinho para o fim; o fim novo entra às 23:59. Um fim que ficou antes do início novo volta para "agora", e um dia de fim antes do início recomeça por ele. Dias futuros ficam desligados.
- **Horário à direita:** colunas de hora e minuto (`MultiSectionDigitalClock`, 24 h, de minuto em minuto), da altura do calendário, já roladas até a hora marcada da ponta ativa. Com o fim em "agora", no lugar do relógio aparece a orientação para escolher um dia. A barra de rolagem das colunas é fininha e só aparece com o mouse em cima; a rolagem fica sempre ligada (o MUI a ligava só no hover, e o espaço da barra que surgia empurrava os números de lado).
- **Celular:** calendário e horário não cabem lado a lado, então viram abas, como no DateTimePicker do MUI (`DateTimePickerTabs`, ícones de calendário e relógio). O calendário ocupa a largura do painel (os 7 dias somam 280px; com os 320px fixos da tela grande, estourava um celular de 320px). A largura do painel é fixa no celular (a tela menos 16px de cada lado): solta, ela seguia o conteúdo (280px com o fim em "agora", 357px com data) e o painel pulava de lado ao escolher o fim. As duas abas têm o mesmo tamanho, para o painel não pular ao trocar, e só o meio rola: as pontas e o OK ficam sempre à vista.
- **Rodapé:** o botão da ponta opcional ("Agora", "Desde já", "Sem data") esvazia a ponta marcada; Cancelar (ou clicar fora) descarta; OK aplica e fecha. Tudo fica num rascunho até o OK; ao reabrir, volta ao valor aplicado. Com o fim antes do início, o OK desliga e aparece o aviso.
- **Valor (`Intervalo`):** `{ de: Date | null; ate: Date | null }`, já pronto para a consulta: com hora, `ate` vem no fim do minuto (18:00:59.999), então "até 18:00" inclui o que aconteceu às 18:00:40. Vazio só quando a ponta é opcional.
- **Opções (props):**
  - `value` / `onChange` (chamado só no OK) e `label` (padrão "Período").
  - `semHora`: só dias, sem relógio nem abas; as duas pontas vêm no começo do dia, como no DatePicker. Usado nas datas do evento.
  - `semInicio` / `semFim`: a ponta pode ficar vazia (`null`), e o texto passado é o que aparece no lugar — "agora" nos logs, "desde já" e "sem data" nos grupos. Um botão no rodapé (com esse texto) esvazia a ponta marcada. Sem a prop, a ponta é obrigatória: o cartão diz "Escolha" e o OK espera por ela.
  - `disableFuture` / `disablePast`: dias desligados no calendário (logs não têm futuro; evento ativo não aceita data passada).
  - `required`, `error`, `helperText`: para formulário, como num TextField.
  - `sx` do campo (padrão 260px; no celular, dentro de uma barra com `barraLarguraCheiaNoCelularSx`, ocupa a largura toda).
- **Onde está:** Registro de Atividades e Registro de Login (filtro de tempo), datas do evento (cadastro e edição) e abertura automática dos grupos de inscrição. O filtro de aniversário dos inscritos (dia e mês, sem ano) e o agendamento de notícia (uma data só) não são intervalos de datas e ficaram como estavam.
- Feito com o `DateCalendar` e o `MultiSectionDigitalClock`, porque o `DateRangePicker` do MUI X é da versão paga. Conferido em print no tema escuro e no claro, na tela grande e no celular (320 a 430px).

## Botão de barra (`src/components/botaoDaBarra`)

Botão das barras de busca e ações das abas do evento (Filtros, Exportar, PDF Envelopes, PDF Crachás, Conferir no gateway, PDF quartos, PDF Equipes, Ver Quadrante, Gerar QR Code). Na tela grande, ícone e texto; no celular, **só o ícone**, e os botões ficam numa linha só e dividem a largura toda (`stackButtons`: cada um cresce a partir do próprio tamanho, e o botão dentro de um embrulho, como o contador do Filtros ou a barra de carregamento do PDF, ocupa a largura do embrulho). Antes cada um ocupava uma linha inteira no celular. Sem o texto, o rótulo vira dica (`Tooltip`, só no celular) e `aria-label`, para o leitor de tela. O `endIcon` (a seta do "Exportar") some no celular. Os botões de criação ("Adicionar quarto", "Adicionar Equipe", "Adicionar transporte") continuam com texto: não têm ícone e são a ação principal da aba.

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
- O item ativo é o que corresponde exatamente à rota atual (ou prefixo dela).
- **Grupos com filhos** (Tesouraria; Disparadores › WhatsApp nas configurações) **abrem e fecham**: a linha do grupo é um botão (`aria-expanded`) com uma seta à direita que gira ao abrir, e os filhos entram com `Collapse`. O clique no grupo não navega — a rota dele só redirecionaria para o primeiro filho — e, na gaveta do celular, não fecha a gaveta. **Começam recolhidos**, menos o da tela aberta (senão o item ativo ficaria escondido); abrir e fechar à mão vale até recarregar a página. O grupo só acende quando está **fechado** com a tela aberta dentro dele, para dizer onde a pessoa está; aberto, quem acende é o filho, e nunca as duas linhas juntas. Na régua recolhida (só ícones) não há seta: o ícone do grupo abre e fecha, e os filhos aparecem na mesma coluna.
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

| Seção         | Item                              | Papéis que veem                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Administrador | Início                            | todos os quatro perfis do painel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Administrador | Usuários                          | `isSuperAdmin` (dev, super admin) — as igrejas chegam numa pessoa pelos inscritos do evento e por Membros                                                                                                                                                                                                                                                                                                                                                                                                            |
| Administrador | Igrejas                           | `isSuperAdmin` (dev, super admin)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Administrador | Planos                            | `isSuperAdmin` (dev, super admin) — logo abaixo de Igrejas; ver `docs/planos.md`                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Administrador | Meus planos                       | quem não é super admin (admin e tesouraria de igreja) — logo abaixo de Início: o plano da igreja e os outros para comparar; ver `docs/planos.md`                                                                                                                                                                                                                                                                                                                                                                     |
| Módulos       | Eventos                           | todos os quatro perfis do painel, e o tesoureiro(a) e o admin de evento (a mesma lista, só com os eventos deles)                                                                                                                                                                                                                                                                                                                                                                                                     |
| Módulos       | Notícias                          | `isAdminRole` — tesouraria não publica                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Módulos       | Membros                           | `isAdminRole` (dev, super admin, admin), e só para consulta a tesouraria, o tesoureiro(a) e o admin de evento (este também abre o cadastro para editar); primeiro item da seção, acima de Eventos; ver `docs/membros.md`                                                                                                                                                                                                                                                                                             |
| Módulos       | Tesouraria                        | todos os perfis do painel; grupo com três filhos: Administrativa (abas Conciliação, Dízimos e Lançamentos), Eventos e Congregações (as duas com "Novo"; a congregação tem Conciliação e Lançamentos e é só de admin e tesouraria — `docs/tesouraria-congregacoes.md`); o grupo abre na Administrativa — ver `docs/tesouraria.md`. Nas linhas de filho, que são recuadas, as etiquetas "Novo!" e "Em breve" saem menores (`Etiqueta pequena`): no tamanho cheio, "Em breve" cortava "Congregações"                    |
| Módulos       | Tesouraria › Eventos (tesoureiro) | quem é **apenas** tesoureiro(a) de evento (sem perfil em igreja) vê os **mesmos itens** do sistema, recortados: Membros (consulta), Eventos e, se é completo em algum evento, o grupo Tesouraria só com o filho Eventos (o grupo abre nele). Sem Início, Meus planos e Patrimônio, que são da igreja; o logo leva a Eventos. Nada de seção ou rótulo próprio. Vale igual para quem é só **admin de evento** (`soPorEvento`): Membros e Eventos, sem a Tesouraria. Ver `docs/tesouraria.md` e `docs/admin-eventos.md` |
| Módulos       | Patrimônio, Loja                  | todos os perfis do painel — **em breve**: etiqueta "EM BREVE" em laranja, linha apagada e sem navegação (ainda não há tela)                                                                                                                                                                                                                                                                                                                                                                                          |
| Manutenção    | Registro de Atividades            | `isSuperAdmin` (dev, super admin)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Manutenção    | Registro de Login                 | `isDev` apenas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Módulo novo do sistema entra em `itensModulos`, e não no grupo Administrador.

**Plano da igreja:** os itens de módulo (Eventos, Notícias, Tesouraria — Membros não é módulo, toda igreja tem; e em Configurações, Pagamentos → Eventos, Disparadores → Notícias, Integrações → Tesouraria) só aparecem se alguma igreja da pessoa tem o módulo no plano (`MODULO_DO_LINK` + `useModulos`); dev e super admin veem todos. Módulo novo que entra no plano ganha uma linha em `MODULO_DO_LINK` — ver `docs/planos.md`.

**Etiquetas da linha:** "NOVO!" (`novo`), com degradê azul e violeta, estreia
uma tela. "EM BREVE" (`emBreve`), com degradê laranja e âmbar, anuncia um
módulo que ainda não existe: a linha não é link, não reage ao hover e o nome
fica com a cor de desabilitado. Quando a tela existir, troque `emBreve` por
`novo` e aponte o `link` para a rota.

**Configurações (`configuracoes`)**

No topo, sem grupo, **Voltar ao painel** (todos). Embaixo, um grupo por módulo (grupo sem item não aparece):

| Grupo      | Item                    | Papéis que veem                                                  |
| ---------- | ----------------------- | ---------------------------------------------------------------- |
| Eventos    | Pagamentos              | `isAdminRole`, com Eventos no plano                              |
| Notícias   | Disparadores › WhatsApp | `isAdminRole`, com Notícias no plano                             |
| Tesouraria | Integrações             | `isAdminRole` ou tesouraria, com Tesouraria no plano             |
| Sistema    | Termos de Uso           | `isSuperAdmin` — valem para a plataforma inteira, não por igreja |

Seção sem título (`titulo: ''`) não monta a linha de título; só a primeira monta, porque é dela o botão de recolher. Entre um grupo e outro da régua (em todas as áreas) o espaço é de 12px.

**Usuário (`usuario`)**

Página Inicial, Minhas Inscrições, Eventos — sem distinção de papel (é a área de quem não é da organização).

Arquivo: `src/components/sideBar/index.tsx`.

## Papéis e permissões no front

- **Perfis (`Role`, `src/constants/roles.ts`):** `DEV` (-1), `SUPER_ADMIN` (1), `ADMIN` (2), `FINANCE` (3), `USER` (5). Os valores espelham `User.role` no backend.
- **Grupos:**
  - `SUPER_ADMIN_ROLES` = dev + super admin.
  - `ADMIN_ROLES` = `SUPER_ADMIN_ROLES` + admin (acesso total ao painel).
  - `ADMIN_AREA_ROLES` = `ADMIN_ROLES` + tesouraria (quem entra no painel, com abas restritas).
  - `TESOURARIA_EVENT_TABS` = abas de detalhes do evento liberadas à tesouraria (`usuarios`, `pagamentos`).
- **`useRole()`:** lê o usuário guardado na sessão e devolve `role` (perfil efetivo — o mais alto entre os vínculos por igreja), `isAdmin`, `isSuperAdmin`, `isDev`, `isTesouraria`, `canAccessAdminArea`, `churchRoles` (perfil por igreja), `igrejasQueAdministra` e `perfilNaIgreja(churchId)`.
- **`RequireRole`:** componente de rota que esconde a tela de quem não tem o perfil exigido, redirecionando (padrão: `/admin/inicio`). É só usabilidade — quem garante é o `RolesGuard` da API.
- **`RequireEventRole`:** para telas que dependem da igreja do evento (editar, check-in, quadrante) — usa o papel da pessoa **naquela igreja específica**, e não o perfil efetivo geral, porque admin de uma igreja não deve mexer no evento de outra.

Arquivos: `src/constants/roles.ts`, `src/hooks/useRole.tsx`, `src/components/requireRole/index.tsx`.

### Seletor de igreja (multitenant)

Toda tela de uma feature que é por igreja tem o seletor de igreja **no canto
superior direito**, como `children` do `Header` ("Igreja selecionada" + o
alternador). É o mesmo lugar e o mesmo desenho em todas as telas, para
ninguém procurar a igreja de um jeito em cada uma. Nunca se deduz "a primeira
igreja" para super admin ou dev.

- **No celular:** nas telas sem `modulo` o seletor fica na mesma linha do
  título (`Header` com `acaoAoLado`); no cabeçalho de módulo ele desce para
  baixo do bloco de título (ver "Cabeçalho das páginas"). O rótulo "Igreja selecionada" some; o ícone de igreja e a
  caixa já dizem o que é. Nome longo de igreja corta com reticências. Vale
  também para o seletor das Configurações, que é o mesmo `ChurchScopeBar`.

- **Sempre uma igreja:** as telas dos módulos (Eventos, Notícias, Membros,
  Tesouraria, Configurações) usam `useIgrejaSelecionada` + `ChurchScopeBar`.
  Não há "Todas as igrejas": a tela é de uma igreja e mostra **exatamente o
  que o admin dela vê** (sem coluna de igreja nas listas). Com uma igreja só,
  ela vem sozinha; com várias e nenhuma escolhida, a tela pede a escolha. O
  seletor lista todas as igrejas da pessoa, **com ou sem o módulo**: escolhida
  uma que não tem o módulo da tela, o `RequireRole` (com `modulo`) mostra o
  aviso `ForaDoPlano` — "<igreja> não tem o módulo <X>", com o seletor no
  topo para trocar e o botão "Ver planos" (Meus planos) ou, para dev e super
  admin, "Mudar o plano" (Igrejas). Vale para dev e super admin também: o
  plano vem de `useModulos().planoDaIgreja`, que para eles lê a lista de
  igrejas. Até 13/10/2026 Eventos e Notícias tinham "Todas as igrejas", e o
  seletor das outras telas só oferecia as igrejas com o módulo.
- **Componente `SeletorDeIgreja`** (`src/components/seletorDeIgreja`): só da
  home. Por dentro é o mesmo `ChurchScopeBar`, com a opção **DEV** (`'all'`,
  a visão do sistema) para dev e super admin — o `todas` do `ChurchScopeBar`
  é o rótulo dessa opção.
- **A escolha anda junto entre componentes:** o `useFiltroSalvo` avisa as
  outras instâncias com a mesma chave quando grava (evento `filtro-salvo`), e
  elas releem. É o que faz a troca de igreja no seletor da página valer na
  hora para o guarda da rota, que também lê a escolha.
- **Uma escolha só para o painel inteiro (`useIgrejaEscolhida`):** fica no
  `localStorage` (`useFiltroSalvo`, separada por usuário). Escolher a Filial
  em Notícias abre Usuários, Eventos, Início e Configurações já na Filial, e
  continua assim ao voltar outro dia. As Configurações usam a mesma escolha;
  como lá a configuração é sempre de uma igreja, "Todas" faz a tela pedir uma.
- **Quais igrejas (`useIgrejasDoSeletor`):**
  - super admin e dev: todas (`useGetChurches`);
  - admin: as suas (`igrejasQueAdministra`);
  - `incluirTesouraria: true`: também as igrejas onde a pessoa é financeira
    (início e eventos, telas que a tesouraria usa).
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

## Ícone da aba e cartão do link compartilhado

Ficam no `index.html`: o ícone da aba é `public/favicon.svg` (o mesmo `logo-ic.svg` do sistema, índigo no navegador claro e branco no escuro) e o cartão que
WhatsApp, Telegram e afins montam ao colar o link vem das tags `og:*` (título,
descrição e `og:image` com `https://eventos.iccidadeverde.com/og-iccv-eventos.png`: cartão
1200×630, fundo índigo da marca (`#1C0F4D`), logo branco e "ICCV Eventos", como
na barra do sistema).
Os robôs não executam JavaScript e exigem URL absoluta na imagem — por isso
isso não pode ser montado pelo React. Sem as tags o robô escolhia sozinho uma
imagem, e saía a borboleta antiga (`public/borboleta.png`, hoje sem uso). Para
trocar a imagem do cartão, troque `public/og-iccv-eventos.png` (mantenha
1200×630) ou a URL no `index.html`. Quem já colou o link antes pode ver o cartão antigo por um tempo:
o app de mensagens guarda o preview em cache.

## Servidor

As permissões de verdade são cobradas no servidor: papéis, recorte por igreja
e os guards (`JwtAuthGuard`, `RolesGuard`, `EventTenantGuard`,
`ChurchTenantGuard`) estão no `ic-backend`, em `docs/autenticacao.md`. As
guardas de rota do front só evitam mostrar tela que a pessoa não pode usar.
