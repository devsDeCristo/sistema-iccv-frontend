import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useTheme,
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
import { useGetChurches } from '../../../features/admin/churches/api/getChurches';
import {
  campoBuscaSx,
  superficieSx,
} from '../../../components/listPageStyles';

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
  const { isAdmin, isSuperAdmin, churchRoles } = useRole();
  // os filtros ficam salvos no navegador: quem volta para a lista depois de
  // abrir um evento encontra ela do jeito que deixou
  const [search, setSearch] = useFiltroSalvo('eventos:busca', '', ehTexto);
  const [status, setStatus] = useFiltroSalvo<EventStatusFilter>(
    'eventos:status',
    'active',
    ehStatus
  );
  // 'all' e não string vazia: com valor vazio o campo fica em branco e o
  // rótulo não sobe, destoando do Status ao lado. Só o super admin escolhe —
  // o admin já recebe do backend apenas os eventos da igreja dele
  const [churchIdSalvo, setChurchId] = useFiltroSalvo(
    'eventos:igreja',
    'all',
    ehTexto
  );
  const { data: todasAsIgrejas = [], isFetched: igrejasCarregadas } =
    useGetChurches({
      enabled: isSuperAdmin,
    });

  // o super admin filtra entre todas; quem administra mais de uma, entre as
  // dela. Com uma igreja só a lista já é de uma igreja só
  const igrejasDoFiltro = isSuperAdmin
    ? todasAsIgrejas.map((igreja) => ({ id: igreja.id, name: igreja.name }))
    : churchRoles.map((vinculo) => vinculo.church);
  const mostraFiltroDeIgreja = isSuperAdmin || igrejasDoFiltro.length > 1;

  /**
   * A igreja salva pode ter deixado de valer: foi apagada, ou a pessoa perdeu
   * o vínculo com ela. Filtrar por ela esvaziaria a lista sem explicação, então
   * vale "Todas". Enquanto a lista de igrejas do super admin carrega, a salva
   * é mantida — senão o filtro piscaria para "Todas" e voltaria.
   */
  const igrejaSalvaValida =
    churchIdSalvo === 'all' ||
    (isSuperAdmin && !igrejasCarregadas) ||
    igrejasDoFiltro.some((igreja) => igreja.id === churchIdSalvo);
  const churchId =
    mostraFiltroDeIgreja && igrejaSalvaValida ? churchIdSalvo : 'all';
  const theme = useTheme();
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
      ...campoBuscaSx(theme),
    },
    selectStatus: {
      width: { xs: '100%', sm: '200px' },
      ...campoBuscaSx(theme),
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
      <Header title="Eventos"></Header>
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

            {/* o admin não precisa: a lista dele já vem só com a igreja dele */}
            {mostraFiltroDeIgreja && (
              <TextField
                select
                label="Igreja"
                variant="outlined"
                size="small"
                value={churchId}
                sx={styles.selectStatus}
                onChange={(e) => setChurchId(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                {igrejasDoFiltro.map((igreja) => (
                  <MenuItem key={igreja.id} value={igreja.id}>
                    {igreja.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
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
