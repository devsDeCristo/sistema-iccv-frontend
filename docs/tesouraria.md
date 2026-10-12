# Tesouraria (/admin/tesouraria)

Módulo de tesouraria da igreja, no menu do painel como o grupo **Tesouraria**, com três filhos:

- **Administrativa** (`/admin/tesouraria/administrativa`): a administração financeira da própria igreja, numa tela com três abas — **Conciliação**, **Dízimos** e **Lançamentos**. Cada aba é uma rota (`.../conciliacao`, `.../dizimos`, `.../lancamentos`), e o cabeçalho é o mesmo nas três ("Tesouraria administrativa"). O grupo e a administrativa abrem na primeira aba.
- **Eventos** (`/admin/tesouraria/eventos`): uma tesouraria por evento — **MVP com dados de exemplo**, ver abaixo.
- **Congregações** (`/admin/tesouraria/congregacoes`): uma tesouraria por congregação, só com entradas e saídas (Conciliação e Lançamentos) — **MVP com dados de exemplo**, todo o fluxo em [tesouraria-congregacoes.md](tesouraria-congregacoes.md).

As abas são `AbasDaTesouraria` (`components/abasDaTesouraria.tsx`), as mesmas na administrativa, no evento e na congregação.

O perfil de quem trabalha na tesouraria da igreja se chamava "Financeiro" e agora é **Tesouraria** (`Role.TESOURARIA`, o mesmo número 3 no banco). Pastas, rotas da API (`/churches/:churchId/tesouraria`) e textos seguiram o nome.

Regras de servidor: `docs/tesouraria.md` no `ic-backend`.

## Quem acessa e de qual igreja

- **Administrativa e Congregações:** admin e tesouraria da igreja (`ADMIN_AREA_ROLES`, com `RequireRole` nas rotas), além de dev e super admin.
- **Eventos:** os mesmos, e também o **tesoureiro(a) completo** de um evento, que vê só a tesouraria dos eventos dele (ver abaixo).
- **Fechar e reabrir** uma tesouraria de evento ou de congregação: só o **admin da igreja** (e dev e super admin).
- A tesouraria é **sempre de uma igreja**: o seletor no topo (`ChurchScopeBar` com `useIgrejaSelecionada(true)`, o mesmo de Integrações) não tem "Todas". Com uma igreja só, ela já vem escolhida; com várias e nenhuma escolhida, a tela pede a escolha. A escolha é a mesma dos outros módulos. O tesoureiro(a) de evento não tem seletor: os eventos são dele.

## Tesoureiro(a) de evento

Quem cuida da tesouraria de um evento sem ser admin nem tesouraria da igreja. O vínculo é **por evento**: uma pessoa é tesoureira de um evento e não de outro. Ele não muda o perfil da pessoa — quem é só tesoureiro de evento continua usuário comum. No servidor é a tabela `EventTreasurer` (ver o `docs/tesouraria.md` do `ic-backend`).

- **Básico:** vê só a aba **Tesouraria** dos detalhes do evento (pagamentos, histórico, baixa e reembolso).
- **Completo:** vê também **Tesouraria › Eventos**, só com as tesourarias dos eventos dele.
- **Quem escolhe:** o admin da igreja do evento, no botão **Tesoureiros** da aba Tesouraria dos detalhes do evento (`modalTesoureiros.tsx`). A busca é a mesma de Membros (CPF completo ou dois nomes); cada tesoureiro tem o tipo (básico ou completo), que dá para trocar na linha, e a lixeira tira o vínculo. A API recusa quem já é admin ou tesouraria da igreja, que já vê tudo. A tesouraria da igreja não vê o botão.
- **Na sessão:** o login e o `/auth/admin/validate` mandam `eventTreasurers` (evento, nome, igreja e tipo). `useRole()` responde `soTesoureiroDeEvento`, `temTesoureiroCompleto` e `tesoureiroDoEvento(id)`; `useEventRole(churchId, eventId)` responde `isTesoureiroDoEvento`.
- **O painel de quem é só tesoureiro:** o login abre o painel; o Início (que são os números da igreja) manda para **Meus eventos** (`/admin/eventos`, só os eventos dele, vindos da API). O menu tem uma seção só, **Tesoureiro(a)**: Meus eventos e, se é completo em algum, Tesouraria de eventos. `RequireRole` aceita o tesoureiro nas rotas marcadas com `aceitaTesoureiro` (`BASICO` nos eventos, `COMPLETO` em Tesouraria › Eventos), sem a conta do plano — ele não tem igreja; a API confere o plano da igreja do evento.
- **Nos detalhes do evento**, o tesoureiro vê só a aba Tesouraria; a lista de inscritos nem é pedida (a API recusaria).
- **Quem tem perfil numa igreja e é tesoureiro de evento de outra** (tesouraria da A, tesoureiro de um evento da B) vê o painel normal, e no evento da B só a aba Tesouraria.
- **Limite do MVP:** Tesouraria › Eventos ainda é de exemplo. A lista do tesoureiro completo é filtrada pelos ids de evento de verdade, então com os dados de exemplo ele não vê nenhuma.

## Administrativa › Conciliação (`/admin/tesouraria/administrativa/conciliacao`)

O extrato do banco (Pluggy) contra os lançamentos manuais, no jeito de um diff do git (`diffDaConciliacao.tsx`).

- **Duas tabelas lado a lado:** extrato do banco à esquerda, manuais à direita, cada par na mesma linha (altura fixa, para alinhar) e as duas **rolando juntas** — rolar uma rola a outra. A rolagem é das tabelas, a página fica parada. Passar o mouse acende a linha dos dois lados.
- **Linhas:** sugerido (azul, ícone de elo, botão de conciliar na ponta da linha), só de um lado (laranja, com o lado que falta hachurado e uma caixinha) e conciliado (verde, botão de desfazer na linha). Sugeridos primeiro, conciliados por último.
- **Conciliar à mão:** marcar a caixinha de um do banco e de um manual; a barra de seleção (`BarraDeSelecao`) oferece "Conciliar o par". Marcado um lado, só o mesmo tipo (entrada/saída) pode ser marcado do outro.
- **Barra:** período (`SeletorDeIntervalo` só com datas, mês corrente até hoje), "Importar do banco" (com a Pluggy ligada; sem ela, um aviso) e "Conciliar sugestões (n)".
- **Cards:** conciliados, sugeridos, só no banco e só manual (com o saldo de cada um).
- **Celular:** não cabem duas tabelas: vira o diff unificado, o banco em cima do manual em cada par, com um vão entre os pares.
- Conciliar ou desfazer recarrega Lançamentos e Dizimistas: o manual conciliado sai dos totais (vale o do banco).

## Administrativa › Lançamentos (`/admin/tesouraria/administrativa/lancamentos`)

- **Cards:** entradas, saídas, saldo (vermelho se negativo) e dízimos — do **período inteiro**. Os filtros recortam só a tabela.
- **Filtros:** período (`SeletorDeIntervalo` só com datas; abre no mês corrente até hoje), tipo, categoria (as do tipo escolhido), origem (manual ou banco), conciliação (conciliados ou pendentes) e busca por descrição, pagador ou dizimista (vai ao servidor depois de uma pausa na digitação).
- **Botões:** "Importar do banco" (só com a Pluggy configurada e ligada na igreja) e "Novo lançamento", juntos à direita (quando a barra não cabe numa linha, os dois descem juntos). No celular, os dois ocupam a linha inteira, como os campos.
- **Tabela:** data, descrição (o importado mostra a conta e o pagador embaixo, com o ícone de banco), categoria (chip verde na entrada, vermelho na saída), dizimista, forma, conciliação (chip "Conciliado" verde ou "Pendente" laranja) e valor (`+` verde / `−` vermelho — o sinal não depende só da cor). Na exportação, saída sai negativa. Editar em todos; apagar só no manual (no importado o botão fica desligado, com a explicação).
- **Novo / editar** (`modalLancamento.tsx`): entrada ou saída, valor (máscara de centavos: digita só números e o campo mostra `R$ 12,50`), data, categoria, forma, descrição e dizimista (só em entrada; a lista é a dos membros da igreja; no dízimo, a ajuda lembra que ligado ao dizimista ele conta no total do ano dele). No importado, tipo, valor, data e forma ficam travados, com um aviso dizendo de que conta e pagador veio.
- **Importar:** o toast diz quantos lançamentos entraram, ou que não havia nada novo. A importação pode rodar quantas vezes quiser sem duplicar.
- Mais de 5.000 lançamentos no período: aviso para encurtar o período.

## Administrativa › Dízimos (`/admin/tesouraria/administrativa/dizimos`)

- **Os dizimistas são os membros:** a tela lista todos os membros da igreja — todo membro é um dizimista em potencial. Não há cadastro de dizimista: quem entra e sai da lista é o admin, no módulo Membros. Sem nenhum membro, um aviso diz isso.
- **Cards:** membros (dizimistas em potencial), quantos dizimaram no mês (com o valor), total do ano (quantos dizimaram) e média por quem dizimou no ano.
- **Filtros:** busca por nome ou CPF (na lista já carregada), "Dízimo em {ano}" (todos, dizimaram, não dizimaram) e ano dos números (o atual e os quatro anteriores).
- **Tabela por mês** (`listaDizimosPorMes.tsx`), com as famílias juntas (o mesmo desenho da tela de Membros: famílias em sequência, faixa da cor, fundo leve e, na primeira linha, só o ícone — o nome da família fica na dica do ícone, para a coluna ser estreita (56px, com o ícone no cabeçalho); depois quem não tem família — por isso as colunas não se reordenam por clique). Cada membro numa linha: família, membro (foto, nome, CPF — `celulasDoDizimista.tsx`), dízimo (o valor, que é também o botão de editar: clicar nele, ou no lápis ao lado, abre o valor do dízimo; a dica do cabeçalho explica), quanto dizimou em cada mês do ano (Jan a Dez, com "R$"; traço no mês sem dízimo; vazio no mês que ainda não chegou) e o total do ano. A última linha, destacada, é o **total da igreja** em cada mês (de todos os membros, sem os filtros). É a única visão: a visão por ano (meses em pontos e último dízimo) saiu. Com 16 colunas (cada mês com 108px, para caber "R$ 12.345,67") a tabela passa da largura das telas comuns e rola na horizontal.
- **Importar planilha** (botão na barra, só para o admin desta igreja, ou dev e super admin — `modalPlanilhaDeDizimos.tsx`, leitura em `planilha.ts` com o `xlsx` que o projeto já tem): a primeira aba precisa de um cabeçalho com "Nome" e os meses (Jan a Dez); valores como "R$ 1.600,20" ou número. Ficam de fora as linhas sem nome ("-"), a de total e as sem valor no ano; a linha "Anônimo" (o nome pode estar na coluna do número) já vem como sem vínculo. Escolhe-se o ano (abre no da tela). A prévia mostra cada linha com o total do ano e um select de quem é: os candidatos (nome, CPF pela metade e "vira membro" / "já é membro" / "membro de X", este desligado), "Sem vínculo (não é usuário)" — o dízimo entra sem dizimista, com o nome da planilha na descrição e no pagador — e "Não importar". Padrão de cada linha: a pessoa escolhida pelo sistema; **sem vínculo** quando não há nenhum candidato (chip **Não encontrado**); "Não importar" quando há homônimos sem desempate (chip **Escolha**: a pessoa decide). Escolhida sem o nome igual: chip **Confira**. Essas linhas vêm primeiro. O botão diz quantas linhas entram e o texto, quanto somam. Depois, um toast com os dízimos lançados, os novos membros e os que já existiam; os que ficaram de fora (membro de outra igreja) num aviso que não some sozinho. Celular: tela cheia, um campo por linha.
- **Valor do dízimo** (clicar no valor da coluna Dízimo, `modalDizimista.tsx`): a única coisa que se edita aqui, com a mesma máscara de centavos do lançamento. Com valor, a ajuda do campo diz a regra: na importação do banco, um Pix dele com esse valor é dízimo, e com outro valor é oferta (ligada a ele). Apagar o campo tira o valor: todo Pix dele entra como dízimo.

## Eventos (`/admin/tesouraria/eventos`) — MVP

**Dados de exemplo:** nada vem da API ainda (`features/admin/tesouraria/eventosECongregacoes/dados.ts`), e um aviso no topo diz isso. O que se cria, aloca ou fecha fica em memória e some ao recarregar a página. A igreja do seletor não muda os números.

**O modelo é o de uma conta por tesouraria** (Configurações › Integrações, "Bancos divididos por tesouraria"). A tesouraria de Eventos tem a sua conta, e ela é uma só para todos os eventos. O extrato chega pelo Pluggy e fica salvo; cada movimento é **alocado** na tesouraria do evento a que pertence. Ninguém lança à mão para depois conciliar: o que veio do banco já é o lançamento. Os ingressos são a exceção — vêm das inscrições pagas no sistema.

- **Só existe tesouraria de evento que foi criada aqui.** Evento cadastrado não ganha uma sozinho.
- **Lista** (`listaDeTesourarias.tsx`, a mesma das congregações):
  - **Aviso de não alocados** (`avisoNaoAlocados.tsx`), no topo: quantos lançamentos da conta de Eventos não estão em evento nenhum, e quanto somam. Parte é trabalho por fazer; parte nunca será de evento (uma tarifa do banco).
  - **Filtro** Abertas, Fechadas e Todas (com a contagem); abre em Abertas.
  - **Cards** no acabamento dos cards das Igrejas e dos `StatusCards`: aro e tinta na cor da situação (verde aberta, neutra fechada), ícone num quadrado da mesma cor (calendário para evento do sistema, confete para o de fora), o chip **Aberta** ou **Fechada**, o nome, o período, "Evento do sistema" ou "Fora do sistema" (elo ligado ou cortado), e entradas, saídas e resultado em linhas (negativo em vermelho, com o sinal). "Abrir tesouraria" no rodapé.
  - **Nova tesouraria** (`modalNovaTesouraria.tsx`): ou **evento do sistema** (um evento tem uma tesouraria só, e o que já tem aparece desligado), ou **evento fora do sistema** — nome e data opcional. O tesoureiro(a) de evento não cria.
- **A tesouraria de um evento** (`/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`, abas com endereço; sem aba, abre na Conciliação):
  - **Fechamento** (`barraDoFechamento.tsx`): o admin da igreja vê "Fechar tesouraria" (com confirmação). Fechada, um aviso diz quando e por quem, e nada mais entra, sai ou muda de categoria; só o admin reabre. **Fechar não é o evento acabar**: o fechamento vem bem depois, com o dinheiro todo assentado.
  - **Conciliação** (`distribuicaoDaConta.tsx`, o mesmo da congregação) é **alocar o extrato**:
    - À esquerda, **A distribuir**: o que falta alocar de cada movimento da conta — os mesmos em todas as tesourarias de evento. Marca-se o que é deste evento (a caixinha ou o clique na linha) e **Trazer para este evento**, na barra do pé: vem o que falta do movimento.
    - **Rateio:** o ícone de dividir na linha traz **só uma parte** (o valor, menor que o que falta); o resto continua a distribuir, para outro evento. A linha mostra "falta de R$ X" quando parte já foi alocada, e do lado do evento, "parte de R$ X".
    - À direita, **Neste evento**: cada alocação com a categoria (entra "Sem categoria"; escolhe-se na própria linha) e o **devolver**, que manda o valor de volta para a distribuir.
    - **Conferir com o pagamento das inscrições:** numa entrada, o mesmo seletor da categoria lista os pagamentos das inscrições ainda não conferidos. O repasse do PagBank que cai na conta é o mesmo dinheiro do pagamento já registrado: conferido, ele aparece como "Conferido: …" e não conta duas vezes.
    - Cards: neste evento (com o saldo), a distribuir (com o saldo do que falta) e sem categoria. Fechada, a tela é só leitura.
  - **Lançamentos** (`lancamentosDaTesouraria.tsx`, o mesmo da congregação): os pagamentos das inscrições e as alocações do evento — menos as conferidas, que o pagamento já conta (a tabela marca o pagamento "conferido no extrato"). Cards (entradas, saídas, resultado, ingressos), entradas e saídas por categoria (cores `COR_ENTRADA`/`COR_SAIDA`, validadas para daltonismo) e a tabela, com abas Todos, Entradas e Saídas.
- **Termos:**
  - **não alocado** é o lançamento da conta que não está em nenhuma tesouraria (sem centro de custo). Não é "sem competência": competência diz _quando_ o lançamento conta, e não _onde_.
  - **rateio** é dividir um lançamento entre tesourarias.
- **Para virar dado de verdade:**
  - os movimentos da conta de Eventos salvos no servidor (a importação do Pluggy, como a da administrativa);
  - as alocações (movimento, tesouraria, valor, categoria e o pagamento conferido);
  - a tabela das tesourarias de evento, com o fechamento (quando e por quem).

## Em aberto

- **A Administrativa no modelo "o banco é a fonte":** decidido, falta fazer. A conciliação dela é a real (do outro dev) e ainda forma par entre lançamento manual e banco. A mudança é no código real, no backend e nos dados que já existem (lançamentos manuais e pares conciliados). O plano está na conversa e espera confirmação.
- **O destino do não alocado:** a tarifa do banco fica na conta de Eventos (ou de Congregações) para sempre, só avisada, ou passa para a Administrativa?

## Código

- Telas: `src/pages/admin/tesouraria/{conciliacao,lancamentos,dizimistas,eventos,congregacoes}` (o nome das pastas ficou "tesouraria"; as rotas são `/admin/tesouraria/...`), rotas em `src/pages/admin/tesouraria/routes`.
- Tesourarias de eventos e de congregações (MVP): `src/features/admin/tesouraria/eventosECongregacoes` (`dados.ts` e `components/`).
- Tesoureiros de evento: `src/features/admin/events/api/tesoureiros.ts` e `components/modalTesoureiros.tsx`; o resto do acesso em `hooks/useRole.tsx`, `hooks/useEventRole.tsx`, `components/requireRole` e `components/sideBar`.
- `src/features/admin/tesouraria`: `api.ts` (hooks; mexer em lançamento ou conciliação recarrega lançamentos, dizimistas e conciliação, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
