# Notificações (sininho)

O sininho fica na barra do topo, na pastilha ao lado do tema e da conta, nas
duas áreas (usuário e painel). Quem recebe cada aviso é decidido no backend
(`docs/notificacoes.md` do servidor).

## Comportamento

- **Número:** as não lidas (`GET /notificacoes/nao-lidas`), no `Badge`
  vermelho. Pergunta a cada 60s e quando a aba volta a ficar em foco
  (`refetchOnWindowFocus`, desligado no resto do projeto).
- **Lista:** só carrega com o sininho aberto (`GET /notificacoes`, as 30 mais
  recentes). Cada aviso tem o ícone e a cor do módulo
  (`ICONE_DO_MODULO`/`CORES_DO_MODULO`: secundária no ícone, terciária no ponto
  de não lida), título (negrito se não lida), texto e "há X tempo" (data
  completa no `title`). Vazia: "Nenhum aviso por aqui."
- **Abrir não lê nada.** Clicar num aviso marca só ele como lido, troca a
  igreja do painel para a do aviso (só nos avisos de admin) e abre o destino.
  **Marcar todas como lidas** lê todas as não lidas, inclusive as que não
  couberam na lista.

## Destinos

| Aviso | Módulo | Leva para |
| --- | --- | --- |
| Novo pedido de membro | Membros | `/admin/membros?aba=pedidos` (troca a igreja) |
| Pedido aceito ou recusado | Membros | `/home` |
| Nova solicitação | Solicitações | `/admin/solicitacoes` (troca a igreja) |
| Solicitação respondida | Solicitações | `/solicitacoes` |
| Notícia | Notícias | `/home` (o mural) |
| Novo evento | Eventos | `/eventos/:id` |

## Código

- `src/components/sininho/index.tsx`: o botão e o menu (`DESTINO` mapeia tipo →
  módulo e rota).
- `src/features/notificacoes/api.ts`: `useNaoLidas`, `useNotificacoes(aberto)`
  e `useMarcarLidas` (invalida as duas consultas).
