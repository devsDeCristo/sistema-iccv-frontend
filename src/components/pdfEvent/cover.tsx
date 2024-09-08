import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import coverImg from '../../assets/capa-curs-fem.png';
function CoverPdf() {
  return (
    <View style={stylesPdf.cover} wrap={false}>
      <Image style={stylesPdf.imageCover} src={coverImg} />
    </View>
  );
}
export { CoverPdf };
