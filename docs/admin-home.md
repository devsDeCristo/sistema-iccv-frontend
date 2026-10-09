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
| Admin de igreja | a home da igreja dele (`scope: 'church'`) | `ChurchKpis`, lista de eventos, mural (`news`), últimas inscrições |
| Financeiro | a home da igreja dele, mesmo layout | `TreasuryKpis` e `EventEarnings` no lugar dos números e da lista de eventos do admin |
| Super admin | panorama do sistema (`scope: 'system'`) | `SystemKpis`, comparativo entre igrejas, lista de igrejas, base de usuários |
| Dev | mesmo panorama do super admin | `SystemInsights` (indicadores de funcionamento), além dos blocos do super admin |

Arquivos: `src/pages/admin/home/routes/index.tsx`, `src/auth/functions/authLoaderAdmin.tsx`, `src/routes/index.tsx`.

## Seletor de igreja (multitenant)

No `/admin/inicio`, quem alcança mais de uma igreja (super admin, dev, admin
ou financeiro de várias) tem um seletor **Igreja** no topo. O padrão é
**"Todas as igrejas"**, a home de sempre. Escolher uma abre a home daquela
igreja (`GET /dashboard?churchId=…`), com o perfil que a pessoa tem **nela**:
quem é financeiro na igreja vê a home do financeiro. O seletor usa
`useIgrejasDoSeletor({ incluirFinanceiro: true })`, porque a home também é do
financeiro. Na home aberta pela lista de igrejas (`churchHome`) o seletor não
aparece, porque a igreja já veio na URL.

- **De qual igreja é cada pendência:** aparece o nome da igreja sempre que a
  tela tem mais de uma, seja o super admin no sistema ou quem administra
  várias em "Todas". Antes só aparecia para o super admin.

## Faixa de abertura (`Hero`)

- Saudação do dia + primeiro nome de quem entrou, com foto e um selo de perfil
  no canto do avatar (coroa para admin/super admin, cifrão para financeiro,
  `</>` para dev).
- Frase de apresentação (`apresentacao`, em `utils.ts`) diz o cargo e a igreja
  por extenso:
  - sem igreja (super admin/dev): "Você é super admin e acompanha todas as
    igrejas do sistema", seguido do que vem abaixo (indicadores, para o dev;
    resumo de igrejas e usuários, para o super admin);
  - com vínculo em mais de uma igreja e papéis diferentes: lista as duas,
    porque "Admin" sozinho mentiria pela metade;
  - vínculo mas nenhuma igreja (`churches.length === 0`): troca a segunda
    frase por "peça a um super admin para incluir você em uma".
- Na home aberta por uma igreja específica (`churchId` preenchido), a faixa
  de saudação some e vira um `Header` com o nome da igreja e botão de voltar
  para a lista — ali a tela é sobre a igreja, não sobre quem está olhando.

Arquivos: `src/features/admin/home/components/hero.tsx`, `src/features/admin/home/components/roleBadge.tsx`, `src/features/admin/home/utils.ts`.

## Painel de quem administra a igreja (admin e financeiro)

Todos os números somam só os **eventos em jogo**: os ativos, ou o último
encerrado quando não há nenhum aberto ou a caminho (nesse caso o título da
lista vira "Último evento encerrado" em vez de "Eventos ativos").

- **KPIs do admin (`ChurchKpis`):** eventos ativos (com a composição
  acontecendo/a caminho/encerrados), inscritos de vagas, lista de espera e
  comprovantes a conferir. Ocupação olha só o que não terminou; dinheiro olha
  todos os eventos, porque cobrança em aberto não desaparece com o fim do
  cursilho.
- **KPIs do financeiro (`TreasuryKpis`):** aparece no lugar do anterior
  quando a API manda `treasury` preenchido. Só dinheiro — recebido, a
  receber, a conferir e quantas pessoas devem. Vaga, ritmo e lista de espera
  saem, porque não são decisão dele.
- **Lista de eventos (`EventsList`):** uma linha por evento (sem cartão
  próprio), com fase (acontecendo/aberto/encerrado, com pulso animado no que
  está rolando agora), vagas por evento e por grupo (com aviso de "lotado"),
  caixa recebido, ritmo de inscrição (some no evento encerrado) e check-in
  (só aparece se já começou). Some para o financeiro — some no lugar entra
  `EventEarnings`.
- **Ganhos por evento (`EventEarnings`):** só do financeiro. Uma barra
  empilhada por evento (recebido / em análise / a receber), escalada pelo
  maior evento, para comparar uns com os outros. Eventos sem cobrança
  (`finance.expected === 0`) não entram.
- **Precisa de você (`PendingActions`):** tarefas com endereço — comprovantes
  esperando conferência e listas de espera com vaga para chamar —, cada uma
  linkando direto para a aba do evento. A seção some quando não há nada; não
  mostra "tudo em dia" para não ensinar o olho a pular a região.
- **Últimas inscrições e mural:** lado a lado quando há espaço. As inscrições
  recentes são o pulso da tela; o mural (`news`) é só do admin — o financeiro
  e o super admin não publicam notícia, e por isso não recebem o bloco.

Arquivos: `src/features/admin/home/components/churchKpis.tsx`, `treasuryKpis.tsx`, `eventsList.tsx`, `eventEarnings.tsx`, `pendingActions.tsx`, `recentRegistrations.tsx`, `newsBoard.tsx`.

## Panorama do super admin e do dev

Só entra quando a API responde `scope: 'system'` — quem não pertence a
nenhuma igreja e por isso atravessa todas.

- **SystemKpis:** igrejas cadastradas (com quantas têm evento aberto),
  eventos abertos no sistema, pessoas cadastradas e quantas nunca se
  inscreveram em nada — o número que só faz sentido olhando o conjunto
  inteiro. O rodapé do último card também soma quem opera o painel (todo
  perfil diferente de `USER`), porque vínculo de igreja não serve de contagem
  aqui: super admin e dev não têm nenhum.
- **Comparativo entre igrejas (`ChurchRankings`):** dois rankings lado a
  lado — igrejas com mais ações de admin/financeiro na janela recente
  (`activityWindowDays`; super admin e dev ficam de fora porque não têm
  vínculo de igreja) e igrejas com mais eventos cadastrados.
- **Igrejas (`ChurchBreakdown`):** substitui a lista de eventos da home de
  igreja — cada linha é uma igreja com o evento em foco dela (o ativo/a
  caminho, não o histórico). Igreja sem evento em andamento não ganha barra
  nem número zerado, só a frase "Sem evento em andamento ou a caminho" — uma
  barra em zero se leria como evento vazio, não como ausência de evento. Tem
  atalho para "Gerenciar" (`/admin/igrejas`).
- **Usuários (`UserOverview`):** novos cadastros por mês, últimos 12 meses.
- **Indicadores do sistema (`SystemInsights`):** só do dev. Inscrições por
  mês, movimento do sistema (ações registradas em 14 dias), tentativas de
  login por dia (sucesso/falha — a tabela que alimenta isso só existe a
  partir da migration que a criou, então dias antes vêm zerados por falta de
  registro, não porque ninguém entrou), igrejas com mais eventos e quem mais
  movimenta o painel (ações de escrita do log; o sistema não registra
  login/acesso, só o texto já avisa disso no rótulo).

Arquivos: `src/features/admin/home/components/systemKpis.tsx`, `churchRankings.tsx`, `churchBreakdown.tsx`, `userOverview.tsx`, `systemInsights.tsx`, `charts.tsx`.

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
  `churches`, `events`, `pending`, `recentRegistrations`, `news`, `byChurch`,
  `treasury` (só financeiro), `panorama` (só super admin) e `insights` (só
  dev).

Arquivos: `src/features/admin/home/api/getDashboard.ts`, `src/features/admin/home/types.ts`, `src/features/admin/home/constants.ts`.
