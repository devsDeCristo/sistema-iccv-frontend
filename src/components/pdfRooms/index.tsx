import { Page, Text, View, Document, Font } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfRoomsProps } from './types';
import { HeaderPdf } from '../pdfEvent/header';
// import logoIc from '../../assets/logo-ic-vermelha.png';

// import logoCursilho from '../../assets/logo-cursilho-verm.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBedRooms({ data, event }: PdfRoomsProps) {
  const dataEvent = event.data;

  return (
    <Document>
      {data.map(({ users, note, id, name }, index) => (
        <Page
          key={id + index}
          orientation="portrait"
          style={stylesPdfRooms.body}
        >
          <HeaderPdf logo={dataEvent.logoBase64 as string} bg={dataEvent.coverBase64 as string} />
          <View fixed style={stylesPdfRooms.decuria}>
            <Text style={stylesPdfRooms.title}>{name.toLocaleUpperCase()}</Text>
            <Text style={stylesPdfRooms.subTitle}>{note}</Text>
          </View>

          <View style={stylesPdfRooms.containerRow}>
            {' '}
            <Text style={stylesPdfRooms.textNameBold}>
              {`Lista de participantes:`}
            </Text>
            {users?.map((user, idx) => (
              <View
                key={'quartos-pdf' + idx}
                style={stylesPdfRooms.row}
                wrap={false}
              >
                {/* <View style={stylesPdfRooms.cell}> */}
                <Text style={stylesPdfRooms.textName}>
                  <Text style={stylesPdfRooms.textNameBold}>
                    {(idx + 1).toString() + '. '}
                  </Text>{' '}
                  {user.fullName}
                </Text>
                {/* </View> */}
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfBedRooms;
