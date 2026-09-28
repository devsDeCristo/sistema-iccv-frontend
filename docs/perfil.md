# Perfil (/perfil)

Tela do próprio cadastro de quem está logado: foto, dados pessoais e troca de
senha. Todas as chamadas usam as rotas `me` da API, com o id tirado do token —
não há como pedir ou alterar o cadastro de outra pessoa por aqui.

## Acesso

- **Rota:** `/perfil`, dentro da área de usuário logado (mesma régua para admin e usuário comum — o perfil é comum aos dois).
- **Entrada:** menu da conta na barra do topo ("Meu perfil").

Arquivos: `src/routes/index.tsx`, `src/pages/profile/index.tsx`.

## Cabeçalho

- Foto (com iniciais como alternativa), nome completo, e-mail e CPF (formatado, só leitura).
- **Trocar foto:** menu com "Tirar foto com a câmera" (webcam) ou "Escolher arquivo" (`.jpeg`, `.png`, `.webp`). Envio via `POST /users/me/profile-photo`; ao concluir, o cadastro é atualizado e a barra do topo (nome/foto) é sincronizada.

## Aba "Meus dados"

- Mesmo formulário usado no cadastro (`Form`) e na edição pelo admin, com o **CPF travado** (não editável).
- **Salvar sem trocar e-mail:** `PUT /users/me` direto com os dados novos.
- **Trocar e-mail:** exige confirmar a **senha atual** num diálogo antes de salvar — o servidor recusa a troca de e-mail sem a senha de qualquer forma; a tela só antecipa a pergunta em vez de deixar o erro estourar depois de preencher tudo.
  - Senha errada: o erro aparece no próprio campo da senha (não em toast solto), e a pessoa pode tentar de novo sem perder o que preencheu.
  - Cancelar: fecha o diálogo sem salvar nada.

Arquivo: `src/pages/profile/index.tsx` (`MeusDados`).

## Aba "Segurança" — troca de senha

- **Campos:** senha atual, nova senha, confirmação da nova senha.
- **Validação:** mesmo schema de senha nova do cadastro e da redefinição (8 a 72 caracteres), mais a exigência de informar a senha atual.
- **Envio:** `POST /auth/password/change` com `currentPassword` e `password`.
- **Regras de segurança mostradas na tela** (texto ao lado do formulário):
  - A senha atual é pedida para confirmar identidade.
  - Um aviso por e-mail é enviado sempre que a senha muda.
  - Depois de 5 tentativas com a senha atual errada, a troca fica **bloqueada por 15 minutos**.
- **Esqueceu a senha atual:** link para `/esqueci-senha` (redefinição por código, sem precisar da senha atual) — ver `docs/login-e-cadastro.md`.
- **Sucesso:** limpa o formulário e mostra confirmação de que um aviso foi enviado por e-mail.

Arquivo: `src/pages/profile/index.tsx` (`MinhaSenha`, `Seguranca`); `src/features/profile/api.ts` (`useChangePassword`).

## Dados e API

| Ação | Rota |
| --- | --- |
| Carregar o próprio cadastro | `GET /users/me` |
| Salvar dados pessoais | `PUT /users/me` |
| Enviar/trocar foto | `POST /users/me/profile-photo` |
| Trocar senha | `POST /auth/password/change` |

Arquivo: `src/features/profile/api.ts`.

## Servidor

O limite de 5 tentativas e o bloqueio de 15 minutos na troca de senha são
aplicados no servidor; o front só exibe o aviso. Detalhes no `ic-backend`, em
`docs/autenticacao.md` (troca de senha) e `docs/usuarios.md` (`/users/me`).
