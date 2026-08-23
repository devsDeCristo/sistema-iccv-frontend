import { Page, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfEnvelopePhoto } from './styles';

// import logoIc from '../../assets/logo-ic-vermelha.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';
import { EventDetails } from '../../features/admin/events/types';
import { PdfSection } from '../../types/pdf';
Font.register({
  family: 'Amethysta',
  src: 'http://fonts.gstatic.com/s/amethysta/v4/uuO0VFu8kdKx34ju6adj-KCWcynf_cDxXwCLxiixG1c.ttf',
});

interface PdfEnvelopePhotoProps {
  event: EventDetails;
  /** Uma folha por inscrito dos blocos; o envelope não leva texto nenhum */
  sections?: PdfSection[];
  /** Envelopes em branco impressos ao final */
  blankCount?: number;
}

// Create Document Component
function PdfEnvelopePhoto({
  event,
  sections,
  blankCount = 0,
}: PdfEnvelopePhotoProps) {
  const dataEvent = event.data;

  const total =
    (sections ?? []).reduce((acc, section) => acc + section.users.length, 0) +
    blankCount;
  // sem escopo nenhum mantém o comportamento antigo: uma folha
  const pages = Array.from({ length: Math.max(total, 1) });

  return (
    <Document>
      {pages.map((_, index) => (
        <Page
          key={`page-${index}`}
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
      ))}
    </Document>
  );
}

export default PdfEnvelopePhoto;
