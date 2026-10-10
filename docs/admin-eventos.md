# Admin: eventos (`/admin/eventos`, `/admin/eventos/cadastro`, `/admin/eventos/:id/editar`)

Cadastro, edição, listagem e exclusão de evento pelo painel administrativo. O
cadastro e a edição reaproveitam os mesmos formulários, em passos; a loja do
evento tem seu próprio documento (`docs/loja-do-evento.md`) e a janela de
inscrição por grupo também (`docs/inscricao-em-grupos.md`).

## Lista de eventos (`/admin/eventos`)

- **Cards de resumo:** total, ativos, inativos, em teste e "em andamento"
  (eventos cuja data cobre hoje, dia inteiro nas duas pontas). Os números vêm da
  mesma consulta da tabela, sem chamada extra.
  Seguem a igreja do seletor (canto superior direito), com o mesmo recorte
  da lista; numa igreja escolhida, o total diz "Nesta igreja".
- **Filtros:** busca por nome e status (Ativos/Inativos/Em teste/Todos), salvos
  no navegador entre visitas.
- **Igreja:** escolhida no seletor padrão, no canto superior direito
  (`SeletorDeIgreja`), com a mesma escolha dos outros módulos. Ele aparece para
  o super admin e para quem administra ou é financeiro em mais de uma igreja.
  Quem tem uma igreja só vê os eventos dela, sem seletor. Se a igreja escolhida
  deixou de existir ou de pertencer à pessoa, volta para "Todas" em silêncio.
- **Seleção e status em massa:** caixa de seleção por linha, no mesmo padrão
  da lista de usuários (marcar só pela caixa; busca e filtro não desmarcam;
  contagem na barra, não no rodapé da tabela).
  - **Barra flutuante** (`BarraDeSelecao`, a mesma de usuários): quantidade,
    "Mudar status" (só para admin; no celular, "Status") e o X que limpa.
  - **Modal "Mudar status"** (`ModalStatusEmMassa`): Ativo, Teste ou Inativo,
    em cartões com o que cada um muda para quem se inscreve. Chama
    `PUT /events/status`.
  - **Resultado:** tudo certo vira toast e a seleção limpa. Evento de igreja
    que a pessoa não administra volta listado com o motivo; ao fechar, só
    esses continuam marcados.
- **Ações por linha**, num menu de três pontos:
  - **Abrir página do evento:** em nova aba.
  - **Detalhes:** vai para o painel de inscritos do evento.
  - **Editar:** só aparece para quem administra a igreja do evento ou é super
    admin (`perfilNaIgreja(...) === Role.ADMIN`).
  - **Apagar evento:** só aparece para o perfil de desenvolvimento (`isDev`).
- **Novo evento:** botão "Novo Evento", visível para admin, leva ao cadastro.

Arquivos: `src/pages/admin/events/index.tsx`, `src/features/admin/events/components/list.tsx`, `src/features/admin/events/components/cardsStatus.tsx`, `src/features/admin/events/utils/eventStatus.ts`, `src/features/admin/events/components/modalStatusEmMassa.tsx`, `src/features/admin/events/api/putStatusEmMassa.ts`.

## Status do evento

| Status | Onde aparece | Efeito |
| --- | --- | --- |
| `ACTIVE` | catálogo público | evento visível para todo mundo |
| `INACTIVE` | nenhum lugar público | oculto do público; continua no painel |
| `TEST` | só admin/super admin | evento de ensaio, visível apenas para quem administra |

O status é escolhido no formulário de informações gerais e pode ser trocado a
qualquer momento na edição.

Arquivo: `src/features/admin/events/components/formGeneralInfo.tsx`.

## Cadastro (`/admin/eventos/cadastro`)

Assistente em 8 passos, cada um com seu próprio `react-hook-form` e validação
Zod; só avança quem passa no `trigger()` do passo atual. Passos: Categoria do
evento, Informações gerais, Data e Local, Módulos, Logo e capa, Termos,
Configurações de inscrição, Produtos.

- **Categoria do evento (passo 1):** `RETIRO` ou `CURSILHO`. Define os grupos e
  regras padrão que vêm pré-preenchidos no passo de configurações de inscrição
  (ex.: Retiro nasce com "Completo" e diárias por dia; Cursilho nasce com
  "Cursilhista" e "Cursilheiro(a)"). Trocar a categoria depois de escolhida
  reseta esses padrões.
- **Informações gerais (passo 2):**
  - **Igreja do evento:** só aparece para quem tem escolha — super admin (que
    não tem igreja própria) ou quem administra mais de uma. Quem administra uma
    só não vê o campo; o servidor usa a igreja do próprio perfil.
  - **Nome** (obrigatório, até 200 caracteres), **status**, **ocultar vagas**
    (esconde a contagem de vagas restantes na página do evento), **descrição
    curta** (até 100) e **descrição detalhada** (editor rico).
- **Data e Local (passo 3):** data de início e fim; data passada só é bloqueada
  quando o status é `ACTIVE` — evento inativo ou de teste é rascunho e pode
  levar uma data que já passou. Endereço é opcional, com busca automática por
  CEP (ViaCEP) preenchendo logradouro, bairro, cidade e UF. O link do Google
  Maps aceita link direto ou código de incorporação (embed), e mostra uma
  prévia do mapa.
- **Módulos (passo 4):** liga/desliga Quartos, Equipes e Transporte — nascem
  todos ligados, inclusive nos eventos que já existem (ausência da chave é
  "ligado"). Um módulo com conteúdo cadastrado (quarto, equipe ou transporte já
  criado) não pode ser desligado: o interruptor fica travado com aviso do
  total cadastrado, e o servidor confere de novo antes de gravar. O campo
  **Quadrante** só aparece com o módulo Equipes ligado, nasce desligado, e
  controla se admin e inscritos enxergam a lista de equipes com foto, celular,
  e-mail e aniversário.
  - Espelha `src/event/event-modules.ts` e `src/event/event-quadrante.ts` no
    backend.
- **Logo e capa (passo 5):**
  - Uma prévia simula o cabeçalho real da página do evento (capa com o mesmo
    filtro e véu, logo, nome e selo de categoria), nas proporções de tela cheia
    e de celular.
  - Logo e capa aceitam arraste ou seleção de arquivo, até 5MB, apenas imagem.
  - A logo pode ser recortada na hora (`LogoCropDialog`): retângulo (16:9) ou
    quadrado, com zoom e arraste, exportando PNG (para preservar fundo
    transparente) reduzido a no máximo 900px no lado maior. O recorte só lê os
    pixels do arquivo recém-escolhido — a imagem já salva no Storage não pode
    ser lida por CORS, e nesse caso a tela orienta a escolher o arquivo de novo.
  - **Cores do evento:** três cores (primária, secundária, terciária) sugeridas
    automaticamente a partir da logo (primária) e da capa (secundária e
    terciária) — a leitura só alcança a imagem recém-escolhida, nunca sobrepõe
    campo já preenchido à mão, e pode ser refeita a qualquer momento pelo botão
    "Tirar das imagens". As três continuam editáveis por seletor de cor ou
    hexadecimal. Ver `src/features/admin/events/eventColors.ts`.
- **Termos (passo 6):**
  - **Termo do evento:** texto em HTML (editor rico), aceito na hora da
    inscrição. Deixar em branco (inclusive `<p><br></p>`, que o editor produz
    ao apagar tudo) é dizer que o evento não exige termo algum.
  - **Termo de autorização de menores:** modelo em branco (PDF ou imagem, até
    5MB) que os pais baixam, assinam e reenviam — ver aprovação de menores em
    `docs/admin-inscritos.md`.
- **Configurações de inscrição (passo 7):** grupos, regras e janela de
  inscrição de cada grupo — documentado em `docs/inscricao-em-grupos.md`.
- **Produtos (passo 8):** loja do evento e produtos vendidos junto com a
  inscrição — documentado em `docs/loja-do-evento.md`. Passo opcional: lista
  vazia passa direto.

Ao finalizar, o formulário reúne os dados de todos os passos num único envio
(`POST /events`), junto dos arquivos (logo, capa, termo).

Arquivos: `src/pages/admin/events/register/index.tsx`, `src/features/admin/events/constants.ts`, `src/features/admin/events/types.ts`, `src/features/admin/events/api/postEvent.tsx`.

## Edição (`/admin/eventos/:id/editar`)

Mesmos formulários do cadastro, exceto a Categoria do evento (fixa depois de
criado) e reorganizados em abas (`NavTabs`) em vez de passos sequenciais: dá
para pular direto para qualquer aba. Ao salvar, todas as abas são validadas de
uma vez (`Promise.all` de `trigger()` em cada formulário); se alguma falhar, a
edição é recusada com um toast de erro genérico e o console lista os erros por
formulário.

- **Igreja do evento:** o campo é reaproveitado dentro de Informações gerais,
  mas nem sempre altera nada — o backend ignora o `churchId` vindo de quem não
  é super admin.
- Registrados e em espera de cada regra de grupo (`registered`, `waitlisted`)
  são só leitura na tela e removidos do payload antes de enviar — são
  contadores do servidor, não campos editáveis.

Arquivos: `src/pages/admin/events/edit/index.tsx`, `src/features/admin/events/api/putEvent.tsx`.

## Exclusão de evento

- **Quem pode:** só o perfil de desenvolvimento (`isDev`). Não aparece no menu
  para admin nem super admin.
- **Confirmação:** modal que lista o que é apagado junto (grupos e regras de
  inscrição, quartos, equipes, lista de espera, produtos e histórico de
  cobrança) e exige digitar a palavra `APAGAR` para liberar o botão.
- **Evento com inscritos:** o servidor recusa a exclusão; a ação existe para
  desfazer um evento criado errado, não para uso rotineiro.

Arquivos: `src/features/admin/events/components/modalDeleteEvent.tsx`, `src/features/admin/events/api/deleteEvent.tsx`.
