import { Page, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfEnvelopePhoto } from './styles';

// import logoIc from '../../assets/logo-ic-vermelha.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';
import { EventDetails } from '../../features/admin/events/types';
Font.register({
  family: 'Amethysta',
  src: 'http://fonts.gstatic.com/s/amethysta/v4/uuO0VFu8kdKx34ju6adj-KCWcynf_cDxXwCLxiixG1c.ttf',
});

// Create Document Component
function PdfEnvelopePhoto({ event }: { event: EventDetails }) {
  const dataEvent = event.data;
  return (
    <Document>
      <Page
        key={'page-1'}
        orientation="portrait"
        size="A4"
        style={stylesPdfEnvelopePhoto.body}
      >
        <View style={stylesPdfEnvelopePhoto.container}>
          <View style={stylesPdfEnvelopePhoto.badge} wrap={false}>
            <Image
              style={stylesPdfEnvelopePhoto.imageBackground}
              src={dataEvent?.coverBase64 || bgbadge}
            />
            <View style={stylesPdfEnvelopePhoto.headerBadge} wrap={false}>
              {/* <Image style={stylesPdfEnvelopePhoto.image} src={logoIc} /> */}
              <Image
                style={stylesPdfEnvelopePhoto.imageEvent}
                src={dataEvent?.logoBase64 || logoEvento}
              />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default PdfEnvelopePhoto;
