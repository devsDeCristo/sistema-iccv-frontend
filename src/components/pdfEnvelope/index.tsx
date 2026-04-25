import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfEnvelope } from './styles';
import type { PdfProps } from './types';
// import logoIc from '../../assets/logo-ic-vermelha.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';
Font.register({
  family: 'Helvetica',
  src: 'http://fonts.gstatic.com/s/amethysta/v4/uuO0VFu8kdKx34ju6adj-KCWcynf_cDxXwCLxiixG1c.ttf',
});

// Create Document Component
function PdfEnvelope({ data, event }: PdfProps) {
  const dataEvent = event.data;
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
              <Image
                style={stylesPdfEnvelope.imageBackground}
                src={dataEvent?.coverBase64 || bgbadge}
              />
              <View style={stylesPdfEnvelope.headerBadge} wrap={false}>
                {/* <Image style={stylesPdfEnvelope.image} src={logoIc} /> */}
                <Image
                  style={{
                    ...stylesPdfEnvelope.imageEvent,
                    marginTop: '70px',
                  }}
                  src={dataEvent?.logoBase64 || logoEvento}
                />
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
