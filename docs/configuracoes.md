# Configurações (/configuracoes)

Área onde dev, super admin e admin configuram o que roda por igreja: o gateway
que recebe as inscrições e o número de WhatsApp que dispara os avisos. Também
reúne, à parte, os Termos de Uso da plataforma inteira. A régua lateral é
quem lista as sub-seções; a URL não tem página de índice própria.

## Quem acessa e como as sub-seções se organizam

- **`/configuracoes`:** redireciona direto para `/configuracoes/pagamentos`. Não existe uma tela de boas-vindas da área.
- **`Gateways de pagamento` (`/configuracoes/pagamentos`):** liberado para `ADMIN_ROLES` (dev, super admin e admin).
- **`Disparadores` (`/configuracoes/disparadores`):** redireciona para `/configuracoes/disparadores/whatsapp` — "Disparadores" é um grupo de canais, hoje só o WhatsApp, sem página de índice própria (o segundo canal, quando existir, decide para onde esse redirecionamento aponta).
- **`WhatsApp` (`/configuracoes/disparadores/whatsapp`):** liberado para `ADMIN_ROLES`. Já foi restrito a super admin porque o número era um só para o sistema inteiro; hoje é por igreja (`churches/:churchId/whatsapp`, com `ChurchTenantGuard` no servidor), então quem administra uma igreja só mexe na dela.
- **`Termos de Uso` (`/configuracoes/termos`):** liberado só para `SUPER_ADMIN_ROLES` (dev e super admin) — vale para a plataforma inteira, não é recorte por igreja.
- **Financeiro fica fora das três:** dá baixa em pagamento, mas não decide para qual conta o dinheiro vai nem por qual número o aviso sai.
- **Recorte real por igreja é do servidor:** o `ChurchTenantGuard` na API é quem de fato impede um admin de mexer em outra igreja — as guardas de rota aqui são usabilidade, não a barreira de segurança.

Arquivos: `src/pages/settings/routes/index.tsx`, `src/constants/roles.ts`.

### Alternador de igreja

Pagamentos e WhatsApp são configurados por igreja e compartilham o mesmo
controle de contexto, no cabeçalho da página (não numa faixa própria abaixo do
título):

- **Quem vê o quê:** super admin e dev enxergam todas as igrejas (via listagem de igrejas); admin vê só as que administra.
- **Sem igreja vinculada:** admin sem nenhuma igreja recebe um aviso informativo em vez da tela de configuração.
- **Só uma igreja:** o controle vira rótulo fixo (sem seta, sem menu) — não faz sentido oferecer troca de contexto quando não há para onde trocar.
- **Persistência:** a igreja escolhida fica em `sessionStorage` (chave `configuracoes_igreja`), não em estado de página — trocar entre Pagamentos e WhatsApp mantém a mesma igreja selecionada. Some ao fechar a aba.
- **Vínculo removido:** se a igreja guardada sai da lista de quem a pessoa administra, a escolha cai para a primeira disponível.
- **Trocar de igreja reinicia o formulário em andamento:** a tela de WhatsApp derruba número digitado e volta para o modo QR ao trocar de igreja (evita parear o telefone errado).

Arquivos: `src/features/settings/shared/useIgrejaSelecionada.ts`, `src/features/settings/shared/churchScopeBar.tsx`.

## Gateways de pagamento por igreja

Tela em `src/pages/settings/payments/index.tsx` (`PaymentsSettings`), corpo em
`src/features/settings/payments/`. Cada igreja escolhe e cadastra credenciais
para os gateways que aceita — hoje PagBank, Mercado Pago, InfinitePay e Ton. As
regras de como o servidor valida, cifra e roteia essas credenciais e cobranças
estão em `ic-backend docs/pagamentos.md`; aqui documenta-se só o que a tela
mostra e permite configurar.

### Módulo de pagamento (a igreja recebe pelo site?)

- **O que é:** um interruptor por igreja, acima de tudo, que decide se ela cobra online. Substituiu variáveis de ambiente globais (`PAGBANK_PAYMENT_ENABLED` no servidor, `VITE_MODULE_PAYMENT` na tela), que eram por sistema inteiro.
- **Quem alterna:** só dev ou super admin — continua sendo decisão de plataforma, não do admin da igreja. O admin não vê o interruptor; se o módulo estiver desligado, vê apenas um aviso e é orientado a falar com o suporte.
- **Desligado:** os inscritos não veem nada de pagamento no site, cobranças já em aberto não recebem baixa automática, e a grade de gateways nem aparece (não há o que configurar enquanto não roda). As credenciais cadastradas continuam guardadas — religar devolve tudo como estava.
- **Ligado:** mostra a grade de gateways normalmente.

Arquivo: `src/features/settings/payments/components/moduloDePagamento.tsx`.

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

Arquivo: `src/features/settings/payments/constants.ts` (`PROVIDER_PRICING`), `src/features/settings/payments/components/providerFees.tsx`.

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
- **Aviso de segurança fixo:** recomenda usar um número do ministério, não o pessoal — o sistema entra como mais um aparelho conectado (como WhatsApp Web), sem API oficial, e um uso que pareça automático ou uma denúncia pode levar o número a ser bloqueado.
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
