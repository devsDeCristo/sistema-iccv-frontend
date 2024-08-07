import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import logoIccv from '../../assets/logoiccv-rosa.png';
import logoEvento from '../../assets/5-curs-fem.png';
import logoCursilho from '../../assets/logo-cursilho-rosa.png';

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
