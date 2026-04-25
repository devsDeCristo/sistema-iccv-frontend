import { Image, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
//import logoIc from '../../assets/logo-ic-vermelha.png';
import logoEvento from '../../assets/6-curs-fem.png';
//import logoCursilho from '../../assets/logo-cursilho-verm.png';
// import bgbadge from '../../assets/galo.png';
// import coverImg from '../../assets/cover-img.png';
import fundo from '../../assets/fundo-fem.png';

function HeaderPdf({ logo, bg }: { logo: string, bg?: string }) {
  return (
    <View style={stylesPdf.header} fixed>
      <Image style={stylesPdf.imageBackground} src={bg||fundo} />
      {/* <Image style={{ ...stylesPdf.image, marginLeft: '18px' }} src={logoIc} />  */}
      <Image style={stylesPdf.imageEvent} src={logo||logoEvento} />
      {/* <Image style={stylesPdf.image} src={logoCursilho} />  */}
    </View>
  );
}
export { HeaderPdf };
