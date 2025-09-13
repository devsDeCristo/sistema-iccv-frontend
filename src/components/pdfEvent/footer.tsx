import {
  Image,
  //  Text,
  View,
} from '@react-pdf/renderer';
// import { FooterProps } from './types';
import { stylesPdf } from './styles';
import footerImg from '../../assets/footer-6-cursilho-fem.png';
function FooterPdf() {
  return (
    <View style={stylesPdf.footer} fixed>
      {/* <Text>{'2 a 5 de Outubro de 2025'}</Text>
      <Text>{'Igreja de Cristo no Brasil'}</Text>
      <View wrap={false}> */}
      <Image style={stylesPdf.imageFooter} src={footerImg} />
      {/* </View> */}
    </View>
  );
}
export { FooterPdf };
