# Quartos, equipes e transporte (painel do evento)

Três abas do painel do evento que resolvem o mesmo problema — encaixar
inscritos em lugares com capacidade limitada: hospedagem, equipe de trabalho e
transporte. Quartos e transporte têm exatamente a mesma estrutura (capacidade,
tags e restrição por grupo); equipes trocam a restrição por grupo por líder e
membro.

## Módulos do evento

Cada um dos três é um módulo que pode estar ligado ou desligado no evento
(`data.modules.bedrooms/teams/transport`). Desligado, a aba correspondente some
do painel — não vira aba vazia.

- **Ausente é ligado:** evento sem a chave `modules` (todos os que já existem)
  continua com as três abas.
- **Nasce ligado:** ao criar um evento novo, os três módulos começam ligados.
- **Travado com conteúdo:** o formulário de configuração do evento só permite
  desligar um módulo vazio. Com quarto/equipe/transporte cadastrado, o
  interruptor fica desabilitado e mostra quantos existem — apagar todos é
  pré-requisito para desligar.
- **Quadrante depende de Equipes:** a opção de quadrante só aparece com o
  módulo de equipes ligado, e desligar as equipes desliga o quadrante junto.

Arquivos: `src/features/admin/events/eventModules.ts` (`moduloAtivo`,
`quadranteAtivo`), `src/features/admin/events/components/formEventModules.tsx`,
`src/pages/admin/events/details/index.tsx` (`ABA_DO_MODULO`, `visibleTabs`).

## Estrutura comum (quartos e transporte)

| Campo | Significado |
| --- | --- |
| `name` | nome do quarto/transporte |
| `capacity` | vagas totais |
| `tag` | etiquetas livres (Feminino, Masculino, Familia, Outro) |
| `groupTags` | grupos de inscrição autorizados a ocupar; vazio = aberto |
| `note` | anotação livre, até duas linhas na lista |
| `users` | quem está alocado |

- **Aberto vs. restrito:** sem `groupTags`, qualquer inscrito do evento pode
  ser alocado. Com `groupTags` preenchido, só quem está em um desses grupos
  aparece como opção — e o check-in só aloca ali gente desses grupos (ver
  `checkin.md`, alocação automática de quarto).
- **Participantes oferecidos:** a lista de pessoas para escolher vem dos
  inscritos do evento com grupo de inscrição preenchido
  (`useGetUsers` → `groupsRegistration`); quem não tem grupo não aparece.
- **Capacidade trava a seleção:** sem capacidade definida (`<= 1`), o campo de
  participantes fica desabilitado. Ao atingir o limite, novas seleções são
  recusadas com aviso e as opções restantes ficam desabilitadas na lista —
  exceto quem já está selecionado, que continua podendo ser removido.
- **Reduzir a capacidade abaixo do já alocado é bloqueado**, com a mensagem
  informando quantas pessoas já ocupam o quarto/transporte.
- **Fora do grupo (só ao editar):** se o quarto/transporte é restrito e algum
  ocupante já alocado não pertence a nenhum grupo marcado, aparece um aviso
  listando quem está fora — a tela nunca remove essas pessoas sozinha, é
  preciso desmarcá-las ou reabrir o grupo delas para salvar.

Arquivos: `src/features/admin/events/components/modalBedRoom.tsx`,
`src/features/admin/events/components/modalTransport.tsx`,
`src/features/admin/events/components/listBedRooms.tsx`,
`src/features/admin/events/components/listTransports.tsx`.

## Equipes

Mesma ideia de capacidade, mas com dois papéis em vez de tags de restrição:

- **Líder e membro** são dois campos separados (`usersLeadersId`,
  `usersId`); a mesma pessoa não pode ocupar os dois papéis na mesma equipe —
  quem já é membro fica desabilitado (e marcado "já é participante") na lista
  de líderes, e vice-versa.
- **Capacidade é somada** entre líderes e membros; atingi-la bloqueia novas
  seleções nos dois campos.
- **Obrigatório ter ao menos um líder e um membro** para salvar.
- **PDF de equipes:** botão próprio na aba, gerado no navegador (`@react-pdf`,
  `PdfTeams`), separando líderes de membros por equipe — distinto do PDF de
  crachás/envelopes do servidor (ver `admin-pdfs.md`).
- **Quadrante:** quando ligado no evento, a aba de equipes ganha o botão "Ver
  Quadrante", que leva à tela própria de quadrante (ver `quadrante.md`).

Arquivos: `src/features/admin/events/components/modalTeam.tsx`,
`src/features/admin/events/components/listTeams.tsx`,
`src/components/pdfTeams/index.tsx`.

## Listagem

As três listas seguem o mesmo padrão visual: cartões em grade, busca por nome,
paginação, barra de ocupação (`usados/capacidade`, %) e avatares dos alocados.
Quarto e transporte mostram as tags e, se restritos, um chip com cadeado por
grupo permitido. Editar e excluir ficam em botões diretos no desktop e num
menu (⋮) no celular.

## Quando alguém sai do evento

Não há, no front, uma tela ou aviso dedicado a isso: a lista de participantes
oferecida nos modais vem sempre da consulta atual de inscritos do evento
(`useGetUsers`). Se uma inscrição for cancelada ou removida, essa pessoa deixa
de aparecer como opção nova, mas a tela não confirma nem documenta aqui o que
acontece com uma alocação já salva (quarto/equipe/transporte) — esse
comportamento depende do servidor.
