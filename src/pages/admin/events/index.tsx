import {
  Alert,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/events/components/list';
import { CardsStatus } from '../../../features/admin/events/components/cardsStatus';
import { useFiltroSalvo } from '../../../hooks/useFiltroSalvo';
import { Add, Search } from '@mui/icons-material';
import {
  EventPeriodFilter,
  EventStatusFilter,
} from '../../../features/admin/events/types';
import { FiltroMultiplo } from '../../../features/admin/events/components/filtroMultiplo';
import { useRole } from '../../../hooks/useRole';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../components/listPageStyles';

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'test', label: 'Em teste' },
];

const PERIOD_OPTIONS: { value: EventPeriodFilter; label: string }[] = [
  { value: 'ongoing', label: 'Em andamento' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'finished', label: 'Encerrados' },
];

const ehTexto = (valor: unknown): valor is string => typeof valor === 'string';

/**
 * Lista só de opções que existem. O que estava salvo antes de os filtros serem
 * múltiplos (um texto, como `'active'`) não passa, e o filtro volta ao padrão.
 */
const listaDe =
  <T extends string>(opcoes: { value: T }[]) =>
  (valor: unknown): valor is T[] =>
    Array.isArray(valor) &&
    valor.every((item) => opcoes.some((opcao) => opcao.value === item));

const ehStatus = listaDe(STATUS_OPTIONS);
const ehPeriodo = listaDe(PERIOD_OPTIONS);

function Events() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  // os filtros ficam salvos no navegador: quem volta para a lista depois de
  // abrir um evento encontra ela do jeito que deixou
  const [search, setSearch] = useFiltroSalvo('eventos:busca', '', ehTexto);
  // lista vazia é "todos": os dois filtros aceitam mais de uma opção
  const [status, setStatus] = useFiltroSalvo<EventStatusFilter[]>(
    'eventos:status:multiplo',
    ['active'],
    ehStatus
  );
  const [period, setPeriod] = useFiltroSalvo<EventPeriodFilter[]>(
    'eventos:periodo',
    [],
    ehPeriodo
  );
  // A igreja do seletor padrão, no canto superior direito — a mesma em todos
  // os módulos e lembrada entre visitas. Sempre uma: a tela é a do admin
  // daquela igreja. A lista de eventos é também da tesouraria e de quem é
  // tesoureiro(a) ou admin de um evento, então entram as igrejas deles
  const escopo = useIgrejaSelecionada(true, true);
  const churchId = escopo.churchId;
  const styles = {
    boxFilterAndPdf: {
      display: 'flex',
      // flexDirection: { xs: 'column', sm: 'row' },
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      p: 2,
      ...superficieSx,
      // no celular, busca, selects e botões ocupam a linha inteira
      ...barraLarguraCheiaNoCelularSx,
    },
    textField: {
      width: { xs: '100%', sm: '300px' },
    },
    // largura mínima, e não fixa: o campo mostra os nomes das opções marcadas
    // e cresce com eles (no celular a barra já os põe na largura toda)
    selectStatus: {
      minWidth: { xs: '100%', sm: '200px' },
    },
    selectPeriod: {
      minWidth: { xs: '100%', sm: '220px' },
    },
    filters: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2,
    },
  };
  return (
    <PageStyle>
      <Header
        title="Eventos"
        description="Inscrições, equipes, quartos, check-in e pagamentos"
        modulo="eventos"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="os eventos" />
      </Header>
      {!churchId ? (
        <Alert severity="info">
          {escopo.semIgreja
            ? 'Você não trabalha em nenhuma igreja. Os eventos são por igreja.'
            : 'Escolha no topo da página de qual igreja são os eventos.'}
        </Alert>
      ) : (
        <>
          <CardsStatus churchId={churchId} />
          <Stack gap={2}>
            <Paper component="div" sx={styles.boxFilterAndPdf}>
              <Stack sx={styles.filters}>
                <TextField
                  placeholder="Pesquisar evento por nome"
                  variant="outlined"
                  size="small"
                  value={search}
                  sx={styles.textField}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <FiltroMultiplo
                  label="Status"
                  opcoes={STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  sx={styles.selectStatus}
                />
                <FiltroMultiplo
                  label="Período"
                  opcoes={PERIOD_OPTIONS}
                  value={period}
                  onChange={setPeriod}
                  sx={styles.selectPeriod}
                />
              </Stack>

              {isAdmin && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/admin/eventos/cadastro')}
                  startIcon={<Add />}
                >
                  Novo Evento
                </Button>
              )}
            </Paper>
            <List
              search={search}
              status={status}
              period={period}
              churchId={churchId}
            />
          </Stack>
        </>
      )}
    </PageStyle>
  );
}

export { Events };
