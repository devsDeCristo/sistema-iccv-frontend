import { Image, View } from '@react-pdf/renderer';
// import { FooterProps } from './types';
import { stylesPdf } from './styles';
import footerImg from '../../assets/footer-cursilho-fem.png';
function FooterPdf() {
  return (
    <View style={stylesPdf.footer} fixed>
      {/* <Text>{text}</Text>
      <Text>{'Igreja de Cristo no Brasil'}</Text> */}
      <View wrap={false}>
        <Image style={stylesPdf.imageFooter} src={footerImg} />
      </View>
    </View>
  );
}
export { FooterPdf };
