import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';
import { stylesPdfRooms } from './styles';
import type { PdfProps } from './types';
import logoIc from '../../assets/logo-ic-preta.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function PdfBadge({ data }: PdfProps) {
  const filterBadgeName = data.filter(({ badgeName }) => !!badgeName);
  const pages = chunkArray(filterBadgeName, 4); // 4 crachás por página

  return (
    <Document>
      {pages.map((group, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="A4" style={stylesPdfRooms.body}>
          <View style={stylesPdfRooms.container}>
            {group.map((user, index) => (
              <View
                style={stylesPdfRooms.badge}
                key={`cracha-${pageIndex}-${index}`}
                wrap={false}
              >
                <Image style={stylesPdfRooms.imageBackground} src={bgbadge} />
                <View style={stylesPdfRooms.headerBadge}>
                  <Image style={stylesPdfRooms.image} src={logoIc} />
                  <Image style={stylesPdfRooms.imageEvent} src={logoEvento} />
                </View>
                <Text style={stylesPdfRooms.textName}>
                  {user.badgeName?.toLowerCase()}
                </Text>
              </View>
            ))}
            {group.length < 4 &&
              Array.from({ length: 4 - group.length }).map((_, i) => (
                <View
                  key={`empty-${pageIndex}-${i}`}
                  style={[stylesPdfRooms.badge, { border: 'none' }]}
                  wrap={false}
                />
              ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfBadge;
