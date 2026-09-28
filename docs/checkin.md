# Check-in do evento (`/admin/eventos/:id/checkin`)

Tela de dois postos para o dia do evento: recepção (entrega do crachá) e foto
(conferência dos dados e da foto do inscrito). Atualiza em tempo real por
WebSocket, com um refetch periódico como rede de segurança.

## Etapas do check-in

| Status | Significado |
| --- | --- |
| `PENDING` | não chegou |
| `QUEUED` | crachá entregue, na fila do posto de foto |
| `IN_PROGRESS` | sendo atendido no posto de foto agora |
| `DONE` | check-in concluído |

Cada etapa é uma mutação própria (`useDeliverBadge`, `useCallNext` /
`useCallParticipant`, `useCompleteCheckin`), e qualquer uma delas invalida a
fila, os contadores e a busca — quem executou a ação vê o próprio resultado
sem depender só do WebSocket.

Arquivos: `src/features/admin/checkin/types.ts`, `src/features/admin/checkin/api/postCheckin.tsx`.

## Posto 1 — Recepção (`ReceptionStation`)

- **Lista inteira em tela:** a busca (nome, crachá, CPF ou nº de inscrição) e
  o filtro por situação recortam localmente uma lista já carregada por
  inteiro — sem ida ao servidor a cada tecla.
- **Recorte por grupo:** o seletor "Grupo" no cabeçalho da página filtra
  quem aparece nos dois postos e nos contadores.
- **Entregar crachá:** só aparece para quem está `PENDING`. Ao confirmar, o
  quarto é alocado automaticamente (quando o evento tem o módulo de quartos
  ligado) e o resultado abre em modal, não em toast — o operador precisa ler
  o nome do quarto em voz alta para a pessoa no balcão.
  - Sem vaga automática, o modal avisa que não havia quarto disponível e que
    ele precisa ser definido manualmente na aba Quartos.
  - Evento sem o módulo de quartos (`moduloAtivo(evento.data, 'bedrooms')`)
    nem mostra a seção de quarto no modal.
- **Reverter:** a mesma linha que entregou o crachá desfaz a entrega e volta
  o participante para `PENDING`. Quem já passou da fila da foto (`QUEUED` em
  diante) pede confirmação antes, porque reverter descarta o atendimento já
  feito no posto de foto.

Arquivos: `src/features/admin/checkin/components/receptionStation.tsx`,
`src/features/admin/checkin/components/badgeDeliveredModal.tsx`.

## Posto 2 — Foto e conferência (`PhotoStation`)

Fluxo de três passos, feito para dois monitores: o do operador e um segundo
(`ExternalWindow`, uma janela separada do navegador) virado para o inscrito.

1. **Conferir os dados** — formulário de cadastro do inscrito, editável ali
   mesmo se algo estiver errado.
2. **Tirar a foto** — mesma webcam do cadastro de usuário; a foto só é salva
   ao concluir o check-in (upload prévio ao endpoint de foto de perfil).
3. **Concluir** — observações livres do atendimento e o botão que fecha o
   check-in (`DONE`), liberando o participante.

- **Fila (`waiting`) e em atendimento (`inProgress`)** vêm de uma consulta à
  parte (`useGetCheckinQueue`), própria desta tela.
- **"Chamar próximo"** pega o primeiro da fila; **"Chamar" numa linha**
  chama alguém fora de ordem. Só um atendimento por vez nesta tela local —
  chamar de novo fica bloqueado enquanto há alguém em atendimento.
- **"Devolver à fila"** desfaz só o passo do posto de foto (`QUEUED`), sem
  mexer na entrega do crachá.
- **Espera longa:** quem está na fila há 15 minutos ou mais ganha destaque
  visual (contagem em minutos desde a entrega do crachá).
- **Tela do participante:** some do ar se o operador sair da aba/tela de
  check-in — por isso qualquer navegação com o painel aberto pede confirmação
  antes (o atendimento em si continua na fila, só a janela fecha). No
  celular o botão de abrir a tela do participante fica desabilitado, porque o
  navegador do aparelho não mantém duas janelas ao mesmo tempo.

Arquivos: `src/features/admin/checkin/components/photoStation.tsx`,
`src/features/admin/checkin/components/participantDisplay.tsx`,
`src/features/admin/checkin/components/participantSummary.tsx`.

## Tempo real (`useCheckinSocket`)

- Um WebSocket por evento (`/checkin`, namespace autenticado por token) avisa
  as telas quando algo muda; o socket só carrega o aviso — quem busca os
  dados de novo são as rotas REST de sempre.
- **Reconectou → refaz a consulta.** Sem conexão, o chip do cabeçalho mostra
  "Reconectando" e a tela continua funcionando com o refetch periódico (a
  cada 15s).

Arquivo: `src/features/admin/checkin/hooks/useCheckinSocket.ts`.

## Leitura do QR do crachá

O código do QR é o id do inscrito, sem hífen e em hexadecimal maiúsculo
(`buildBadgeCode`) — formato escolhido para caber no modo alfanumérico do QR
e sair com menos módulos, o que facilita a leitura pela câmera.
`parseBadgeCode` aceita esse formato compacto e mais dois legados (uuid com
hífen; `eventId:userId` de crachás antigos), sempre devolvendo o uuid
canônico do inscrito.

- **Onde é lido hoje:** não é nas telas de check-in acima, e sim na aba
  Inscritos do painel do evento (`ListUsers`) — o botão de QR abre um leitor
  de câmera (`QrScannerModal`, decodificação local com `jsQR`) que preenche o
  campo de busca da grade com o id lido. Achar o inscrito ali é o caminho
  para os dados que os postos de check-in usam.
  - Confere se a inscrição pertence a este evento **é a própria lista**: QR
    de outro evento não aparece nela e o operador recebe o aviso de que a
    inscrição não está nesta lista.
- **Onde o código é gerado:** no PDF de crachás (ver `admin-pdfs.md`), pelo
  servidor.

Arquivos: `src/utils/qrcode.ts` (`buildBadgeCode`, `parseBadgeCode`),
`src/pages/admin/events/details/index.tsx` (`handleQrRead`),
`src/components/qrScanner/index.tsx`.
