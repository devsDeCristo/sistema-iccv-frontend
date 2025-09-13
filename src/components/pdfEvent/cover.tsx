import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import coverImg from '../../assets/cover-img-fem.png';
function CoverPdf() {
  return (
    <View style={stylesPdf.cover} wrap={false}>
      <Image style={stylesPdf.imageCover} src={coverImg} />
    </View>
  );
}
export { CoverPdf };
