import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import Borboleta from '../../assets/borboleta.png';
import { stylesPdf } from './styles';
import type { PdfProps } from './types';
import { HeaderPdf } from './header';
import { FooterPdf } from './footer';
import { UserRectangle } from './userRetangle';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfEvent({ data, textFooter }: PdfProps) {
  return (
    <Document>
      <Page orientation="landscape" style={stylesPdf.body}>
        <HeaderPdf />
        <View fixed style={stylesPdf.decuria}>
          {' '}
          <Image style={stylesPdf.imageDecuria} src={Borboleta} />
          <Text style={stylesPdf.title}>Decúria Amor</Text>
        </View>
        <View style={stylesPdf.rectangleRow}>
          {data.map((user) => (
            <UserRectangle user={user} />
          ))}
        </View>
        <FooterPdf text={textFooter} />
      </Page>
    </Document>
  );
}

export default PdfEvent;
