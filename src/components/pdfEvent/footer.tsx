import { Text, View } from '@react-pdf/renderer';
// import { FooterProps } from './types';
import { stylesPdf } from './styles';
// import footerImg from '../../assets/footer-cursilho-fem.png';
function FooterPdf() {
  return (
    <View style={stylesPdf.footer} fixed>
      <Text>{'5 a 8 de Junho de 2025'}</Text>
      <Text>{'Igreja de Cristo no Brasil'}</Text>
      {/* <View wrap={false}>
        <Image style={stylesPdf.imageFooter} src={footerImg} />
      </View> */}
    </View>
  );
}
export { FooterPdf };
