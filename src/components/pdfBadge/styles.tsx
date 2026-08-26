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
   * Nome e QR num bloco só, ancorado onde o nome ficava. Posicionar os dois de
   * forma independente colocava o QR sobre a segunda linha de nome comprido —
   * em fluxo, o QR desce junto.
   */
  nameArea: {
    position: 'absolute',
    top: 210,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    // a formatação do nome já vem resolvida do modal
    width: '100%',
  },
  /**
   * Sem moldura branca: o QR fica direto sobre a arte, e a zona de silêncio é a
   * margem de 2 módulos do próprio código.
   *
   * Isso vale enquanto a arte atrás do código for clara e lisa, como a padrão.
   * A capa é configurável por evento (`coverBase64`) — subindo uma foto ali, o
   * código para de ser lido e a moldura branca precisa voltar.
   */
  qrBox: {
    marginTop: 8,
  },
  /**
   * 52pt para 29 células (25 módulos + margem 2 de cada lado) dá ~0,63mm por
   * módulo. Aumentar o quadro em vez do módulo não ajudaria: o bloco nome+QR
   * passa do rodapé quando o nome ocupa duas linhas.
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
