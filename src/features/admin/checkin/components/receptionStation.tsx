import { useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import { HowToReg, Search, Undo } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSearchCheckin } from '../api/getCheckin';
import { useDeliverBadge, useUndoCheckin } from '../api/postCheckin';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatCPF } from '../../../../utils';
import {
  CHECKIN_REFETCH_MS,
  CHECKIN_STATUS_COLOR,
  CHECKIN_STATUS_LABEL,
} from '../constants';
import { CheckinParticipant } from '../types';

interface ReceptionStationProps {
  eventId: string;
}

/** Ignora acento e caixa: "jose" encontra "José". */
const normalizar = (valor?: string | null) =>
  (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * Posto 1 — reconhecimento e entrega do crachá.
 *
 * A lista inteira do evento fica na tela e o campo apenas filtra, como no resto
 * do sistema: a recepção precisa enxergar quem ainda não chegou sem depender de
 * lembrar o nome exato de quem está no balcão.
 */
function ReceptionStation({ eventId }: ReceptionStationProps) {
  const [filtro, setFiltro] = useState('');
  const campoFiltro = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  // a lista vem inteira de uma vez e o filtro roda no cliente — sem ida ao
  // servidor a cada tecla, o resultado aparece instantâneo no balcão
  const { data: inscritos, isLoading } = useSearchCheckin(eventId, '', {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  const todos = useMemo(() => inscritos || [], [inscritos]);

  const lista = useMemo(() => {
    const termo = normalizar(filtro.trim());
    if (!termo) return todos;

    const digitos = filtro.replace(/\D/g, '');

    return todos.filter((participante) => {
      const nome = `${normalizar(participante.fullName)} ${normalizar(
        participante.badgeName
      )}`;
      if (nome.includes(termo)) return true;
      if (!digitos) return false;

      return (
        (participante.cpf || '').includes(digitos) ||
        String(participante.registrationNumber).includes(digitos)
      );
    });
  }, [todos, filtro]);

  const { mutate: entregarCracha, isLoading: entregando } = useDeliverBadge({
    onSuccess: (participante) => {
      toast.success(
        `${participante.fullName} entrou na fila da foto. Encaminhe ao posto.`
      );
      setFiltro('');
      campoFiltro.current?.focus();
    },
  });

  const { mutate: desfazer, isLoading: desfazendo } = useUndoCheckin({
    onSuccess: (participante) => {
      toast.success(`Entrega de crachá desfeita para ${participante.fullName}`);
    },
  });

  const acaoDoParticipante = (participante: CheckinParticipant) => {
    if (participante.status === 'PENDING') {
      return (
        <Button
          size="small"
          variant="contained"
          startIcon={<HowToReg />}
          disabled={entregando}
          onClick={() => entregarCracha({ eventId, userId: participante.userId })}
        >
          Entregar crachá
        </Button>
      );
    }

    // só desfaz quem ainda não foi chamado; depois disso é o outro posto
    if (participante.status === 'QUEUED') {
      return (
        <Button
          size="small"
          color="warning"
          startIcon={<Undo />}
          disabled={desfazendo}
          onClick={() => desfazer({ eventId, userId: participante.userId })}
        >
          Desfazer
        </Button>
      );
    }

    return null;
  };

  const colunas: GridColDef[] = [
    {
      field: 'foto',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <UserAvatar
          name={params.row.fullName}
          photoUrl={params.row.profilePhotoUrl}
          sx={{ width: 34, height: 34 }}
        />
      ),
    },
    {
      field: 'fullName',
      headerName: 'Nome / crachá',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Stack sx={{ py: 0.5, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.fullName}
          </Typography>
          {params.row.badgeName && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.badgeName}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'registrationNumber',
      headerName: 'Inscrição',
      width: 100,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 140,
      valueGetter: (params) => formatCPF(params.row.cpf || ''),
    },
    {
      field: 'bedroom',
      headerName: 'Quarto',
      width: 130,
      valueGetter: (params) => params.row.bedroom || '—',
    },
    {
      field: 'teams',
      headerName: 'Equipe',
      width: 170,
      sortable: false,
      valueGetter: (params) =>
        params.row.teams.map((team: { name: string }) => team.name).join(', ') ||
        '—',
    },
    {
      field: 'status',
      headerName: 'Situação',
      width: 160,
      renderCell: (params) => (
        <Chip
          size="small"
          label={CHECKIN_STATUS_LABEL[params.row.status as CheckinParticipant['status']]}
          color={CHECKIN_STATUS_COLOR[params.row.status as CheckinParticipant['status']]}
        />
      ),
    },
    {
      field: 'acao',
      headerName: '',
      width: 190,
      sortable: false,
      filterable: false,
      renderCell: (params) => acaoDoParticipante(params.row),
    },
  ];

  return (
    <Stack spacing={2}>
      <TextField
        inputRef={campoFiltro}
        autoFocus
        fullWidth
        size="medium"
        placeholder="Filtrar por nome, crachá, CPF ou número de inscrição"
        value={filtro}
        onChange={(event) => setFiltro(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        helperText={
          filtro
            ? `${lista.length} de ${todos.length} inscritos`
            : `${todos.length} inscritos no evento — o participante é encaminhado ao posto de foto após a entrega`
        }
      />

      <Card>
        <DataGrid
          rows={lista}
          columns={colunas}
          getRowId={(row) => row.userId}
          loading={isLoading}
          autoHeight
          rowHeight={56}
          columnHeaderHeight={40}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            p: 1,
            '& .MuiDataGrid-row': {
              borderTop: '1px solid ' + theme.palette.divider,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'transparent',
              border: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              height: '40px !important',
              minHeight: '40px !important',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
              {
                outline: 'none',
              },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>
    </Stack>
  );
}

export { ReceptionStation };
