import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  VolunteerActivism,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../../components/customChip';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import {
  formatCPF,
  formatCurrency,
  formatPhoneNumber,
} from '../../../../utils';
import { MESES_CURTOS } from '../constants';
import { Dizimista } from '../types';

/** "2026-10-03" → "03/10/2026", sem passar por fuso */
const dataCurta = (dia: string | null) =>
  dia ? dia.split('-').reverse().join('/') : '';

/**
 * Os doze meses do ano numa régua de pontos: aceso, houve dízimo naquele mês.
 * Diz mais que "8 de 10" — mostra o mês que faltou.
 */
function MesesDoAno({ meses, ano }: { meses: number[]; ano: number }) {
  const theme = useTheme();
  const agora = new Date();
  // mês que ainda não chegou fica mais apagado que o que passou sem dízimo
  const ultimoMes =
    ano < agora.getFullYear()
      ? 12
      : ano > agora.getFullYear()
        ? 0
        : agora.getMonth() + 1;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {MESES_CURTOS.map((nome, indice) => {
        const mes = indice + 1;
        const deu = meses.includes(mes);
        return (
          <Tooltip
            key={nome}
            title={`${nome}: ${deu ? 'dizimou' : mes > ultimoMes ? 'ainda não chegou' : 'sem dízimo'}`}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: deu
                  ? theme.palette.chips.success
                  : alpha(
                      theme.palette.text.primary,
                      mes > ultimoMes ? 0.08 : 0.22
                    ),
              }}
            />
          </Tooltip>
        );
      })}
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
        {meses.length}/{ultimoMes || 12}
      </Typography>
    </Stack>
  );
}

interface Props {
  dizimistas: Dizimista[];
  ano: number;
  carregando: boolean;
  onEditar: (dizimista: Dizimista) => void;
  onRemover: (dizimista: Dizimista) => void;
}

function ListaDeDizimistas({
  dizimistas,
  ano,
  carregando,
  onEditar,
  onRemover,
}: Props) {
  const theme = useTheme();

  const columns: GridColDef<Dizimista>[] = [
    {
      field: 'nome',
      headerName: 'Dizimista',
      flex: 2,
      minWidth: 230,
      valueGetter: ({ row }) => row.user.fullName,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ py: 1 }}
        >
          <UserAvatar
            name={row.user.fullName}
            photoUrl={row.user.profilePhotoUrl}
            sx={{
              width: 32,
              height: 32,
              fontSize: 13,
              opacity: row.active ? 1 : 0.5,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
              {row.user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCPF(row.user.cpf)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'contato',
      headerName: 'Contato',
      flex: 1.3,
      minWidth: 180,
      valueGetter: ({ row }) =>
        `${formatPhoneNumber(row.user.cellphone)} ${row.user.email}`,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={13}>
            {formatPhoneNumber(row.user.cellphone)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.user.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'expectedAmount',
      headerName: 'Dízimo',
      // o cabeçalho curto cabe; a dica explica o que é
      description:
        'Valor combinado. Na importação do banco separa dízimo (este valor) de oferta (outro valor)',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: ({ value }) =>
        value ? formatCurrency(value as number) : '—',
    },
    {
      field: 'since',
      headerName: 'Desde',
      width: 100,
      valueFormatter: ({ value }) => dataCurta(value as string | null) || '—',
    },
    {
      field: 'mesesNoAno',
      headerName: `Meses em ${ano}`,
      width: 200,
      sortable: false,
      valueGetter: ({ row }) => row.mesesNoAno.length,
      renderCell: ({ row }) => <MesesDoAno meses={row.mesesNoAno} ano={ano} />,
    },
    {
      field: 'ultimoDizimo',
      headerName: 'Último dízimo',
      width: 115,
      valueFormatter: ({ value }) => dataCurta(value as string | null) || '—',
    },
    {
      field: 'totalNoAno',
      headerName: `Total em ${ano}`,
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography fontSize={14} fontWeight={600}>
          {formatCurrency(value as number)}
        </Typography>
      ),
    },
    {
      field: 'active',
      headerName: 'Situação',
      width: 100,
      valueGetter: ({ row }) => (row.active ? 'Ativo' : 'Inativo'),
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={row.active ? 'Ativo' : 'Inativo'}
          customColor={
            row.active
              ? theme.palette.chips.success
              : theme.palette.chips.default
          }
        />
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 96,
      sortable: false,
      filterable: false,
      disableExport: true,
      align: 'right',
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEditar(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tirar da lista">
            <IconButton
              size="small"
              onClick={() => onRemover(row)}
              sx={{ '&:hover': { color: theme.palette.chips.canceled } }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={dizimistas}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
            minHeight: 60,
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
              <VolunteerActivism
                sx={{ fontSize: 34, color: 'text.disabled' }}
              />
              <Typography color="text.secondary">
                Nenhum dizimista cadastrado
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDeDizimistas };
