# Página do evento (`/eventos/:id`)

A vitrine pública de um evento: cartaz com a arte cadastrada, fichas de resumo (quando, onde, tipos de ingresso), a lista de grupos com vaga, o card da loja e os botões de inscrição. É o ponto de entrada para inscrever-se, comprar na loja e abrir o quadrante.

## Cartaz

- **Capa:** `event.data.coverUrl`, ou a capa padrão do sistema quando o evento não tem uma. Filtro preto de 38% por cima e um véu que escurece progressivamente até o fundo da página, no rodapé.
- **Logo:** `event.data.logoUrl`, opcional. Muda o alinhamento do bloco de texto (encostado no rodapé com logo; centralizado sem ela).
- **Selos:** tipo do evento (`event.type`), contagem regressiva (`contagemRegressiva`) e "Evento de teste" quando `event.status === 'TEST'`.
- **Botão Voltar:** sempre visível, leva a `/home`.
- **Atalhos do admin:** "Editar evento" e "Ver no painel", só para quem `podeAdministrar` (super admin, dev, ou admin da igreja dona do evento). Ficam no canto oposto ao botão Voltar.
- **Cores do evento (`event.data.colors`):** quando o evento tem paleta válida (`ehCorHex`), a cor primária pinta o botão de inscrição da faixa do cartaz e o risco de cada seção; as três cores (primária, secundária, terciária) se dividem entre as fichas, uma para cada. Sem paleta cadastrada, tudo usa o azul-violeta padrão do sistema.

Arquivo: `src/pages/events/details/index.tsx`.

## Fichas de resumo

Três (ou quatro, com loja) cartões logo abaixo do cartaz:

- **Loja** (`StoreCard`): só aparece quando há produto à venda (`temDisponivel` em alguma variante de algum produto). Ocupa uma ficha e meia no desktop; abre `/eventos/:id/produtos`.
- **Quando:** período do evento (`formatarPeriodo`) com a contagem regressiva como apoio.
- **Onde:** cidade/UF, ou o nome do local quando não há cidade; "Local a definir" na ausência dos dois.
- **Tipos de ingresso:** conta só os grupos visíveis (não inativos). O apoio muda conforme o estado das inscrições:
  - sem grupo aberto: o motivo do fechamento (ver seção seguinte);
  - com `event.data.hideVacancies`: "Inscrições abertas", sem falar de vaga;
  - com vaga: "Vagas disponíveis" (verde);
  - esgotado: "Lista de espera" (laranja).

Arquivos: `src/pages/events/details/index.tsx`, `src/features/events/components/storeCard.tsx`.

## Grupos e vagas

A lista de grupos ("Escolha seu ingresso") mostra cada `groupRole` do evento, com nome, barra de ocupação e vagas restantes. As regras de quando um grupo aceita inscrição (`estadoDoGrupo`, agendado/aberto/encerrado/inativo) e o prazo padrão pelo fim do evento estão em `docs/inscricao-em-grupos.md` — esta página só aplica esse estado:

- grupo **inativo** não aparece;
- **agendado** e **encerrado** aparecem sem clique, com "Abre dd/mm às hh:mm" ou "Encerrado";
- só grupo **aberto** é clicável e leva para `/eventos/:id/inscricao`;
- a barra de ocupação e o número de vagas somem quando `event.data.hideVacancies` está ligado; nesse caso só resta saber se está esgotado ("Lista de espera").

Os vagas restantes somados na ficha "Tipos de ingresso" também contam só os grupos abertos.

## Botões de inscrição

Dois botões ("Inscreva-se"), um no cartaz e um abaixo da lista de grupos — ambos chamam a mesma ação e ficam desabilitados juntos quando nenhum grupo está aberto, com o motivo em vez do texto padrão: "Inscrições abrem dd/mm às hh:mm", "Inscrições encerradas" ou "Inscrições em breve" (evento sem grupo nenhum visível). Ver `docs/inscricao-em-grupos.md` para o detalhe de cada estado.

## Acesso ao quadrante

O botão "Quadrante" (ícone de grupos, ao lado do botão de inscrição no cartaz) só aparece quando:

- o evento tem o módulo ligado (`quadranteAtivo(event.data)`: `showQuadrante === true` e o módulo `teams` ativo) **e**
- a pessoa pode administrar o evento **ou** já está inscrita e confirmada em algum grupo dele (`present`, não conta lista de espera).

Leva a `/eventos/:id/quadrante`. Detalhe da tela em `docs/quadrante.md`.

## Link de grupo de WhatsApp

Para cada grupo em que a pessoa está inscrita e confirmada (`present`) e que tem `link` cadastrado, aparece um botão verde "Entre no grupo do evento" (ou "Ingresso: <nome do grupo>" quando há mais de um link). Abre o link em nova aba. O link é por grupo, não por evento — quem está em mais de um grupo com link vê um botão para cada.

## Sobre o evento e local

- **Sobre o evento:** renderiza `event.data.description` (HTML do editor); sem texto, mostra um estado vazio ilustrado.
- **Como chegar:** só aparece quando algum campo de local está preenchido (nome, endereço, bairro, cidade, estado ou CEP). Mostra o endereço concatenado e, se houver `event.data.linkMaps`, o mapa incorporado.

Arquivo: `src/pages/events/details/index.tsx`.
