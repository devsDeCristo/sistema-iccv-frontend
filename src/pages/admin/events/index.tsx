import {
  Button,
  MenuItem,
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
import { Add } from '@mui/icons-material';
import { EventStatusFilter } from '../../../features/admin/events/types';
import { useRole } from '../../../hooks/useRole';
import { SeletorDeIgreja } from '../../../components/seletorDeIgreja';
import { useIgrejaEscolhida } from '../../../hooks/useIgrejaEscolhida';
import { superficieSx } from '../../../components/listPageStyles';

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'test', label: 'Em teste' },
  { value: 'all', label: 'Todos' },
];

const ehTexto = (valor: unknown): valor is string => typeof valor === 'string';

const ehStatus = (valor: unknown): valor is EventStatusFilter =>
  STATUS_OPTIONS.some((option) => option.value === valor);

function Events() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  // os filtros ficam salvos no navegador: quem volta para a lista depois de
  // abrir um evento encontra ela do jeito que deixou
  const [search, setSearch] = useFiltroSalvo('eventos:busca', '', ehTexto);
  const [status, setStatus] = useFiltroSalvo<EventStatusFilter>(
    'eventos:status',
    'active',
    ehStatus
  );
  // A igreja do seletor padrão, no canto superior direito — a mesma em todos
  // os módulos e lembrada entre visitas. O seletor devolve "Todas" quando a
  // salva deixou de valer (igreja apagada, vínculo removido). A lista de
  // eventos é também do financeiro, então entram as igrejas dele
  const [churchId, setChurchId] = useIgrejaEscolhida();
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
    },
    textField: {
      width: { xs: '100%', sm: '300px' },
    },
    selectStatus: {
      width: { xs: '100%', sm: '200px' },
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
      <Header title="Eventos">
        <SeletorDeIgreja
          value={churchId}
          onChange={setChurchId}
          incluirFinanceiro
        />
      </Header>
      <CardsStatus />
      <Stack gap={2}>
        <Paper component="div" sx={styles.boxFilterAndPdf}>
          <Stack sx={styles.filters}>
            <TextField
              label="Pesquisar evento por nome"
              variant="outlined"
              size="small"
              value={search}
              sx={styles.textField}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={status}
              sx={styles.selectStatus}
              onChange={(e) => setStatus(e.target.value as EventStatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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
        <List search={search} status={status} churchId={churchId} />
      </Stack>
    </PageStyle>
  );
}

export { Events };
