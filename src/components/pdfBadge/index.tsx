import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfBadge } from './styles';
import type { PdfProps } from './types';
import logoIc from '../../assets/logo-ic-preta.png';
import logoEvento from '../../assets/8-cur-mas.png';
import bgbadge from '../../assets/galo.png';
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfBadge({ data }: PdfProps) {
  const filterBadgeName = data.filter(({ badgeName }) => !!badgeName);

  const chunked = [];
  for (let i = 0; i < filterBadgeName.length; i += 4) {
    chunked.push(filterBadgeName.slice(i, i + 4));
  }
  return (
    <Document>
      {chunked.map((group, pageIndex) => (
        <Page
          key={pageIndex}
          orientation="portrait"
          style={stylesPdfBadge.body}
        >
          <View style={stylesPdfBadge.container}>
            {group.map(({ fullName }, index) => (
              <View
                key={`cracha-${pageIndex}-${index}`}
                style={stylesPdfBadge.badge}
                wrap={false}
              >
                <Image style={stylesPdfBadge.imageBackground} src={bgbadge} />
                <View style={stylesPdfBadge.headerBadge} wrap={false}>
                  <Image style={stylesPdfBadge.image} src={logoIc} />
                  <Image style={stylesPdfBadge.imageEvent} src={logoEvento} />
                </View>
                <Text wrap={false} style={stylesPdfBadge.textName}>
                  {fullName?.toLowerCase()}
                </Text>
              </View>
            ))}
            {group.length % 2 !== 0 && (
              <View
                style={[stylesPdfBadge.badge, { border: 'none' }]}
                key={'cracha-pdf'}
                wrap={false}
              ></View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfBadge;
