import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import coverImg from '../../assets/cover-img-fem.png';
function CoverPdf({ logo, bg }: { logo: string, bg?: string }) {
  return (
    <View style={stylesPdf.cover} wrap={false}>
      <Image style={stylesPdf.imageBackground} src={bg||coverImg} />
      <Image style={{...stylesPdf.imageEvent}} src={logo} />
    </View>
  );
}
export { CoverPdf };
