# Notícias

Mural de avisos: um feed curto na tela de eventos e uma administração completa
para criar, editar, excluir e disparar no WhatsApp. As regras de servidor
(igreja dona, disparo automático, sessão do WhatsApp) estão em
`ic-backend/docs/noticias-e-whatsapp.md`; este arquivo cobre as duas telas.

## Feed (`NewsFeed`, tela de eventos)

- Aparece ao lado da lista de eventos, em coluna estreita — é recado curto,
  não a tela principal.
- Carrega até 6 notícias (`LIMITE_DO_FEED`) por `useGetNews`, sempre as já
  publicadas, mais recentes primeiro.
- Cada item mostra a data (`dataDaNoticia`: "Hoje, HH:mm", "Ontem", ou a data
  por extenso), o evento associado quando houver (notícia restrita a um
  evento), o título e a chamada, cortados em duas linhas cada.
- Sem notícia nenhuma, mostra o aviso "Nenhuma notícia por aqui ainda...".
- Clicar num item abre o texto inteiro em modal (`NewsModal`), renderizado
  pelo mesmo viewer do editor rico (Quill) usado no formulário.

Arquivos: `src/features/news/components/newsFeed.tsx`,
`src/features/news/components/newsModal.tsx`, `src/features/news/utils.ts`
(`dataDaNoticia`).

- **De qual igreja:** o aviso para todos mostra o nome da igreja de onde saiu, na linha da data (feed e modal). O anúncio de evento mostra o evento.

## Administração (`/admin/noticias`)

**Seletor de igreja (multitenant).** Na barra de busca há um seletor de igreja
(`useIgrejasDoSeletor`, a mesma regra do filtro de admin/usuários):

- super admin e dev escolhem entre todas as igrejas;
- quem administra várias escolhe entre as suas;
- com uma só, o seletor fica escondido.

O padrão é **"Todas as igrejas"**, todas as que a pessoa alcança; escolher uma
recorta a lista e o calendário. Na lista, a linha de baixo do título mostra a
igreja de cada notícia.

Lista em grade (`NewsAdminList`) com busca por título/chamada e botão "Nova
notícia". São quatro colunas, só o necessário para decidir o que fazer com a
notícia:

| Coluna | O que mostra |
| --- | --- |
| **Notícia** | miniatura da capa, título e, embaixo, o público ("Todos os usuários" ou "Só: {evento}") |
| **Situação** | chip Publicada, Agendada ou Rascunho, com a data de publicação embaixo (a do último disparo agendado, que conta como nova publicação) |
| **Disparadores** | um chip por canal por onde a notícia sai (ver abaixo) |
| ações | editar, reenviar no WhatsApp e excluir |

- **Colunas que saíram (09/10/2026):** capa (foi para dentro da coluna
  Notícia), público (virou a linha de baixo do título), publicada em (foi para
  a coluna Situação), autor e última alteração. Era informação que não muda a
  decisão, e a tabela não cabia ao lado do calendário.
- **Situação:** rascunho só é visto pelo admin; publicada aparece no feed;
  **Agendada** (publicada sem `publishedAt`) espera o primeiro horário para
  entrar no mural.
- **Disparadores:**
  - **Mural:** verde quando a notícia está no ar e cinza quando ainda não
    está. O tooltip diz quem vê.
  - **WhatsApp N/M:** só aparece com destino marcado, contando grupos de
    evento e links avulsos (`destinosDaNoticia`). Verde quando todos
    receberam, vermelho com erro e neutro em andamento. O tooltip lista os
    destinos, ou o motivo de cada erro.
- **Reenviar (ícone do WhatsApp):** desabilitado sem grupo marcado na notícia
  ou sem número de WhatsApp conectado (tooltip explica qual dos dois é o
  motivo, apontando "Configurações → Disparadores"). Confirma antes de
  reenviar, avisando que vai para **todos** os grupos marcados, inclusive os
  que já receberam.
- **Excluir:** confirma antes, com o aviso de que sai do feed e não volta.

Arquivos: `src/pages/admin/news/index.tsx`,
`src/features/news/components/newsAdminList.tsx`.

### Calendário de disparos (`CalendarioDeDisparos`)

Fica **ao lado da lista** em tela larga (`lg`, coluna de 352px, com o
calendário em cima e os disparos do dia embaixo), e abaixo dela em tela menor.
O `DateCalendar` do MUI tem 320px fixos e, com o cartão ocupando a largura
toda, encostava no canto. Por isso ele ocupa a largura disponível até 460px,
centralizado e com os dias espalhados. A partir de `sm` os dias crescem de 36
para 44px; na coluna estreita (`lg`) voltam a 36. A legenda fica centralizada
embaixo. É um calendário do mês (`DateCalendar` do MUI X)
com uma bolinha em cada dia que teve disparo: **verde** para o que já saiu no
WhatsApp e **azul** para o que está agendado. Passar o mouse mostra o título
das notícias do dia.

Ao lado fica a lista do dia escolhido (hoje, ao abrir), com:

- o horário;
- a notícia;
- a origem: publicação, reenvio ou agendado; para agendados, "Uma vez" ou "Toda semana";
- falhas e grupos sem link, quando houver;
- um chip: "Enviado · N grupo(s)", "Não saiu" ou "Agendado".

Busca um mês por vez (`GET /news/calendar`, chave `GET_NEWS_CALENDAR`), e é
atualizado ao salvar, reenviar ou agendar. O histórico só tem disparos a partir
de 09/10/2026, quando passou a ser gravado.

Arquivos: `src/features/news/components/calendarioDeDisparos.tsx`,
`src/features/news/api/getNewsCalendar.tsx`.

## Formulário (`NewsFormModal`)

Um modal só para criar e editar, em **4 passos** (`Stepper` do MUI):

1. **Conteúdo:** a igreja, o texto e a imagem.
   - **Igreja da notícia** é a primeira pergunta, como "Igreja do evento" na
     criação de evento. É obrigatória e começa vazia, sem sugestão; não deixa
     avançar sem ela. Com uma igreja só, o campo fica escondido e vale ela. Na
     **edição** o seletor também aparece, com a igreja atual, e dá para trocar.
     Trocar a igreja limpa o evento do público e os grupos, que eram da
     anterior.
2. **Disparadores:** por onde a notícia sai, em cartões (`CartaoDeDisparador`).
   - **Sistema:** o mural, sempre ligado, com o "Quem vê no mural".
     - **Igreja (multitenant):** aparece como texto ("Sai em nome de …"). Ela
       é perguntada no passo Conteúdo (ver abaixo).
     - **Listas recortadas:** os eventos do público e os grupos de WhatsApp
       oferecidos são só os da igreja da notícia. O backend confere de novo.
   - **WhatsApp:** com chave de ligar. Ligado, mostra o aviso de disparador,
     os grupos de evento e os links avulsos. Desligado, salva sem grupo
     nenhum.
3. **Agendamento:** "Imediatamente" (publica e envia ao salvar) ou "Agendar".
   - **Agendar:** pede ao menos um horário. A notícia vai como `scheduled` e
     entra no mural no primeiro horário.
   - **Imediatamente:** apaga os horários que a notícia tinha.
   - **Horário "uma vez" que já passou** (`nextRunAt` nulo) aparece
     **desabilitado**, como histórico: "Disparado em …", ou "Não disparou"
     quando o servidor estava fora do ar. Ele não é validado (antes travava a
     edição com "a data precisa ser futura"), não tem lixeira e não vai no
     salvar; o backend o mantém. Com só histórico, a notícia abre em "Agendar"
     e salva sem cobrar horário novo.
4. **Publicação:** o resumo (título, imagem, mural, WhatsApp, quando) e o
   interruptor de rascunho. Rascunho não publica nem envia, nem nos horários
   agendados.

Navegação:

- **Criação:** "Próximo" só avança com o passo pronto. O que falta fica
  marcado no campo, e o passo fica vermelho no topo. Dá para voltar a um passo
  já feito clicando nele.
- **Edição:** os passos são livres (clica e vai), e o "Salvar" fica sempre
  disponível. Mudar só o título não obriga a percorrer tudo.
- **Ao salvar:** confere todos os passos e volta para o primeiro com problema.
- **Revisão:** o último passo resume título, imagem, público, grupos e
  agendamentos antes de criar.
- **Altura mínima:** o modal tem altura mínima para não "pular" entre passos.

As seções de cada passo:

- **Conteúdo:** título (até 140 caracteres, obrigatório), chamada (até 280,
  opcional, é o resumo do feed) e o corpo em editor rico (Quill), também
  obrigatório.
- **Imagem:** opcional, até 2MB, com arrastar-e-soltar ou seleção de arquivo;
  dá para trocar ou remover a imagem já salva. É a mesma que vai como capa no
  feed e, se houver disparo, como foto anexada no WhatsApp.
- **Quem vê no mural:** select de evento; vazio é aviso geral, e escolher um
  evento restringe a quem está inscrito ou na lista de espera dele.
- **Aviso de disparador:** consulta o número **da igreja da notícia**
  (`useWhatsappConectado(igrejaDaNoticia)`), e não "a igreja de quem está
  logado". Sem isso, o aviso não aparecia para o super admin nem para quem
  administra várias igrejas. Aparece mesmo com o WhatsApp desligado, e há um
  aviso próprio para notícia sem igreja.
  Sem número de WhatsApp conectado, o passo do
  WhatsApp abre com um aviso no topo e o botão "Configurar", que leva a
  Configurações → Disparadores → WhatsApp. O aviso diz que nada sai, nem nos
  agendamentos, e que a notícia pode ser salva do mesmo jeito.
- **Outros grupos (link):** campo livre, abaixo do select, para colar o link de
  convite de grupos que não são de inscrição de evento.
  - Cada link vira um chip; colar vários, um por linha, também vale.
  - O `?mode=...` do "copiar link" é removido.
  - O que não é link de grupo (`ehLinkDeGrupo`) é recusado com mensagem.
  - Os links contam como destino no resumo, na revisão e na lista do admin (`destinosDaNoticia`).
- **Envio no WhatsApp:** autocomplete múltiplo com os grupos de inscrição que
  têm link de WhatsApp preenchido, agrupados por evento (eventos em teste
  ganham o sufixo "(em teste)"). Fica desabilitado sem número conectado, mas
  os grupos já marcados continuam visíveis. Sem grupo nenhum disponível, um
  aviso aponta para preencher o link na aba de inscrições do evento.
- **Agendar disparos (`AgendamentosDaNoticia`):** quantos agendamentos
  quiser, cada um de um tipo:
  - **"Uma vez":** data e hora (`datetime-local`).
  - **"Toda semana":** dias da semana em botões D S T Q Q S S e horário. Exemplo: toda terça às 12:00.

  Na hora marcada a notícia sai de novo para todos os grupos marcados. Sem
  grupo marcado, um aviso diz que não há para onde enviar. Cada agendamento
  salvo mostra o próximo disparo.
  - **Conferência antes de salvar:** data no passado, nenhum dia escolhido ou
    sem horário pinta a linha de vermelho e não deixa salvar. A conferência
    vem antes de gravar a notícia: se só os agendamentos falhassem depois, a
    notícia nova já estaria gravada, e salvar de novo criaria outra.
  - **Ordem de gravação:** primeiro a notícia, depois os agendamentos
    (`PUT /news/:id/schedules`, com o id que a criação devolve).
  - **Rascunho com agendamento:** é publicado no primeiro horário agendado. O
    texto da publicação e o resumo do rodapé dizem isso.
- **Publicação:** interruptor Publicada/Rascunho. Como rascunho, nada é
  enviado; publicando, sai no mural e, se houver grupos marcados e número
  conectado, também no WhatsApp.
- **Resumo do envio (rodapé):** frase que muda conforme o estado — sem
  grupo marcado, sem número conectado, como rascunho, já publicada (aviso de
  que salvar não reenvia, é preciso usar o "Reenviar" da lista) ou a
  contagem de grupos que vão receber ao salvar.

Arquivo: `src/features/news/components/newsFormModal.tsx`.

## Tipos e API

| Campo (`News`) | Observação |
| --- | --- |
| `event` | `null`/ausente é aviso geral; presente restringe ao evento |
| `isPublished` | só vem preenchido na lista do admin |
| `groups` | destinos de WhatsApp desta notícia, cada um com `sentAt`/`error` |
| `schedules` | agendamentos de disparo (`NewsSchedule`), com `nextRunAt`; só na lista do admin |

Rotas usadas pelo front: `GET /news` (feed), `GET /news/admin` (lista do
admin), `GET /news/whatsapp-groups` (grupos elegíveis para o formulário),
`POST /news` e `PUT /news/:id` (salvar), `POST /news/:id/whatsapp` (reenvio),
`PUT /news/:id/schedules` (agendamentos), `GET /news/calendar` (calendário),
`DELETE /news/:id` (excluir).

Arquivos: `src/features/news/types.ts`, `src/features/news/api/getNews.tsx`,
`src/features/news/api/getNewsAdmin.tsx`,
`src/features/news/api/getWhatsappGroups.tsx`,
`src/features/news/api/saveNews.tsx`, `src/features/news/api/resendNews.tsx`,
`src/features/news/api/deleteNews.tsx`.
