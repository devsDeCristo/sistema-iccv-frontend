# Documentação dos módulos

Cada arquivo descreve um módulo do front (área do usuário e painel do admin):
o que ele faz, as regras que valem nele e onde está no código. Serve de
contexto para quem (pessoa ou IA) for mexer nessas telas.

| Módulo | Tela | Arquivo |
| --- | --- | --- |
| **Área do usuário** | | |
| Página inicial | `/home` | [pagina-inicial.md](pagina-inicial.md) |
| Agenda de inscrições | card na `/home` | [agenda.md](agenda.md) |
| Ingresso | `/home` e `/minhasInscricoes` | [ingresso.md](ingresso.md) |
| Minhas Inscrições | `/minhasInscricoes` | [minhas-inscricoes.md](minhas-inscricoes.md) |
| Eventos | `/historicoEventos` | [eventos.md](eventos.md) |
| Página do evento | `/eventos/:id` | [pagina-do-evento.md](pagina-do-evento.md) |
| Inscrição no evento | `/eventos/:id/inscricao` | [inscricao-no-evento.md](inscricao-no-evento.md) |
| Inscrição em grupos | página do evento, inscrição e painel | [inscricao-em-grupos.md](inscricao-em-grupos.md) |
| Loja do evento | `/eventos/:id/produtos` | [loja-do-evento.md](loja-do-evento.md) |
| Quadrante | `/eventos/:id/quadrante` | [quadrante.md](quadrante.md) |
| Notícias | feed da `/home` e painel | [noticias.md](noticias.md) |
| Perfil | `/perfil` | [perfil.md](perfil.md) |
| **Acesso** | | |
| Login e cadastro | `/login`, `/usuario/cadastrar` | [login-e-cadastro.md](login-e-cadastro.md) |
| Termos de Uso | `/termos` | [termos-de-uso.md](termos-de-uso.md) |
| Layout e navegação | menu, rotas e perfis | [layout-e-navegacao.md](layout-e-navegacao.md) |
| Deploy | CI, imagem e variáveis `VITE_*` | [deploy.md](deploy.md) |
| **Painel do admin** | | |
| Início do painel | `/admin/inicio` | [admin-home.md](admin-home.md) |
| Eventos (cadastro e edição) | `/admin/eventos` | [admin-eventos.md](admin-eventos.md) |
| Inscritos do evento | detalhes do evento | [admin-inscritos.md](admin-inscritos.md) |
| Pagamentos e pedidos | detalhes do evento | [admin-pagamentos.md](admin-pagamentos.md) |
| Quartos, equipes e transporte | detalhes do evento | [admin-quartos-equipes-transporte.md](admin-quartos-equipes-transporte.md) |
| Crachás e envelopes (PDF) | detalhes do evento | [admin-pdfs.md](admin-pdfs.md) |
| Check-in | `/admin/eventos/:id/checkin` | [checkin.md](checkin.md) |
| Igrejas | painel | [igrejas.md](igrejas.md) |
| Usuários | painel | [usuarios.md](usuarios.md) |
| Logs e registro de login | painel | [logs-e-logins.md](logs-e-logins.md) |
| Configurações | gateways, WhatsApp, disparos, termos | [configuracoes.md](configuracoes.md) |

As regras de servidor estão no repositório `ic-backend`, em `docs/` (índice em
`docs/README.md`). Cada documento daqui aponta o do servidor quando a regra
também vale lá.

## Convenções que valem em todos os módulos

- **Evento já acabou (`jaAcabou`, em `src/features/events/utils.ts`):** a data final ficou para trás, contando o dia inteiro. Um evento que termina hoje ainda está acontecendo.
- **Evento em andamento (`emAndamento`, em `src/features/admin/events/utils/eventStatus.ts`):** hoje cai entre o início e o fim, contando o dia inteiro nas duas pontas.
- **Cor do evento:** `event.data.colors.primary`, conferida com `ehCorHex`. Sem cor válida, vale a cor primária do tema.
- **Data do evento na inscrição:** a rota `/users/:id/payments` (`paymentsWithRoles`) não traz a data do evento. Quem precisa dela cruza com o catálogo (`useGetEvents({})`, mesma consulta em cache) pelo `eventId`.

## Manter atualizado

Toda modificação, da mais simples à mais complexa, atualiza o `.md` do módulo
que ela toca, no mesmo commit. Módulo novo ganha arquivo próprio e uma linha na
tabela acima. Quando a regra vale também no servidor, atualize o `.md` do
mesmo módulo no `ic-backend`. Os `.md` não entram na imagem Docker
(`**/*.md` no `.dockerignore`).
