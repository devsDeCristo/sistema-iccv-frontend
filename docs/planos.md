# Planos (`/admin/planos`)

O plano de uma igreja diz quais módulos ela usa no sistema. Regras de servidor: `docs/planos.md` no `ic-backend`.

## Quem acessa

Só **dev e super admin** (`SUPER_ADMIN_ROLES`), como Igrejas. No menu, "Planos" fica logo abaixo de "Igrejas", no grupo Administrador.

## A tela

- **Um cartão por plano** (do mais barato ao mais caro): nome, quantas igrejas usam, o **valor** ("R$ 249,90/mês", ou "Grátis" no zero — `valorDoPlano`), a descrição e **todos os módulos**, com ✓ verde nos que o plano libera e ✕ apagado nos que não; no rodapé, "N de 4 módulos", editar e apagar.
- **Apagar** só plano que nenhuma igreja usa: com igreja, o botão fica desligado e a dica diz para trocar o plano delas antes.
- Um aviso no topo lembra que o plano se escolhe em Igrejas e que igreja sem plano não tem módulo nenhum.
- **Novo / editar** (`modalPlano.tsx`): nome, **valor mensal** (máscara de centavos, como o valor do dízimo; zero é gratuito), descrição (opcional) e um checkbox por módulo, com o que cada um abre. Editando plano em uso, o texto diz que vale na hora para as igrejas dele e que nada é apagado.

## Meus planos (`/admin/meus-planos`)

Para quem trabalha numa igreja (admin e tesouraria; `ADMIN_AREA_ROLES` na rota). No menu, "Meus planos" fica no grupo Administrador, logo abaixo de Início — só para quem não é super admin (ele tem Planos). `meusPlanos.tsx`, dados de `GET /churches/:churchId/plano`.

- **Seletor de igreja** no topo (`ChurchScopeBar`, `useIgrejaSelecionada(true)`): quem trabalha em mais de uma escolhe de qual ver.
- **Destaque do plano da igreja:** cartão grande com degradê na cor primária e o ícone do plano apagado ao fundo; selo "Seu plano", nome, descrição e o valor em destaque ("R$ 149,90 /mês" ou "Grátis"); embaixo, os módulos em pílulas — os do plano com ✓ verde (Membros sempre, que toda igreja tem), os de fora tracejados com cadeado.
- **Sem plano:** um aviso no lugar do destaque ("Sua igreja ainda não tem plano. Por enquanto ela usa só o básico").
- **Compare os planos:** um cartão por plano, do mais em conta ao mais completo, com valor, descrição e os módulos (✓ ou cadeado). O plano atual ganha aro na cor primária e o selo "Atual"; os outros, o selo "+N módulos" com o que têm a mais, e cada módulo a mais vem em negrito com "a mais que o seu" (sem plano, só o selo).
- **Rodapé:** "Para mudar de plano, fale com quem administra o sistema" — a tela não troca o plano.
- Celular: o valor desce para baixo do nome e os cartões ficam um por linha.

## Módulos

`src/constants/modulos.ts` (`MODULOS`, `ROTULO_DO_MODULO`): Eventos, Notícias e Tesouraria — na ordem do menu. **A cobrança online é parte de Eventos** (já foi um módulo próprio). As configurações seguem o módulo a que servem: Pagamentos é de Eventos, Disparadores (WhatsApp) de Notícias, Integrações (Pluggy) de Tesouraria. **Membros não é módulo:** toda igreja tem, com ou sem plano.

## Como o painel respeita o plano

É usabilidade: quem recusa de verdade é o `ModuloGuard` da API.

- **O plano recorta quem trabalha na igreja** (admin, tesouraria). **Dev e super admin veem todos os módulos de todas as igrejas**: para eles nada some do menu, nenhuma rota diz "fora do plano" e o seletor de igreja traz todas.
- **Os módulos de cada igreja** vêm na sessão (`church.modulos` em cada vínculo, renovada a cada navegação no painel). Quem junta é `useModulos()` (`src/hooks/useModulos.ts`): `temModulo(m)` (alguma igreja da pessoa tem; sempre sim para dev e super admin) e `igrejaTem(id, m)`.
- **Menu:** item de módulo que nenhuma igreja da pessoa tem no plano sai da régua (`MODULO_DO_LINK` na `sideBar`): Eventos, Notícias, Tesouraria, e em Configurações Pagamentos (Eventos), Disparadores (Notícias) e Integrações (Tesouraria).
- **Rotas:** `RequireRole` aceita `modulo`; sem nenhuma igreja com ele, a tela mostra `ForaDoPlano` ("O plano da sua igreja não inclui o módulo X. Para usá-lo, fale com quem administra o sistema"). Nas telas de um evento (`RequireEventRole`), a igreja daquele evento precisa ter Eventos.
- **Seletor de igreja:** `useIgrejaSelecionada(incluirTesouraria, modulo)` só oferece as igrejas com o módulo no plano (Tesouraria, Integrações → Tesouraria, Disparadores → Notícias, Pagamentos → Eventos) — para admin e tesouraria.
- **Pagamentos sem Cobrança online:** a tela é de Eventos; numa igreja sem Cobrança online no plano, ela avisa que a igreja não recebe pelo site (a grade de gateways não aparece).
- **`/configuracoes`** abre na primeira tela que a pessoa tem: Pagamentos (Eventos), WhatsApp (Notícias) ou Integrações (dev e super admin: Pagamentos).
- **Limite:** Eventos e Notícias listam "Todas as igrejas"; uma igreja fora do plano ainda aparece nessas listas quando a pessoa tem outra com o módulo — a ação sobre o item volta 403.
