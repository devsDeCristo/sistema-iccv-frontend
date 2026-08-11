import { Page, Text, View, Document, Font } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfTeamsProps } from './types';
import { HeaderPdf } from '../pdfEvent/header';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfTeams({ data, event }: PdfTeamsProps) {
  const dataEvent = event.data;
  return (
    <Document>
      {data.map(({ usersLeaders, usersMembers, note, id, name }, index) => (
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
            <Text style={stylesPdfRooms.textNameBold}>{`Líderes:`}</Text>
            {usersLeaders?.map((user, idx) => (
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
            <Text style={{ ...stylesPdfRooms.textNameBold, marginTop: 10 }}>
              {`Membros:`}
            </Text>
            {usersMembers?.map((user, idx) => (
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

export default PdfTeams;
