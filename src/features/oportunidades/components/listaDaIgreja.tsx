import {
  alpha,
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  LockOpenOutlined,
  LockOutlined,
  PeopleOutline,
  Work,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../components/customChip';
import { cardTabelaSx, dataGridSx } from '../../../components/listPageStyles';
import { formatarData } from '../formulario';
import { OportunidadeDaIgreja } from '../types';

interface Props {
  oportunidades: OportunidadeDaIgreja[];
  carregando: boolean;
  onInteressados: (oportunidade: OportunidadeDaIgreja) => void;
  onEditar: (oportunidade: OportunidadeDaIgreja) => void;
  onAbrirOuEncerrar: (oportunidade: OportunidadeDaIgreja) => void;
  onExcluir: (oportunidade: OportunidadeDaIgreja) => void;
}

const situacao = (o: OportunidadeDaIgreja) =>
  !o.encerrada ? 'Aberta' : o.isOpen ? 'Vencida' : 'Encerrada';

/** As vagas da igreja; as ações de cada uma ficam na própria linha */
function ListaDaIgreja({
  oportunidades,
  carregando,
  onInteressados,
  onEditar,
  onAbrirOuEncerrar,
  onExcluir,
}: Props) {
  const theme = useTheme();

  const acao = (
    titulo: string,
    icone: React.ReactNode,
    onClick: () => void,
    cor = theme.palette.primary.main
  ) => (
    <Tooltip title={titulo} arrow>
      <IconButton
        size="small"
        aria-label={titulo}
        onClick={onClick}
        sx={{
          color: cor,
          bgcolor: alpha(cor, 0.08),
          '&:hover': { bgcolor: alpha(cor, 0.18) },
        }}
      >
        {icone}
      </IconButton>
    </Tooltip>
  );

  const columns: GridColDef<OportunidadeDaIgreja>[] = [
    {
      field: 'title',
      headerName: 'Vaga',
      flex: 2,
      minWidth: 240,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0, py: 1 }}>
          <Typography fontSize={14} fontWeight={600}>
            {row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {[row.company, row.location].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'interests',
      headerName: 'Candidaturas',
      width: 140,
      valueGetter: ({ row }) => row.interests.length,
      renderCell: ({ row }) => (
        <Button
          size="small"
          startIcon={<PeopleOutline />}
          onClick={() => onInteressados(row)}
          aria-label={`Ver as candidaturas em ${row.title}`}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {row.interests.length}
        </Button>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Publicada',
      width: 140,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1, minWidth: 0 }}>
          <Typography fontSize={13}>{formatarData(row.createdAt)}</Typography>
          {row.createdBy && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              component="div"
            >
              por {row.createdBy.fullName.split(' ')[0]}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'closesAt',
      headerName: 'Até',
      width: 110,
      valueFormatter: ({ value }) =>
        value ? formatarData(value as string) : '—',
    },
    {
      field: 'isOpen',
      headerName: 'Situação',
      width: 120,
      valueGetter: ({ row }) => situacao(row),
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={situacao(row)}
          customColor={
            row.encerrada
              ? theme.palette.text.secondary
              : theme.palette.success.main
          }
        />
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 170,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.75}>
          {acao('Editar', <EditOutlined fontSize="small" />, () =>
            onEditar(row)
          )}
          {acao(
            row.encerrada ? 'Reabrir' : 'Encerrar',
            !row.encerrada ? (
              <LockOutlined fontSize="small" />
            ) : (
              <LockOpenOutlined fontSize="small" />
            ),
            () => onAbrirOuEncerrar(row)
          )}
          {acao(
            'Excluir',
            <DeleteOutline fontSize="small" />,
            () => onExcluir(row),
            theme.palette.error.main
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={oportunidades}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
            minHeight: 56,
          },
        }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        slots={{
          noRowsOverlay: () => (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              py={5}
            >
              <Work sx={{ fontSize: 34, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Nenhuma oportunidade aqui
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDaIgreja };
