import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfRooms } from './styles';
import type { PdfProps } from './types';
import logoIc from '../../assets/logoic-rosa.png';
import logoEvento from '../../assets/5-curs-fem.png';
import bgbadge from '../../assets/bg-badge.png';
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBadge({ data }: PdfProps) {
  const filterBadgeName = data.filter(({ badgeName }) => !!badgeName);
  return (
    <Document>
      <Page orientation="portrait" style={stylesPdfRooms.body}>
        <View style={stylesPdfRooms.container} wrap={true}>
          {filterBadgeName?.map(({ badgeName ,fullName}, index) => (
            <View
              style={stylesPdfRooms.badge}
              key={'cracha-pdf' + index}
              wrap={false}
            >
              <Image style={stylesPdfRooms.imageBackground} src={bgbadge} />
              <View style={stylesPdfRooms.headerBadge} wrap={false}>
                <Image style={stylesPdfRooms.image} src={logoIc} />
                <Image style={stylesPdfRooms.imageEvent} src={logoEvento} />
              </View>
             <Text wrap={false} style={stylesPdfRooms.textName}> {fullName?.toLowerCase()}</Text>
            </View>
          ))}
          {filterBadgeName.length % 2 !== 0 && (
            <View
              style={[stylesPdfRooms.badge, { border: 'none' }]}
              key={'cracha-pdf'}
              wrap={false}
            ></View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default PdfBadge;
