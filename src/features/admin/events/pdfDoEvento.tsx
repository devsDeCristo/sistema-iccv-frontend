import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

export type ColunaDoRelatorio = {
  titulo: string;
  /** quanto da largura a coluna leva, em relação às outras (padrão 1) */
  peso?: number;
  /** número alinhado à direita */
  numero?: boolean;
};

export type LinhaDoRelatorio = {
  valores: (string | number)[];
  /** subtotal de um grupo ou total geral: negrito, com linha em cima */
  tipo?: 'subtotal' | 'total';
};

export type RelatorioDoEvento = {
  /** o que é o relatório: "Pedidos de produtos · com comprador" */
  titulo: string;
  evento: { nome: string; igreja?: string; periodo?: string };
  /** data URI da capa do evento (`data.coverBase64`); opcional */
  capa?: string;
  /** data URI da logo do evento (`data.logoBase64`); opcional */
  logo?: string;
  /** a paleta do evento (`data.colors`); sem ela, o índigo do sistema */
  cores?: { primary?: string; secondary?: string } | null;
  /** linhas soltas embaixo do evento: filtros aplicados, quem exportou */
  detalhes: string[];
  colunas: ColunaDoRelatorio[];
  linhas: LinhaDoRelatorio[];
  /** muitas colunas pedem a página deitada */
  orientacao?: 'portrait' | 'landscape';
  /** o que conta o rodapé: "4 compras" */
  rodape: string;
};

/** O índigo da marca: a cor quando o evento não tem paleta */
const INDIGO = '#1C0F4D';

const HEX = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i;

/** "#RRGGBB" válido, ou `undefined` — a paleta vem de JSON livre do evento */
const corValida = (cor?: string) => {
  const casou = cor?.trim().match(HEX);
  return casou ? `#${casou[1]}` : undefined;
};

/**
 * A cor clareada na direção do branco: o fundo do cabeçalho da tabela e do
 * total. O react-pdf não tem transparência por cor, então a mistura é feita
 * aqui.
 */
function clarear(hex: string, quanto: number) {
  const n = parseInt(hex.slice(1), 16);
  const canal = (deslocamento: number) => {
    const valor = (n >> deslocamento) & 0xff;
    return Math.round(valor + (255 - valor) * quanto)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${canal(16)}${canal(8)}${canal(0)}`;
}

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 28,
    fontSize: 9,
    color: '#1A1A1A',
  },
  // ---- faixa de abertura: a capa do evento, com o evento por cima ---------
  faixa: {
    position: 'relative',
    height: 104,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  // as quatro bordas, e não width/height 100%: com 100% a imagem media a
  // área interna e deixava uma faixa lisa à direita
  capa: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
  },
  // véu escuro sobre a capa: o texto branco tem de ler em qualquer foto
  veu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    opacity: 0.5,
  },
  // o respiro fica no conteúdo, e não na faixa, para a capa ir de ponta a ponta
  conteudoDaFaixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
  },
  quadroDaLogo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  nome: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  sobre: { fontSize: 10, color: '#FFFFFF', opacity: 0.9, marginTop: 4 },
  // ---- o que é o relatório e o recorte ------------------------------------
  titulo: {
    marginTop: 14,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detalhes: { marginTop: 4, marginBottom: 12 },
  detalhe: { fontSize: 8, color: '#667085', marginTop: 2 },
  // ---- tabela -------------------------------------------------------------
  cabecalho: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tituloDaColuna: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingRight: 4,
  },
  linha: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottom: '0.5pt solid #E4E2EC',
  },
  celula: { fontSize: 8.5, paddingRight: 4 },
  subtotal: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  total: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  // negrito pela família: com a Helvetica embutida do react-pdf, o
  // `fontWeight` sozinho não muda nada
  negrito: { fontFamily: 'Helvetica-Bold' },
  // número encostado à direita colava no texto da coluna seguinte
  numero: { textAlign: 'right', paddingRight: 12 },
  vazio: { fontSize: 10, color: '#667085', marginTop: 16 },
  rodape: {
    position: 'absolute',
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#98A2B3',
  },
});

/**
 * PDF de uma lista do evento, com a cara **do evento**: a capa abre a
 * primeira página, com a logo e o nome por cima, e a cor principal da paleta
 * dele tinge o título, o cabeçalho da tabela e os totais. Evento sem capa
 * abre numa faixa da cor principal; sem paleta, no índigo do sistema.
 *
 * Embaixo, o que é o relatório, os filtros que valeram e quem exportou; a
 * tabela tem o cabeçalho repetido em toda página, e o rodapé a contagem e a
 * paginação.
 */
function PdfDoEvento({
  titulo,
  evento,
  capa,
  logo,
  cores,
  detalhes,
  colunas,
  linhas,
  orientacao = 'portrait',
  rodape,
}: RelatorioDoEvento) {
  const cor = corValida(cores?.primary) ?? INDIGO;
  const fundo = clarear(cor, 0.88);
  const sobre = [evento.igreja, evento.periodo].filter(Boolean).join('  ·  ');

  const celulas = (valores: (string | number)[], destaque = false) =>
    colunas.map((coluna, indice) => (
      <Text
        key={indice}
        style={[
          estilos.celula,
          { flex: coluna.peso ?? 1 },
          coluna.numero ? estilos.numero : {},
          destaque ? estilos.negrito : {},
          destaque ? { color: cor } : {},
        ]}
      >
        {String(valores[indice] ?? '')}
      </Text>
    ));

  return (
    <Document title={`${evento.nome} — ${titulo}`} author="ICCV Eventos">
      <Page size="A4" orientation={orientacao} style={estilos.pagina}>
        <View style={[estilos.faixa, { backgroundColor: cor }]}>
          {/* sem src o react-pdf quebra: capa e logo só entram se existirem */}
          {capa ? <Image style={estilos.capa} src={capa} /> : null}
          {capa ? <View style={estilos.veu} /> : null}

          <View style={estilos.conteudoDaFaixa}>
            {logo ? (
              <View style={estilos.quadroDaLogo}>
                <Image style={estilos.logo} src={logo} />
              </View>
            ) : null}
            <View>
              <Text style={estilos.nome}>{evento.nome}</Text>
              {sobre ? <Text style={estilos.sobre}>{sobre}</Text> : null}
            </View>
          </View>
        </View>

        <Text style={[estilos.titulo, { color: cor }]}>{titulo}</Text>
        <View style={estilos.detalhes}>
          {detalhes.map((detalhe) => (
            <Text key={detalhe} style={estilos.detalhe}>
              {detalhe}
            </Text>
          ))}
        </View>

        {/* repetido no topo de cada página */}
        <View
          style={[
            estilos.cabecalho,
            { backgroundColor: fundo, borderBottom: `1pt solid ${cor}` },
          ]}
          fixed
        >
          {colunas.map((coluna, indice) => (
            <Text
              key={indice}
              style={[
                estilos.tituloDaColuna,
                { flex: coluna.peso ?? 1, color: cor },
                coluna.numero ? estilos.numero : {},
              ]}
            >
              {coluna.titulo}
            </Text>
          ))}
        </View>

        {!linhas.some((linha) => !linha.tipo) && (
          <Text style={estilos.vazio}>
            Nada a listar com os filtros atuais.
          </Text>
        )}

        {linhas.map((linha, indice) => (
          <View
            key={indice}
            wrap={false}
            style={
              linha.tipo === 'total'
                ? [
                    estilos.total,
                    { backgroundColor: fundo, borderTop: `1pt solid ${cor}` },
                  ]
                : linha.tipo === 'subtotal'
                  ? [estilos.subtotal, { borderTop: `0.75pt solid ${cor}` }]
                  : estilos.linha
            }
          >
            {celulas(linha.valores, !!linha.tipo)}
          </View>
        ))}

        <View style={estilos.rodape} fixed>
          <Text>{`${evento.nome}  ·  ${rodape}`}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export { PdfDoEvento };
