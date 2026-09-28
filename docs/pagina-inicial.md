# Página inicial (`/home`)

A primeira tela de quem entra na área do usuário. Mostra os ingressos ativos,
os eventos abertos, a agenda de inscrições e as notícias.

## Layout

- **Topo:** a faixa de boas-vindas (`WelcomeHero`).
- **Duas colunas em flexbox**, e não em Grid:
  - **Esquerda (`flex: 1`):** filtro de igrejas, "Meus Ingressos Ativos" e o catálogo de eventos.
  - **Direita (largura fixa de 372px):** a agenda (`MinhaAgenda`) e as notícias (`NewsFeed`). 372px é a largura do calendário (340) mais o padding do card.
- **Celular:** as colunas se empilham, e a da direita desce para baixo dos eventos.

## Filtro de igrejas

- **Quando aparece:** só quando o catálogo tem eventos de mais de uma igreja.
- **Posição:** no topo da coluna da esquerda.
- **O que filtra:** ao mesmo tempo os ingressos ativos e os eventos.
- **Escolha salva:** fica no `localStorage`, na chave `home:igreja`. Uma igreja salva que não está mais no catálogo vale como "Todas as igrejas".
- **Contagem ao lado de cada igreja:** eventos abertos, contados no catálogo inteiro, sem o recorte atual.

## Meus Ingressos Ativos

- **Quais aparecem:** ingressos de eventos em andamento ou futuros, nunca histórico, ordenados pela data do evento.
- **Quais ficam de fora:** eventos que não estão no catálogo, porque sem data não dá para saber se já passaram.
- **Formato:** ingresso na versão compacta (ver [ingresso.md](ingresso.md)), numa grade com quantos couberem e mínimo de 240px cada.
- **Sem ingressos:** o título continua, com um aviso. O texto muda quando há igreja filtrada.
- **Carregando:** aparece só o título, para o aviso de vazio não piscar.

Arquivo: `src/features/events/components/meusIngressos.tsx`, renderizado pelo catálogo logo abaixo do filtro.

## Catálogo de eventos

- **Quais aparecem (`eventosAbertos`):** status `ACTIVE`, e também `TEST` para admin, que ainda não acabaram, do mais próximo para o mais distante.
- **Duas seções:**
  - **"Acontecendo agora":** eventos em andamento.
  - **"Próximos eventos":** o resto, por data.
- **Evento encerrado:** não aparece em lugar nenhum da home. O histórico fica em Eventos (ver [eventos.md](eventos.md)).
- **Sem eventos:** o título "Próximos eventos" continua, com o aviso `SemEventos`, que tem texto próprio quando há igreja filtrada.
- **Cartaz (`CartazDoEvento`):**
  - capa com filtro e véu, a logo e selos de contagem ("Faltam N dias", até 45 dias) e de situação ("Inscrito" / "Lista de espera");
  - data, local e o botão "Ver detalhes" ou "Ver meu evento";
  - é o mesmo componente usado na página Eventos.

Arquivo: `src/features/events/components/cards.tsx` (`Cards`, `CartazDoEvento`).
