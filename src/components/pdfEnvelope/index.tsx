import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfEnvelope } from './styles';
import type { PdfProps } from './types';
import logoIc from '../../assets/logo-ic-preta.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/galo.png';
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfEnvelope({ data }: PdfProps) {
  const filterBadgeName = data.filter(({ badgeName }) => !!badgeName);

  return (
    <Document>
      {filterBadgeName.map(({ fullName }, index) => (
        <Page
          key={index}
          orientation="portrait"
          size="A4"
          style={stylesPdfEnvelope.body}
        >
          <View style={stylesPdfEnvelope.container}>
            <View style={stylesPdfEnvelope.badge} wrap={false}>
              <Image style={stylesPdfEnvelope.imageBackground} src={bgbadge} />
              <View style={stylesPdfEnvelope.headerBadge} wrap={false}>
                <Image style={stylesPdfEnvelope.image} src={logoIc} />
                <Image style={stylesPdfEnvelope.imageEvent} src={logoEvento} />
              </View>
              <Text wrap={false} style={stylesPdfEnvelope.textName}>
                {fullName?.toLowerCase()}
              </Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfEnvelope;
