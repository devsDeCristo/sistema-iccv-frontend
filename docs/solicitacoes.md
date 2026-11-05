# Solicitações

Módulo do plano (`REQUESTS`) em que os membros pedem à igreja equipamentos e
melhorias: o louvor pede um pedestal, a mídia pede um cabo. O admin responde
mudando a situação, e o membro acompanha. Regras e rotas da API em
`ic-backend/docs/solicitacoes.md`.

É um esqueleto: pedido, situação e resposta.

## Tela do membro (`/solicitacoes`)

- **Quem vê:** a barra lateral da área do participante mostra Solicitações só
  a quem é membro de uma igreja que tem o módulo no plano
  (`memberChurch.modulos` da sessão). Quem não é membro de nenhuma igreja não
  vê o item. Quem abrir o endereço sem poder pedir lê o motivo, sem o botão.
- **Nova solicitação:** o ministério se escolhe em cards com ícone (lista
  fixa `MINISTERIOS` em `src/features/solicitacoes/constants.ts`, a mesma da
  API), na cor do módulo; depois, o que precisa, por que precisa e, opcional,
  o link do produto (só `http://` ou `https://`, conferido na tela e na API).
  A igreja não se escolhe: é a de que a pessoa é membro.
- **Link do produto:** aparece como "Ver produto" (abre em outra aba) no card
  do membro, na lista do painel e na janela de resposta
  (`components/linkDoProduto.tsx`).
- **Divisões:** a lista se divide em **Aguardando** (Solicitado e Em
  análise) e **Respondidos** (Aceito e Recusado), cada uma com o título, a
  quantidade num chip na cor do módulo e a sua grade. Divisão vazia não
  aparece.
- **Lista:** em cada divisão, as solicitações dela, as novas primeiro, numa grade de cards
  (três colunas na tela grande, duas no tablet, uma no celular;
  `components/cardDaSolicitacao.tsx`), no estilo dos cards de mapa do
  easymaps: a situação numa etiqueta pendurada na borda de cima, à
  direita (a cor dela, chapada e escurecida, texto branco, com bolinha) e o fundo com degradê e
  textura de pontinhos na cor da situação, saindo do canto superior esquerdo,
  que acende ao passar o mouse. Depois, o pedido em destaque, o ministério
  num chip na cor do módulo, com o ícone dele (`ministerios.tsx`), e a data, a descrição em até três linhas e o
  link do produto. No rodapé, separado por uma linha, a resposta da igreja ou
  "Ainda sem resposta". Os cards de uma linha têm a mesma altura.
- **Recusada:** o card apaga em cinza (fundo, pontinhos, chip do ministério,
  textos e link, no `text.secondary`, que se lê nos dois temas); só a
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
- **Lista:** quem pediu e o ministério, o pedido, a data e a situação.
  Clicar na linha (ou no botão redondo de olho, no fim dela, com a dica
  "Abrir solicitação") abre a solicitação inteira.
- **Janela da solicitação** (`components/modalDaSolicitacao.tsx`): a
  situação atual (na mesma etiqueta do card do membro), o ministério em chip
  e a data; o título e a descrição sem corte, e o link do produto; quem pediu,
  com foto e telefone, para conversar antes de decidir; e a resposta para quem
  pediu (opcional), já preenchida com a que existia. Embaixo, a situação
  num select (com o ícone de cada uma) e a resposta; **Salvar** grava as
  duas juntas e só acende quando algo mudou; **Cancelar** fecha sem mudar.
- **Home do painel:** card de Solicitações para o admin da igreja, como os
  outros módulos.

## Identidade

Ícone `Assignment` e a paleta "Videira" (Jo 15:5) em `CORES_DO_MODULO`. As
duas telas abrem com as cores do módulo (`TemaDoModulo`), e o item aceso da
barra lateral usa a primária dele.

Arquivos: `src/features/solicitacoes/` (api, constantes, tipos, a lista do
painel, a janela da solicitação e a de nova solicitação), `src/pages/admin/solicitacoes/`,
`src/pages/solicitacoes/`.
