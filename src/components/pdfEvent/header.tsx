import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import logoIccv from '../../assets/logo-ic.png';
import logoEvento from '../../assets/7-cur-mas.png';
import logoCursilho from '../../assets/logo-cursilho-masc.png';

function HeaderPdf() {
  return (
    <View style={stylesPdf.header} fixed>
      <Image style={stylesPdf.image} src={logoIccv} />
      <Image style={stylesPdf.imageEvent} src={logoEvento} />
      <Image style={stylesPdf.image} src={logoCursilho} />
    </View>
  );
}
export { HeaderPdf };
