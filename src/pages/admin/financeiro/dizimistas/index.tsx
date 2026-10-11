import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useTheme,
} from '@mui/material';
import {
  CalendarMonth,
  People,
  Savings,
  Search,
  UploadFile,
  VolunteerActivism,
} from '@mui/icons-material';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { StatusCards } from '../../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useGetDizimistas } from '../../../../features/admin/financeiro/api';
import { ListaDizimosPorMes } from '../../../../features/admin/financeiro/components/listaDizimosPorMes';
import { ModalDizimista } from '../../../../features/admin/financeiro/components/modalDizimista';
import { ModalPlanilhaDeDizimos } from '../../../../features/admin/financeiro/components/modalPlanilhaDeDizimos';
import { Dizimista } from '../../../../features/admin/financeiro/types';
import { Role } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';

const ANO_ATUAL = new Date().getFullYear();
/** O ano corrente e os quatro anteriores */
const ANOS = Array.from({ length: 5 }, (_, i) => ANO_ATUAL - i);

/**
 * Os dizimistas são **os membros da igreja** — todo membro é um dizimista em
 * potencial, e não há cadastro à parte (quem entra e sai é o admin, em
 * Membros). Aqui se vê como está o ano de cada um: em quais meses houve
 * dízimo, o total e o último — dos lançamentos de dízimo ligados à pessoa, os
 * manuais e os que a importação do banco reconheceu pelo CPF — e se ajusta o
 * valor do dízimo, que separa dízimo de oferta na importação.
 */
function Dizimistas() {
  const theme = useTheme();
  const escopo = useIgrejaSelecionada(true);
  const churchId = escopo.churchId;

  const [ano, setAno] = useState(ANO_ATUAL);
  const [noAno, setNoAno] = useState<'todos' | 'com' | 'sem'>('todos');
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<Dizimista | null>(null);
  const [importando, setImportando] = useState(false);

  // a planilha coloca gente como membro: só o admin desta igreja (a API cobra)
  const { isDev, isSuperAdmin, perfilNaIgreja } = useRole();
  const podeImportar =
    !!churchId &&
    (isDev || isSuperAdmin || perfilNaIgreja(churchId) === Role.ADMIN);

  const { data, isFetching } = useGetDizimistas(churchId, ano);

  // a lista de uma igreja é curta: filtrar aqui poupa ida ao servidor
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, '');
    return (data?.dizimistas ?? []).filter(
      (d) =>
        (noAno === 'todos' || (noAno === 'com') === d.totalNoAno > 0) &&
        (!termo ||
          d.fullName.toLowerCase().includes(termo) ||
          (digitos.length >= 3 && d.cpf.includes(digitos)))
    );
  }, [data, noAno, busca]);

  const resumo = data?.resumo;
  const media =
    resumo && resumo.dizimaramNoAno
      ? resumo.totalNoAno / resumo.dizimaramNoAno
      : 0;

  return (
    <PageStyle>
      <Header
        title="Dizimistas"
        description="Os membros da igreja e o dízimo de cada um"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="os dizimistas" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja são os dizimistas: cada
          igreja tem os seus.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem financeiro de nenhuma igreja. O financeiro é por
          igreja.
        </Alert>
      ) : (
        <>
          <StatusCards
            isLoading={!data}
            cards={[
              {
                title: 'Membros',
                value: resumo?.membros ?? 0,
                subtitle: 'Dizimistas em potencial',
                icon: <People sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.info,
              },
              {
                title: 'Dizimaram no mês',
                value: resumo?.dizimaramNoMes ?? 0,
                subtitle: `${formatCurrency(resumo?.totalNoMes)} em dízimos`,
                icon: <CalendarMonth sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.success,
              },
              {
                title: `Total em ${ano}`,
                value: formatCurrency(resumo?.totalNoAno),
                subtitle: `${resumo?.dizimaramNoAno ?? 0} membros dizimaram`,
                icon: <VolunteerActivism sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.alert,
                compact: true,
              },
              {
                title: 'Média por dizimista',
                value: formatCurrency(media),
                subtitle: 'Entre quem dizimou no ano',
                icon: <Savings sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.pending,
                compact: true,
              },
            ]}
          />

          <Paper
            sx={{
              ...superficieSx,
              ...barraLarguraCheiaNoCelularSx,
              p: 2,
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <TextField
                size="small"
                placeholder="Nome ou CPF"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                sx={{ width: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                size="small"
                label={`Dízimo em ${ano}`}
                value={noAno}
                onChange={(e) => setNoAno(e.target.value as typeof noAno)}
                sx={{ width: 170 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="com">Dizimaram</MenuItem>
                <MenuItem value="sem">Não dizimaram</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Ano"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                sx={{ width: 110 }}
              >
                {ANOS.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
              {podeImportar && (
                <Button
                  variant="outlined"
                  startIcon={<UploadFile />}
                  onClick={() => setImportando(true)}
                  sx={{
                    textTransform: 'none',
                    ml: { sm: 'auto' },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Importar planilha
                </Button>
              )}
            </Stack>
          </Paper>

          {/* sem membro, a lista fica vazia: diz de onde eles vêm */}
          {resumo && !resumo.membros && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Os dizimistas são os membros da igreja. Quem administra a igreja
              coloca as pessoas como membros no módulo Membros.
            </Alert>
          )}

          <ListaDizimosPorMes
            dizimistas={visiveis}
            ano={ano}
            porMesDaIgreja={resumo?.porMes ?? Array(12).fill(0)}
            totalDaIgreja={resumo?.totalNoAno ?? 0}
            carregando={isFetching}
            onEditar={setEditando}
          />

          {churchId && podeImportar && (
            <ModalPlanilhaDeDizimos
              open={importando}
              churchId={churchId}
              anoInicial={ano}
              onClose={() => setImportando(false)}
            />
          )}

          {churchId && (
            <ModalDizimista
              churchId={churchId}
              dizimista={editando}
              onClose={() => setEditando(null)}
            />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { Dizimistas };
