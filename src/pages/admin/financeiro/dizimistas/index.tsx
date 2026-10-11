import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  People,
  Savings,
  Search,
  VolunteerActivism,
} from '@mui/icons-material';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { StatusCards } from '../../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import {
  useGetDizimistas,
  useRemoverDizimista,
} from '../../../../features/admin/financeiro/api';
import { ListaDeDizimistas } from '../../../../features/admin/financeiro/components/listaDeDizimistas';
import { ModalDizimista } from '../../../../features/admin/financeiro/components/modalDizimista';
import { Dizimista } from '../../../../features/admin/financeiro/types';

const ANO_ATUAL = new Date().getFullYear();
/** O ano corrente e os quatro anteriores */
const ANOS = Array.from({ length: 5 }, (_, i) => ANO_ATUAL - i);

/**
 * Quem dizima na igreja e como está o ano de cada um: em quais meses houve
 * dízimo, o total e o último. Os números saem dos lançamentos de dízimo
 * ligados à pessoa — os manuais e os que a importação do banco reconheceu
 * pelo CPF.
 */
function Dizimistas() {
  const theme = useTheme();
  const escopo = useIgrejaSelecionada(true);
  const churchId = escopo.churchId;

  const [ano, setAno] = useState(ANO_ATUAL);
  const [situacao, setSituacao] = useState<'ativos' | 'inativos' | 'todos'>(
    'ativos'
  );
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<Dizimista | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  const [removendo, setRemovendo] = useState<Dizimista | null>(null);

  const { data, isFetching } = useGetDizimistas(churchId, ano);
  const remover = useRemoverDizimista();

  // a lista de uma igreja é curta: filtrar aqui poupa ida ao servidor
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, '');
    return (data?.dizimistas ?? []).filter(
      (d) =>
        (situacao === 'todos' || d.active === (situacao === 'ativos')) &&
        (!termo ||
          d.user.fullName.toLowerCase().includes(termo) ||
          (digitos.length >= 3 && d.user.cpf.includes(digitos)))
    );
  }, [data, situacao, busca]);

  const resumo = data?.resumo;
  const media = resumo && resumo.ativos ? resumo.totalNoAno / resumo.ativos : 0;

  return (
    <PageStyle>
      <Header
        title="Dizimistas"
        description="Quem dizima na igreja e como está o ano"
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
                title: 'Dizimistas ativos',
                value: resumo?.ativos ?? 0,
                subtitle: 'Na lista da igreja',
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
                subtitle: 'Dízimos ligados a dizimistas',
                icon: <VolunteerActivism sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.alert,
                compact: true,
              },
              {
                title: 'Média por dizimista',
                value: formatCurrency(media),
                subtitle: `No ano, entre os ativos`,
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
                label="Situação"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as typeof situacao)}
                sx={{ width: 140 }}
              >
                <MenuItem value="ativos">Ativos</MenuItem>
                <MenuItem value="inativos">Inativos</MenuItem>
                <MenuItem value="todos">Todos</MenuItem>
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

              <Box sx={{ flex: 1 }} />

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAdicionando(true)}
                sx={{
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Adicionar dizimista
              </Button>
            </Stack>
          </Paper>

          <ListaDeDizimistas
            dizimistas={visiveis}
            ano={ano}
            carregando={isFetching}
            onEditar={setEditando}
            onRemover={setRemovendo}
          />

          {churchId && (
            <ModalDizimista
              open={adicionando || !!editando}
              churchId={churchId}
              dizimista={editando}
              onClose={() => {
                setAdicionando(false);
                setEditando(null);
              }}
            />
          )}

          <ConfirmModal
            open={!!removendo}
            onClose={() => setRemovendo(null)}
            title="Tirar da lista de dizimistas?"
            message={`${removendo?.user.fullName} sai da lista. Os dízimos já lançados continuam no livro-caixa. Para só parar de contar, prefira desativar.`}
            confirmLabel="Tirar da lista"
            onConfirm={() => {
              if (churchId && removendo) {
                remover.mutate({ churchId, id: removendo.id });
              }
              setRemovendo(null);
            }}
          />
        </>
      )}
    </PageStyle>
  );
}

export { Dizimistas };
