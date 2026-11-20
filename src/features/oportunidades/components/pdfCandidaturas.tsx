import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatarSalario, respostaEmTexto } from '../formulario';
import { OportunidadeDaIgreja } from '../types';

const s = StyleSheet.create({
  page: { padding: 28, paddingBottom: 40, fontSize: 9, color: '#111' },
  titulo: { fontSize: 15, marginBottom: 2 },
  subtitulo: { fontSize: 9, color: '#555', marginBottom: 12 },
  linhaCabecalho: {
    flexDirection: 'row',
    borderBottom: '1pt solid #333',
    paddingBottom: 3,
  },
  linha: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottom: '0.5pt solid #ddd',
  },
  celula: { paddingRight: 4 },
  secao: { fontSize: 11, marginTop: 16, marginBottom: 6 },
  bloco: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '0.5pt solid #ddd',
  },
  nome: { fontSize: 10, marginBottom: 3 },
  rotulo: { fontSize: 7.5, color: '#666', marginTop: 3 },
  rodape: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7,
    color: '#777',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const COLUNAS = [
  { titulo: 'Nome', flex: 2.4 },
  { titulo: 'Celular', flex: 1.3 },
  { titulo: 'E-mail', flex: 2.2 },
];

/**
 * O que o admin manda para quem ofereceu a vaga: a tabela de contato e,
 * depois, um bloco por candidato com as respostas do formulário. Os
 * currículos vão à parte (são arquivos).
 */
export function PdfCandidaturas({ vaga }: { vaga: OportunidadeDaIgreja }) {
  const comRespostas = vaga.interests.filter(
    (i) => Object.keys(i.respostas).length > 0
  );
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.titulo}>{vaga.title}</Text>
        <Text style={s.subtitulo}>
          {['Candidaturas', vaga.company, formatarSalario(vaga.salario)]
            .filter(Boolean)
            .join(' · ')}
        </Text>

        <View style={s.linhaCabecalho} fixed>
          {COLUNAS.map((c) => (
            <Text
              key={c.titulo}
              style={[s.celula, { flex: c.flex, color: '#333' }]}
            >
              {c.titulo}
            </Text>
          ))}
        </View>
        {vaga.interests.map(({ user }) => (
          <View key={user.id} style={s.linha} wrap={false}>
            {[user.fullName, user.cellphone ?? '', user.email].map((v, i) => (
              <Text key={i} style={[s.celula, { flex: COLUNAS[i].flex }]}>
                {v}
              </Text>
            ))}
          </View>
        ))}

        {comRespostas.length > 0 && <Text style={s.secao}>Respostas</Text>}
        {comRespostas.map(({ user, respostas }) => (
          <View key={user.id} style={s.bloco} wrap={false}>
            <Text style={s.nome}>{user.fullName}</Text>
            {Object.values(respostas).map((r) => (
              <View key={r.rotulo}>
                <Text style={s.rotulo}>{r.rotulo}</Text>
                <Text>{respostaEmTexto(r)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={s.rodape} fixed>
          <Text>{`${vaga.interests.length} candidatura(s)`}</Text>
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
