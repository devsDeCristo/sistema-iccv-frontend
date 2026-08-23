import { Page, Text, View, Document, Font, Image } from '@react-pdf/renderer';
import { stylesPdfBadge } from './styles';
import type { BadgePage, PdfProps } from './types';
import { PdfNameCase, PdfSection } from '../../types/pdf';
import { formatNameCase } from '../../utils';
import logoIc from '../../assets/logo-ic-preta.png';
import logoEvento from '../../assets/6-curs-fem.png';
import bgbadge from '../../assets/fundo-cracha.png';
import paper from '../../assets/papel-rasgado.png';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const BADGES_PER_PAGE = 4;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Monta as folhas. Cada bloco começa em folha nova para o cabeçalho valer para
 * todos os crachás da folha; os em branco vão para o fim, sem cabeçalho.
 */
function buildPages(
  sections: PdfSection[],
  blankCount: number,
  nameCase: PdfNameCase
): BadgePage[] {
  const pages: BadgePage[] = [];

  for (const section of sections) {
    const names = section.users
      .filter(({ badgeName }) => !!badgeName)
      .map(({ badgeName }) => formatNameCase(badgeName || '', nameCase));

    for (const chunk of chunkArray(names, BADGES_PER_PAGE)) {
      pages.push({ title: section.title, names: chunk });
    }
  }

  if (blankCount > 0) {
    const blanks = Array.from({ length: blankCount }, () => '');
    for (const chunk of chunkArray(blanks, BADGES_PER_PAGE)) {
      pages.push({ title: null, names: chunk });
    }
  }

  return pages;
}

function PdfBadge({
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
      {pages.map((page, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="A4" style={stylesPdfBadge.body}>
          {page.title && (
            <Text style={stylesPdfBadge.sectionTitle}>
              {page.title.toLowerCase()}
            </Text>
          )}
          <View style={stylesPdfBadge.container}>
            {page.names.map((name, index) => (
              <View
                style={stylesPdfBadge.badge}
                key={`cracha-${pageIndex}-${index}`}
                wrap={false}
              >
                <Image style={stylesPdfBadge.imageBackground} src={dataEvent?.coverBase64 ||bgbadge} />
                <View style={stylesPdfBadge.headerBadge}>
                  <Image style={stylesPdfBadge.image} src={logoIc} />
                  <Image
                    style={stylesPdfBadge.imageEvent}
                    src={
                      dataEvent?.logoBase64 || logoEvento
                    }
                  />
                  <Image style={stylesPdfBadge.imagePaper} src={paper} />
                </View>
                <Text style={stylesPdfBadge.textName}>{name}</Text>
              </View>
            ))}
            {page.names.length < BADGES_PER_PAGE &&
              Array.from({ length: BADGES_PER_PAGE - page.names.length }).map(
                (_, i) => (
                  <View
                    key={`empty-${pageIndex}-${i}`}
                    style={[stylesPdfBadge.badge, { border: 'none' }]}
                    wrap={false}
                  />
                )
              )}
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default PdfBadge;
