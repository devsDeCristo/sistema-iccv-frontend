# Solicitações

Módulo do plano (`REQUESTS`) em que os membros pedem à igreja equipamentos e
melhorias: o louvor pede um pedestal, a mídia pede um cabo. O admin responde
mudando a situação, e o membro acompanha. Aprovar pede duas confirmações, em
qualquer ordem: a do pastor (o líder espiritual da igreja) e a de uma
tesouraria; recusar basta um. Regras e rotas da API em
`ic-backend/docs/solicitacoes.md`.

Um pedido tem um ou mais produtos, e pode ser aceito só em parte (**Aceito
parcialmente**): entra o que o pastor e a tesouraria aprovaram em comum.

**Situações** (`ROTULO_DO_STATUS`, `ICONE_DO_STATUS` e `corDoStatus` em
`constants.ts`): Solicitado (relógio, azul), Em análise (ampulheta, laranja),
Aguardando tesouraria (carteira) e Aguardando pastor (igreja), as duas no roxo
de pendente, Aceito (✓, verde), Aceito
parcialmente (`Rule`, verde-azulado: `#0E7C74` no claro, `#2DD4BF` no
escuro, fora das cores do tema) e Recusado (✕, vermelho). `RESPONDIDA` diz quais já
têm resposta: aceita, em parte e recusada; as de "aguardando" ainda não.

## Tela do membro (`/solicitacoes`)

- **Quem vê:** a barra lateral da área do participante mostra Solicitações só
  a quem é membro de uma igreja que tem o módulo no plano
  (`memberChurch.modulos` da sessão). Quem não é membro de nenhuma igreja não
  vê o item. Quem abrir o endereço sem poder pedir lê o motivo, sem o botão.
- **Nova solicitação:** o ministério se escolhe em cards com ícone (lista
  fixa `MINISTERIOS` em `src/features/solicitacoes/constants.ts`, a mesma da
  API), na cor do módulo; depois, o título do pedido, por que precisa e os
  **produtos**: cada um num bloco com nome, quantidade (1 a 999) e, opcional,
  o link da loja (só `http://` ou `https://`, conferido na tela e na API);
  "Adicionar produto" põe outro (até 20, o teto da API) e a lixeira tira (com
  dois ou mais). A igreja não se escolhe: é a de que a pessoa é membro.
- **Obrigatórios:** o asterisco vem do rótulo (`InputLabelProps.required`),
  não do `required` do campo, que acendia o balão nativo "Preencha este
  campo." do navegador.
- **Produtos na tela** (`components/listaDeProdutos.tsx`): "2× Microfone sem
  fio", com o ícone de link para a loja (abre em outra aba). Decidido, o
  aceito ganha um ✓ verde e o não aceito fica riscado e apagado; sem decisão,
  só um ponto.
- **Divisões:** a lista se divide em **Aguardando** (Solicitado e Em
  análise) e **Respondidos** (Aceito, Aceito parcialmente e Recusado), cada uma com o título, a
  quantidade num chip na cor do módulo e a sua grade. Divisão vazia não
  aparece.
- **Lista:** em cada divisão, as solicitações dela, as novas primeiro, numa grade de cards
  (três colunas na tela grande, duas no tablet, uma no celular;
  `components/cardDaSolicitacao.tsx`), no estilo dos cards de mapa do
  easymaps: a situação numa etiqueta pendurada na borda de cima, à
  direita (a cor dela, chapada e escurecida, texto branco, com bolinha) e o fundo com degradê e
  textura de pontinhos na cor da situação, saindo do canto superior esquerdo,
  que acende ao passar o mouse. Depois, o pedido em destaque, o ministério
  num chip na cor do módulo, com o ícone dele (`ministerios.tsx`), e a data, a descrição em até três linhas e os
  produtos (os três primeiros e "+ N produtos"), com o que foi aceito. No rodapé, separado por uma linha, a resposta da igreja ou
  "Ainda sem resposta". Os cards de uma linha têm a mesma altura.
- **Recusada:** o card apaga em cinza (fundo, pontinhos, chip do ministério,
  textos e links, no `text.secondary`, que se lê nos dois temas); só a
  etiqueta "Recusado" fica em vermelho.
- **Contraste da etiqueta:** a cor cheia da situação (sobretudo o laranja de
  "Em análise") não dá contraste com texto branco; por isso a etiqueta vai
  35% mais escura.

## Painel (`/admin/solicitacoes`)

- **Quem vê:** o admin e a tesouraria da igreja (e dev/super admin), com o
  módulo no plano — rota com `ADMIN_AREA_ROLES`, item no menu lateral para os
  dois. O seletor de igreja do topo escolhe de qual igreja são as solicitações,
  e para a tesouraria traz as igrejas em que ela é tesouraria
  (`useIgrejaSelecionada(true)`).
- **Abas** (`NavTabs`): Todas e uma por etapa do trâmite (`ETAPAS` em
  `constants.ts`) — **Novas** (solicitado e em análise), **Em aprovação** (as
  duas de aguardando), **Aceitas** (aceito e em parte) e **Recusadas** —, cada
  uma com ícone e a quantidade num chip depois do rótulo (`contagem`). Uma aba
  por situação davam oito, e os rótulos longos quebravam em duas linhas; a
  situação exata segue no chip de cada linha da lista.
- **Lista:** quem pediu e o ministério, o pedido (com quantos produtos tem),
  a data e a situação.
  Clicar na linha (ou no botão redondo de olho, no fim dela, com a dica
  "Abrir solicitação") abre a solicitação inteira.
- **Janela da solicitação** (`components/modalDaSolicitacao.tsx`): no topo,
  quem pediu (foto, nome e telefone, para conversar antes de decidir) e, à
  direita, o ministério em chip e a situação atual (na mesma etiqueta do card
  do membro) lado a lado, com a data do pedido embaixo; no celular, essa
  coluna desce para baixo de quem pediu. Depois, o título e a descrição sem
  corte, os produtos, a **Aprovação**, a decisão (para quem decide), a
  situação e a resposta.
  - **Produtos** (`ProdutosParaMarcar`, em `listaDeProdutos.tsx`): uma linha
    por produto, com a quantidade num destaque, o nome inteiro, as etiquetas
    do que cada lado já decidiu ("Pastor ✓", "Tesouraria ✗") e o botão "Ver"
    da loja. Para quem está decidindo, cada linha tem uma caixa e é clicável
    inteira (o `label` da caixa; o "Ver" abre sem marcar); para os outros, no
    lugar da caixa vem o resultado (✓, ✗, ou um ponto enquanto não há).
  - **Aprovação:** dois quadros lado a lado, Pastor e Tesouraria, cada um com
    "Aprovou", "Recusou" ou "Aguardando", quem decidiu e a data. Igreja sem
    pastor cadastrado ganha um aviso: sem ele, nada é aprovado.
  - **Sua decisão** (só o pastor ou a tesouraria que ainda não decidiu, com a
    solicitação em aberto — o lado vem de `GET …/solicitacoes/papel`): a
    lista abre marcada com o que o outro lado aprovou, se ele já decidiu
    (senão, com tudo), e a faixa diz quem falta ou que entra só o que os dois
    aprovarem. **Aprovar tudo** / **Aprovar N de M** manda os marcados
    (precisa de ao menos um); **Recusar** pede confirmação ali mesmo ("Recusar
    encerra a solicitação…", **Voltar** / **Sim, recusar**) — o SweetAlert
    abriria por baixo da janela. A resposta escrita vai junto da decisão.
  - **Situação e resposta:** o select de situação só aparece antes de qualquer
    decisão, e só com Solicitado e Em análise (aprovar e recusar são do pastor
    e da tesouraria). A resposta segue editável. **Salvar** grava os dois e só
    acende quando algo mudou; **Cancelar** fecha sem mudar.
- **Home do painel:** card de Solicitações para o admin e a tesouraria da
  igreja, como os outros módulos (`modulosDaIgreja.tsx`), e a tarefa
  "solicitação(ões) esperando resposta" em Precisa de você, que conta também
  as que aguardam o pastor ou a tesouraria.

## Identidade

Ícone `Assignment` e a paleta "Videira" (Jo 15:5) em `CORES_DO_MODULO`. As
duas telas abrem com as cores do módulo (`TemaDoModulo`), e o item aceso da
barra lateral usa a primária dele.

Arquivos: `src/features/solicitacoes/` (api, constantes, tipos, a lista do
painel, a lista de produtos, a janela da solicitação e a de nova
solicitação), `src/pages/admin/solicitacoes/`,
`src/pages/solicitacoes/`.
