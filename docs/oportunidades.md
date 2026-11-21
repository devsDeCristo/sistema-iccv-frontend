# Oportunidades

Módulo do plano (`OPPORTUNITIES`) de vagas de emprego. O admin da igreja
publica vagas (na própria igreja ou na empresa de um membro), cada uma com o
seu formulário de candidatura. Os membros se candidatam, e o admin vê as
candidaturas e as exporta para mandar a quem ofereceu a vaga. Regras, rotas
e formato do formulário em `ic-backend/docs/oportunidades.md`.

## Vitrine do membro (`/oportunidades`)

- **Quem vê:** a barra lateral da área do participante mostra Oportunidades
  só a quem é membro de uma igreja com o módulo no plano
  (`memberChurch.modulos` da sessão). Quem abrir o endereço sem isso lê o
  motivo, e a tela nem consulta a API.
- **Filtros** (na barra de cima, no padrão das listas do sistema), feitos
  na tela sobre a lista que a API já entrega:
  - busca por nome ("Pesquisar vaga por nome"), que procura no título e em
    quem oferece, sem diferenciar acento nem maiúsculas;
  - "Publicada entre" (`SeletorDeIntervalo`, só datas, sem futuro). As duas
    pontas podem ficar vazias ("qualquer data" e "hoje"), e o fim vale o
    dia inteiro.
  - Se nada passar pelos filtros, a tela diz isso.
- **Agrupamento:** pelo mês de publicação ("Novembro de 2026 · 3 vagas"),
  das mais novas para as mais antigas, com o mesmo título de grupo do
  histórico de eventos (que agrupa por ano).
- **Cards** (`components/cardDaVaga.tsx`), o card exclusivo do módulo (como
  o ingresso é o de Eventos e a folha do talão, o de Solicitações), na mesma
  grade (3 colunas na tela grande, 2 no tablet, 1 no celular): **a página
  de "contrato de trabalho" da carteira**.
  - o papel é o do ingresso de
    Eventos nos dois temas (`background.paper`, com a `sombraDeCartao` de
    `components/listPageStyles.ts`: `drop-shadow` e, no escuro, um contorno
    claro de 1px), com um **fundo de segurança** de arcos finos na cor do
    módulo;
  - no lugar da foto 3x4, um **crachá pequeno** preso no canto, um pouco
    torto: a miniatura do crachá dos detalhes, com a fita e o mosquetão
    saindo da borda de cima da página, o rasgo, a logo (`contain` sobre um
    quadrado branco, como a `LogoDaVaga`; sem imagem, a maleta `Work`, que fica só para a logo que falta) e um
    friso embaixo. A face fica um tom abaixo do card
    (`background.default`), como card dentro de card. A fita, a faixa e o ícone
    usam a **cor da logo** (`vaga.cor`; sem ela, a do módulo), como o crachá;
  - "CONTRATO DE TRABALHO" e, anotados em fonte de máquina sobre linhas
    pontilhadas, **Empregador** (quem oferece), **Cargo** (o título),
    **Local** ("—" sem local) e **Remuneração** ("A combinar" sem salário);
  - no pé, a linha da **assinatura do empregador**, em branco, e a
    situação (`EtiquetaDaVaga`): "Encerrada" (vermelho, e a página toda
    apaga), "✓ Candidatura enviada" (cor do módulo) ou o prazo quando está
    acabando ("Encerra hoje", "Faltam N dias", em laranja); fora isso, só
    "até dd/mm" discreto;
  - sem a descrição nem a data de publicação: ficam no crachá. As
    encerradas só aparecem para quem se candidatou, para ainda poder ver e
    retirar;
  - o card inteiro é clicável (também com Enter e espaço) e abre o crachá;
    no hover, a página sobe 2px e ganha um contorno na cor do módulo. Com
    `rodape`, o pé é outro e, sem `onAbrir`, o card não é clicável (é como
    "Minhas propostas" o usa).
- **Detalhes** (`components/modalDetalhesDaVaga.tsx`): um **crachá de
  "estamos contratando"** que substitui o modal. O `Dialog` fica
  transparente, sem cabeçalho nem rodapé: só aparece o crachá, pendurado
  numa fita, sobre o fundo escurecido. Fecha no X do crachá, no Esc ou
  clicando fora.
  - De cima para baixo: fita e mosquetão, o rasgo do crachá, a logo e quem
    oferece, "ESTAMOS CONTRATANDO!" (ou "VAGA ENCERRADA"), o selo "VAGA"
    entre traços e o título.
  - Depois, a descrição **cortada em 5 linhas** (a última esmaece) e a ficha
    em linhas, rótulo à esquerda e valor à direita: local, salário,
    candidaturas até e publicada em ("Quem oferece" saiu: a empresa já está
    no topo). As linhas em branco ficam como foram escritas; as listas
    perdem o recuo grande do Quill.
  - **Ver mais** (só quando o texto passa do corte) **vira o crachá**
    (`rotateY`, 0,6s; sem animação com `prefers-reduced-motion`). O verso
    tem o mesmo tamanho da frente: o letreiro "Sobre a vaga", o título e a
    descrição inteira. Se ela não cabe, vira **páginas**, com ‹ 1 / 3 › embaixo.
    As páginas são colunas CSS da largura da área (`column-width`, em
    `DescricaoPaginada`): o navegador quebra o HTML onde cabe, sem cortar
    linha, e trocar de página desliza as colunas. "Voltar ao crachá" desvira.
    A face escondida fica `inert`, fora do teclado e do leitor de tela.
    Abrir outra vaga recomeça na frente e na página 1.
  - Embaixo, o botão **Candidatar-me** (ou **Ver candidatura**), dentro do
    crachá.
  - Na tela grande, um segundo crachá, do mesmo tamanho do da frente e na
    cor da logo, fica atrás, inclinado e meio escondido (`translateX(18%)
    rotate(6deg)`, como a pasta da prancheta; o par vai 7% para a esquerda
    para ficar centrado), só com "OPORTUNIDADE" na vertical, na cor da fita escurecida, como marca d'água. Ao abrir, o
    crachá balança uma vez, a não ser com `prefers-reduced-motion`.
  - **Cores:**
    - o papel é o fundo do modal no tema (`background.paper`, o mesmo da
      prancheta de Solicitações; um grafite fixo ficava cinza no escuro);
    - a fita, o crachá de trás, o botão e o título pegam a **cor da logo**
      (`vaga.cor`);
    - o título passa por `legivelSobre`, que escurece ou clareia a cor até
      dar 4,5:1 com o papel;
    - o texto do botão é branco ou quase preto, o que contrastar melhor
      (`textoSobre`);
    - sem cor (vaga sem imagem, logo preto e branco ou imagem subida antes
      disso), vale o laranja do módulo.
  - **De onde vem a cor:** `corDaImagem.ts` lê os pixels da logo quando o
    admin a escolhe, com o arquivo ainda no navegador (ler a imagem do
    bucket esbarraria no CORS). Reduz para 48×48, ignora fundo branco,
    preto e cinza, e fica com o balde de cor mais saturado e frequente. A
    cor vai junto no upload da imagem.
- A vaga aberta fica no endereço (`?vaga=<id>`): a notificação de vaga nova
  e o voltar da candidatura caem direto no modal dela.

## Propor uma vaga (membro)

Qualquer membro que vê as vagas pode propor uma. Ela só vai ao ar depois que
o admin aprova.

- **Onde:** o botão **Propor vaga** no cabeçalho da vitrine, e a aba
  **Minhas propostas** ao lado de **Vagas** (`?aba=propostas`, onde cai o
  aviso de proposta aprovada ou recusada).
- **Página da proposta** (`pages/oportunidades/proposta.tsx`): em
  `/oportunidades/propor` para propor e `/oportunidades/propostas/:id` para
  editar a pendente. É o mesmo formulário do admin (`FormularioDaVaga`: a
  vaga, o salário, a data, a descrição, o formulário de candidatura com a
  prévia). No topo, o aviso: a proposta vai para o admin, que pode ajustar,
  aprovar ou recusar, e só aparece aos membros aprovada. Aprovada, quem
  propôs vê nome, celular, e-mail, currículo e respostas dos candidatos,
  para usar só no processo da vaga. Decidida, a página não edita mais e diz
  isso.
- **Minhas propostas** (`components/minhasPropostas.tsx`): os **mesmos
  cards da vitrine** (a página da carteira), na mesma grade, com o pé
  trocado pela situação da proposta e as opções dela. O card em si não abre
  nada: quem age são os botões do pé.
  - **Pendente:** "Aguardando aprovação" (laranja) e os botões **Editar** e
    **Retirar** (com confirmação).
  - **Aprovada:** "✓ Aprovada" (verde), ou "Encerrada" (cinza) quando a vaga
    fechou, e o botão **"N candidaturas ›"**, que abre a mesma página do
    admin (`/oportunidades/propostas/:id/candidaturas`), com a etapa, a
    anotação, o currículo pela rota da proposta e a exportação.
  - **Recusada:** "Recusada" (vermelho) e o motivo embaixo (ou "Recusada sem
    motivo informado").
  - Sem nenhuma, um convite para propor.

## Candidatura (`/oportunidades/:id/candidatura`)

`pages/oportunidades/candidatura.tsx`. Página, e não modal: o formulário pode
ser longo, e no celular o modal fica apertado.

- **Topo:** um cartão com a imagem, o título, quem oferece, o local e o
  salário.
- **Seus dados:** nome, e-mail e celular, vindos do perfil (`useGetMe`), com
  link para editar. Sem celular, a página pede o cadastro no perfil e não
  deixa enviar.
- **Campos**, na ordem que o admin definiu:
  - currículo: botão de arquivo, só PDF até 5 MB, conferido antes de subir;
  - pretensão salarial: valor ou mínimo, e máximo opcional;
  - mensagem e resposta livre: texto com contador;
  - cada rede social: um campo de link com exemplo;
  - seleção: select;
  - opção única: radio;
  - caixas de marcação: checkboxes.
- Obrigatório leva o asterisco. Enquanto falta algum, o botão fica desligado
  e a página diz o que falta. Quem confere de verdade é a API, e a mensagem
  dela vira o toast.
- Antes do envio aparece o aviso de privacidade.
- **Já se candidatou:** a página mostra o que foi enviado e o botão
  **Retirar candidatura** (com confirmação). Para mudar, retira e manda de
  novo.
- Quem não é membro, ou é de igreja sem o módulo, lê o mesmo motivo da
  vitrine, e a página nem consulta a API. Vaga encerrada em que a pessoa não
  se candidatou: "não está mais recebendo candidaturas".

## Painel (`/admin/oportunidades`)

- **Quem vê:** só o admin da igreja (e dev/super admin), com o módulo no
  plano: rotas com `ADMIN_ROLES`; a tesouraria não tem o item no menu. O
  seletor de igreja do topo (`ChurchScopeBar` + `useIgrejaSelecionada`)
  escolhe de qual igreja são as vagas.
- **Abas** (`NavTabs`, no endereço como `?aba=`): **Pendentes** (as
  propostas dos membros), **Abertas**, **Encerradas** (a vencida entra aqui)
  e **Recusadas**, com a quantidade de cada uma. Sem aba no endereço, abre
  em Pendentes se houver alguma; senão, em Abertas. **Nova oportunidade**
  fica ao lado das abas.
- **Lista** (`components/listaDaIgreja.tsx`, só do painel;
  as ações de cada linha vêm de quem usa): vaga (a logo, o título e, com
  ícone, quem oferece, local e salário; na
  recusada, o motivo), candidaturas (botão com a contagem; "—" fora da
  aprovada), data com quem publicou ("proposta por Fulano" na proposta),
  data final com o prazo embaixo na aberta ("Faltam 3 dias", em laranja
  quando falta uma semana ou menos) e situação em chip: Pendente (laranja), Aberta
  (verde), Encerrada e Vencida (cinza), Recusada (vermelho). Ações na linha:
  - **pendente:** **Revisar e editar** (a página da vaga, com o aviso de
    que é proposta), **Aprovar** (confirmação: avisa os membros, e quem
    propôs passa a ver os candidatos) e **Recusar** (janela com motivo
    opcional, que vai para quem propôs);
  - **aprovada:** **Editar**; **Encerrar**/**Reabrir**, sem confirmação
    porque é reversível (reabrir uma vencida tira a data final e avisa); e
    **Excluir**, com confirmação, que sugere exportar antes se houver
    candidaturas;
  - **recusada:** só **Excluir**.
- **Publicar e editar** (`pages/admin/oportunidades/editar.tsx`, em
  `/admin/oportunidades/nova`, com o título **Cadastrar oportunidade** e sem
  subtítulo (como o "Cadastrar evento"), e `/admin/oportunidades/:id`; o formulário é
  `components/formularioDaVaga.tsx`, o mesmo da proposta do membro):
  - Em dois passos, no layout do cadastro de evento: um Paper só com a
    régua `StepProgress` (`components/step`) no topo, o passo e os botões
    embaixo (contornado à esquerda, preenchido à direita), com os mesmos
    espaços: 24px de borda e da régua ao passo, 16px entre os campos e do
    passo aos botões, e o título do passo em `h6` de 18px. Os campos da
    vaga também são os do evento: o `Input` do sistema (`components/input`)
    e o `InputDatePicker`, em `size="small"`, numa `Grid` de `spacing={2}`
    (Vaga na linha toda; Quem oferece e Local meio a meio; salário e data
    em duas ou três colunas, conforme fixo ou faixa), e o rótulo da
    descrição em `subtitle1` de 16px, como o "Descrição detalhada". **1. Vaga** (os
    dados abaixo, até Candidaturas até): Cancelar e **Próximo**, travado
    enquanto falta algo da vaga (o "Falta:" diz o quê). **2. Formulário de
    inscrição** (editor e prévia): **Voltar** e Salvar, que confere a vaga e
    o formulário. No celular a régua deixa tocar no passo, mas o 2 só abre
    com a vaga completa. Os dados dos dois passos ficam juntos no
    componente, e trocar de passo volta a rolagem do `#layout-scroll` para o
    topo. Editar uma vaga também passa pelos dois.
  - **A vaga:** imagem (prévia, trocar, remover; sobe depois de salvar),
    Vaga\*, Quem oferece\*, Local e Descrição\* no `ReactQuillEditor`, o editor do sistema,
    com fundo, borda e ícones iguais aos dos campos.
  - **Salário** (opcional): "Valor fixo" ou "Faixa", num
    `ToggleButtonGroup` como o de Nova tesouraria. Valor fixo mostra um
    campo ("Salário"); faixa mostra dois ("De" e "Até"), e o "Até" fica em
    vermelho se for menor que o "De". Voltar para fixo descarta o máximo. A
    vaga com máximo já abre em faixa.
  - **Candidaturas até** (opcional): o `InputDatePicker` do sistema (o
    mesmo da data de nascimento no cadastro de usuário), sem dias passados
    e com o botão de limpar.
  - **Formulário de candidatura** (`components/editorDoFormulario.tsx`), em
    duas colunas na tela grande: o editor e, ao lado (fixa ao rolar, 16px
    abaixo do topo do `#layout-scroll`, que já começa sob a appbar), a
    **prévia**, com o que o candidato vê: uma moldura tracejada um tom
    abaixo do Paper (`background.default`), com o cabeçalho "Prévia", e
    dentro dela o formulário num Paper próprio, como uma telinha (num Paper
    simples ela ficava da cor do cadastro e não parecia amostra). A prévia usa o
    mesmo `CampoDoFormulario` da candidatura e é só para olhar: os campos
    não respondem a clique, teclado nem leitor de tela (`inert`), para quem
    monta o formulário não confundi-la com o editor. No celular, a prévia
    desce para baixo do editor.
  - Cada campo é um card um tom abaixo do Paper (`background.default`), com
    a faixa laranja à esquerda no campo em edição, como no Google Forms, e
    com subir/descer, remover e a chave **Obrigatório**. Nas perguntas
    próprias aparecem o enunciado e o tipo de resposta.
  - As opções das perguntas de escolha são uma lista de campos, cada um com
    o marcador do tipo (círculo, quadrado ou número) e um X. **Adicionar
    opção** ou Enter na última cria a próxima. **Adicionar campo** oferece os quatro tipos de
    pergunta e os campos prontos que não estão no formulário (um por rede
    social). A vaga nova já vem com Currículo, Pretensão salarial,
    Mensagem, LinkedIn e Instagram.
  - O botão salvar fica desligado e diz o que falta, como na candidatura.
- **Candidaturas** (página, `components/paginaDeCandidaturas.tsx`): o botão
  com a contagem, na lista, leva a `/admin/oportunidades/:id/candidaturas`
  (e, para quem propôs a vaga, a `/oportunidades/propostas/:id/candidaturas`,
  a mesma página). Ela substitui a janela que havia antes.
  - **Cards no topo** (`StatusCards`): candidaturas, com currículo, novas
    nas últimas 24 horas e selecionadas.
  - **Lista à esquerda:** foto, nome, data, a etapa num chip, o ícone de
    currículo e a pretensão salarial. Tem busca por nome ou e-mail, filtro
    por etapa, ordem (mais recentes, mais antigas, nome), "só com currículo",
    "pretensão até" e um filtro para cada pergunta de escolha do formulário
    (seleção, opção única, caixas). "Limpar filtros" volta tudo.
  - **Detalhe à direita:** foto, nome, contato, data e hora da candidatura,
    botões **WhatsApp** (`wa.me`), **E-mail** (com a vaga no assunto) e
    **Copiar contato**. Depois o **acompanhamento** e as respostas na ordem
    do formulário (resposta a campo que saiu vem no fim, com o rótulo de
    quando respondeu), com os links das redes clicáveis. O currículo tem
    **Ver** (um visualizador de PDF na própria página; alguns celulares não
    mostram PDF ali, e a tela diz para baixar) e **Baixar**. Embaixo,
    **Anterior** e **Próximo**, na ordem da lista filtrada.
  - **Acompanhamento** (interno; o candidato não vê): a **etapa** (Nova, Em
    análise, Entrevista, Selecionada, Descartada), que grava ao escolher, e
    a **anotação interna**, com "Salvar anotação". Em coluna, em qualquer
    tela: a etapa em cima e a anotação embaixo, as duas na largura toda.
  - **Celular:** a lista ocupa a tela; tocar num candidato abre o detalhe,
    com "Todos os candidatos" para voltar. Na tela grande, o primeiro da
    lista já aparece aberto. O candidato aberto fica no endereço
    (`?candidato=<id>`).
  - **Exportar (N):** exporta o que está filtrado. O **PDF**
    (`components/pdfCandidaturas.tsx`) traz a tabela de contato e um bloco
    por candidato com as respostas. O **Excel** tem uma coluna por pergunta
    do formulário, mais nome, celular, e-mail, data e etapa. A anotação, que
    é interna, não vai em nenhum dos dois.
- **Home do painel:** card de Oportunidades para o admin da igreja
  (`modulosDaIgreja.tsx`), como os outros módulos.

## Identidade

Ícone `Badge` (um crachá, como o dos detalhes da vaga; no menu lateral, no
card da home, no cabeçalho, nas abas "Vagas" e "Abertas" e nos estados
vazios) e a paleta "Mãos à obra" (Ne 2:18), laranja, em
`CORES_DO_MODULO`: claro `#8A3A00` / `#AD4A00` / `#D9650B`, escuro
`#F2B07C` / `#FF9B52` / `#EE7A22` (contrastes conferidos: primária 7,8:1 e
8,6:1 com o texto do botão; secundária 4,9:1 e 7:1; terciária 3,2:1 e
5,2:1). Todas as telas abrem com `TemaDoModulo`.

Arquivos:

- `src/features/oportunidades/`: api, tipos, `formulario.ts` (redes, prazo,
  salário e o espelho das regras da API) e os componentes
  (`campoDoFormulario.tsx` é o campo da candidatura, usado também na
  prévia);
- `src/pages/oportunidades/`: a vitrine e a candidatura;
- `src/pages/admin/oportunidades/`: a lista e a página da vaga.
