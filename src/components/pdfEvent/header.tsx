import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import logoIc from '../../assets/logo-ic-preta.png';
import logoEvento from '../../assets/8-cur-mas.png';
import logoCursilho from '../../assets/logo-cursilho-preta.png';

function HeaderPdf() {
  return (
    <View style={stylesPdf.header} fixed>
      <Image style={stylesPdf.image} src={logoIc} />
      <Image style={stylesPdf.imageEvent} src={logoEvento} />
      <Image style={stylesPdf.image} src={logoCursilho} />
    </View>
  );
}
export { HeaderPdf };
