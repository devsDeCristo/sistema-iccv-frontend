# Planos e módulos

O sistema atende várias igrejas ao mesmo tempo (cada igreja é um _tenant_: tem os seus eventos, notícias, membros e tesouraria, e quem trabalha numa não vê as outras). O **plano** é o que diz o que cada igreja pode usar. É um pacote de **módulos**, com um valor mensal. A plataforma monta os planos e escolhe o de cada igreja; a igreja vê o seu e compara com os outros, mas não troca sozinha.

Regras de servidor: `docs/planos.md` no `ic-backend`.

## O modelo de negócio

### O que é um plano

- **Plano = nome + valor mensal + módulos.** Exemplo: "Básico · Grátis · Eventos" e "Completo · R$ 149,90/mês · Eventos, Notícias e Tesouraria".
- **Cada igreja tem no máximo um plano** (`Church.planId`).
- **Igreja sem plano não tem módulo nenhum.** Fica só com o que toda igreja tem, sem depender de plano (ver "O que não é módulo").
- **Nenhuma igreja nasce com plano.** Quando os planos chegaram, as igrejas que já existiam também ficaram sem; o super admin escolhe um para cada uma, em Igrejas.

### O valor

- **É o valor mensal, em reais.** Zero aparece como **Grátis**.
- **O sistema não cobra a igreja.** Não há assinatura nem fatura aqui dentro: o valor é vitrine, para a igreja saber quanto custa cada plano e comparar. A contratação e o pagamento acontecem fora do sistema, com quem o administra — é o que a tela "Meus planos" diz no rodapé.
- **Não confundir** com o dinheiro que a igreja recebe dos inscritos (a cobrança online dos eventos, ver o módulo Eventos) nem com a tesouraria dela.

### Quem decide

| Quem                                 | O que faz com planos                                                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dev e super admin** (a plataforma) | Criam, editam e apagam planos (`/admin/planos`) e escolhem o plano de cada igreja (Igrejas). Para eles o plano não vale: veem todos os módulos de todas as igrejas.  |
| **Admin da igreja**                  | Vê o plano da sua igreja e compara com os outros (`/admin/meus-planos`). Usa os módulos do plano.                                                                    |
| **Tesouraria da igreja**             | Igual ao admin em "Meus planos". Dos módulos do plano, usa o que o perfil já alcança (a tesouraria não publica notícia, por exemplo).                                |
| **Tesoureiro(a) de evento**          | Não tem plano próprio: vale o da igreja do evento. A sessão traz os módulos dela (`eventTreasurers[].modulos`), e menu e rotas fazem a mesma conta que para o admin. |
| **Inscrito**                         | O plano não recorta a área do usuário. Ele só sente o plano na cobrança: igreja que não cobra online não oferece o botão de pagar.                                   |

### Mudar de plano

- **Vale na hora.** Trocar o plano de uma igreja, ou os módulos de um plano, muda o painel de todas as igrejas dele na próxima navegação de quem está logado (a sessão traz os módulos de cada igreja e se renova a cada navegação no painel).
- **Nada é apagado.** O módulo que sai do plano some do painel e a API dele passa a recusar, mas os dados continuam lá. Devolver o módulo ao plano devolve tudo como estava.
- **Plano em uso não se apaga:** as igrejas dele ficariam sem módulo nenhum. Primeiro troca-se o plano delas.

### O plano recorta o painel, não o público

- **O que some:** o painel de quem trabalha na igreja.
- **O evento publicado continua aberto ao público**, mesmo com Eventos fora do plano: dá para ver e se inscrever.
- **O que muda para o público é só a cobrança online,** que é parte de Eventos.

## Os módulos

São três (`ModuloDaIgreja` em `src/constants/modulos.ts`, `ChurchModule` na API), na ordem do menu:

| Módulo                      | O que libera no painel                                                                                                                                          | Configuração que vem junto              | Fora do plano                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Eventos** (`EVENTS`)      | Criar e gerir eventos: inscritos, lista de espera, a aba Tesouraria do evento, pedidos de produtos, quartos, equipes, transporte, crachás, check-in e quadrante | **Pagamentos** (os gateways da igreja)  | Some do painel. O evento publicado segue aberto, mas a igreja **não cobra pelo site**: a inscrição se confirma sem pagamento online e o inscrito vê "acerte com a organização" |
| **Notícias** (`NEWS`)       | Notícias e disparos                                                                                                                                             | **Disparadores** (o WhatsApp da igreja) | Some do painel                                                                                                                                                                 |
| **Tesouraria** (`TREASURY`) | Tesouraria administrativa (conciliação, dízimos, lançamentos) e as de eventos e congregações                                                                    | **Integrações** (os bancos pela Pluggy) | Some do painel                                                                                                                                                                 |

### A cobrança online é parte de Eventos

- **Dar às igrejas o suporte a pagamentos é parte do que o módulo de eventos é.** A igreja com Eventos no plano cobra pelo site — desde que tenha um gateway cadastrado e ativo em Pagamentos.
- **Sem uma das duas condições, não cobra.** Por isso a API manda junto do evento `chargesOnline`, que já junta as duas; a tela de inscrição usa essa bandeira para oferecer o pagamento ou confirmar direto, em vez de levar a pessoa a um checkout que daria erro.
- **Histórico, para entender os nomes antigos:** a cobrança foi uma variável de ambiente global, depois `Church.modulePayment` por igreja, depois o módulo próprio `ONLINE_PAYMENTS`, e agora é parte de Eventos. As respostas da API ainda chamam a bandeira de `modulePayment` (calculada pelo plano), para a tela não precisar mudar.

### As configurações seguem o módulo a que servem

Pagamentos é de Eventos, Disparadores (WhatsApp) de Notícias e Integrações (Pluggy) de Tesouraria. WhatsApp e Integrações já foram módulos próprios do plano e saíram; um plano que os tinha não ganhou Notícias ou Tesouraria sozinho.

### O que não é módulo

- **Membros:** toda igreja tem, com ou sem plano (e a tesouraria depende dele: os dizimistas são os membros). É do admin da igreja.
- **Início e Meus planos:** de todo mundo que trabalha numa igreja.
- **Na prática, a igreja sem plano:**
  - o admin vê Início, Meus planos e Membros;
  - a tesouraria vê Início e Meus planos;
  - Configurações cai em Integrações, que diz que está fora do plano.
- **Usuários é outra coisa:** é só de dev e super admin, que atravessam todas as igrejas.

### Plano não é o mesmo que os módulos do evento

Quartos, Equipes e Transporte também se chamam "módulos", mas são **do evento**: liga-se ou desliga-se cada um na edição do evento (`event.data.modules`), e a aba some só daquele evento. Eles vivem dentro do módulo Eventos do plano. Sem Eventos no plano, nenhum deles aparece.

### Limites por plano

Ainda não existem (quantidade de eventos, de membros e etc.). Quando vierem, entram no plano como campos próprios, e na janela do plano abaixo dos módulos.

## As telas

### Planos (`/admin/planos`)

Só **dev e super admin** (`SUPER_ADMIN_ROLES`), como Igrejas. No menu, "Planos" fica no grupo Administrador, logo abaixo de "Igrejas". Tela: `src/features/admin/planos/index.tsx`.

- **Um aviso no topo:** o plano de cada igreja se escolhe em Igrejas, e igreja sem plano não tem módulo nenhum.
- **Um cartão por plano,** do mais barato ao mais caro (e por nome, no empate):
  - o nome e quantas igrejas usam o plano ("Nenhuma igreja", "1 igreja", "3 igrejas");
  - o valor em destaque ("R$ 249,90/mês", ou "Grátis" — `valorDoPlano`);
  - a descrição;
  - **todos os módulos**, com ✓ verde nos que o plano libera e ✕ apagado nos que não: o que falta também importa;
  - no rodapé, "N de 3 módulos", editar e apagar.
- **Apagar** só plano que nenhuma igreja usa: com igreja, o botão fica desligado e a dica diz para trocar o plano delas antes. Apagar pede confirmação.
- **Sem plano nenhum:** "Nenhum plano ainda. Crie o primeiro e escolha-o nas igrejas."
- **Novo / editar** (`components/modalPlano.tsx`):
  - **nome:** obrigatório, de 2 a 60 letras; nome repetido, mesmo com outras maiúsculas, a API recusa;
  - **valor mensal:** máscara de centavos, como o valor do dízimo — digita-se só números. Com zero, a ajuda diz que o plano aparece como gratuito;
  - **descrição:** opcional, até 300 letras;
  - **módulos:** uma caixinha por módulo, com o que cada um abre. Os marcados são salvos na ordem do menu.
  - **Editando plano em uso,** o texto avisa que vale na hora para as N igrejas dele, que o que sai some do painel delas e que nada é apagado.

### Escolher o plano da igreja (Igrejas, `/admin/igrejas`)

Também só dev e super admin (`docs/igrejas.md`).

- **No cartão da igreja:** "Plano X", ou **"Sem plano"** em laranja, porque sem plano a igreja não tem módulo nenhum. A dica mostra os módulos do plano.
- **No formulário da igreja,** o campo **Plano**:
  - as opções são "Sem plano" e cada plano com o valor ("Completo · R$ 149,90/mês");
  - a ajuda embaixo lista os módulos do plano escolhido, ou diz que ele não libera nenhum.

### Meus planos (`/admin/meus-planos`)

Para quem trabalha numa igreja (admin e tesouraria; `ADMIN_AREA_ROLES` na rota). No menu, "Meus planos" fica no grupo Administrador, logo abaixo de Início — para quem não é super admin (ele tem Planos). Tela: `src/features/admin/planos/meusPlanos.tsx`; dados de `GET /churches/:churchId/plano`, que **não** diz quantas igrejas usam cada plano (não é da conta de uma igreja).

- **Seletor de igreja** no topo (`ChurchScopeBar`, `useIgrejaSelecionada(true)`): quem trabalha em mais de uma escolhe de qual ver.
- **O plano da igreja, em destaque:**
  - um cartão grande, com degradê na cor primária e o ícone do plano apagado ao fundo;
  - o selo "Seu plano", o nome, a descrição e o valor em destaque ("R$ 149,90 /mês" ou "Grátis");
  - embaixo, os módulos em pílulas: **Membros** sempre, que toda igreja tem; os do plano com ✓ verde; os de fora tracejados, com cadeado.
- **Sem plano:** um aviso no lugar do destaque — "Sua igreja ainda não tem plano. Por enquanto ela usa só o básico: Início e Membros".
- **Compare os planos:** um cartão por plano, do mais em conta ao mais completo, com valor, descrição e os módulos (✓ ou cadeado).
  - O plano atual ganha aro na cor primária e o selo **Atual**.
  - Os outros ganham o selo **"+N módulos"**, com quantos têm a mais que o atual, e cada módulo a mais vem em negrito, com "a mais que o seu". É o que faz alguém querer trocar.
  - Sem plano atual, tudo seria "a mais": fica só o selo.
- **Rodapé:** "Para mudar de plano, fale com quem administra o sistema" — a tela não troca o plano.
- **Celular:** o valor do destaque desce para baixo do nome, e os cartões ficam um por linha.

## Como o painel respeita o plano

É **usabilidade**: esconde o que a igreja não tem, para ninguém clicar e levar 403. Quem recusa de verdade é a API (`ModuloGuard` e as conferências nos services — ver o doc do servidor).

- **Os módulos de cada igreja vêm na sessão:** `church.modulos` em cada vínculo (`churchRoles`), devolvido por `/auth/validate` e `/auth/admin/validate` e renovado a cada navegação no painel.
- **Quem junta é `useModulos()`** (`src/hooks/useModulos.ts`):
  - `temModulo(m)`: alguma igreja da pessoa tem o módulo? Sempre sim para dev e super admin;
  - `igrejaTem(id, m)`: esta igreja tem?
- **Menu:** item de módulo que nenhuma igreja da pessoa tem sai da régua (`MODULO_DO_LINK` na `sideBar`). São Eventos, Notícias e Tesouraria e, em Configurações, Pagamentos (Eventos), Disparadores (Notícias) e Integrações (Tesouraria). Grupo de Configurações sem item nenhum também some.
- **Rotas:** `RequireRole` aceita `modulo`. Sem nenhuma igreja com ele, a rota mostra `ForaDoPlano`: "O plano da sua igreja não inclui o módulo X. Para usá-lo, fale com quem administra o sistema".
  - Têm `modulo` as rotas de Eventos, Notícias e Tesouraria, e as de Pagamentos, Disparadores e Integrações.
  - **Telas de um evento** (`RequireEventRole`: editar, check-in, quadrante): a igreja **daquele** evento precisa ter Eventos.
  - **Tesoureiro(a) de evento** (`aceitaTesoureiro`): passa sem essa conta, porque não tem igreja; a API confere o plano da igreja do evento.
- **Seletor de igreja:** `useIgrejaSelecionada(incluirTesouraria, modulo)` só oferece, para admin e tesouraria, as igrejas com o módulo da tela no plano:
  - Tesouraria e Integrações → Tesouraria;
  - Disparadores → Notícias;
  - Pagamentos → Eventos.
- **Pagamentos numa igreja sem Eventos:** só dev e super admin chegam lá (o admin nem vê o item). A tela avisa "O plano desta igreja não inclui Eventos: ela não recebe pelo site", sem a grade de gateways.
- **`/configuracoes`** abre na primeira tela que a pessoa alcança:
  - para admin, Pagamentos (se alguma igreja dele tem Eventos), senão WhatsApp (Notícias);
  - para os demais, Integrações. A tesouraria não entra em Pagamentos.
  - Sem nenhuma, cai em Integrações, que diz que está fora do plano. Dev e super admin abrem em Pagamentos.
- **Área do usuário:** usa `chargesOnline` (e `modulePayment`) do evento para oferecer ou não o pagamento na inscrição, em Minhas Inscrições e na loja do evento.

## Código

- `src/constants/modulos.ts`: os módulos (`MODULOS`, com rótulo e o que cada um abre; `ROTULO_DO_MODULO`).
- `src/hooks/useModulos.ts`: os módulos das igrejas da pessoa.
- `src/components/foraDoPlano`: a tela de módulo fora do plano; `src/components/requireRole`: a guarda de rota com `modulo`.
- `src/features/admin/planos`:
  - `api.ts`: hooks; salvar ou apagar plano recarrega planos, igrejas e "Meus planos";
  - `index.tsx` (Planos), `meusPlanos.tsx`, `components/modalPlano.tsx`;
  - `valor.ts`: `valorDoPlano`, "R$ X/mês" ou "Grátis".
- `src/features/admin/churches/index.tsx`: o plano no cartão e no formulário da igreja.

## Limites conhecidos

- **Sessão aberta:** a mudança de plano chega na próxima navegação no painel, não no meio da tela.
