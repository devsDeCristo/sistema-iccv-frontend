# Registro de Atividades e Registro de Login (/admin/atividades, /admin/logins)

Duas telas de auditoria do painel administrativo: uma lista tudo que foi criado, alterado ou removido no sistema, a outra lista as tentativas de entrada (login), aceitas ou recusadas. As duas são só leitura, paginadas pelo servidor, e escondidas de quase todo mundo.

## Acesso

- **Registro de Atividades (`/admin/atividades`):** dev e super admin (`RequireRole allowedRoles={SUPER_ADMIN_ROLES}`). A coluna "Conteúdo" mostra o antes e o depois de qualquer tabela, de todas as igrejas, incluindo dado pessoal de inscrito; por isso só entra quem já atravessa todas elas, e o admin de igreja não. Até 10/10/2026 era só o dev.
- **Registro de Login (`/admin/logins`):** só o dev (`RequireRole allowedRoles={[Role.DEV]}`). Documento, IP e aparelho de cada tentativa são investigação de segurança.
- **A API confere o mesmo:** `GET /logs*` para dev e super admin, e `GET /logs/login-attempts` só para o dev.

Arquivos: `src/pages/admin/logs/routes/index.tsx`, `src/pages/admin/logins/routes/index.tsx`, `src/constants/roles.ts`.

## Registro de Atividades (`/admin/atividades`)

Uma linha por **ação** do painel — não por escrita no banco. Uma ação pode gerar várias escritas (inscrever alguém mexe em inscrição, tipo de inscrição e pagamento), e isso vira uma linha só, agrupada por operação.

### O que aparece na lista

- **Quando:** data/hora e tempo relativo ("há 2 horas").
- **Quem fez:** avatar e nome de quem executou; nas rotas públicas (sem autenticação) aparece "Sistema".
- **Quem recebeu:** a pessoa (ou pessoas) alvo da ação, quando a ação é sobre alguém. Mostra a primeira com avatar e "e mais N" para o resto — um `deleteMany` pode derrubar dezenas de vínculos de uma vez.
- **Ação:** chip colorido por família — verde para criação, azul para alteração, vermelho para remoção. Um `save` que não mudou nada vira o chip "Salvou sem alterar", em cinza, para não se confundir com uma edição de verdade.
- **Operação:** o nome do que a pessoa mandou fazer (ex. "Inscrição no evento"), e não só a tabela afetada — inscrever, cancelar e chamar da lista de espera mexem nas mesmas tabelas, mas são operações diferentes. Sem essa informação (histórico anterior à coluna), a tela usa o nome da tabela.
- **Conteúdo:** os campos alterados, cada um como "rótulo: valor antigo → valor novo". Criação mostra só o valor novo, remoção só o antigo. Mostra até 2 campos na célula; o resto abre no painel de detalhe ao clicar na linha.

### Painel de detalhe

Ao clicar na linha, abre um painel lateral com: nome da operação, quantas escritas e em quantas tabelas, a rota crua que executou a ação (ex. `POST /events/:idEvent/users/:idUser`, útil para o dev achar o controller), quem fez, quem recebeu (lista completa) e uma seção por escrita com todos os campos alterados naquela tabela.

### Filtros

| Filtro | O que faz |
| --- | --- |
| **Período** | 24 horas (padrão ao abrir a tela), 7 dias ou 30 dias |
| **Usuário** | traz ações feitas *pela* pessoa e ações feitas *sobre* ela |
| **Operação** | pelo catálogo de rotas vindo da API (`/logs/operations`), não uma lista fixa no front — evita a lista do front ficar desatualizada quando uma rota muda |
| **Tabela** | uma das ~19 tabelas monitoradas (Cadastro, Pagamento, Evento, Inscrição no evento, Quarto, Check-in, Notícia etc.) |
| **Ação** | Criou, Criou em lote, Alterou, Alterou em lote, Removeu, Removeu em lote, Criou ou alterou (`upsert`) |

Quando a tela volta vazia com o filtro padrão de 24 horas, aparece um atalho "Ampliar para 7 dias".

### Cartões de resumo

Contagem de ações no período, criações, alterações e remoções — no mesmo filtro aplicado à listagem.

Arquivos: `src/pages/admin/logs/index.tsx`, `src/features/admin/logs/components/list.tsx`, `src/features/admin/logs/api/getLogs.tsx`, `src/features/admin/logs/constants.ts`.

## Registro de Login (`/admin/logins`)

Uma linha por tentativa de entrada no sistema, bem-sucedida ou recusada.

### O que aparece na lista

- **Quando:** data/hora e tempo relativo.
- **Usuário:** avatar e nome de quem é dono do documento digitado, quando o documento existe no cadastro; senão, "Documento não encontrado".
- **Documento digitado:** o CPF/documento informado na tentativa — aparece mesmo quando não bate com nenhum cadastro.
- **Resultado:** chip "Sucesso" (verde) ou "Falha" (vermelho).
- **Motivo:** em falhas, "Senha incorreta" ou "Documento não encontrado"; em sucesso, "—".
- **Dispositivo:** ícone por tipo (celular, tablet, computador, não identificado) e o resumo lido do `User-Agent` (ex. "iPhone · iOS 18.7"). Clicar abre um popover com aparelho, sistema, versão do sistema, navegador, versão do navegador, motor, arquitetura, e o texto bruto do `User-Agent` com botão de copiar — é essa string bruta que serve de prova numa investigação. Campos não informados pelo navegador aparecem como "Não informado".
- **IP:** o endereço de origem da tentativa, ou "—" quando ausente.

### Filtros

| Filtro | O que faz |
| --- | --- |
| **Período** | 24 horas (padrão), 7 dias ou 30 dias |
| **Usuário** | filtra por quem é dono do documento |
| **Documento** | busca por texto no documento digitado |
| **Resultado** | Todos, Sucesso ou Falha |

### Cartões de resumo

Total de tentativas no período, logins aceitos e falhas — no mesmo filtro da listagem.

Arquivos: `src/pages/admin/logins/index.tsx`, `src/features/admin/logs/components/listLoginAttempts.tsx`, `src/features/admin/logs/api/getLogs.tsx` (tipos `LoginAttempt`, `useGetLoginAttempts`).
