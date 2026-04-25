import {
  Image,
  Text,
  View,
} from '@react-pdf/renderer';
// import { FooterProps } from './types';
import { stylesPdf } from './styles';
import footerImg from '../../assets/footer-6-cursilho-fem.png';
function FooterPdf({ bg, text }: { bg?: string, text: string }) {
  return (
    <View style={stylesPdf.footer} fixed>
      
     
      <Image style={stylesPdf.imageFooter} src={bg||footerImg} />
      <Text style={stylesPdf.textFooter}>{text}</Text>
      {/* </View> */}
    </View>
  );
}
export { FooterPdf };
