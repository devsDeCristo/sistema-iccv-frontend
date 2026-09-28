# Quadrante do evento (`/eventos/:id/quadrante` e `/admin/eventos/:id/quadrante`)

Painel com as equipes do evento e o contato de cada pessoa (foto, celular, e-mail, aniversário). As duas rotas — a do inscrito e a do admin — renderizam o mesmo componente (`QuadrantePage`), com o que muda sendo a permissão e para onde o botão "Voltar" leva.

## Quem vê o quê

- **Módulo ligado no evento:** `quadranteAtivo(event.data)` exige `data.showQuadrante === true` **e** o módulo `teams` ativo (`moduleAtivo`). Ao contrário dos outros módulos do evento, aqui a ausência da chave é **desligado** — o quadrante expõe e-mail, celular e data de nascimento da equipe inteira, e isso não deve abrir sozinho num evento antigo.
- **Página do inscrito (`/eventos/:id/quadrante`, `EventQuadrante`):** o botão para chegar até aqui só aparece na página do evento (`docs/pagina-do-evento.md`) quando o módulo está ligado **e** a pessoa administra o evento **ou** está inscrita e confirmada (`present`) em algum grupo dele. A rota em si não tem guarda de front — quem entra direto pela URL depende do servidor recusar (`getQuadrante` retorna erro e a tela mostra "O quadrante deste evento não está disponível").
- **Página do admin (`/admin/eventos/:id/quadrante`, `Quadrante`):** protegida por `RequireEventRole` — a mesma permissão da aba "Equipes" do painel (quem administra a igreja dona do evento, ou super admin/dev). Abre sempre, independente de `showQuadrante` — é o admin vendo o que ele mesmo está montando, ligado ou não para o público.

Arquivos: `src/pages/events/quadrante/index.tsx`, `src/pages/admin/events/quadrante/index.tsx`, `src/pages/admin/events/routes/index.tsx`, `src/features/admin/events/eventModules.ts`.

## Dados e estados

- **Fonte:** `useGetQuadrante` → `GET /events/:eventId/quadrante`. A chave de cache começa com o mesmo prefixo de `GET_TEAMS`: qualquer edição de equipe invalida o quadrante junto.
- **Carregando:** spinner sobre o cartaz vazio.
- **Erro ou evento sem quadrante liberado:** mensagem "O quadrante deste evento não está disponível.", sem listar nada.
- **Sem equipes:** "Este evento ainda não possui equipes cadastradas.", mesmo com o quadrante liberado.

Arquivo: `src/features/admin/events/api/getQuadrante.tsx`.

## A tela

- **Cartaz:** mesmo desenho da página do evento — capa do evento (ou padrão), filtro escuro, véu que funde com o fundo da página, fichas subindo sobre a virada. Fichas de resumo: "Quando" (período do evento), "Equipes" (contagem) e "Pessoas" (soma de todos os integrantes de todas as equipes).
- **Cores:** a paleta do evento (`event.colors`) pinta o risco de título de cada equipe e o destaque dos cartões, em rodízio entre as três cores cadastradas (ou o azul-violeta padrão, repetido, sem paleta). Cada tom é ajustado (`corLegivel`) até garantir contraste de leitura (4,5:1) contra o fundo do cartão, no claro e no escuro.
- **Busca:** filtra pessoas por nome, e-mail ou celular (a partir de 3 dígitos para celular); equipe sem ninguém que bata some da lista.
- **Atalhos de equipe:** chips com o nome de cada equipe (só quando há mais de uma) rolam a página até a seção dela.
- **Cartão de pessoa:** foto (ou iniciais, quando não há foto ou ela falha ao carregar), nome, selo de "Líder" quando `roleTeam === 'LEADER'`, celular (com atalho de ligar e, se o número parece celular, atalho de WhatsApp), e-mail e data de aniversário (dia e mês, sem ano).

Arquivo: `src/components/quadrante/index.tsx`.

## Geração do PDF

Botão "Baixar PDF" no cartaz, desabilitado enquanto não há equipe nenhuma. Chama `GET /events/:eventId/quadrante/pdf` (resposta em blob) e salva o arquivo com o nome que vier no cabeçalho `Content-Disposition`, ou `quadrante.pdf` como padrão. A tela não monta o PDF: ele sai pronto do servidor — a versão em tela é um documento à parte, pensado para navegar e buscar, não uma cópia do PDF. Falha na geração mostra toast de erro, sem travar a tela.

Regras de geração do arquivo (crachás, memória, layout de página) ficam no servidor: repositório `ic-backend`, `docs/quadrante.md`.

## Impressão pelo navegador

Existe suporte a `window.print()` (estilos `@media print` que escondem o resto do sistema e mostram só o quadrante, em grade de 4 colunas por página A4 paisagem), mas o botão "Imprimir" que chamaria essa função está comentado no código (`src/components/quadrante/index.tsx`, junto com o estilo `vidroSx` que ele usava) — hoje a única forma de tirar o quadrante do sistema é pelo botão "Baixar PDF".
