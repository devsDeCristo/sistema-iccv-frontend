import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfProps } from './types';
import logoIccv from '../../assets/logo-ic.png';
import logoEvento from '../../assets/7-cur-mas.png';
import logoCursilho from '../../assets/logo-cursilho-masc.png';
import papel from '../../assets/papel.png';
import papelTop from '../../assets/papel-top.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBadge({ data }: PdfProps) {
  return (
    <Document>
      <Page orientation="portrait" style={stylesPdfRooms.body}>
        {/* <View style={stylesPdfRooms.containerRow}> */}
        <View style={stylesPdfRooms.container} wrap={true}>
          {data?.map(
            ({ badgeName }, index) =>
              badgeName && (
                <>
                  <View
                    style={stylesPdfRooms.badge}
                    key={'cracha-pdf' + index}
                    wrap={false}
                  >
                    {/* <Image
                      style={{
                        width: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      src={papelTop}
                    /> */}
                    <Image style={stylesPdfRooms.image} src={logoIccv} />
                    <Image style={stylesPdfRooms.imageEvent} src={logoEvento} />
                    <Text style={stylesPdfRooms.textName}>{badgeName}</Text>
                    {/* <Image
                      style={{
                        width: '100%',
                        position: 'absolute',
                        left: 0,
                        top: 180,
                      }}
                      src={papel}
                    /> */}
                  </View>
                </>
              )
          )}
        </View>
      </Page>
    </Document>
  );
}

export default PdfBadge;
