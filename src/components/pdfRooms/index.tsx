import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfRoomsProps } from './types';
import logoIccv from '../../assets/logo-ic.png';
import logoEvento from '../../assets/5-curs-fem.png';
import logoCursilho from '../../assets/logo-cursilho-masc.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBedRooms({ data }: PdfRoomsProps) {
  return (
    <Document>
      {data.map(({ users, note, id }, index) => (
        <Page
          key={id + index}
          orientation="portrait"
          style={stylesPdfRooms.body}
        >
          <View style={stylesPdfRooms.header} fixed>
            <Image style={stylesPdfRooms.image} src={logoIccv} />
            <Image style={stylesPdfRooms.imageEvent} src={logoEvento} />
            <Image style={stylesPdfRooms.image} src={logoCursilho} />
          </View>
          <View fixed style={stylesPdfRooms.decuria}>
            <Text style={stylesPdfRooms.title}>{note}</Text>
          </View>
          <View style={stylesPdfRooms.containerRow}>
            {users?.map((user, idx) => (
              <View
                key={'quartos-pdf' + idx}
                style={stylesPdfRooms.row}
                wrap={false}
              >
                <View style={stylesPdfRooms.cell}>
                  <Text style={stylesPdfRooms.textName}>{user.fullName}</Text>
                </View>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfBedRooms;
