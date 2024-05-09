import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfProps } from './types';
import logoIccv from '../../assets/logo-ic.png';
import logoEvento from '../../assets/7-cur-mas.png';
import logoCursilho from '../../assets/logo-cursilho-masc.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBadge({ data }: PdfProps) {
  return (
    <Document>
      <Page orientation="landscape" style={stylesPdfRooms.body}>
        {/* <View style={stylesPdfRooms.containerRow}> */}
        <View style={stylesPdfRooms.row}>
          {data?.map(({ fullName }, index) => (
            <View
              style={stylesPdfRooms.cell}
              key={'cracha-pdf' + index}
              wrap={false}
            >
              <View style={stylesPdfRooms.header} fixed>
                <Image style={stylesPdfRooms.image} src={logoIccv} />
                <Image style={stylesPdfRooms.imageEvent} src={logoEvento} />
                {/* <Image style={stylesPdfRooms.image} src={logoCursilho} /> */}
              </View>
              <Text style={stylesPdfRooms.textName}>{fullName}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export default PdfBadge;
