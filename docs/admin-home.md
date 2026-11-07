# Início do painel admin (`/admin/inicio`)

Tela de abertura do painel administrativo. Não é a home de um perfil, e sim
de uma igreja (ou do sistema inteiro, para quem responde por ele): o mesmo
componente `Home` desenha os blocos que a API mandou preenchidos, e o que
aparece muda com quem pergunta.

## Quem entra e o que cada um vê

A rota `/admin/inicio` não tem `RequireRole` próprio — quem chega até ela já
passou pelo `authLoaderAdmin` (`GET /auth/admin/validate`), que barra quem não
tem acesso ao painel. Dentro da tela, nenhum bloco é escolhido por `role` no
front: o recorte mora no serviço do dashboard, que é o mesmo lugar que decide
o que a consulta pode ver. Por isso não existe seção sem dado atrás nem dado
que chegue sem seção.

| Perfil | O que abre | Blocos exclusivos |
| --- | --- | --- |
| Admin de igreja | a home da igreja dele (`scope: 'church'`) | módulos (`ModulosDaIgreja`), lista de eventos, mural (`news`) |
| Tesouraria | a home da igreja dele, mesmo layout | `TreasuryKpis` e `EventEarnings` no lugar dos números e da lista de eventos do admin |
| Super admin | a home da igreja escolhida no seletor — a mesma do admin dela | nenhum: sem igreja escolhida, a home pede a escolha. Até 07/11/2026 ele tinha uma home do sistema própria (base de usuários, comparativo e números das igrejas), que saiu |
| Dev | a visão do sistema (`scope: 'system'`), o padrão dele; ou a home de uma igreja, se escolher | `SystemInsights` (indicadores de funcionamento) e a lista de igrejas (`ChurchBreakdown`) |

Arquivos: `src/pages/admin/home/routes/index.tsx`, `src/auth/functions/authLoaderAdmin.tsx`, `src/routes/index.tsx`.

## Seletor de igreja (multitenant)

No `/admin/inicio` o seletor (`SeletorDeIgreja`, no canto superior direito)
usa a mesma escolha de igreja dos outros módulos. A home é **sempre de uma
igreja**, e mostra o que o admin dela vê (`GET /dashboard?churchId=…`), com o
perfil que a pessoa tem **nela**: quem é tesouraria na igreja vê a home da
tesouraria. A exceção é a opção **DEV** (`'all'`), a visão do sistema, que só
o dev tem — e é o padrão dele. O super admin também escolhe uma igreja (todas
aparecem no seletor); o `'all'` que ele tinha salvo deixa de valer e a home
pede a escolha. A API devolve `400` se ele pedir sem igreja. Quem trabalha em igreja escolhe
uma das suas (as de tesouraria também): com uma só ela vem sozinha e o
seletor some; com várias e nenhuma escolhida, a home pede a escolha e não
consulta a API. Até 13/10/2026 havia "Todas as igrejas", que somava as igrejas
da pessoa. Na home aberta pela lista de igrejas (`churchHome`) o seletor não
aparece, porque a igreja já veio na URL.

- **De qual igreja é cada pendência:** aparece o nome da igreja sempre que a
  tela tem mais de uma, seja o dev no sistema ou quem administra
  várias em "Todas". Antes só aparecia para o super admin.

## Faixa de abertura (`Hero`)

- Saudação do dia + primeiro nome de quem entrou, com foto e um selo de perfil
  no canto do avatar (coroa para admin/super admin, cifrão para tesouraria,
  `</>` para dev).
- Frase de apresentação (`apresentacao`, em `utils.ts`) diz o cargo e a igreja
  por extenso:
  - sem igreja (só o dev, na visão DEV): "Você é dev e acompanha todas as
    igrejas do sistema. A seguir, os indicadores do sistema.";
  - com vínculo em mais de uma igreja e papéis diferentes: lista as duas,
    porque "Admin" sozinho mentiria pela metade;
  - vínculo mas nenhuma igreja (`churches.length === 0`): troca a segunda
    frase por "peça a um super admin para incluir você em uma".
- Na home aberta por uma igreja específica (`churchId` preenchido), a faixa
  de saudação some e vira um `Header` com o nome da igreja e botão de voltar
  para a lista — ali a tela é sobre a igreja, não sobre quem está olhando.

Arquivos: `src/features/admin/home/components/hero.tsx`, `src/features/admin/home/components/roleBadge.tsx`, `src/features/admin/home/utils.ts`.

## Painel de quem administra a igreja (admin e tesouraria)

A API manda os **eventos em jogo** (os ativos, ou o último encerrado quando
não há nenhum), e é deles que saem as pendências — comprovante a conferir de
evento encerrado continua cobrado. A **lista** da tela, porém, mostra só os
que estão acontecendo ou a caminho (ver abaixo).

- **Módulos (`ModulosDaIgreja`)**, logo abaixo da saudação, para admin e
  tesouraria: a **apresentação** de cada módulo, sem números — Membros,
  Eventos, Notícias (só para quem é admin da igreja) e Tesouraria. Cada um é
  um tile de fundo tingido na cor do módulo, com o ícone grande em marca
  d'água, a palavra "Módulo", o nome e uma frase do que ele faz; não usa o
  card de números do sistema. Dois por linha no celular, todos numa linha na
  tela larga.

  O tile inteiro leva ao módulo. **Fora do plano**, o tile fica listrado e
  sem cor, com borda tracejada e cadeado, diz "Fora do seu plano · Ver planos" e leva a
  **Meus planos** (`/admin/meus-planos`). O plano vem da API (`resumo.modulos`) e não do acesso
  de quem olha: super admin e dev, que alcançam todos os módulos, veem a
  igreja como ela é, e o card apagado diz "Fora do plano da igreja · Mudar o
  plano" e leva a Igrejas, onde se troca o plano. Até 13/10/2026 aqui ficavam os KPIs de evento
  (`ChurchKpis`: eventos ativos, inscritos, lista de espera, a conferir); saíram
  para a home não ser só eventos — o card de Eventos e a lista logo abaixo já
  contam isso.
- **KPIs da tesouraria (`TreasuryKpis`):** aparece no lugar do anterior
  quando a API manda `treasury` preenchido. Só dinheiro — recebido, a
  receber, a conferir e quantas pessoas devem. Vaga, ritmo e lista de espera
  saem, porque não são decisão dele.
- **Lista de eventos (`EventsList`, "Eventos acontecendo e a caminho"):**
  só os eventos **acontecendo agora ou a caminho** — o encerrado não entra;
  primeiro os que acontecem, depois do mais próximo ao mais longe. Uma
  **linha compacta por evento**, como tabela (cabeçalho Evento · Vagas ·
  Recebido na tela larga): ponto da fase (com pulso no que acontece agora),
  nome, período, quanto falta e o check-in feito; vagas ocupadas/total com
  barra fina ("lotado" em laranja) e o recebido com a porcentagem do
  esperado. A linha inteira abre o evento; durante o evento há o atalho do
  check-in. No celular as duas leituras descem para baixo do nome, lado a
  lado. Sem nenhum, "Nenhum evento acontecendo ou a caminho" e "Criar
  evento". Até 13/10/2026 era um bloco grande por evento, com grupos e
  check-in em barra, e entrava o último encerrado — três eventos ocupavam a
  tela inteira. Some para a tesouraria — no lugar entra `EventEarnings`.
- **Ganhos por evento (`EventEarnings`):** só da tesouraria. Uma barra
  empilhada por evento (recebido / em análise / a receber), escalada pelo
  maior evento, para comparar uns com os outros. Eventos sem cobrança
  (`finance.expected === 0`) não entram.
- **Precisa de você (`PendingActions`):** tarefas com endereço — pedidos
  para ser membro (levam a Membros já na aba Pedidos, `?aba=pedidos`),
  solicitações esperando resposta (levam a Solicitações), comprovantes
  esperando conferência e listas de espera com vaga para chamar (levam à aba
  do evento). As da igreja vêm primeiro, com o ícone e a cor do módulo, e
  ao clicar escolhem a igreja da tarefa no seletor do painel. A seção some quando não há nada; não
  mostra "tudo em dia" para não ensinar o olho a pular a região.
- **Eventos e mural lado a lado:** na tela larga, a lista de eventos ocupa
  dois terços à esquerda e o mural a coluna da direita; abaixo disso, um
  embaixo do outro. Sem um dos dois, o outro ocupa a largura toda.
- **Mural (`news`):** só do admin — a tesouraria e o super admin não publicam
  notícia, e por isso não recebem o bloco. Até 13/10/2026 ficava ao lado das
  "Últimas inscrições", que saíram da home: os inscritos estão na lista de
  cada evento.
- **O plano recorta os blocos:** sem Eventos no plano, a API manda `events` e
  `treasury` nulos e a tela não os monta; sem Notícias, o mural não vem.

Arquivos: `src/features/admin/home/components/modulosDaIgreja.tsx`, `treasuryKpis.tsx`, `eventsList.tsx`, `eventEarnings.tsx`, `pendingActions.tsx`, `newsBoard.tsx`.

## Visão do sistema (só o dev)

Só entra quando a API responde `scope: 'system'` — o dev sem igreja
escolhida. Até 07/11/2026 o super admin também tinha esta tela, com um
panorama próprio (`SystemKpis`, o comparativo `ChurchRankings` e a base de
usuários `UserOverview`); os três saíram junto com o `panorama` da API.
- **Igrejas (`ChurchBreakdown`):** substitui a lista de eventos da home de
  igreja — cada linha é uma igreja com o evento em foco dela (o ativo/a
  caminho, não o histórico). Igreja sem evento em andamento não ganha barra
  nem número zerado, só a frase "Sem evento em andamento ou a caminho" — uma
  barra em zero se leria como evento vazio, não como ausência de evento. Tem
  atalho para "Gerenciar" (`/admin/igrejas`).
- **Indicadores do sistema (`SystemInsights`):** só do dev. Inscrições por
  mês, movimento do sistema (ações registradas em 14 dias), tentativas de
  login por dia (sucesso/falha — a tabela que alimenta isso só existe a
  partir da migration que a criou, então dias antes vêm zerados por falta de
  registro, não porque ninguém entrou), igrejas com mais eventos e quem mais
  movimenta o painel (ações de escrita do log; o sistema não registra
  login/acesso, só o texto já avisa disso no rótulo).

Arquivos: `src/features/admin/home/components/churchBreakdown.tsx`, `systemInsights.tsx`, `charts.tsx`.

## Home de uma igreja aberta pela lista (`churchHome`)

`/admin/igrejas/:churchId` é a mesma tela `Home`, só que com `churchId`
vindo da URL — não existe uma segunda implementação. É como o super admin
abre a home de qualquer igreja a partir da lista (`Igrejas`), sem trocar de
vínculo: a API responde pelo `churchId` pedido, e não pelo vínculo de quem
entrou. Rota protegida por `RequireRole` com `SUPER_ADMIN_ROLES` (dev e super
admin) — o admin da igreja não passa por aqui, ele já cai direto em
`/admin/inicio`.

Arquivos: `src/features/admin/churchHome/index.tsx`, `src/pages/admin/churches/routes/index.tsx`.

## Dados

- **Fonte:** `useGetDashboard(churchId?)` → `GET /dashboard`, com `churchId`
  como query param quando presente. Sem ele, a API responde pelo vínculo de
  quem entrou; com ele, pela igreja pedida — e quem pode pedir qual igreja é
  decisão da API, não desta chamada (pedir a igreja errada dá 403).
- **Cache:** o `churchId` entra na chave da consulta (`[GET_DASHBOARD,
  churchId ?? null]`), senão abrir a segunda igreja mostraria por um instante
  os números da primeira.
- **Formato da resposta (`Dashboard`):** o eixo é o evento, não o sistema —
  cada número mora dentro do evento a que pertence. Bloco `null` quer dizer
  "não é da alçada de quem pediu", nunca "zerado". Campos: `scope`, `role`,
  `churches`, `events`, `pending`, `news`, `resumo`, `byChurch`,
  `treasury` (só tesouraria), `panorama` (só super admin) e `insights` (só
  dev).

Arquivos: `src/features/admin/home/api/getDashboard.ts`, `src/features/admin/home/types.ts`, `src/features/admin/home/constants.ts`.
