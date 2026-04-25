import { Page, Text, View, Document, Font } from '@react-pdf/renderer';

//import Borboleta from '../../assets/borboleta.png';
import { stylesPdf } from './styles';
import type { PdfProps } from './types';
import { HeaderPdf } from './header';
import { FooterPdf } from './footer';
import { UserRectangle } from './userRetangle';
import { CoverPdf } from './cover';
import dayjs from 'dayjs';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create Document Component
function PdfEvent({ data, event }: PdfProps) {
  const dataEvent = event.data;
  return (
    <Document>
      <Page orientation="landscape" style={stylesPdf.bodyCover}>
        <CoverPdf  logo={dataEvent.logoBase64 as string} bg={dataEvent.coverBase64 as string} />
      </Page>
      <Page orientation="landscape" style={stylesPdf.body}>
        <HeaderPdf logo={dataEvent.logoBase64 as string} bg={dataEvent.coverBase64 as string} />
        {data.map(({ name, users }, index) => (
          <View break={index != 0} wrap>
            <View fixed style={stylesPdf.decuria} key={'titulo-pdf' + index}>
              <Text style={stylesPdf.title}>{name}</Text>
            </View>
            <View style={stylesPdf.rectangleRow} key={'quadrantes-pdf' + index}>
              {users?.map((user, index) => (
                <UserRectangle key={index} user={user} />
              ))}
            </View>
          </View>
        ))}
        <FooterPdf bg={dataEvent.coverBase64 as string} text={"De " + dayjs(event.startDate).format('D') + " a " + dayjs(event.endDate).format('D') + " de " + dayjs(event.endDate).format('MMMM') + " de " + dayjs(event.endDate).format('YYYY')} />
      </Page>
    </Document>
  );
}

export default PdfEvent;
