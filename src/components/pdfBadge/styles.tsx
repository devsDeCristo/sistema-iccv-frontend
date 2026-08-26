import { StyleSheet } from '@react-pdf/renderer';

const stylesPdfBadge = StyleSheet.create({
  body: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#555555',
    textTransform: 'lowercase',
    marginBottom: 6,
    paddingLeft: 2,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '8.7cm', // 2 por linha
    height: '11cm', // 2 por coluna
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    position: 'relative',
  },
  imageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    // opacity: 0.4,
  },
  headerBadge: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    height: 30,

  },
  imageEvent: {
    height: 100,
    marginTop: 5,
    objectFit: 'contain',
  },
  /**
   * Nome e QR centralizados dentro do rasgo do papel.
   *
   * Os números vêm de medição, não de estimativa: renderizando um crachá só com
   * a arte e lendo o brilho médio linha por linha, a faixa clara do rasgo vai de
   * 177,1pt a 273,6pt — centro em 225,4pt.
   *
   * O 184 é esse centro menos metade do conjunto de uma linha
   * (24 do nome + 6 + 52 do QR = 82pt): 225,4 - 41 = 184,4.
   *
   * Sem `height` de propósito. Container de altura fixa faz o react-pdf medir o
   * texto pela altura que sobra em vez de pelo conteúdo: o nome de três linhas
   * era desenhado inteiro mas ocupava a caixa de uma linha e meia, e o QR subia
   * para dentro dele. Sem altura, nome comprido só empurra o QR para baixo.
   */
  nameArea: {
    position: 'absolute',
    top: 190,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    // a formatação do nome já vem resolvida do modal.
    // largura cheia é o que faz o nome comprido quebrar dentro do crachá em vez
    // de vazar pelas laterais
    width: '100%',
  },
  qrBox: {
    marginTop: 6,
  },
  /**
   * 52pt para 29 células (25 módulos + margem 2 de cada lado) dá ~0,63mm por
   * módulo, o piso para leitura confiável por câmera.
   *
   * Sem moldura branca: a zona de silêncio é a margem de 2 módulos do próprio
   * código, sobre a arte. Isso vale enquanto a arte atrás dele for clara; a
   * capa é configurável por evento (`coverBase64`) e, subindo uma foto ali, o
   * código para de ser lido e a moldura branca precisa voltar.
   */
  qrCode: {
    width: 52,
    height: 52,
  },
  imagePaper: {
    // position: 'absolute',
    // top: -10,
    // left: 0,
    // bottom: 10,
    width: '100%',
    height: 140,
    objectFit: 'cover',
    opacity: 0.8,
  },
});

export { stylesPdfBadge };
