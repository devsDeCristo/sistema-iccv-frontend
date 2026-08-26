import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import { HowToReg, Search, Undo } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSearchCheckin } from '../api/getCheckin';
import { useDeliverBadge, useUndoBadgeDelivery } from '../api/postCheckin';
import { UserAvatar } from '../../../../components/userAvatar';
import { InputSelect } from '../../../../components/inputSelect';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { BadgeDeliveredModal } from './badgeDeliveredModal';
import CustomChip from '../../../../components/customChip';
import {
  campoBuscaSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { formatCPF } from '../../../../utils';
import {
  CHECKIN_REFETCH_MS,
  corDoStatusCheckin,
  CHECKIN_STATUS_LABEL,
  CHECKIN_STATUS_ORDER,
} from '../constants';
import {
  TODAS_AS_SITUACOES,
  TODOS_OS_GRUPOS,
  filtrarPorGrupo,
  filtrarPorSituacao,
} from '../utils';
import { CheckinParticipant } from '../types';
import { cardTabelaSx, dataGridSx } from '../../../../components/listPageStyles';

interface ReceptionStationProps {
  eventId: string;
  /** Recorte escolhido pelo operador; vazio mostra o evento inteiro */
  grupo: string;
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
function ReceptionStation({ eventId, grupo }: ReceptionStationProps) {
  const [filtro, setFiltro] = useState('');
  const [situacao, setSituacao] = useState(TODAS_AS_SITUACOES);
  /** Participante aguardando confirmação para ter o check-in revertido */
  const [revertendo, setRevertendo] = useState<CheckinParticipant | null>(null);
  /** Última entrega, para o modal mostrar o quarto alocado */
  const [entregue, setEntregue] = useState<CheckinParticipant | null>(null);
  const campoFiltro = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const coresDeStatus = corDoStatusCheckin(theme);

  // a lista vem inteira de uma vez e o filtro roda no cliente — sem ida ao
  // servidor a cada tecla, o resultado aparece instantâneo no balcão
  const { data: inscritos, isLoading } = useSearchCheckin(eventId, '', {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  const todos = useMemo(
    () => filtrarPorGrupo(inscritos || [], grupo),
    [inscritos, grupo]
  );

  const porSituacao = useMemo(
    () => filtrarPorSituacao(todos, situacao),
    [todos, situacao]
  );

  const lista = useMemo(() => {
    const termo = normalizar(filtro.trim());
    if (!termo) return porSituacao;

    const digitos = filtro.replace(/\D/g, '');

    return porSituacao.filter((participante) => {
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
  }, [porSituacao, filtro]);

  // com qualquer recorte ligado o rodapé mostra o quanto sobrou, para ninguém
  // achar que o evento tem menos gente do que tem
  const recortando = !!filtro.trim() || situacao !== TODAS_AS_SITUACOES;

  const { mutate: entregarCracha, isLoading: entregando } = useDeliverBadge({
    /**
     * O resultado vai para um modal, não para um toast: o quarto é alocado
     * junto com a entrega e o operador precisa ler o nome dele para a pessoa
     * que está no balcão. Toast some sozinho e passa batido.
     */
    onSuccess: (participante) => setEntregue(participante),
  });

  /** O balcão volta a digitar assim que a confirmação é fechada. */
  const fecharConfirmacao = () => {
    setEntregue(null);
    setFiltro('');
    campoFiltro.current?.focus();
  };

  const { mutate: reverterEntrega, isLoading: revertendoEntrega } =
    useUndoBadgeDelivery({
      onSuccess: (participante) => {
        toast.success(
          `${participante.fullName} voltou para "não chegou". O crachá pode ser entregue de novo.`
        );
        setRevertendo(null);
        campoFiltro.current?.focus();
      },
      onError: () => setRevertendo(null),
    });

  /**
   * Entregou por engano? A mesma linha que entregou o crachá reverte. Quem já
   * passou da fila da foto pede confirmação antes: reverter ali descarta o
   * atendimento que o outro posto já fez.
   */
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

    const naFila = participante.status === 'QUEUED';

    return (
      <Tooltip
        title={
          naFila
            ? 'Reverte a entrega do crachá e volta o participante para "não chegou"'
            : 'Reverte a entrega do crachá; o atendimento já feito no posto de foto é descartado'
        }
      >
        <Button
          size="small"
          color="warning"
          variant="outlined"
          startIcon={<Undo />}
          disabled={revertendoEntrega}
          onClick={() =>
            naFila
              ? reverterEntrega({ eventId, userId: participante.userId })
              : setRevertendo(participante)
          }
        >
          Reverter
        </Button>
      </Tooltip>
    );
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
        <CustomChip
          size="small"
          label={
            CHECKIN_STATUS_LABEL[
              params.row.status as CheckinParticipant['status']
            ]
          }
          customColor={
            coresDeStatus[params.row.status as CheckinParticipant['status']]
          }
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
      {/* os campos ficam sobre uma superfície, como nas demais telas de lista */}
      <Paper sx={{ ...superficieSx, p: 2 }}>
        {/**
         * `flex-start` e não `center`: o campo de filtro tem texto de apoio
         * embaixo, então ele é mais alto que o select. Centralizando, a altura
         * desse texto entra na conta e as duas caixas de input saem de linha —
         * alinhando pelo topo, elas coincidem.
         */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        >
          <TextField
            inputRef={campoFiltro}
            autoFocus
            fullWidth
            size="small"
            placeholder="Filtrar por nome, crachá, CPF ou número de inscrição"
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            helperText={
              recortando
                ? `${lista.length} de ${todos.length} inscritos`
                : `${todos.length} inscritos ${
                    grupo === TODOS_OS_GRUPOS ? 'no evento' : `em ${grupo}`
                  } — o participante é encaminhado ao posto de foto após a entrega`
            }
            sx={{ flex: 1, ...campoBuscaSx(theme) }}
          />

          <Box sx={{ width: { xs: '100%', sm: 260 } }}>
            <InputSelect
              label="Situação"
              size="small"
              sx={campoBuscaSx(theme)}
              value={situacao}
              onChange={(event) => setSituacao(String(event.target.value))}
              menuOptions={[
                { value: TODAS_AS_SITUACOES, name: 'Todas as situações' },
                ...CHECKIN_STATUS_ORDER.map((status) => ({
                  value: status,
                  name: CHECKIN_STATUS_LABEL[status],
                })),
              ]}
            />
          </Box>
        </Stack>
      </Paper>

      <Card sx={cardTabelaSx}>
        <DataGrid
          rows={lista}
          columns={colunas}
          getRowId={(row) => row.userId}
          loading={isLoading}
          autoHeight
          rowHeight={56}
          columnHeaderHeight={44}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={dataGridSx(theme)}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>

      <BadgeDeliveredModal
        participante={entregue}
        onClose={fecharConfirmacao}
      />

      <ConfirmModal
        open={!!revertendo}
        title="Reverter a entrega do crachá?"
        message={
          revertendo
            ? `${revertendo.fullName} já passou da fila da foto. Reverter apaga o atendimento registrado no posto de foto e devolve o participante para "não chegou".`
            : ''
        }
        confirmLabel="Reverter"
        cancelLabel="Manter"
        onClose={() => setRevertendo(null)}
        onConfirm={() =>
          revertendo &&
          reverterEntrega({ eventId, userId: revertendo.userId })
        }
      />
    </Stack>
  );
}

export { ReceptionStation };
