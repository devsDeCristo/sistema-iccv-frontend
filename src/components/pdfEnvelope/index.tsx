import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';

import { stylesPdfEnvelope } from './styles';
import type { EnvelopePage, PdfProps } from './types';
import { PdfNameCase, PdfSection } from '../../types/pdf';
import { formatNameCase } from '../../utils';
// import logoIc from '../../assets/logo-ic-vermelha.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';
Font.register({
  family: 'Helvetica',
  src: 'http://fonts.gstatic.com/s/amethysta/v4/uuO0VFu8kdKx34ju6adj-KCWcynf_cDxXwCLxiixG1c.ttf',
});

/**
 * Um envelope por folha, na ordem dos blocos; os em branco vão para o fim.
 * O envelope não leva o nome da equipe/grupo: a arte ocupa a folha inteira e
 * qualquer texto acabaria por cima dela.
 */
function buildPages(
  sections: PdfSection[],
  blankCount: number,
  nameCase: PdfNameCase
): EnvelopePage[] {
  const pages: EnvelopePage[] = sections.flatMap((section) =>
    section.users
      .filter(({ badgeName }) => !!badgeName)
      .map(({ fullName }) => ({
        name: formatNameCase(fullName || '', nameCase),
      }))
  );

  for (let i = 0; i < blankCount; i += 1) {
    pages.push({ name: '' });
  }

  return pages;
}

// Create Document Component
function PdfEnvelope({
  data,
  event,
  sections,
  nameCase = 'capitalize',
  blankCount = 0,
}: PdfProps) {
  const dataEvent = event.data;

  const resolvedSections: PdfSection[] = sections?.length
    ? sections
    : [{ title: null, users: data || [] }];
  const pages = buildPages(resolvedSections, blankCount, nameCase);

  return (
    <Document>
      {pages.map((page, index) => (
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
                {page.name}
              </Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfEnvelope;
