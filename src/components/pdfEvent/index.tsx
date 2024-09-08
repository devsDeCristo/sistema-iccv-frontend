import { Page, Text, View, Document, Font } from '@react-pdf/renderer';

//import Borboleta from '../../assets/borboleta.png';
import { stylesPdf } from './styles';
import type { PdfProps } from './types';
import { HeaderPdf } from './header';
import { FooterPdf } from './footer';
import { UserRectangle } from './userRetangle';
import { CoverPdf } from './cover';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfEvent({ data }: PdfProps) {
  return (
    <Document>
      <Page orientation="landscape" style={stylesPdf.body}>
        <CoverPdf />
      </Page>
      <Page orientation="landscape" style={stylesPdf.body}>
        <HeaderPdf />
        {data.map(({ name, users }, index) => (
          <View  wrap>
            <View fixed style={stylesPdf.decuria} key={'titulo-pdf' + index}>
              <Text style={stylesPdf.title}>{name}</Text>
            </View>
            <View  style={stylesPdf.rectangleRow} key={'quadrantes-pdf' + index}>
              {users?.map((user, index) => (
                <UserRectangle key={index} user={user} />
              ))}
            </View>
          </View>
        ))}
        <FooterPdf />
      </Page>
    </Document>
  );
}

export default PdfEvent;
