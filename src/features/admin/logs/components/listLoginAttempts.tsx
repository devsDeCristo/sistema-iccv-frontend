import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Card,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircleOutline, Login, WarningAmber } from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import CustomChip from '../../../../components/customChip';
import {
  cardTabelaSx,
  dataGridSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatDateTime, tempoRelativo } from '../../../../utils';
import { useGetUsers } from '../../users/api/getUsers';
import { User } from '../../../../types/user';
import {
  PERIOD_OPTIONS,
  DEFAULT_PERIOD_HOURS,
} from '../constants';
import { useGetLoginAttempts } from '../api/getLogs';

const PAGE_SIZE = 25;

function ListLoginAttempts() {
  const theme = useTheme();
  const [periodoHoras, setPeriodoHoras] = useState(DEFAULT_PERIOD_HOURS);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [documento, setDocumento] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const from = useMemo(
    () => new Date(Date.now() - periodoHoras * 60 * 60 * 1000).toISOString(),
    [periodoHoras]
  );
  const { data, isFetching } = useGetLoginAttempts({
    from,
    userId: usuario?.id,
    document: documento || undefined,
    success: success === '' ? undefined : success === 'true',
    page: page + 1,
    limit: PAGE_SIZE,
  });
  const { data: usersData = [] } = useGetUsers({});
  const usuarios = (Array.isArray(usersData) ? usersData : []) as User[];
  const items = data?.items ?? [];

  const cards: StatusCard[] = [
    {
      title: 'Tentativas no período',
      value: data?.total ?? 0,
      subtitle: 'Entradas registradas',
      icon: <Login sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Logins aceitos',
      value: data?.summary.success ?? 0,
      subtitle: 'Credenciais válidas',
      icon: <CheckCircleOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      title: 'Falhas',
      value: data?.summary.failure ?? 0,
      subtitle: 'Entradas recusadas',
      icon: <WarningAmber sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.canceled,
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Quando',
      width: 165,
      renderCell: ({ row }) => (
        <Stack spacing={0} py={1}>
          <Typography fontSize={13}>{formatDateTime(row.createdAt)}</Typography>
          <Typography fontSize={11} color="text.secondary">
            {tempoRelativo(row.createdAt)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'user',
      headerName: 'Usuário',
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) =>
        row.user ? (
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <UserAvatar
              name={row.user.name}
              photoUrl={row.user.photoUrl}
              sx={{ width: 30, height: 30, fontSize: 12 }}
            />
            <Typography fontSize={13} noWrap>{row.user.name}</Typography>
          </Stack>
        ) : (
          <Typography fontSize={13} color="text.secondary">Documento não encontrado</Typography>
        ),
    },
    {
      field: 'document',
      headerName: 'Documento digitado',
      width: 180,
      renderCell: ({ value }) => <Typography fontSize={13}>{value}</Typography>,
    },
    {
      field: 'success',
      headerName: 'Resultado',
      width: 150,
      renderCell: ({ row }) => (
        <CustomChip
          label={row.success ? 'Sucesso' : 'Falha'}
          customColor={row.success ? theme.palette.chips.success : theme.palette.chips.canceled}
          size="small"
        />
      ),
    },
    {
      field: 'reason',
      headerName: 'Motivo',
      flex: 1,
      minWidth: 190,
      renderCell: ({ row }) => (
        <Typography fontSize={13} color={row.success ? 'text.disabled' : 'text.primary'}>
          {row.success
            ? '—'
            : row.reason === 'WRONG_PASSWORD'
              ? 'Senha incorreta'
              : 'Documento não encontrado'}
        </Typography>
      ),
    },
    {
      field: 'ip',
      headerName: 'IP',
      width: 145,
      renderCell: ({ value }) => <Typography fontSize={13}>{value || '—'}</Typography>,
    },
  ];

  const trocarPeriodo = (horas: number) => {
    setPeriodoHoras(horas);
    setPage(0);
  };

  return (
    <>
      <StatusCards cards={cards} isLoading={isFetching && !data} />
      <Paper sx={{ ...superficieSx, p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={periodoHoras}
            onChange={(_, value) => value && trocarPeriodo(value)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} sx={{ textTransform: 'none', px: 1.75 }}>
                {option.short}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Autocomplete
            size="small"
            sx={{ minWidth: 250, flex: 1 }}
            options={usuarios}
            value={usuario}
            onChange={(_, value) => { setUsuario(value); setPage(0); }}
            getOptionLabel={(option) => option.fullName ?? ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Usuário" />}
          />
          <TextField
            size="small"
            label="Documento"
            value={documento}
            onChange={(event) => { setDocumento(event.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            select
            size="small"
            label="Resultado"
            value={success}
            onChange={(event) => { setSuccess(event.target.value); setPage(0); }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Sucesso</MenuItem>
            <MenuItem value="false">Falha</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      <Card sx={cardTabelaSx}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={isFetching}
          getRowId={(row) => row.id}
          rowHeight={72}
          disableRowSelectionOnClick
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          sx={dataGridSx(theme)}
          paginationMode="server"
          rowCount={data?.total ?? 0}
          paginationModel={{ page, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(model) => setPage(model.page)}
          pageSizeOptions={[PAGE_SIZE]}
          autoHeight
          slots={{
            noRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center" py={5}>
                <Login sx={{ fontSize: 34, color: 'text.disabled' }} />
                <Typography color="text.secondary">Nenhuma tentativa no período</Typography>
              </Stack>
            ),
          }}
        />
      </Card>
    </>
  );
}

export { ListLoginAttempts };