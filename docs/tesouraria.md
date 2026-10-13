# Tesouraria (/admin/tesouraria)

Módulo de tesouraria da igreja, no menu do painel como o grupo **Tesouraria**, com três filhos:

- **Administrativa** (`/admin/tesouraria/administrativa`): a administração financeira da própria igreja, numa tela com três abas — **Conciliação**, **Dízimos** e **Lançamentos**. Cada aba é uma rota (`.../conciliacao`, `.../dizimos`, `.../lancamentos`), e o cabeçalho é o mesmo nas três ("Tesouraria administrativa"). O grupo e a administrativa abrem na primeira aba.
- **Eventos** (`/admin/tesouraria/eventos`): uma tesouraria por evento, ver abaixo.
- **Congregações** (`/admin/tesouraria/congregacoes`): uma tesouraria por congregação, só com entradas e saídas (Conciliação e Lançamentos) — todo o fluxo em [tesouraria-congregacoes.md](tesouraria-congregacoes.md).

As abas são `AbasDaTesouraria` (`components/abasDaTesouraria.tsx`), as mesmas na administrativa, no evento e na congregação.

O perfil de quem trabalha na tesouraria da igreja se chamava "Financeiro" e agora é **Tesouraria** (`Role.TESOURARIA`, o mesmo número 3 no banco). Pastas, rotas da API (`/churches/:churchId/tesouraria`) e textos seguiram o nome.

Regras de servidor: `docs/tesouraria.md` no `ic-backend`.

## Quem acessa e de qual igreja

- **Administrativa e Congregações:** admin e tesouraria da igreja (`ADMIN_AREA_ROLES`, com `RequireRole` nas rotas), além de dev e super admin.
- **Eventos:** os mesmos (a tesouraria da igreja vê a de **todos** os eventos da igreja), e também o **tesoureiro(a) completo** de um evento, que vê só a tesouraria dos eventos dele (ver abaixo).
- **Fechar e reabrir** uma tesouraria de evento ou de congregação: o **admin** e a **tesouraria** da igreja (e dev e super admin). O tesoureiro(a) do evento não.
- **Configurar os tesoureiros(as) de um evento:** só o admin da igreja.
- A tesouraria é **sempre de uma igreja**: o seletor no topo (`ChurchScopeBar` com `useIgrejaSelecionada(true)`, o mesmo de Integrações) não tem "Todas". Com uma igreja só, ela já vem escolhida; com várias e nenhuma escolhida, a tela pede a escolha. A escolha é a mesma dos outros módulos. O tesoureiro(a) de evento não tem seletor: os eventos são dele.

## Tesoureiro(a) de evento

Quem cuida da tesouraria de um evento sem ser admin nem tesouraria da igreja. O vínculo é **por evento**: uma pessoa é tesoureira de um evento e não de outro. Ele não muda o perfil da pessoa — quem é só tesoureiro de evento continua usuário comum. No servidor é a tabela `EventTreasurer` (ver o `docs/tesouraria.md` do `ic-backend`).

- **Básico:** vê só a aba **Tesouraria** dos detalhes do evento (pagamentos, histórico, baixa e reembolso).
- **Completo:** vê também **Tesouraria › Eventos**, só com as tesourarias dos eventos dele.
- **Quem escolhe:** o admin da igreja do evento, no botão **Configurar tesoureiros** da tesouraria do evento (Tesouraria › Eventos › o evento), ao lado de "Fechar tesouraria" (`modalTesoureiros.tsx`). Só para tesouraria ligada a um evento cadastrado: o evento fora do sistema não tem a quem ligar. A busca é a mesma de Membros (CPF completo ou dois nomes); cada tesoureiro tem o tipo (básico ou completo), que dá para trocar na linha, e a lixeira tira o vínculo. A API recusa quem já é admin ou tesouraria da igreja, que já vê tudo. A tesouraria da igreja não vê o botão. Os tesoureiros também se definem no cadastro e na edição do evento (passo/aba **Equipe**, junto com os admins do evento — ver `docs/admin-eventos.md`); os dois caminhos gravam o mesmo vínculo.
- **Na sessão:** o login e o `/auth/admin/validate` mandam `eventTreasurers` (evento, nome, igreja, nome da igreja e tipo). `useRole()` responde `soTesoureiroDeEvento`, `temTesoureiroCompleto` e `tesoureiroDoEvento(id)`; `useEventRole(churchId, eventId)` responde `isTesoureiroDoEvento`.
- **O painel de quem é só tesoureiro:** as **mesmas telas e os mesmos itens de menu** do sistema, recortados — nada de tela ou menu próprio. Na seção Módulos: **Membros** (só consulta, da igreja dos eventos dele), **Eventos** (a lista de sempre, só com os eventos dele, vindos da API) e, se é completo em algum, **Tesouraria › Eventos** (só esse filho, só com os eventos dele; o grupo abre direto nele). Início e Meus planos são da igreja e não aparecem; abrir o Início manda para Eventos. `RequireRole` aceita o tesoureiro nas rotas marcadas com `aceitaTesoureiro` (`BASICO` em Eventos e Membros, `COMPLETO` em Tesouraria › Eventos). O plano vale para ele como para o admin: os módulos vêm da igreja dos eventos dele (`eventTreasurers[].modulos`, lidos por `useModulos`), e a Tesouraria › Eventos abre na igreja do primeiro evento completo com Tesouraria no plano.
- **Nos detalhes do evento**, o tesoureiro vê só a aba Tesouraria; a lista de inscritos nem é pedida (a API recusaria).
- **Quem tem perfil numa igreja e é tesoureiro de evento de outra** (tesouraria da A, tesoureiro de um evento da B) vê o painel normal, e no evento da B só a aba Tesouraria.
- **Na Tesouraria › Eventos**, a API devolve só as tesourarias dos eventos em que ele é completo (`useIgrejaDaTesouraria` usa a igreja desses eventos; quem é tesoureiro em mais de uma igreja fica com a primeira).

## Administrativa › Conciliação (`/admin/tesouraria/administrativa/conciliacao`)

O extrato do banco (Pluggy) contra os lançamentos manuais, no jeito de um diff do git (`diffDaConciliacao.tsx`).

**O banco é a fonte; o manual é para o que o banco não vê** (o dinheiro em espécie). Os dois contam nos totais; o mesmo dinheiro nos dois lados se concilia e conta uma vez. O manual que nunca vai aparecer no extrato fica **"não consta no banco"** — é assim que os manuais sem par passam a ser tratados.

- **Duas tabelas lado a lado:** extrato do banco à esquerda, manuais à direita, cada par na mesma linha. As duas colunas ficam numa **rolagem só** (uma grade de duas colunas por linha), então rolar é nativo e o par nunca desalinha; o cabeçalho reserva o vão da barra (`scrollbar-gutter`) para alinhar com o corpo. A rolagem é das tabelas, a página fica parada. Passar o mouse acende a linha dos dois lados **só com CSS** (`.linha:hover`), sem redesenhar a tabela; e a linha fora da tela só é desenhada quando chega perto (`content-visibility: auto`) — com centenas de lançamentos, rolar e passar o mouse continuam leves. O mesmo vale para a conciliação das tesourarias de evento e de congregação.
- **Linhas:** sugerido (azul, ícone de elo, botão de conciliar na ponta da linha), só de um lado (laranja, com o lado que falta hachurado e uma caixinha), **não consta no banco** (roxo, só do lado manual) e conciliado (verde, botão de desfazer na linha). Sugeridos primeiro, depois só no banco, só manual, não consta e conciliados.
- **Não consta no banco:** o manual sem par tem, na ponta da linha, o botão de marcar (ícone de dinheiro cortado); marcado, ele sai da fila e das sugestões (continua nos totais), e o mesmo botão vira o **voltar para a conciliação**. Conciliar um marcado desfaz a marca — o banco mostrou que constava.
- **Conciliar à mão:** marcar a caixinha de um do banco e de um manual; a barra de seleção (`BarraDeSelecao`) oferece "Conciliar o par". Marcado um lado, só o mesmo tipo (entrada/saída) pode ser marcado do outro.
- **Barra:** período (`SeletorDeIntervalo` só com datas, mês corrente até hoje), "Importar do banco" (com a Pluggy ligada; sem ela, um aviso) e "Conciliar sugestões (n)".
- **Cards:** conciliados, sugeridos, só no banco e só manual (com o saldo de cada um), e não consta no banco.
- **Celular:** não cabem duas tabelas: vira o diff unificado, o banco em cima do manual em cada par, com um vão entre os pares.
- Conciliar ou desfazer recarrega Lançamentos e Dizimistas: o manual conciliado sai dos totais (vale o do banco).

## Administrativa › Lançamentos (`/admin/tesouraria/administrativa/lancamentos`)

- **Cards:** entradas, saídas, saldo (vermelho se negativo) e dízimos — do **período inteiro**. Os filtros recortam só a tabela.
- **Filtros:** período (`SeletorDeIntervalo` só com datas; abre no mês corrente até hoje), tipo, categoria (as do tipo escolhido), origem (manual ou banco), conciliação (conciliados ou pendentes) e busca por descrição, pagador ou dizimista (vai ao servidor depois de uma pausa na digitação).
- **Botões:** "Importar do banco" (só com a Pluggy configurada e ligada na igreja) e "Novo lançamento", juntos à direita (quando a barra não cabe numa linha, os dois descem juntos). No celular, os dois ocupam a linha inteira, como os campos.
- **Tabela:** data, descrição (o importado mostra a conta e o pagador embaixo, com o ícone de banco), categoria (chip verde na entrada, vermelho na saída), dizimista, forma, conciliação (chip "Conciliado" verde, "Não consta no banco" roxo ou "Pendente" laranja) e valor (`+` verde / `−` vermelho — o sinal não depende só da cor). Na exportação, saída sai negativa. Editar em todos; apagar só no manual (no importado o botão fica desligado, com a explicação).
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

## Eventos (`/admin/tesouraria/eventos`)

**Dados da API** (`eventosECongregacoes/api.ts`, rotas `/churches/:churchId/tesouraria/tesourarias` — regras no `docs/tesouraria.md` do `ic-backend`). Os tipos e as contas da tela ficam em `modelo.ts`.

### O modelo

Uma **conta por tesouraria** (Configurações › Integrações, "Bancos divididos por tesouraria"). A tesouraria de Eventos tem os **seus bancos** — aqui, o Sicredi e o PagBank, onde caem as vendas do site; uma tesouraria pode receber de mais de um, e cada movimento mostra de qual veio. A conta é uma só para todos os eventos. O extrato chega pelo Pluggy e fica salvo; cada movimento é **alocado** no evento a que pertence.

O evento tem também os **lançamentos do sistema**, registrados antes de o dinheiro aparecer no banco:

- os **pagamentos** das inscrições e dos produtos (vêm da tela de pagamentos do evento);
- os **lançamentos manuais** da tesouraria do evento (aba Lançamentos).

A **conciliação** liga cada um deles ao movimento do banco que é o mesmo dinheiro, para ele não contar duas vezes. O pagamento com **código de transação** se concilia sozinho; o de **baixa manual** (o operador mudou o status no "Detalhes do pagamento") e o lançamento manual, a pessoa concilia. O que nunca vai passar pelo banco é marcado **"não consta no banco"**.

### A lista

- **Só existe tesouraria de evento que foi criada aqui.** Evento cadastrado não ganha uma sozinho.
- **Lista** (`listaDeTesourarias.tsx`, a mesma das congregações):
  - **Aviso de não alocados** (`avisoNaoAlocados.tsx`), no topo: quantos lançamentos dos bancos de Eventos não estão em evento nenhum, e quanto somam, com o botão **Ver não alocados**. Só aparece quando Eventos tem **banco próprio** (`temBancoProprio`, da divisão dos bancos na tela da Pluggy); com a conta única, o que não foi alocado já está na Administrativa, e o aviso de lá basta.
  - **Filtro** Abertas, Fechadas e Todas (com a contagem); abre em Abertas.
  - **Cards** no acabamento dos cards das Igrejas e dos `StatusCards`: aro e tinta na cor da situação (verde aberta, neutra fechada), ícone num quadrado da mesma cor (calendário para evento do sistema, confete para o de fora), o chip **Aberta** ou **Fechada**, o nome, o período, "Evento do sistema" ou "Fora do sistema" (elo ligado ou cortado), e entradas, saídas e resultado em linhas (negativo em vermelho, com o sinal). "Abrir tesouraria" no rodapé.
  - **Nova tesouraria** (`modalNovaTesouraria.tsx`): ou **evento do sistema** — os eventos **cadastrados** da igreja, vindos da API (um evento tem uma tesouraria só, e o que já tem aparece desligado) —, ou **evento fora do sistema**, com nome e data opcional. O tesoureiro(a) de evento não cria.
- **Lançamentos não alocados** (`/admin/tesouraria/eventos/nao-alocados`, `pages/admin/tesouraria/naoAlocados.tsx`): a lista do aviso, só leitura, na mesma tabela dos Lançamentos (data, descrição com o banco, chip "Não alocado", valor). Alocar é na Conciliação de cada evento. Admin e tesouraria da igreja.

### A tesouraria de um evento

`/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`, abas com endereço; sem aba, abre na Conciliação.

- **Barra do fechamento** (`barraDoFechamento.tsx`): "Configurar tesoureiros" (admin da igreja) e "Fechar tesouraria" (admin e tesouraria da igreja), lado a lado. **Fechar não é o evento acabar**: o fechamento vem bem depois, com o dinheiro todo assentado. Fechada, um aviso diz quando e por quem, nada mais entra, sai ou muda, e só o admin ou a tesouraria reabre.
  - **Aviso ao fechar:** se há lançamentos do sistema **a conciliar** (sem movimento no banco), a confirmação avisa quantos e quanto somam, lembra de marcar como "não consta no banco" o que não passa pelo banco, e o botão vira "Fechar mesmo assim".
- **Conciliação** (`conciliacaoDaTesouraria.tsx`, o mesmo da congregação; as linhas vêm prontas da API): o **diff da Administrativa**. **À esquerda, só o que veio do banco** (o Pluggy); **à direita, só os lançamentos do evento** — pagamentos das inscrições e dos produtos, baixas manuais e lançamentos manuais. Cada par na mesma linha, as duas tabelas rolando juntas, o lado que falta hachurado; no celular, o banco em cima do lançamento.
  - **Linhas**, nesta ordem (e da data mais recente):
    - **sugerido** (azul): o movimento do banco e o pagamento ou manual de mesmo valor ao centavo e data a até 3 dias, na mesma linha ("Sugerido: mesmo valor no banco"), com o **conciliar** na ponta; os dois lados também podem ser marcados, para parear de outro jeito;
    - **só no banco** (laranja, direita hachurada): o movimento da conta que ainda não foi para evento nenhum — os mesmos em todos os eventos —, com o banco e o pagador; "falta de R$ X" quando parte já foi para outro;
    - **só no evento** (laranja, esquerda hachurada): o pagamento ou o manual sem par no banco — "A conciliar", ou "Aguardando o banco" quando tem código de transação e o dinheiro ainda não caiu;
    - **não consta no banco** (roxo, esquerda hachurada);
    - **conciliado** (verde): o movimento e o lançamento juntos. Um movimento com vários lançamentos (o depósito do dinheiro de três inscrições, o repasse com a tarifa) ocupa as linhas seguidas, e as de baixo dizem "↳ o mesmo movimento". O conciliado pelo código diz "Conciliado pelo código". O **desfazer** (na primeira linha do par) devolve o movimento para "só no banco" e os lançamentos para "a conciliar".
  - **Trazer do banco:** o movimento que é do evento e não tem par no sistema (a hospedagem, a gráfica) é trazido, e vira ele mesmo um lançamento do evento ("Extrato"), na mesma linha do banco, com a categoria escolhida ali (entra "Sem categoria") e o **devolver**. "Parte de R$ X" no rateio.
  - **Tudo pela barra do pé**, conforme o que está marcado (a caixinha ou o clique na linha):
    - só movimentos do banco: **Trazer para este evento** (o que falta de cada um) e, ao lado, **Ratear e trazer** — uma janela com **uma aba por movimento** (com mais de um), cada uma com o valor que vem para o evento (começa no que falta; o resto continua no banco, para outro). O botão diz o total.
    - um movimento do banco **e** lançamentos do evento: **Conciliar**. A soma dos lançamentos (entradas menos saídas) precisa **bater ao centavo** com o banco; se não bate, o aviso diz a diferença — sendo tarifa, lança-se a saída e marca-se junto.
    - só lançamentos do evento: **Não consta no banco** (ou, se todos já estão marcados, **Voltar para a conciliação**).
  - **Cards**, os da Administrativa: conciliados, só no banco e só no evento (com o saldo), não consta no banco e sem categoria. Fechada, a tela é só leitura.
- **Lançamentos** (`lancamentosDaTesouraria.tsx`, o mesmo da congregação):
  - **Novo lançamento** (`modalLancamentoDoEvento.tsx`, o mesmo desenho do da Administrativa: entrada ou saída, valor, data, categoria, forma e descrição): para o que não passa pelos pagamentos — uma venda no intervalo, um gasto pago em dinheiro. Entra **a conciliar**, como a baixa manual. Some com a tesouraria fechada.
  - O que conta: os lançamentos do sistema (pagamentos e manuais, em qualquer situação) e o que veio do banco sem par. O movimento conciliado não conta: os lançamentos dele já contam aquele dinheiro.
  - Cards (entradas, saídas, resultado, ingressos), entradas e saídas por categoria (cores `COR_ENTRADA`/`COR_SAIDA`, validadas para daltonismo) e a tabela, com abas Todos, Entradas e Saídas. Embaixo da descrição: a origem, o banco e a situação ("Inscrição · PagBank · Conciliado", "Extrato · Sicredi").
- **Termos:**
  - **não alocado** é o lançamento da conta que não está em nenhuma tesouraria (sem centro de custo). Não é "sem competência": competência diz _quando_ o lançamento conta, e não _onde_.
  - **rateio** é dividir um lançamento entre tesourarias.
  - **conciliar** é ligar o lançamento do sistema ao movimento do banco que é o mesmo dinheiro.
  - **não consta no banco** é o lançamento do sistema que nunca vai aparecer no extrato (dinheiro em espécie).

### Conciliação automática pelo código: o que é preciso

Não existe ainda: no lugar dela, a **sugestão** por valor e data (acima). Para o pagamento pelo site se conciliar sozinho, o código da venda precisa chegar no extrato:

- **O pagamento pago pelo site já guarda os códigos:** no checkout (`PaymentCheckout`), a referência que o sistema manda ao gateway (`referenceId`), o `checkoutId` e a casa (`provider`: PagBank, Mercado Pago, InfinitePay, Ton); e o retorno do gateway, com o id da cobrança, em `Payment.payload`. A baixa manual (`receivedFrom = EXTERNAL`) não tem código nenhum — é a que vai para a conciliação à mão.
- **O extrato da Pluggy não traz esse código.** A transação tem descrição, valor, data, pagador e `paymentData.referenceNumber` (às vezes), mas nenhum id da venda do gateway — e a importação de hoje nem guarda o `referenceNumber`.
- **O dinheiro do site não cai venda a venda na conta da igreja:** cai na conta do gateway, que repassa em lote (vários pagamentos, menos as tarifas, num movimento só).
- **Caminhos:**
  1. **Relatório de repasses do gateway** (o mais seguro): cada casa tem a API que lista, por repasse, os pagamentos que entraram nele (no Mercado Pago, o relatório de liberações; no PagBank, o extrato de recebíveis). Com ele, o repasse do extrato (valor e data) casa com o lote, e o lote traz os códigos — um movimento, vários pagamentos, a tarifa à parte. Precisa de uma integração por gateway.
  2. **A conta do gateway como banco na Pluggy** (o PagBank é instituição do Open Finance): o extrato dela mostra as vendas uma a uma. Falta confirmar, com um extrato real, se a descrição ou o `referenceNumber` trazem o código da venda.
  3. **Sem código, por sugestão**, como a Administrativa já faz: mesmo valor e data próxima, e a pessoa confirma.
- **Para começar:** guardar o `referenceNumber` na importação e olhar extratos reais de cada gateway antes de escolher.

## Em aberto

- **O destino do não alocado:** a tarifa do banco fica na conta de Eventos (ou de Congregações) para sempre, só avisada, ou passa para a Administrativa?
- **A diferença na conciliação:** hoje a soma precisa bater ao centavo. Se o repasse do gateway vier sempre sem a tarifa, vale lançar a diferença sozinho (como a automática faz)?

## Código

- Telas: `src/pages/admin/tesouraria/{conciliacao,lancamentos,dizimistas,eventos,congregacoes}` (o nome das pastas ficou "tesouraria"; as rotas são `/admin/tesouraria/...`), rotas em `src/pages/admin/tesouraria/routes`.
- Tesourarias de eventos e de congregações: `src/features/admin/tesouraria/eventosECongregacoes` (`api.ts`, `modelo.ts` e `components/`).
- Tesoureiros de evento: `src/features/admin/events/api/tesoureiros.ts` e `components/modalTesoureiros.tsx` (aberto da tesouraria do evento); o resto do acesso em `hooks/useRole.tsx`, `hooks/useEventRole.tsx`, `components/requireRole` e `components/sideBar`.
- `src/features/admin/tesouraria`: `api.ts` (hooks; mexer em lançamento ou conciliação recarrega lançamentos, dizimistas e conciliação, e importar recarrega também o card da Pluggy), `types.ts`, `constants.ts` (rótulos de categoria, forma, origem) e `components/`.
