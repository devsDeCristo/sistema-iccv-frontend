# Agenda de inscrições

Card da coluna da direita da página inicial: um calendário com os dias dos
eventos da pessoa marcados e, embaixo, a lista desses eventos.

## Quais eventos entram

- Eventos do catálogo em que a pessoa está **inscrita** (`present`) ou **na lista de espera** (`waitlist`), vindos de `useGetGroupsByUser`.
- Eventos que já acabaram (`jaAcabou`) ficam de fora.
- A ordem é pela data de início.
- Quando a pessoa está inscrita e na espera no mesmo evento, vale "inscrita".

## Calendário

- **Componente:** `DateCalendar` do MUI X, em modo só leitura, em português (`LocalizationProvider` com `ptBR` local, porque o global não tem idioma).
- **Dias marcados:**
  - todos os dias entre o início e o fim de cada evento, com limite de 62 dias por evento;
  - cada dia é pintado na **cor do próprio evento**;
  - dois eventos no mesmo dia usam a cor do primeiro.
- **Dica ao passar o mouse:** um `Tooltip` do MUI com o nome do evento, ou os nomes separados por "·". Não usar `title` nativo, que demora cerca de 1s para aparecer.
- **Mês inicial:** o mês atual se há evento em andamento, senão o mês do próximo evento. A `key` do calendário renova o mês quando a agenda muda.

## Lista

- **Seções:** "Acontecendo agora" (em andamento) e "Meus eventos" (o resto).
- **Linha:** barra na cor do evento, bloco de data (dia e mês), nome e período.
- **Lista de espera:** vem marcada com "· Lista de espera".
- **Clique:** abre `/eventos/:id`.
- **Sem eventos:** aparece um aviso de que a agenda está vazia.

Arquivo: `src/features/events/components/minhaAgenda.tsx`.
