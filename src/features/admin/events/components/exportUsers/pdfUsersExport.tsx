import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { ExportColumn, ExportGroup, ExportOrientation } from './types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 34,
    paddingHorizontal: 24,
    fontSize: 9,
    color: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  logo: { width: 48, height: 48, objectFit: 'contain' },
  title: { fontSize: 15, marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#555' },
  groupTitle: {
    fontSize: 11,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: '1pt solid #999',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #333',
    paddingBottom: 3,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottom: '0.5pt solid #ddd',
  },
  headerCell: { fontSize: 8, color: '#333', paddingRight: 4 },
  cell: { fontSize: 8, paddingRight: 4 },
  leaderTag: { fontSize: 7, color: '#8a5a00' },
  empty: { fontSize: 10, color: '#777', marginTop: 16 },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    fontSize: 7,
    color: '#777',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

/** Colunas de texto longo ganham mais espaço que as curtas */
const COLUMN_WEIGHT: Record<string, number> = {
  fullName: 2.4,
  badgeName: 1.4,
  email: 2.2,
  notes: 2.4,
  profession: 1.4,
  teams: 1.4,
  groupsRegistration: 1.4,
  bedrooms: 1.2,
  emergencyContact: 1.3,
  cellphone: 1.3,
  cpf: 1.3,
  diabetes: 0.7,
  hypertensive: 0.8,
  state: 0.6,
  roleTeam: 0.8,
};

const weightOf = (field: string) => COLUMN_WEIGHT[field] ?? 1;

interface PdfUsersExportProps {
  eventName: string;
  subtitle: string;
  groups: ExportGroup[];
  columns: ExportColumn[];
  /** marca o líder ao lado do nome, usado no agrupamento por equipe */
  markLeaders: boolean;
  orientation: ExportOrientation;
  /** data URI da logo do evento (event.data.logoBase64); opcional */
  logo?: string;
}

function PdfUsersExport({
  eventName,
  subtitle,
  groups,
  columns,
  markLeaders,
  orientation,
  logo,
}: PdfUsersExportProps) {
  const total = groups.reduce((acc, group) => acc + group.users.length, 0);

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.header} fixed>
          {/* sem src o react-pdf quebra, então a logo só entra se existir */}
          {logo ? <Image style={styles.logo} src={logo} /> : null}
          <View>
            <Text style={styles.title}>{eventName}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {total === 0 && (
          <Text style={styles.empty}>
            Nenhum usuário encontrado para os filtros selecionados.
          </Text>
        )}

        {groups.map((group, groupIndex) => (
          <View key={`group-${groupIndex}`} wrap>
            {group.title && (
              <Text style={styles.groupTitle}>
                {`${group.title}  (${group.users.length})`}
              </Text>
            )}

            <View style={styles.headerRow} fixed={!group.title}>
              {columns.map((column) => (
                <Text
                  key={`header-${column.field}`}
                  style={[styles.headerCell, { flex: weightOf(column.field) }]}
                >
                  {column.label}
                </Text>
              ))}
            </View>

            {group.users.map((user, userIndex) => (
              <View
                key={`${user.id}-${userIndex}`}
                style={styles.row}
                wrap={false}
              >
                {columns.map((column, columnIndex) => (
                  <Text
                    key={`${user.id}-${column.field}`}
                    style={[styles.cell, { flex: weightOf(column.field) }]}
                  >
                    {column.getValue(user)}
                    {columnIndex === 0 &&
                      markLeaders &&
                      user.roleTeam === 'LEADER' && (
                        <Text style={styles.leaderTag}>{'  (Líder)'}</Text>
                      )}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>{`${total} registro(s)`}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export { PdfUsersExport };
