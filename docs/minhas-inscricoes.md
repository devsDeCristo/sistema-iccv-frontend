# Minhas Inscrições (`/minhasInscricoes`)

O histórico de inscrições da pessoa: tudo em que ela já esteve e o que está
por vir.

## Regras

- **Tudo entra:** cada evento com inscrição, lista de espera ou compra na loja da pessoa, incluindo os que já acabaram.
- **Ordem e agrupamento:** da mais recente para a mais antiga, **agrupadas por ano** da data do evento. Cada grupo mostra o ano e a quantidade ("3 inscrições").
- **Data:** vem do catálogo de eventos. Um evento que não está no catálogo vai para o grupo **"Sem data"**, no fim.
- **Sem separação por pendência:** a página não divide mais em "Esperando você" / "Em dia". O que está pendente se vê no chip do próprio ingresso e na seção de pendências do modal de detalhes.
- **Sem inscrições:** mostra o aviso "Você ainda não tem inscrições…".

## Formato

- **Ingresso:** na versão normal, horizontal, com canhoto à direita (ver [ingresso.md](ingresso.md)), com a data do evento no lugar do local.
- **Grade:** quantos couberem, com mínimo de 400px cada, a largura de que o ingresso horizontal precisa. Dá 2 por linha em 1440px, 3 em 1920px e 1 no celular, onde o ingresso fica vertical.

Arquivos: `src/pages/myRegisters/index.tsx` e `src/features/myRegisters/components/cards.tsx` (`Cards`).
