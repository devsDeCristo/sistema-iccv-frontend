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
- **Cards** (`components/cardDaVaga.tsx`), no mesmo estilo dos cards de
  Solicitações e na mesma grade (3 colunas na tela grande, 2 no tablet, 1
  no celular):
  - **etiqueta pendurada** na borda de cima, à direita, com a situação:
    **verde** quando aberta ("Aberta", ou o prazo quando está acabando:
    "Encerra hoje", "Faltam N dias"), **vermelha** quando encerrada e na
    cor do módulo com "✓ Candidatura enviada";
  - **fundo** com degradê e pontinhos saindo do canto superior esquerdo, na
    **cor do módulo** (a cor da logo fica só para o crachá). No hover, o
    fundo acende e a borda aparece;
  - a logo num quadrado branco (`LogoDaVaga`, `contain`: não corta nem
    estica; sem imagem, o ícone `Work`), ao lado do título (até 2 linhas) e
    de quem oferece;
  - o salário num chip na cor do módulo, o local e a data de publicação;
  - a descrição em texto, cortada em 3 linhas;
  - **rodapé** depois do divisor: "Candidaturas: até dd/mm/aaaa" (ou "Sem
    data para encerrar") e "Ver vaga ›";
  - encerrada, o card apaga em cinza (só a etiqueta fica vermelha), como a
    solicitação recusada. As
    encerradas só aparecem para quem se candidatou, para ainda poder ver e
    retirar;
  - o card inteiro é clicável (também com Enter e espaço) e abre o crachá.
- **Detalhes** (`components/modalDetalhesDaVaga.tsx`): um **crachá de
  "estamos contratando"** que substitui o modal. O `Dialog` fica
  transparente, sem cabeçalho nem rodapé: só aparece o crachá, pendurado
  numa fita, sobre o fundo escurecido. Fecha no X do crachá, no Esc ou
  clicando fora.
  - De cima para baixo: fita e mosquetão, o rasgo do crachá, a logo e quem
    oferece, "ESTAMOS CONTRATANDO!" (ou "VAGA ENCERRADA"), o selo "VAGA"
    entre traços e o título.
  - Depois, a descrição inteira (`ReactQuillViewer`; vaga antiga, em texto
    puro, vira parágrafos por `descricaoEmHtml`) e a ficha: quem oferece,
    local, salário, candidaturas até e publicada em.
  - Embaixo, o botão **Candidatar-me** (ou **Ver candidatura**), dentro do
    crachá.
  - Na tela grande, um segundo crachá, do mesmo tamanho do da frente e na
    cor da logo, fica atrás e inclinado, só com "OPORTUNIDADE" na vertical. Ao abrir, o
    crachá balança uma vez, a não ser com `prefers-reduced-motion`.
  - **Cores:**
    - o papel segue o tema: claro no claro e grafite no escuro;
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
- **Abas** (`NavTabs`): **Abertas** e **Encerradas** (a vencida entra aqui),
  com a quantidade de cada uma. **Nova oportunidade** fica ao lado das abas.
- **Lista** (`components/listaDaIgreja.tsx`): vaga (título, quem oferece e
  local), candidaturas (botão com a contagem), data de publicação com quem
  publicou, data final e situação em chip (Aberta em verde; Encerrada e
  Vencida em cinza). Ações na linha:
  - **Editar**;
  - **Encerrar**/**Reabrir**, sem confirmação porque é reversível. Reabrir
    uma vencida tira a data final e avisa;
  - **Excluir**, com confirmação. Se houver candidaturas, o aviso sugere
    exportar antes.
- **Publicar e editar** (`pages/admin/oportunidades/editar.tsx`, em
  `/admin/oportunidades/nova` e `/admin/oportunidades/:id`):
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
    duas colunas na tela grande: o editor e, ao lado (fixa ao rolar), a
    **prévia** num Paper só dela, com o que o candidato vê. A prévia usa o
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
- **Candidaturas** (`components/modalInteressados.tsx`): foto, nome, celular,
  e-mail e data de cada candidato, na ordem em que chegaram. Clicar abre as
  respostas: links das redes clicáveis e **Baixar currículo**, que vem pela
  API (o arquivo não tem link público). **Exportar PDF**
  (`components/pdfCandidaturas.tsx`) gera `<vaga>-candidaturas.pdf` com a
  tabela de nome, celular e e-mail e um bloco por candidato com as
  respostas. Os currículos vão à parte.
- **Home do painel:** card de Oportunidades para o admin da igreja
  (`modulosDaIgreja.tsx`), como os outros módulos.

## Identidade

Ícone `Work` e a paleta "Mãos à obra" (Ne 2:18), laranja, em
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
