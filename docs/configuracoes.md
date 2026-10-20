# Configurações (/configuracoes)

Área onde dev, super admin e admin configuram o que roda por igreja: o gateway
que recebe as inscrições e o número de WhatsApp que dispara os avisos. Também
reúne, à parte, os Termos de Uso da plataforma inteira. A régua lateral é
quem lista as sub-seções; a URL não tem página de índice própria.

## Quem acessa e como as sub-seções se organizam

- **`/configuracoes`:** redireciona para a primeira tela que a pessoa tem, pelo perfil e pelo plano das igrejas dela: Pagamentos (admin, com Eventos; dev e super admin sempre), WhatsApp (admin, com Notícias) ou Integrações. Não existe uma tela de boas-vindas da área.
- **Menu em grupos, um por módulo:** **Eventos** (Pagamentos), **Notícias** (Disparadores › WhatsApp), **Tesouraria** (Integrações), **Sistema** (Termos de Uso, só dev e super admin). "Voltar ao painel" fica no topo, sem grupo. Grupo sem item não aparece.
- **Plano da igreja:** cada tela segue o módulo a que serve — Pagamentos é de Eventos, Disparadores de Notícias, Integrações de Tesouraria: fora do plano de todas as igrejas da pessoa, somem do menu e a rota mostra que está fora do plano; o seletor de igreja lista todas as igrejas da pessoa, e a escolhida sem o módulo mostra o aviso de fora do plano (ver `docs/layout-e-navegacao.md`). Vale para dev e super admin também. Ver `docs/planos.md`.
- **`Gateways de pagamento` (`/configuracoes/pagamentos`):** liberado para `ADMIN_ROLES` (dev, super admin e admin).
- **`Disparadores` (`/configuracoes/disparadores`):** redireciona para `/configuracoes/disparadores/whatsapp` — "Disparadores" é um grupo de canais, hoje só o WhatsApp, sem página de índice própria (o segundo canal, quando existir, decide para onde esse redirecionamento aponta).
- **`WhatsApp` (`/configuracoes/disparadores/whatsapp`):** liberado para `ADMIN_ROLES`. Já foi restrito a super admin porque o número era um só para o sistema inteiro; hoje é por igreja (`churches/:churchId/whatsapp`, com `ChurchTenantGuard` no servidor), então quem administra uma igreja só mexe na dela.
- **`Termos de Uso` (`/configuracoes/termos`):** liberado só para `SUPER_ADMIN_ROLES` (dev e super admin) — vale para a plataforma inteira, não é recorte por igreja.
- **Tesouraria fica fora das três:** dá baixa em pagamento, mas não decide para qual conta o dinheiro vai nem por qual número o aviso sai.
- **Recorte real por igreja é do servidor:** o `ChurchTenantGuard` na API é quem de fato impede um admin de mexer em outra igreja — as guardas de rota aqui são usabilidade, não a barreira de segurança.

Arquivos: `src/pages/settings/routes/index.tsx`, `src/constants/roles.ts`.

### Alternador de igreja

Pagamentos e WhatsApp são configurados por igreja e compartilham o mesmo
controle de contexto, no cabeçalho da página (não numa faixa própria abaixo do
título):

- **Quem vê o quê:** super admin e dev enxergam todas as igrejas (via listagem de igrejas); admin vê só as que administra.
- **Sem igreja vinculada:** admin sem nenhuma igreja recebe um aviso informativo em vez da tela de configuração.
- **Só uma igreja:** o controle vira rótulo fixo (sem seta, sem menu) — não faz sentido oferecer troca de contexto quando não há para onde trocar.
- **Persistência:** é a mesma escolha de igreja do painel inteiro (`useIgrejaEscolhida`, no `localStorage`, separada por usuário). Quem escolheu a Filial em Notícias abre Pagamentos e WhatsApp já na Filial. Se a escolha for a visão DEV da home, a tela pede uma igreja. Até 09/10/2026 era um `sessionStorage` só das Configurações.
- **Sem escolha, nada é deduzido (multitenant):** com uma igreja só, ela vale sozinha. Com várias (super admin, dev, admin de mais de uma), a tela começa sem igreja: a barra mostra "Escolha a igreja" e o conteúdo dá lugar a um aviso pedindo a escolha (`precisaEscolher`). Nenhuma igreja é consultada antes disso. Até 09/10/2026 a tela começava na primeira igreja da lista, e o super admin podia parear o número ou cadastrar a conta de recebimento na igreja errada sem perceber.
- **Vínculo removido:** se a igreja guardada sai da lista de quem a pessoa administra, a escolha é descartada e a tela volta a pedir uma igreja (ou usa a única, se só sobrou uma).
- **Trocar de igreja reinicia o formulário em andamento:** a tela de WhatsApp derruba número digitado e volta para o modo QR ao trocar de igreja (evita parear o telefone errado).

Arquivos: `src/features/settings/shared/useIgrejaSelecionada.ts`, `src/features/settings/shared/churchScopeBar.tsx`.

## Gateways de pagamento por igreja

Tela em `src/pages/settings/payments/index.tsx` (`PaymentsSettings`), corpo em
`src/features/settings/payments/`. Cada igreja escolhe e cadastra credenciais
para os gateways que aceita — hoje PagBank, Mercado Pago, InfinitePay e Ton. As
regras de como o servidor valida, cifra e roteia essas credenciais e cobranças
estão em `ic-backend docs/pagamentos.md`; aqui documenta-se só o que a tela
mostra e permite configurar.

### Cobrança online (a igreja recebe pelo site?)

- **Vem com o módulo Eventos do plano da igreja e liga e desliga por igreja** (ver `docs/planos.md`): a igreja cobra pelo site com Eventos no plano **e** a cobrança ligada, se tiver gateway.
- **O interruptor (`moduloDePagamento.tsx`)**, no topo da tela: dev e super admin ligam e desligam a cobrança da igreja (`useSetPaymentModule` → `PATCH /churches/:churchId/payment-providers/module`). Ligado, fica neutro ("Cobrança online"); desligado, âmbar, explicando que os inscritos não veem pagamento e que as credenciais continuam guardadas. O admin da igreja não alterna: só vê o aviso quando está desligada ("Fale com o suporte para religar"). Com a cobrança desligada a grade de gateways some. Saiu junto com a chegada dos planos e voltou em 13/10/2026.
- A tela **Pagamentos** só aparece no menu, e só oferece no seletor, as igrejas com Eventos no plano. Sem nenhuma, a rota mostra que está fora do plano. O super admin vê todas: numa sem Eventos, a tela avisa que ela não recebe pelo site e não mostra a grade de gateways.
- Sem Eventos, os inscritos não veem nada de pagamento no site e cobranças em aberto não recebem baixa automática. As credenciais cadastradas continuam guardadas.

### "Recebendo agora" e a grade de gateways

- **Recebendo agora:** faixa de destaque mostrando qual gateway é o padrão (`isDefault`) da igreja hoje — a pergunta mais cara da tela. Sem gateway padrão, mostra um aviso de que os inscritos não conseguem pagar pelo sistema.
- **Um cartão por gateway**, sempre os quatro (mesmo os não configurados), mostrando: nome/logo, situação, resumo, tabela de taxas (ou os métodos de pagamento aceitos, se não houver tabela cadastrada) e as ações disponíveis.
- **Situação de cada cartão:** `Não configurada` → `Desligada` (configurada mas `enabled: false`) → `Pronta para usar` (ligada, mas não é a padrão) → `Recebendo` (ligada e padrão).
- **Selo "Em teste":** aparece nos gateways que ainda não fecharam um ciclo completo em produção (hoje: Mercado Pago, InfinitePay e Ton — só o PagBank já rodou de ponta a ponta com inscrição paga). Convite para conferir no painel do gateway se as primeiras baixas chegaram sozinhas.
- **Modo Sandbox:** cartão e faixa "Recebendo agora" avisam quando o gateway padrão está em sandbox (pagamento de teste, dinheiro não entra de verdade).
- **Ações por cartão:** Configurar/Editar (abre o formulário), "Usar esta" (torna padrão, só aparece se já ligada e não for a padrão), testar conexão (ícone, mostra o resultado num popover), e o menu (⋮) com "Gerar novo endereço de notificação" (gira o segredo do webhook) e "Remover credenciais".
- **Cofre indisponível:** se o servidor não tiver a chave de cifragem configurada (`PAYMENT_CREDENTIALS_KEY`), a tela mostra um alerta de erro e nenhuma integração pode ser cadastrada ou usada.

Arquivos: `src/features/settings/payments/components/paymentProviders.tsx`, `.../recebendoAgora.tsx`, `.../providerCard.tsx`.

### Formulário de credenciais (modo teste vs produção)

- **Sem preenchimento automático:** os campos de credencial usam `semAutopreencher` (`src/features/settings/shared/semAutopreencher.ts`): o segredo é `autocomplete="new-password"` (o Chrome ignora `off` em campo de senha) e todos levam os `data-*` que 1Password, LastPass e Bitwarden respeitam. Sem isso, o navegador tratava o formulário como login e preenchia o primeiro campo com o CPF e o segredo com a senha salva da pessoa.
- **Campos dinâmicos:** o formulário não tem layout fixo por gateway — os campos vêm do backend (`integracao.fields`, com rótulo, obrigatoriedade, se é segredo e texto de ajuda). Uma integração nova aparece pronta, sem precisar de deploy do front.
- **Ambiente (Sandbox × Produção):** só o **dev** vê e altera o seletor de ambiente. Admin e super admin não veem esse campo — o formulário simplesmente não envia o modo, e o servidor mantém o que já estava gravado. Se a integração já estiver em sandbox, quem não é dev vê um aviso fixo dizendo isso.
- **Campos secretos:** voltam mascarados do servidor (ex.: `••••4F2A`) e o campo de edição começa em branco; deixar em branco ao salvar significa "manter o que já está lá". O tipo do input é `password`, para não deixar o token legível numa tela compartilhada.
- **Integração ativa / Cobrar os inscritos por aqui:** dois interruptores dependentes — desligar "ativa" desliga também "usar como padrão"; "usar como padrão" só pode ser marcado com a integração ativa.
- **Salvar fica bloqueado** enquanto faltar preencher um campo obrigatório (contando como preenchido um segredo já salvo mesmo com o campo em branco).
- **Credenciais nunca voltam à tela** depois de salvas — ficam cifradas no banco.

Arquivo: `src/features/settings/payments/components/providerForm.tsx`.

### Webhooks (endereço de notificação)

- **Quando aparece:** só para gateways que exigem cadastro de URL no painel deles — hoje Ton (só resolve webhook por conta) e Mercado Pago (aceita URL por cobrança, mas em modo sandbox só notifica o endereço cadastrado no painel). PagBank e InfinitePay recebem a URL dentro da própria chamada de criação da cobrança e não mostram esta seção.
- **O que a tela oferece:** lista os endereços a cadastrar, com botão de copiar (não é link clicável — abrir no navegador jogaria o segredo da URL no histórico).
- **Assinatura:** quando o gateway assina a notificação (`signsWebhook`), a tela mostra só uma legenda de cautela; quando não assina, mostra um alerta mais forte — o segredo da URL é a única barreira entre um POST forjado e uma inscrição marcada como paga.
- **Girar o segredo** ("Gerar novo endereço de notificação", no menu do cartão): pede confirmação e avisa da consequência conforme o tipo de cadastro — se depende de painel, nenhuma baixa automática chega até alguém recadastrar lá; se não depende, cobranças já abertas param de dar baixa (as novas já saem com o endereço novo).
- **Regras de validação e assinatura do lado do servidor:** ver `ic-backend docs/pagamentos.md`, seção de webhooks.

Arquivo: `src/features/settings/payments/components/webhookUrls.tsx`.

### Tabela de taxas

- **Fonte:** valores estáticos mantidos no front (`PROVIDER_PRICING`), não vêm do backend — são "material de escolha", já que nenhuma conta do sistema usa esses números para cobrar de fato (o repasse real segue a tabela negociada no painel de cada gateway).
- **Exibição:** recolhida por padrão dentro de cada cartão (accordion), com forma de pagamento, taxa (ou "não divulgada" quando o gateway aceita a forma mas não publica preço) e prazo de liquidação quando conhecido.
- **Rodapé de cada tabela:** mês da consulta, uma nota específica do gateway quando houver, aviso de que todo gateway negocia taxa por faturamento, e link para a fonte.
- Vale só para checkout/link de pagamento — não para maquininha, que tem outra tabela.
- **Última consulta: out/2026**, nas páginas públicas de link/checkout de cada gateway. Mudanças em relação a set/2026: Mercado Pago passou a cobrar Pix (0,99%) e publica crédito em 14 dias (4,48%), 12x (17,28%), débito só no Débito Virtual CAIXA (3,99%) e boleto (3,99%); PagBank publica boleto (4,99% + R$ 0,40 em 14 dias, 3,99% + R$ 0,40 em 30) e deixou de publicar o débito; InfinitePay mostra a taxa geral do link (crédito à vista 4,20% em 1 dia útil, 5,49% na hora; 12x 16,66% e 18,29%), com as reduzidas por faturamento na nota; Ton publica crédito à vista a partir de 3,19% e a cobrança mínima de R$ 10,00. Páginas de oferta de maquininha (ex.: ton.com.br/oferta-ton) não servem de fonte.

Arquivo: `src/features/settings/payments/constants.ts` (`PROVIDER_PRICING`), `src/features/settings/payments/components/providerFees.tsx`.

## Integrações (`/configuracoes/integracoes`)

Serviços externos ligados a cada igreja, escolhida no alternador do topo (admin e tesouraria: a Pluggy alimenta o módulo da tesouraria). A tela é uma grade de cards, no molde dos gateways em Pagamentos (um por linha no celular, dois no tablet, três na tela grande); hoje só a Pluggy, e a próxima integração entra como mais um card.

- **Card da Pluggy** (`src/features/settings/integrations/pluggyIntegration.tsx`): marca, nome e a situação numa linha só, com o pontinho colorido:
  - **Não configurada** (cinza);
  - **Desligada** (cinza, marca acinzentada);
  - **Conectada · N bancos** (verde; o card ganha borda e fundo levemente verdes, como o gateway que recebe);
  - **Reconectar no MeuPluggy** (âmbar), quando a Pluggy avisa que um banco pede reconexão;
  - **Indisponível no servidor** (vermelho), sem a chave de cifragem (`PAYMENT_CREDENTIALS_KEY`).
  
  Embaixo, o que ela faz em duas linhas fixas e a hora da última leitura do extrato ("Última leitura há 2 horas"), que muda a cada "Importar do banco" em Tesouraria › Administrativa (ver `docs/tesouraria.md`). No rodapé, Configurar (ou Editar) e o teste de conexão; no menu ⋮, Remover integração (com confirmação; os bancos continuam conectados no MeuPluggy).
- **Altura fixa:** nada que acontece muda a altura do card. O resultado do teste (banco a banco: nome, situação e contas, ou o erro) flutua ancorado no botão, e a configuração abre numa janela — para a grade não pular quando houver outros cards ao lado.
- **Configuração** (`pluggyForm.tsx`, `ResponsiveModal`): Client ID e Client Secret do dashboard da Pluggy (em branco mantém o gravado; o secret é campo de senha), os bancos conectados e "Integração ativa".
- **Bancos conectados (Item IDs):** um campo por banco ("Banco 1 · Item ID", "Banco 2 · Item ID"…), cada um com a lixeira ao lado, e "Adicionar banco" embaixo (o campo novo já vem com o cursor). Colar vários IDs de uma vez num campo (por linha, vírgula ou espaço) abre um campo para cada. Vazios saem e repetidos contam uma vez ao salvar; com um só campo, a lixeira só limpa ele. Salvar fecha a janela; Cancelar descarta o que foi digitado. Sem a chave de cifragem, a janela mostra o alerta e não salva.
- **Bancos e tesourarias:** acima dos Item IDs, a escolha entre **sem restrição de tesouraria** (todo o extrato é da Administrativa, e as tesourarias de evento e de congregação distribuem dele) e **bancos divididos por tesouraria** (cada banco ganha um select com a tesouraria dele: Administrativa, Eventos ou Congregações; a escolha é guardada pelo Item ID, e não pela posição). **É salva** junto com os Item IDs (`splitByTreasury` e `itemAccounts`), e salvar reconta a conta dos movimentos já importados pelo banco de onde vieram. O extrato dos bancos de Eventos é o que a conciliação de cada tesouraria de evento distribui (ver `docs/tesouraria.md`), e o dos bancos de Congregações, o que a de cada congregação distribui (`docs/tesouraria-congregacoes.md`). Com os bancos divididos, aparece também a **conta das congregações**, travada em "Uma conta para todas as congregações" ("Uma conta por congregação" fica à vista, desligada, "em breve").
- **Sem preenchimento automático:** os campos de credencial usam `semAutopreencher` (`src/features/settings/shared/semAutopreencher.ts`), o mesmo dos gateways. Sem ele, o navegador via Client ID + Client Secret como um login e colocava ali o CPF e a senha salvos da pessoa.
- **Marca:** `src/assets/integracoes/pluggy.svg`, uma reconstrução pela cor e pela inicial (como as marcas de gateway), não o arquivo oficial — trocar é substituir o `.svg`.

## WhatsApp

Tela em `src/pages/settings/dispatchers/index.tsx` (`DispatcherWhatsapp`),
componente principal em
`src/features/settings/whatsapp/components/whatsappConnection.tsx`. Cada
igreja pareia seu próprio número — quem publica notícia marcada para grupos de
WhatsApp dispara pelo número conectado aqui, um envio de cada vez, com
intervalo entre eles.

- **Sem igreja vinculada:** mostra aviso informativo, sem o painel de conexão.
- **Estados da sessão (`WhatsappStatus`):** `DISCONNECTED` (sem número, nada sai nos grupos), `CONNECTING` (pareamento em andamento, aguardando confirmação no celular) e `CONNECTED` (ativo, com número, nome do WhatsApp e data de conexão exibidos).
- **Dois caminhos de pareamento**, em abas: **QR code** (renderizado a partir de um texto que o servidor devolve, com `qrcode.react`; o código se renova sozinho e a tela consulta o status a cada 3s enquanto conecta, para não deixar o QR na tela vencido) e **código por número de telefone** (a pessoa digita DDI+DDD+número, o servidor devolve um código de 8 caracteres para digitar no celular).
- **Aviso fixo "Qual número conectar":** informativo, sem tom de alerta — a conexão funciona como o WhatsApp Web (o sistema vira um aparelho conectado ao número) e o indicado é um número do ministério, como o da secretaria, separado das conversas pessoais. Cita o bloqueio uma vez, como consequência de o envio ser automático (o WhatsApp pode entender o número como um bot), e não fala em denúncia nem em perda de conversas: o texto antigo assustava, e a intenção é só dar ciência.
- **Cancelar pareamento:** disponível enquanto está em `CONNECTING`; volta a tela ao estado inicial (some QR/código, limpa número digitado).
- **Desconectar:** disponível só quando `CONNECTED`; some a sessão e o próximo uso exige novo pareamento.
- **Trocar de igreja** reinicia o formulário de pareamento (número digitado e aba voltam ao padrão) — evita parear o telefone errado na igreja errada.
- **Aviso de canal fora do ar** (`WhatsappOfflineAlert`, usado fora desta tela, ex. ao publicar notícia): avisa quando não há número conectado ou o pareamento ainda não terminou, com atalho para `/configuracoes/disparadores`. Regras de envio de notícia por WhatsApp em si (fila, intervalo entre grupos etc.) ficam em `ic-backend docs/noticias-e-whatsapp.md`.

Arquivos: `src/pages/settings/dispatchers/index.tsx`, `src/features/settings/whatsapp/components/whatsappConnection.tsx`, `src/features/settings/whatsapp/components/whatsappOfflineAlert.tsx`, `src/features/settings/whatsapp/useWhatsappConectado.ts`.

## Disparadores

"Disparadores" é o nome do grupo de canais de aviso automático, não uma tela
própria — hoje ele tem um único canal, o WhatsApp, descrito acima. Não há
formulário de "criar disparador": a rota `/configuracoes/disparadores`
apenas redireciona para `/configuracoes/disparadores/whatsapp`, e é essa
página que concentra a configuração do canal. Quando um segundo canal existir,
ele entra como uma tela irmã desta, listada ao lado dela na régua lateral, sem
precisar de uma tela de índice.

Arquivo: `src/pages/settings/routes/index.tsx`.

## Termos de Uso

Tela em `src/pages/settings/terms/index.tsx` (`TermsSettings`), liberada só
para super admin e dev. Permite editar o texto vigente dos Termos de Uso num
editor rico, ajustar as frases de resumo do topo da página pública, marcar
uma publicação como "mudança relevante" (exige novo aceite de todos os
usuários) ou como correção (não exige), e consultar o histórico de versões já
publicadas, cada uma com quem publicou, quando e quantos aceites recebeu.

O detalhamento completo de regras (o que pode/não pode ir no texto, o que
"mudança relevante" implica no restante do sistema, como versões e aceites se
relacionam) está em [termos-de-uso.md](termos-de-uso.md); esta seção só resume
a tela. As regras de servidor estão no `ic-backend`, em `docs/termos.md`.

Arquivo: `src/pages/settings/terms/index.tsx`.
