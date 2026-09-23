import {
  Card,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../api/getEvents';
import { formatDate } from '../../../../utils';
import {
  DeleteOutline,
  EditNoteOutlined,
  MoreVert,
  VisibilityOutlined,
  WebOutlined,
} from '@mui/icons-material';
import { useRole } from '../../../../hooks/useRole';
import { Role } from '../../../../constants/roles';
import CustomChip from '../../../../components/customChip';
import { EventStatus, EventStatusFilter } from '../types';
import { EVENT_STATUS_LABELS } from '../constants';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { EventoParaApagar, ModalDeleteEvent } from './modalDeleteEvent';

type AcaoDoEvento = {
  rotulo: string;
  icone: ReactNode;
  cor: string;
  aoClicar: () => void;
};

/**
 * As ações da linha, num menu só.
 *
 * Em botões soltos a coluna crescia a cada ação nova e três ícones coloridos
 * lado a lado disputavam a atenção com os dados da tabela. Nos três pontos cada
 * ação ganha nome escrito, e a cor volta a ser o que separa uma da outra — não
 * o que grita na linha inteira.
 */
function AcoesDoEvento({ acoes }: { acoes: AcaoDoEvento[] }) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Ações">
        <IconButton
          size="medium"
          aria-label="Ações do evento"
          onClick={(evento) => setAncora(evento.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={ancora}
        open={!!ancora}
        onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {acoes.map((acao) => (
          <MenuItem
            key={acao.rotulo}
            onClick={() => {
              setAncora(null);
              acao.aoClicar();
            }}
          >
            <ListItemIcon sx={{ color: acao.cor, minWidth: 34 }}>
              {acao.icone}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              {acao.rotulo}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);

  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
/** Cada aba do filtro olha para um status só; 'all' não passa por aqui. */
const STATUS_DO_FILTRO: Record<
  Exclude<EventStatusFilter, 'all'>,
  EventStatus
> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  test: 'TEST',
};

function List({
  search,
  status = 'active',
  churchId = 'all',
}: {
  search: string;
  status?: EventStatusFilter;
  /** 'all' = todas. Só o super admin recebe evento de mais de uma igreja */
  churchId?: string;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDev, isSuperAdmin, perfilNaIgreja } = useRole();
  const [eventoParaApagar, setEventoParaApagar] =
    useState<EventoParaApagar | null>(null);
  const { data: eventData, isLoading } = useGetEvents({ painel: true });
  const events = Array.isArray(eventData) ? eventData : [];
  const filteredData = events.filter((event: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = event.name.toLowerCase().includes(searchLower);
    const matchesStatus =
      status === 'all' ? true : event.status === STATUS_DO_FILTRO[status];
    const matchesChurch = churchId === 'all' || event.church?.id === churchId;

    return matchesSearch && matchesStatus && matchesChurch;
  });
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 2, minWidth: 180 },
    // a coluna só faz sentido para quem enxerga mais de uma igreja
    ...(isSuperAdmin
      ? [
          {
            field: 'church',
            headerName: 'Igreja',
            width: 170,
            valueGetter: (params: any) => params.row.church?.name || '—',
          },
        ]
      : []),
    {
      field: 'startDate',
      headerName: 'Data inicial',
      width: 100,
      valueGetter: (params) => formatDate(params.row.startDate),
    },
    {
      field: 'endDate',
      headerName: 'Data final',
      width: 100,
      valueGetter: (params) => formatDate(params.row.endDate),
    },
    {
      field: 'location',
      headerName: 'Local',
      width: 200,
      valueGetter: () => 'Chácara Monte Moriá',
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={params.value || 'Cursilho'}
          size="small"
          customColor={theme.palette.chips.default}
        />
      ),
    },
    {
      field: 'users',
      headerName: 'Inscritos',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const users = params?.row?.users;
        const capacity = params?.row?.capacity;

        return (
          <Stack direction="row" alignItems="center">
            <Typography>
              {users}/{capacity}
              <LinearProgress
                variant="determinate"
                value={(users / (capacity || 0)) * 100}
              />
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'waitlist',
      headerName: 'Em espera',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.value || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Aguardando'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'bedrooms',
      headerName: 'Quartos',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.row.bedroom || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Quartos'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'team',
      headerName: 'Equipes',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.row.team || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Equipes'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={EVENT_STATUS_LABELS[params.value] || 'Inativo'}
          // teste em cor de atenção: é um evento que existe mas não está no ar
          customColor={
            params.value === 'ACTIVE'
              ? theme.palette.chips.success
              : params.value === 'TEST'
                ? theme.palette.chips.alert
                : theme.palette.chips.canceled
          }
          size="small"
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Ações',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        // linha a linha: a mesma pessoa pode administrar a igreja de um evento
        // e ser só financeiro na do evento de baixo
        const podeEditar =
          isSuperAdmin || perfilNaIgreja(params.row.church?.id) === Role.ADMIN;

        return (
          <AcoesDoEvento
            acoes={[
              {
                rotulo: 'Abrir página do evento',
                icone: <WebOutlined fontSize="small" />,
                cor: theme.palette.chips.info,
                // em outra aba: o admin volta para a lista onde parou, em vez
                // de refazer busca e filtros no caminho de volta
                aoClicar: () =>
                  window.open(
                    `/eventos/${params.row.id}`,
                    '_blank',
                    'noopener'
                  ),
              },
              {
                rotulo: 'Detalhes',
                icone: <VisibilityOutlined fontSize="small" />,
                cor: theme.palette.primary.main,
                aoClicar: () =>
                  navigate(`/admin/eventos/${params.row.id}/detalhes/usuarios`),
              },
              ...(podeEditar
                ? [
                    {
                      rotulo: 'Editar',
                      icone: <EditNoteOutlined fontSize="small" />,
                      cor: theme.palette.chips.alert,
                      aoClicar: () =>
                        navigate(`/admin/eventos/${params.row.id}/editar`),
                    },
                  ]
                : []),
              // apagar evento é decisão de negócio, e por ora só o perfil de
              // desenvolvimento a toma; a rota no servidor confere o mesmo
              ...(isDev
                ? [
                    {
                      rotulo: 'Apagar evento',
                      icone: <DeleteOutline fontSize="small" />,
                      cor: theme.palette.error.main,
                      aoClicar: () =>
                        setEventoParaApagar({
                          id: params.row.id,
                          name: params.row.name,
                        }),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];

  // function onRowClick({ row }: GridRowParams) {
  //   navigate(`/admin/eventos/${row.id}/detalhes/usuarios`);
  // }

  return (
    <Card sx={cardTabelaSx}>
      <DataGrid
        loading={isLoading}
        //onRowClick={onRowClick}
        rows={filteredData}
        columns={columns}
        autoHeight={true}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
        columnHeaderHeight={44}
        sx={dataGridSx(theme)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />

      <ModalDeleteEvent
        evento={eventoParaApagar}
        onFechar={() => setEventoParaApagar(null)}
      />
    </Card>
  );
}

export { List };
