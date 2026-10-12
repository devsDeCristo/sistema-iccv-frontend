# Planos (`/admin/planos`)

O plano de uma igreja diz quais módulos ela usa no sistema. Regras de servidor: `docs/planos.md` no `ic-backend`.

## Quem acessa

Só **dev e super admin** (`SUPER_ADMIN_ROLES`), como Igrejas. No menu, "Planos" fica logo abaixo de "Igrejas", no grupo Administrador.

## A tela

- **Um cartão por plano:** nome, quantas igrejas usam, a descrição e **todos os módulos**, com ✓ verde nos que o plano libera e ✕ apagado nos que não; no rodapé, "N de 6 módulos", editar e apagar.
- **Apagar** só plano que nenhuma igreja usa: com igreja, o botão fica desligado e a dica diz para trocar o plano delas antes.
- Um aviso no topo lembra que o plano se escolhe em Igrejas e que igreja sem plano não tem módulo nenhum.
- **Novo / editar** (`modalPlano.tsx`): nome, descrição (opcional) e um checkbox por módulo, com o que cada um abre. Editando plano em uso, o texto diz que vale na hora para as igrejas dele e que nada é apagado.

## Módulos

`src/constants/modulos.ts` (`MODULOS`, `ROTULO_DO_MODULO`): Eventos, Notícias, Tesouraria, WhatsApp, Integrações e Cobrança online — na ordem do menu. **Membros não é módulo:** toda igreja tem, com ou sem plano.

## Como o painel respeita o plano

É usabilidade: quem recusa de verdade é o `ModuloGuard` da API.

- **O plano recorta quem trabalha na igreja** (admin, financeiro). **Dev e super admin veem todos os módulos de todas as igrejas**: para eles nada some do menu, nenhuma rota diz "fora do plano" e o seletor de igreja traz todas.
- **Os módulos de cada igreja** vêm na sessão (`church.modulos` em cada vínculo, renovada a cada navegação no painel). Quem junta é `useModulos()` (`src/hooks/useModulos.ts`): `temModulo(m)` (alguma igreja da pessoa tem; sempre sim para dev e super admin) e `igrejaTem(id, m)`.
- **Menu:** item de módulo que nenhuma igreja da pessoa tem no plano sai da régua (`MODULO_DO_LINK` na `sideBar`): Eventos, Notícias, Tesouraria, e em Configurações Pagamentos (Cobrança online), Disparadores (WhatsApp) e Integrações.
- **Rotas:** `RequireRole` aceita `modulo`; sem nenhuma igreja com ele, a tela mostra `ForaDoPlano` ("O plano da sua igreja não inclui o módulo X. Para usá-lo, fale com quem administra o sistema"). Nas telas de um evento (`RequireEventRole`), a igreja daquele evento precisa ter Eventos.
- **Seletor de igreja:** `useIgrejaSelecionada(incluirFinanceiro, modulo)` só oferece as igrejas com o módulo no plano (Tesouraria, Integrações, Disparadores, Pagamentos) — para admin e financeiro.
- **Pagamentos para o super admin:** escolhendo uma igreja sem Cobrança online, a tela avisa que o plano dela não inclui o módulo (a grade de gateways não aparece: a igreja não cobra).
- **`/configuracoes`** abre na primeira tela que a pessoa tem: Pagamentos, WhatsApp ou Integrações (dev e super admin: Pagamentos).
- **Limite:** Eventos e Notícias listam "Todas as igrejas"; uma igreja fora do plano ainda aparece nessas listas quando a pessoa tem outra com o módulo — a ação sobre o item volta 403.
