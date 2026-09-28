# Login e cadastro (/login, /usuario/cadastrar, /esqueci-senha)

Entrada no ICCV Eventos: login por CPF e senha, cadastro público (com senha
própria) e redefinição de senha por código enviado por e-mail. Também cobre
como a sessão é guardada e como o front decide para onde mandar a pessoa
depois de entrar.

## Login (`/login`)

- **Campos:** CPF (com máscara) e senha.
- **Envio:** `POST /auth/login` com `document` (CPF sem máscara) e `password`.
- **Sucesso:** grava `access_token` e `user` no `localStorage` e navega.
- **CPF sem cadastro (404):** guarda o CPF digitado em `localStorage` (`cpf`) e leva para `/usuario/cadastrar`, com um aviso ("Você não possui cadastro ainda...").
- **Sessão vencida:** quem chega ao login por sessão expirada (ver `endSession`) recebe um toast "Sua sessão expirou...".
- **Já logado ao abrir `/login`:** redireciona sozinho para `/admin/inicio` (quem entra no painel) ou `/eventos` conforme o papel.
- **Link para os Termos de Uso** (`/termos`) e para o cadastro (`/usuario/cadastrar`).

Arquivos: `src/pages/login/index.tsx`, `src/features/login/components/form.tsx`, `src/features/login/api/postLogin.tsx`, `src/features/login/constants.ts`.

### Para onde vai depois de logar

- **Área inicial:** `ADMIN_AREA_ROLES.includes(role)` decide entre `/admin/inicio` (perfis do painel) e `/home` (usuário comum). Ver `src/constants/roles.ts`.
- **Rota guardada:** se a pessoa foi expulsa de uma rota protegida por sessão vencida, `rememberRoute` guarda `pathname+search`; o login consome essa rota (`takeRememberedRoute`) e só volta a ela se o papel de agora alcança essa rota — `isAdminPath` bloqueia devolver usuário comum para `/admin/*` ou `/configuracoes/*`.
- Rotas públicas (`/login`, `/usuario/cadastrar`) nunca são lembradas como destino de volta.

Arquivo: `src/auth/session.ts`.

## Cadastro (`/usuario/cadastrar`)

- **Público:** acessível sem login, a partir do login (link "Criar cadastro") ou por CPF não encontrado.
- **Dados pessoais:** o mesmo formulário (`Form`) usado no cadastro pelo admin e na edição de perfil.
- **Senha:** seção própria, com o mesmo schema da redefinição de senha (`NEW_PASSWORD_SCHEMA`, 8 a 72 caracteres, confirmação igual) — é a senha com que a pessoa vai entrar depois.
- **Aceite dos Termos de Uso:** checkbox obrigatório, com o texto "Li e aceito os Termos de Uso. Se este cadastro for de menor de idade, declaro ser o responsável legal por ele." Sem marcar, o envio é bloqueado (toast de erro) e o formulário não é submetido. O servidor é quem registra versão, data, IP e aparelho do aceite — o aceite na tela é só a marcação. Ver `docs/termos-de-uso.md`.
- **Envio:** monta o payload com `role: 5` (usuário comum), remove máscaras de CPF/telefone e envia `POST` de criação de usuário.
- **Sucesso:** grava `access_token`/`user` como no login e navega para `/home`.
- **Erro:** mostra a mensagem do servidor, ou uma genérica se a rede caiu.
- **Campo inválido:** ao submeter com erro, mostra toast orientando a conferir os campos destacados (o formulário tem vários blocos e passa da dobra).
- **Botão "Voltar":** só aparece para quem já tem sessão (`usePermission`) — quem chega pelo login não tem para onde voltar dentro do app.

Arquivo: `src/pages/users/register/index.tsx`.

## Esqueci minha senha (`/esqueci-senha`)

Fluxo em três etapas, sem sair da mesma tela:

| Etapa | Campo | Ação |
| --- | --- | --- |
| 1. CPF | CPF | `POST` solicita o código; a organização envia 8 dígitos por e-mail |
| 2. Código | código de 8 dígitos | valida o código e recebe um `ticket` de uso único |
| 3. Nova senha | senha + confirmação | `POST` redefine a senha com o `ticket` |

- **Reenvio de código:** cooldown de 60 segundos, espelhando o do servidor.
- **Código expira em 1 hora** (aviso na tela).
- **Ticket vencido ou já usado (401 na etapa 3):** volta para a etapa 1 e limpa o formulário de código — não adianta tentar de novo com o mesmo ticket.
- **Voltar:** da etapa de senha, volta para a etapa de código (o ticket não serve mais, tem que revalidar); da etapa de código, volta para a etapa de CPF; da etapa de CPF, sai para `/login`.
- **Sucesso:** confirmação e volta para `/login`.

Arquivos: `src/pages/login/forgotPassword/index.tsx`, `src/features/login/api/postForgotPassword.tsx`, `postVerifyResetCode.tsx`, `postResetPassword.tsx`.

## Sessão (`src/auth`)

- **Onde fica:** `localStorage` guarda `access_token`, `user` e `cpf`; `theme` não é apagado no logout (preferência do aparelho, não da sessão).
- **`authLoader` (rotas de usuário):** confere `GET /auth/validate` a cada navegação de rota; grava a resposta por cima do usuário guardado (mescla, não substitui) — é o que mantém `role`/`churchRoles` em dia sem exigir novo login. Erro de rede/5xx não derruba a sessão (fica com o que já está salvo); 401/403 limpa a sessão, guarda a rota atual e redireciona para `/login`.
- **`authLoaderAdmin` (rotas de admin/configurações):** confere `GET /auth/admin/validate`. Como essa rota responde 401 tanto para token inválido quanto para usuário sem acesso ao painel, uma segunda chamada a `/auth/validate` distingue os dois casos: sessão válida mas sem permissão → redireciona para `/home` (não desloga); sessão inválida → limpa e manda para `/login`.
- **`endSession`:** usado pelo interceptor do axios quando uma chamada volta com sessão vencida. Guarda a rota atual, marca `session_expired`, limpa a sessão e recarrega a aplicação em `/login` (garante que cache do react-query e contexto de usuário não atravessem a troca de sessão). Uma trava evita múltiplos redirects quando várias chamadas da mesma tela levam 401 ao mesmo tempo.

Arquivos: `src/auth/session.ts`, `src/auth/functions/authLoader.tsx`, `src/auth/functions/authLoaderAdmin.tsx`.

## Observações

- Não há verificação de e-mail no cadastro: só o aceite de termos e a senha.
- As regras de servidor do login, da sessão e da redefinição de senha estão no
  `ic-backend`, em `docs/autenticacao.md`; as do cadastro, em `docs/usuarios.md`.
