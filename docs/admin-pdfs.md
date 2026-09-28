# PDFs do painel do evento

Dois tipos de PDF saem da aba Inscritos do painel do evento: **crachás**
(gerados no servidor) e **envelopes** (gerados no navegador). Os dois têm
modal próprio, mas compartilham boa parte das opções.

## Crachás — gerados no servidor

O crachá é montado no servidor (Puppeteer), que busca a capa e a logo do
evento sozinho e devolve o PDF pronto. O front só monta as seções (quem entra
em cada crachá, agrupadas ou não) e manda para `POST
/events/:eventId/crachas/pdf`. As regras de layout, QR e formatação estão
documentadas no backend, em `ic-backend/docs/crachas-e-pdf.md` — este arquivo
cobre só a tela.

- **Em massa (`ModalGeneratePdf`, tipo `badge`):** aberto pelo botão de PDF de
  crachás na aba Inscritos.
- **Da linha (`ModalGenerateBadge`):** aberto pelo menu de uma linha da grade
  de inscritos, para o crachá de uma pessoa só. Mesmas opções (QR e
  formatação do nome), sem escopo nem agrupamento — é sempre aquele inscrito.
  Recusa gerar se o inscrito não tem nome de crachá cadastrado.
- **Quem fica de fora:** em qualquer um dos dois modais, inscrito sem
  `badgeName` não entra no PDF — só quem tem nome de crachá cadastrado.

### Opções do crachá em massa

| Opção | O que faz |
| --- | --- |
| Escopo | de onde vêm os inscritos: selecionados na grade, filtrados/mostrados na tela, todos do evento, uma ou mais equipes, um ou mais grupos de inscrição, ou "sem nome" (crachás em branco) |
| Crachás sem nome | quantidade de crachás em branco a gerar, sem vincular a ninguém |
| Ordem alfabética | ordena os nomes dentro de cada seção (desligado nos crachás em branco) |
| QR code | inclui o QR do crachá; sem ele, o aviso explica que a entrada não pode ser bipada e a conferência tem que ser manual, na lista |
| Agrupar por | Não agrupar / Grupo de inscrição / Equipe — cada grupo sai em uma folha nova, com o nome do grupo em letra minúscula no cabeçalho de todas as folhas geradas |
| Formatação do nome | Primeira letra maiúscula / MAIÚSCULO / minúsculo |

- **Escopo padrão:** abre em "Somente selecionados" se há linhas marcadas na
  grade, senão em "Apenas os filtrados".
- **Contagem em tempo real:** o título do indicador de progresso já mostra
  quantos crachás serão gerados, descontando quem não tem nome de crachá.

Arquivos: `src/features/admin/events/components/pdfGenerator/modalGeneratePdf.tsx`,
`src/features/admin/events/components/pdfGenerator/modalGenerateBadge.tsx`,
`src/features/admin/events/api/postGenerateBadges.ts`.

## Envelopes — gerados no navegador

Diferente do crachá, o envelope é montado no próprio navegador com
`@react-pdf/renderer`, a partir do evento já carregado com logo e capa em
base64 (baixadas na hora de gerar, não na abertura da tela — custam cerca de
1,5s no servidor).

| Tipo | Conteúdo |
| --- | --- |
| Cartas (`letter`) | com nome — usa formatação do nome e ordem alfabética |
| Fotos (`photo`) | sem nome — não usa formatação nem ordem alfabética |

Compartilha com o crachá o escopo (selecionados/filtrados/todos/equipes/
grupos/em branco), mas não tem opção de QR nem de agrupamento — o envelope não
agrupa porque a arte ocupa a folha inteira e não sobra espaço para título de
seção.

Arquivos: `src/features/admin/events/components/pdfGenerator/modalGeneratePdf.tsx`
(mesmo modal, `type="envelope"`), `src/components/pdfEnvelope`,
`src/components/pdfEnvelopePhoto`.

## Indicador de progresso (`ProgressoDoPdf`)

Os dois modais usam o mesmo indicador enquanto o PDF é montado:

- Cobre o formulário com um véu esmaecido e mostra um anel girando, o título
  ("Gerando N crachás/envelopes") e um relógio contando os segundos.
- **Não é uma porcentagem real:** o servidor não informa progresso, então o
  que se vê é só o tempo passando — inventar um percentual seria enganar.
  Passados 15s, um aviso extra lembra que lotes grandes demoram mais.
- O download começa sozinho quando o blob chega; o modal fica bloqueado
  (`disableClose`) enquanto `isGenerating` está ativo.

Arquivo: `src/features/admin/events/components/pdfGenerator/progressoDoPdf.tsx`.

## PDF de equipes

Não faz parte deste gerador: é um botão à parte na aba Equipes, também gerado
no navegador com `@react-pdf/renderer`, separando líderes de membros por
equipe. Ver `admin-quartos-equipes-transporte.md`.

Arquivo: `src/components/pdfTeams/index.tsx`.
