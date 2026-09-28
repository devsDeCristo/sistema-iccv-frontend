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

## Administração (`/admin/noticias`)

Lista em grade (`NewsAdminList`) com busca por título/chamada e botão "Nova
notícia". Colunas: capa, título/chamada, situação (Publicada/Rascunho),
público (evento restrito ou "Todos"), data de publicação, autor, última
alteração, status do envio no WhatsApp e ações (editar, reenviar, excluir).

- **Situação:** rascunho só é visto pelo admin; publicada aparece no feed.
- **Público:** tooltip explica quem vê — "Só quem está em {evento} —
  inscritos e lista de espera" ou "Todos os usuários".
- **Coluna WhatsApp:** mostra quantos destinos já receberam
  (`enviados/total`), com chip verde quando todos receberam, laranja/neutro
  em andamento e vermelho quando há erro — o tooltip lista os destinos com o
  motivo do erro, ou os destinos alcançados.
- **Reenviar (ícone do WhatsApp):** desabilitado sem grupo marcado na notícia
  ou sem número de WhatsApp conectado (tooltip explica qual dos dois é o
  motivo, apontando "Configurações → Disparadores"). Confirma antes de
  reenviar, avisando que vai para **todos** os grupos marcados, inclusive os
  que já receberam.
- **Excluir:** confirma antes, com o aviso de que sai do feed e não volta.

Arquivos: `src/pages/admin/news/index.tsx`,
`src/features/news/components/newsAdminList.tsx`.

## Formulário (`NewsFormModal`)

Um modal só para criar e editar, dividido em seções.

- **Conteúdo:** título (até 140 caracteres, obrigatório), chamada (até 280,
  opcional, é o resumo do feed) e o corpo em editor rico (Quill), também
  obrigatório.
- **Imagem:** opcional, até 2MB, com arrastar-e-soltar ou seleção de arquivo;
  dá para trocar ou remover a imagem já salva. É a mesma que vai como capa no
  feed e, se houver disparo, como foto anexada no WhatsApp.
- **Quem vê no mural:** select de evento; vazio é aviso geral, e escolher um
  evento restringe a quem está inscrito ou na lista de espera dele.
- **Envio no WhatsApp:** autocomplete múltiplo com os grupos de inscrição que
  têm link de WhatsApp preenchido, agrupados por evento (eventos em teste
  ganham o sufixo "(em teste)"). Fica desabilitado sem número conectado, mas
  os grupos já marcados continuam visíveis. Sem grupo nenhum disponível, um
  aviso aponta para preencher o link na aba de inscrições do evento.
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

Rotas usadas pelo front: `GET /news` (feed), `GET /news/admin` (lista do
admin), `GET /news/whatsapp-groups` (grupos elegíveis para o formulário),
`POST /news` e `PUT /news/:id` (salvar), `POST /news/:id/whatsapp` (reenvio),
`DELETE /news/:id` (excluir).

Arquivos: `src/features/news/types.ts`, `src/features/news/api/getNews.tsx`,
`src/features/news/api/getNewsAdmin.tsx`,
`src/features/news/api/getWhatsappGroups.tsx`,
`src/features/news/api/saveNews.tsx`, `src/features/news/api/resendNews.tsx`,
`src/features/news/api/deleteNews.tsx`.
