# Termos de Uso (/termos)

Página pública com o texto vigente dos Termos de Uso, o aceite obrigatório
cobrado de quem está logado e o consentimento sobre dados sensíveis (saúde e
religião). O texto é editado em Configurações > Termos de Uso, por quem
administra a plataforma inteira.

## Página pública (`/termos`)

- **Acesso:** sem login — o link sai da tela de login e do cadastro, antes de haver conta.
- **Conteúdo:** vem do servidor (`useGetTerms`), não é texto fixo no front. Mostra a versão vigente com data de publicação, um bloco "Em resumo" (quando a versão tem frases de resumo) e o texto completo.
- **Índice:** gerado a partir dos títulos (`<h2>`) do texto, numerados automaticamente por contador de CSS — quem escreve não numera.
- **Erro ao carregar:** alerta pedindo para tentar de novo.
- **HTML do editor:** passa por `prepararTermos` antes de ir para a tela (`dangerouslySetInnerHTML`), que limpa o conteúdo para só as tags de texto permanecerem.

Arquivo: `src/pages/terms/index.tsx`.

## Aceite obrigatório (`TermsGate`)

- **Onde aparece:** dentro do `Layout`, nas três áreas logadas (usuário, admin e configurações) — é a primeira coisa renderizada, antes da barra do topo.
- **Quando abre:** consulta `GET /terms/status`; se a pessoa ainda não aceitou a versão vigente, abre um diálogo modal que **não fecha sem decisão** — a única saída é "Sair" (logout).
- **Quem cai nele:** conta de antes de existirem os termos, cadastro feito pela organização (que não passa pela tela de cadastro pública) e qualquer pessoa quando o texto muda para uma versão que "exige novo aceite".
- **Envio:** `POST /terms/accept` com `accepted: true`.

### Consentimento de dados sensíveis

- Além do aceite, o gate também pode pedir uma decisão sobre dados de saúde e religião já salvos no cadastro (campo `precisaDecidirDadosSensiveis` da resposta de status) — caso de cadastros antigos que guardaram esses dados sem consentimento explícito.
- **Duas opções (rádio), nenhuma pré-marcada:**
  - **Autorizo o uso desses dados** — envia `sensitiveDataConsent: true` junto do aceite.
  - **Não autorizo — apague esses dados do meu cadastro** — envia `sensitiveDataConsent: false`; a tela avisa que os dados serão apagados e podem ser informados de novo depois.
- Os dois blocos (aceite dos termos e decisão sobre dados sensíveis) podem aparecer juntos no mesmo diálogo; o botão "Continuar" só libera quando todos os campos exigidos estão preenchidos.
- Nada é apagado sem a pessoa escolher — a decisão é sempre explícita.

Arquivo: `src/features/terms/termsGate.tsx`.

## Aceite no cadastro público

O formulário de `/usuario/cadastrar` também tem seu próprio checkbox de aceite
("Li e aceito os Termos de Uso. Se este cadastro for de menor de idade,
declaro ser o responsável legal por ele."), obrigatório para enviar o
cadastro. Ver `docs/login-e-cadastro.md`.

## Edição dos termos (Configurações > Termos de Uso)

- **Rota:** `/configuracoes/termos`.
- **Quem pode editar:** só `SUPER_ADMIN_ROLES` (super admin e dev) — os termos valem para a plataforma inteira, e não por igreja. A rota é protegida por `RequireRole`, e o item de menu "Termos de Uso" só aparece na régua lateral para quem tem `isSuperAdmin`.
- **Editor:** rich text (Quill) com barra mínima (título, negrito/itálico/sublinhado, listas, link). Cada `<h2>` vira uma seção numerada na página pública.
- **Resumo:** até 10 frases curtas, exibidas no topo da página pública antes do texto completo.
- **Publicar nova versão:**
  - Cria uma versão nova; a versão anterior não é alterada — é o texto que alguém aceitou, e permanece disponível no histórico.
  - Interruptor **"Mudança relevante"**: liga quando a mudança altera o que é coletado, para que serve, com quem é compartilhado, valores ou responsabilidades. Ligado, todo mundo (inclusive quem publicou) precisa aceitar de novo no próximo acesso, via `TermsGate`. Desligado, é tratado como correção de texto e ninguém precisa reaceitar.
  - Botão "Publicar" só habilita quando o texto ou o resumo mudaram em relação à versão vigente carregada.
- **Histórico:** lista todas as versões publicadas, com data, quem publicou, se exigiu novo aceite ("Exigiu novo aceite" / "Correção") e quantos aceites cada versão tem registrado. É possível carregar o texto de uma versão antiga de volta no editor (não republica sozinho — precisa clicar em "Publicar" de novo).
- **Link "Ver página pública":** abre `/termos` em nova aba.

Arquivo: `src/pages/settings/terms/index.tsx`.

## Servidor

As regras de servidor (versões, publicação, aceite e o consentimento de dados
sensíveis) estão no `ic-backend`, em `docs/termos.md`.
