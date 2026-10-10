# Admin: inscritos do evento (`/admin/eventos/:id/detalhes/:subPage`)

Painel de detalhes de um evento, na parte de inscritos: quem está inscrito,
quem está na lista de espera e a aprovação de menores de idade. Pagamentos e
pedidos de produtos têm documento próprio (`docs/admin-pagamentos.md`); quartos,
equipes e transporte também (`docs/admin-quartos-equipes-transporte.md`).

## Abas do painel

- **Inscritos** (`usuarios`), **Lista de Espera** (`lista-espera`),
  **Financeiro** (`pagamentos`), **Pedidos de Produtos** (`produtos`),
  **Quartos**, **Equipes**, **Transporte**.
- **Quem vê o quê:**
  - Quem administra a igreja do evento (`isAdminDoEvento`, via `useEventRole`)
    vê as sete. É o perfil **efetivo no evento**, não o perfil geral da pessoa —
    quem é admin numa igreja pode ser só financeiro na igreja de outro evento, e
    aí só enxerga Inscritos e Financeiro.
  - Quem não administra (perfil financeiro, ou enquanto o evento ainda carrega)
    vê só **Inscritos** e **Financeiro**. Começar pelo conjunto menor evita
    oferecer uma aba que a API recusaria.
  - Aba de um módulo desligado (Quartos, Equipes ou Transporte) some do menu —
    ver `docs/admin-eventos.md`, seção Módulos.
  - Link direto para uma aba bloqueada volta para a primeira aba liberada,
    assim que o perfil no evento é resolvido.
- **Check-in:** botão "Abrir check-in" na linha das abas, à direita e alinhado
  a elas (no celular, embaixo das abas), só para quem administra o evento —
  abre a tela cheia de check-in (`docs/checkin.md`), fora das abas. Na aba
  Financeiro, o "Esconder valores" fica ao lado dele (`docs/admin-pagamentos.md`).
  Os botões não encolhem: no aperto, quem cede são as abas, que rolam.
- **Cabeçalho compacto:** nome do evento em 18px e, embaixo, o período com
  ícone de calendário; menos respiro no topo da página. Ver
  `docs/layout-e-navegacao.md` (`Header` `compacto`).

Arquivo: `src/pages/admin/events/details/index.tsx`.

## Aba Inscritos

- **Cards de resumo** (`CardsRegistrations`), acima da lista:
  - **Inscritos:** soma de `registered` de todas as regras — conta inscrição,
    não pessoa (quem está em dois grupos entra duas vezes, porque ocupa duas
    vagas).
  - **Vagas restantes** e **Ocupação:** somam só grupos com `capacity`
    preenchida; sem nenhum grupo com teto, os dois cards mostram "—" em vez de
    fingir lotação zero.
  - **Liberações pendentes:** menores de idade com `minorApprovalStatus ===
    'PENDING'` — conta pessoa, não inscrição, porque a autorização vale para
    todos os grupos em que ela estiver.
- **Abas por grupo de inscrição:** dentro da lista, cada grupo do evento vira
  uma aba; a grade filtra só os inscritos daquele grupo.
- **Busca:** por nome, CPF ou nome do crachá, mais busca exata por id — é o que
  a leitura do QR do crachá joga no campo, para achar a inscrição bipada.
- **Filtros** (modal `FilterModal`): período de aniversário (dia/mês, aceita
  intervalo que cruza o fim do ano), cidade, bairro (comparação exata,
  normalizada) e "Servindo" (sim/não/todos). O selo com o número de filtros
  ativos fica sobre o botão "Filtros".
- **Exportar:** CSV, XLSX ou PDF, com escopo (selecionados na grade / filtrados
  na tela / todos os inscritos do evento), agrupamento (nenhum, por equipe, por
  quarto, por grupo de inscrição), ordenação (alfabética ou ordem de
  inscrição), colunas escolhidas à mão ou por modelo pronto (ex.: "PDF por
  equipe", que já vem com líder em destaque, telefone, quarto e dados de
  saúde). Modelo só pré-preenche — tudo continua editável depois de escolhido.
  PDF de equipe filtra aniversariantes do mês do evento quando o modelo pedir.
- **PDF Envelopes / PDF Crachás:** geram a partir da mesma fotografia da grade
  (filtro e seleção aplicados) — documentado em `docs/admin-pdfs.md`.
- **Nova Inscrição** (só quem administra o evento): inscreve uma ou mais
  pessoas já cadastradas no sistema, direto no grupo/regra da aba aberta —
  não cria cadastro novo, só a vincula ao evento. Envia uma inscrição de cada
  vez, em sequência.
- **Ações por linha** (menu de três pontos):
  - **Ver detalhes do usuário** (só quem administra): abre o cadastro da
    pessoa.
  - **Baixar Crachá:** aberto a todo mundo que vê a aba.
  - **Remover do evento** (só quem administra): desvincula a inscrição do
    evento, com confirmação. Não é reversível pela tela.
- **Liberação de menor** (coluna "Liberação"): selo com o estado
  (`NOT_REQUIRED`/"Maior de idade", `PENDING`/"Aguardando liberação",
  `APPROVED`/"Liberado", `REJECTED`/"Recusado"). Clicável só quando há algo a
  decidir (não é `NOT_REQUIRED`) e só para quem administra — abre o modal de
  aprovação.

Arquivos: `src/features/admin/events/components/listUsers.tsx`, `cardsRegistrations.tsx`, `filtersUserModal.tsx`, `modalAddUser.tsx`, `components/exportUsers/*`.

## Aprovação de menor (`ModalGuardianApproval`)

- Aparece para inscrito que precisa de autorização dos pais/responsáveis.
- **Termo assinado:** se já veio pelo sistema, um link para baixar. Se não
  veio — o responsável entregou em papel, mandou foto por fora — o admin pode
  **anexar o termo recebido** diretamente aqui, como se o responsável mesmo
  tivesse enviado; o arquivo (PDF ou imagem) substitui qualquer anterior.
- **Aprovar** só aparece depois de existir um termo (enviado agora ou já
  salvo) — o admin precisa ter algo para conferir antes de liberar; por isso o
  botão some em vez de só ficar desabilitado.
- **Recusar:** pede confirmação com motivo (campo obrigatório) antes de
  enviar. Ao recusar, o motivo anterior (se houver) fica visível até um novo
  envio de termo, que o zera.

Arquivo: `src/features/admin/events/components/modalGuardianApproval.tsx`.

## Aba Lista de Espera

- Mesma estrutura de abas por grupo e a mesma busca (nome, CPF, nome do
  crachá) da aba Inscritos, sem os filtros avançados nem exportação.
- **Ações por linha:**
  - **Registrar no Evento:** abre um modal para escolher **qual inscrito
    confirmado será substituído** pelo da lista de espera, dentro do mesmo
    grupo/regra. A troca é feita pelo servidor conforme as regras de vaga e
    **não pode ser desfeita** pela tela — o modal avisa antes de confirmar.
  - **Remover da Lista de Espera:** tira a pessoa da espera, com confirmação;
    permanente.

Arquivos: `src/features/admin/events/components/listUsersWaitList.tsx`, `modalSendUserEvent.tsx`, `src/features/admin/events/api/putMoveUserFromEvent.tsx`, `deleteUserWaitList.tsx`.

## Ponto encontrado, fora do escopo desta tarefa

- Em `src/features/admin/events/components/listUsers.tsx` (linhas ~543-548) e
  em `modalAddUser.tsx` (bloco `<Select ... />` dentro do `Autocomplete`) há
  trechos de JSX comentados — funcionalidade desligada em silêncio (edição de
  "trabalho"/cargo pela lista, e um seletor alternativo de participantes).
  Vale conferir com quem mantém o código se ainda são necessários.
