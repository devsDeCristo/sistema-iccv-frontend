# Solicitações

Módulo do plano (`REQUESTS`) em que os membros pedem à igreja equipamentos e
melhorias: o louvor pede um pedestal, a mídia pede um cabo. O admin responde
mudando a situação, e o membro acompanha. Regras e rotas da API em
`ic-backend/docs/solicitacoes.md`.

Um pedido tem um ou mais produtos, e o admin pode aceitar só parte deles
(**Aceito parcialmente**).

**Situações** (`STATUS` em `constants.ts`, com rótulo, ícone e cor): Solicitado
(relógio, azul), Em análise (ampulheta, laranja), Aceito (✓, verde), Aceito
parcialmente (`Rule`, verde-azulado: `#0E7C74` no claro, `#2DD4BF` no
escuro, fora das cores do tema) e Recusado (✕, vermelho). `RESPONDIDA` diz quais já
têm resposta: as três últimas.

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

- **Quem vê:** o admin da igreja (e dev/super admin), com o módulo no plano.
  O seletor de igreja do topo escolhe de qual igreja são as solicitações.
- **Abas** (`NavTabs`): Todas e uma por situação, cada uma com ícone
  (`ICONE_DO_STATUS` em `constants.ts`: relógio, ampulheta, ✓ e ✕) e a
  quantidade num chip depois do rótulo (`contagem`).
- **Lista:** quem pediu e o ministério, o pedido (com quantos produtos tem),
  a data e a situação.
  Clicar na linha (ou no botão redondo de olho, no fim dela, com a dica
  "Abrir solicitação") abre a solicitação inteira.
- **Janela da solicitação** (`components/modalDaSolicitacao.tsx`): no topo,
  quem pediu (foto, nome e telefone, para conversar antes de decidir) e, à
  direita, o ministério em chip e a situação atual (na mesma etiqueta do card
  do membro) lado a lado, com a data do pedido embaixo; no celular, essa
  coluna desce para baixo de quem pediu. Depois, o título e a descrição sem
  corte, e os produtos: uma
  caixa com uma linha por produto, clicável inteira para marcar (a linha é o
  `label` da caixa), a quantidade num destaque, o nome inteiro, o botão "Ver"
  da loja (abre sem marcar a linha) e o aceito tingido de verde
  (`ProdutosParaMarcar`, em `listaDeProdutos.tsx`). Embaixo, a situação
  num select (com o ícone de cada uma) e a resposta, já preenchida com a que
  existia; **Salvar** grava tudo junto e só acende quando algo mudou;
  **Cancelar** fecha sem mudar.
- **Produtos e situação andam juntos:** os produtos vêm sempre com uma
  caixa, e o título mostra "X de N aceitos". Marcar decide a situação:
  alguns marcados, **Aceito parcialmente**; todos, **Aceito**; nenhum, volta à
  situação de antes da decisão (Solicitado, se era; senão, Em análise).
  Recusar é escolha do select, não efeito de desmarcar. O select também manda
  nas caixas: Aceito marca todas; Recusado, Solicitado e Em análise desmarcam
  todas; Aceito parcialmente mantém as marcadas. Na parcial, Salvar só acende
  com alguns marcados (nem nenhum, nem todos: a API recusa os dois) e manda os
  ids (`produtosAceitos`). A janela abre com os já aceitos marcados. Com um
  produto só, a parcial some do select.
- **Home do painel:** card de Solicitações para o admin da igreja, como os
  outros módulos.

## Identidade

Ícone `Assignment` e a paleta "Videira" (Jo 15:5) em `CORES_DO_MODULO`. As
duas telas abrem com as cores do módulo (`TemaDoModulo`), e o item aceso da
barra lateral usa a primária dele.

Arquivos: `src/features/solicitacoes/` (api, constantes, tipos, a lista do
painel, a lista de produtos, a janela da solicitação e a de nova
solicitação), `src/pages/admin/solicitacoes/`,
`src/pages/solicitacoes/`.
