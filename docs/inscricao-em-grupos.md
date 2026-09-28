# Inscrição em grupos

Cada evento tem grupos (ex.: "Completo", "1º lote") e cada grupo tem regras
de valor. Este módulo descreve **quando um grupo aceita inscrição** e como isso
aparece nas telas. O servidor é quem decide; as regras de lá estão no
repositório `ic-backend`, em `docs/inscricao-em-grupos.md`.

## Campos do grupo

| Campo | Significado | Vazio |
| --- | --- | --- |
| `active` | liga ou desliga o grupo manualmente | ausente = ligado |
| `opensAt` | a partir de quando aceita inscrição | aceita desde já |
| `closesAt` | até quando aceita inscrição | vale o **fim do evento** |

## Estados (`estadoDoGrupo`)

| Estado | Quando |
| --- | --- |
| `inativo` | `active === false` |
| `agendado` | `opensAt` ainda não chegou |
| `encerrado` | passou o `closesAt` ou, sem ele, o `endDate` do evento |
| `aberto` | nenhum dos acima |

- **Prazo padrão:** um grupo sem `closesAt` aceita inscrição até a data e hora final do evento. Quando o grupo tem `closesAt`, vale a data do grupo, mesmo que seja depois do fim do evento.
- **Chamada:** `estadoDoGrupo(grupo, agora, fimDoEvento)`. Passe sempre o `endDate` do evento onde a pessoa se inscreve, senão o prazo padrão não vale na tela.
- **Relógio da tela (`useAgoraDosGrupos(grupos, fimDoEvento)`):** agenda a próxima troca de estado (abertura ou encerramento de algum grupo, ou o fim do evento). Com a página aberta, o grupo libera ou fecha na hora, sem recarregar.
- **Relógio do aparelho:** o front usa o relógio do aparelho só para exibir. Quem aceita ou recusa é o servidor.

Arquivo: `src/features/admin/events/groups.ts`.

## Página do evento (`/eventos/:id`)

- **Grupos:**
  - **Inativo:** não aparece.
  - **Agendado:** mostra "Abre dd/mm às hh:mm".
  - **Encerrado:** mostra "Encerrado".
  - Os dois últimos não são clicáveis.
- **Vagas:** a ficha de "Tipos de ingresso" e a contagem de vagas somam só os grupos abertos.
- **Os dois botões "Inscreva-se"** (topo e seção de ingressos): quando nenhum grupo está aberto, ficam **desabilitados** e mostram o motivo:
  - "Inscrições abrem dd/mm às hh:mm", se algum grupo está agendado;
  - "Inscrições encerradas", se há grupos mas todos fecharam;
  - "Inscrições em breve", se não há grupo visível.
- **Botão desabilitado:** perde o degradê e o brilho (`'&.Mui-disabled'` em `botaoPrincipal`).

Arquivo: `src/pages/events/details/index.tsx`.

## Escolha de grupo na inscrição (`/eventos/:id/inscricao`)

- **Inativo:** some, a não ser que a pessoa já esteja inscrita ou na espera nele.
- **Agendado e encerrado:** aparecem, mas não podem ser escolhidos, com a etiqueta "Abre …" ou "Inscrições encerradas".

Arquivo: `src/features/admin/events/components/formSelectGroupRole.tsx`.

## Painel do admin (configurações de inscrição)

- **Interruptor no cabeçalho do grupo:** liga ou desliga o grupo.
- **Relógio no cabeçalho:** abre o popover "Abertura automática", com "Abrir inscrições em" e "Encerrar inscrições em" e o botão "Limpar datas". O ícone fica:
  - azul, com data configurada;
  - vermelho, com data inválida (encerramento antes da abertura).
- **Selo do grupo:** Inativo, "Abre …", "Aberto até …" ou Encerrado. O selo considera **só a configuração do grupo**, não o fim do evento.
- **Datas:** o campo `datetime-local` fica na hora local e é gravado em ISO (`isoParaCampo` / `campoParaIso`). Vazio grava `null`.

Arquivo: `src/features/admin/events/components/formRegistrationSettings.tsx`.
