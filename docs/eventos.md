# Eventos (`/historicoEventos`)

O histórico de eventos: todos os que o sistema mostra para a pessoa, passados e
futuros. A home mostra só os abertos; aqui fica tudo.

## Regras

- **Quais aparecem:** todos os eventos do catálogo (`useGetEvents({})`), **menos os inativos** (`status === 'INACTIVE'`), que não aparecem para o usuário nesta página.
- **Ordem e agrupamento:** do mais recente para o mais antigo, pela data de início, **agrupados por ano**, com a quantidade ("3 eventos").
- **Situação da pessoa:** "Inscrito" ou "Lista de espera", vinda de `useGetGroupsByUser`. Quem está inscrito e na espera no mesmo evento aparece como inscrito.

## Formato

- **Cartaz:** o mesmo da página inicial (`CartazDoEvento`, exportado de `src/features/events/components/cards.tsx`), com capa, selos, data, local e botão.
- **Grade:** 2 por linha a partir de `md`, 1 no celular.
- **Clique:** abre a página do evento.

## Menu e rota

- **Menu:** item "Eventos" no menu lateral do usuário, abaixo de "Minhas Inscrições" (`src/components/sideBar/index.tsx`).
- **Rota:** `/historicoEventos`. O `/eventos` **continua redirecionando para `/home`**, porque é um endereço antigo que tem gente com ele salvo. Por isso a página não usa `/eventos`.
- **Rota nova com o app aberto:** o roteador (`createBrowserRouter`) é montado uma vez, quando o app carrega. Uma rota adicionada com o app aberto só passa a valer depois de recarregar a página inteira. Antes disso, a rota cai no `*` → `/login` → `/home`.

Arquivos: `src/pages/events/historico/index.tsx` e `src/pages/events/routes/index.tsx`.
