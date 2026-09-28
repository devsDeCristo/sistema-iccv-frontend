# Usuários (/admin/usuarios)

Gestão de usuários pelo admin: listagem, permissões por igreja, cadastro e
edição de dados pessoais. O formulário de dados (`Form`, em
`src/features/admin/users/components/form.tsx`) é compartilhado com o cadastro
público e a edição de perfil — ver `docs/login-e-cadastro.md` e `docs/perfil.md`
para essas outras telas; aqui o foco é o que muda no uso pelo admin.

## Listagem (`/admin/usuarios`)

- **Acesso:** só `ADMIN_ROLES` (dev, super admin, admin) — o financeiro não entra nesta tela.
- **Cards de resumo:** total de usuários, quantos têm acesso ao painel (`ADMIN_AREA_ROLES`), quantos estão em algum evento `ACTIVE` agora (sem recorte de período) e quantos estão sem nome de crachá (`badgeName`) — esse último importa porque o PDF de crachás descarta em silêncio quem não tem o campo preenchido.
- **Busca:** por nome ou CPF, no cliente.
- **Filtro de igreja:** só aparece para o super admin (escolhe entre todas as igrejas) ou para quem administra mais de uma; com uma igreja só não há o que filtrar. Selecionar uma igreja passa `churchId` para `GET /users`, que devolve quem está nos eventos dela mais os administradores dela.
- **Tabela (DataGrid):** foto, nome, CPF, data de nascimento, contato (celular/e-mail, cada um copiável ao clicar), religião, eventos ativos em que a pessoa está inscrita (chip clicável que leva para a aba de inscritos do evento) e data de cadastro. A coluna "Permissão" mostra um chip por vínculo de igreja (`churchRoles`) para o super admin — ex. "Admin · Igreja X" — e, para quem não é super admin, só o perfil efetivo.
- **Menu de ações (por linha):** "Ver detalhes do usuário" (abre a edição) e "Editar Permissões" (abre o modal de papéis). Os dois ficam desabilitados quando a linha é uma conta Dev e quem está olhando não é Dev — o servidor recusa a alteração com 403, e o menu evita a pessoa esbarrar nesse erro.

Arquivos: `src/pages/admin/users/index.tsx`, `src/features/admin/users/components/list.tsx`, `src/features/admin/users/components/cardsStatus.tsx`.

## Papéis do usuário (roles)

| Perfil | Valor | Escopo |
| --- | --- | --- |
| Dev | -1 | interno; atravessa todas as igrejas; só outro Dev altera a conta |
| Super Admin | 1 | atravessa todas as igrejas; não fica preso a nenhuma |
| Admin | 2 | por igreja — administra os eventos e inscritos daquela igreja |
| Financeiro | 3 | por igreja — acesso restrito a abas financeiras |
| Usuário | 5 | sem vínculo administrativo; é o perfil de quem só se inscreve em eventos |

- **Permissão por igreja:** Admin e Financeiro são vínculos (`churchRoles`), não um valor único — a mesma pessoa pode ser admin de uma igreja e financeiro de outra ao mesmo tempo. `role` no usuário é o perfil efetivo (o mais alto entre os vínculos, ou super admin/usuário comum); é o que decide se ela alcança uma rota. Em qual igreja ela é o quê, quem responde é `churchRoles`.
- **Sem vínculo nenhum:** a pessoa é usuário comum — não entra no painel, mas continua podendo se inscrever em evento de qualquer igreja.
- **Editar permissões (`ModalEditRole`):** lista os vínculos atuais (igreja + perfil), permite trocar o perfil de um vínculo, remover um vínculo ou adicionar um novo. Uma igreja só entra uma vez na lista. Quem edita só pode conceder vínculo nas igrejas que administra (`igrejasQueAdministra`); o super admin concede em qualquer igreja.
  - **Interruptor "Super admin"** (só visível ao super admin, e não sobre conta Dev): ligá-lo apaga todos os vínculos de igreja ao salvar, porque o super admin não é de igreja nenhuma.
  - **Conta Dev:** o modal não a rebaixa — ao salvar, o perfil Dev é preservado independente dos vínculos mostrados, e o formulário fica travado (com aviso) para quem não é Dev.
  - **Vínculo "pendente":** se a pessoa escolher igreja e perfil no formulário de adicionar e clicar direto em Salvar (sem clicar em Adicionar antes), o vínculo montado nos campos entra na gravação do mesmo jeito.

Arquivo: `src/features/admin/users/components/modalEditRole.tsx`.

## Cadastro pelo admin (`/admin/usuario/cadastrar`)

- Mesmo `Form` de dados pessoais do cadastro público, sem a seção de senha (a conta criada pelo admin ainda não tem senha própria).
- Envia `role: 5` (usuário comum) — o cadastro pelo admin não atribui permissão; isso é feito depois, pelo modal de permissões.
- Ao salvar, volta para a listagem de usuários.

Arquivo: `src/pages/admin/users/register/index.tsx`.

## Edição pelo admin (`/admin/usuario/:id/editar`)

- **Abre em modo leitura:** os dados aparecem como texto (`ViewField`), não como campos editáveis. O botão "Corrigir dados"/"Editar" libera a edição; "Cancelar" descarta e volta a exibir os dados salvos.
- **Foto de perfil:** upload de arquivo ou captura por webcam (`WebcamModal`); a foto escolhida fica pendente até o "Salvar" — só então é enviada (`POST` separado do PUT de dados).
- **Permissão fora do formulário:** o `PUT` desta tela nunca envia `role` — quem muda o acesso é só o modal de permissões, para uma edição de dados pessoais nunca rebaixar ou promover ninguém por acidente.
- **CPF editável** aqui (diferente da edição do próprio perfil, onde o CPF é a identidade de acesso e fica travado).

Arquivo: `src/pages/admin/users/edit/index.tsx`.

## Campos do formulário (`Form`)

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| Nome completo | Sim | — |
| Nome do crachá | Não | some do crachá impresso se vazio (ver card "Sem nome no crachá") |
| CPF | Sim | 11 dígitos |
| Data de nascimento | Sim | define se exige dados do responsável |
| Celular | Sim | telefone válido com máscara |
| Contato de emergência | Sim (menor de idade: some, vira "Telefone do responsável") | telefone válido |
| E-mail | Sim | — |
| Profissão | Sim | mínimo 2 caracteres |
| CEP | Sim (formato) | 8 dígitos quando preenchido; busca automática de endereço |
| Rua, Bairro, Cidade, Estado | Sim | preenchidos pela busca de CEP ou à mão |
| Número | Sim | texto livre — aceita "s/n" ou "120-A" |
| Dados de saúde (diabetes, hipertensão) | Só com consentimento | exigidos apenas quando "Autorizo o uso dos dados de saúde e de religião" está marcado |
| Observações | Não | alergias etc. |
| Religião | Não | trava em "Não informado" sem o consentimento acima |
| Igreja (congregação) | Não | texto livre — pode ser igreja fora do sistema |
| Ministério | Não | cargo de liderança na igreja |
| Nome do pastor | Não | — |
| Nome do responsável | Só se menor de 16 anos | exigido junto do telefone do responsável |
| Indicado por | Sim | quem indicou o evento, mínimo 2 caracteres |

### Endereço e busca automática de CEP

- Digitar os 8 dígitos do CEP dispara uma consulta ao ViaCEP; a resposta preenche rua, bairro, cidade e estado.
- Cada campo preenchido pela consulta é travado individualmente (cadeado, somente leitura) — não o bloco inteiro, porque em municípios de CEP único o ViaCEP devolve a rua vazia, e travar tudo impediria completá-la à mão.
- Apagar um dígito do CEP destrava tudo de novo.
- CEP não encontrado ou serviço fora do ar: destrava os campos e mostra erro, mas não bloqueia o cadastro — o endereço pode ser preenchido manualmente. O link "Endereço errado? Editar manualmente" também destrava tudo.
- Cadastro antigo aberto para edição começa destravado: o dado gravado não veio de consulta nenhuma, então travar impediria corrigir justamente um endereço errado.

### Menor de idade e responsável

- **Idade de corte:** menor de 16 anos (`GUARDIAN_REQUIRED_BELOW_AGE`), calculada a partir da data de nascimento.
- Abaixo dessa idade, o formulário exibe a seção "Dados do responsável do menor" com **Nome do responsável** (obrigatório) e reaproveita o campo de contato de emergência como **Telefone do responsável** (o rótulo muda, o campo é o mesmo).
- Em modo leitura, um cadastro salvo quando a pessoa era menor continua mostrando os dados do responsável mesmo que a idade calculada hoje já tenha passado dos 16 anos — o dado gravado não desaparece da tela.

### Dados de saúde e religião (consentimento)

- Diabetes, hipertensão e religião só ficam disponíveis para preencher com o consentimento explícito ("Autorizo o uso dos dados de saúde e de religião deste cadastro"), amparado no art. 11 da LGPD. Sem ele, os campos aparecem travados em "Não informado" e o servidor descarta o que vier de qualquer forma.
- Desmarcar um consentimento que já estava dado mostra aviso: ao salvar, os dados de saúde e religião deste cadastro são apagados.
- O envio ao servidor só leva `sensitiveDataConsent` quando ele muda em relação ao que o formulário abriu — assim, um admin que corrige só o telefone de um cadastro antigo (com saúde já registrada, sem o consentimento ainda marcado no sistema) não revoga esse consentimento por engano.

Arquivos: `src/features/admin/users/components/form.tsx`, `src/features/admin/users/constants.ts` (`REGISTER_USERS_SCHEMA`), `src/features/admin/users/utils.ts`.

## Associar usuário a evento (associateEvent)

As telas `src/pages/admin/users/associateEvent/index.tsx` e
`src/pages/users/associateEvent/index.tsx` — que ligariam um usuário a um
evento perguntando se ele participa como cursilhista ou cursilheiro (`worker`)
— estão **inteiramente comentadas** e sem rota registrada (a rota em
`src/pages/admin/users/routes/index.tsx` também está comentada). O hook que
faria a chamada, `usePostCreRelationEventToUser`
(`src/features/admin/users/api/postRelationEventUser.tsx`, `POST
/users/:idUser/event/:idEvent`), existe mas não é usado em nenhum componente
ativo. Hoje a associação de usuário a evento acontece pelo fluxo normal de
inscrição no evento (ver `docs/inscricao-no-evento.md`), não por esta tela.

## Pontos de atenção

- `src/pages/users/routes/index.tsx` (rotas do módulo `pages/users`) está inteiramente comentado e não é montado em lugar nenhum — as rotas reais de cadastro/edição pública vivem em `src/routes/index.tsx` e em `src/pages/admin/users/routes/index.tsx`.
- `src/pages/users/edit/index.tsx` não é referenciado por nenhuma rota encontrada no código — parece ser uma versão anterior da edição pelo admin, hoje substituída por `src/pages/admin/users/edit/index.tsx`.
- `src/pages/admin/users/utils.ts` e `src/pages/users/utils.ts` (`getRole`) não têm nenhum import ativo encontrado no código.
- As regras de servidor (campos aceitos, vínculos por igreja, o que cada perfil edita) estão no `ic-backend`, em `docs/usuarios.md`.
