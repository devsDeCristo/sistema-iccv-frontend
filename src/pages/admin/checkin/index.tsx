import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  CloudDone,
  CloudOff,
  HowToReg,
  PhotoCamera,
} from '@mui/icons-material';
import { CheckinStats } from '../../../features/admin/checkin/components/checkinStats';
import { ReceptionStation } from '../../../features/admin/checkin/components/receptionStation';
import { PhotoStation } from '../../../features/admin/checkin/components/photoStation';
import { InputSelect } from '../../../components/inputSelect';
import { useSearchCheckin } from '../../../features/admin/checkin/api/getCheckin';
import { useCheckinSocket } from '../../../features/admin/checkin/hooks/useCheckinSocket';
import { CHECKIN_REFETCH_MS } from '../../../features/admin/checkin/constants';
import {
  TODOS_OS_GRUPOS,
  contarCheckin,
  filtrarPorGrupo,
  gruposDosInscritos,
} from '../../../features/admin/checkin/utils';

type Posto = 'recepcao' | 'foto';

function Checkin() {
  const { id: eventId = '' } = useParams();
  const navigate = useNavigate();
  const [posto, setPosto] = useState<Posto>('recepcao');
  const [grupo, setGrupo] = useState(TODOS_OS_GRUPOS);

  const { connected } = useCheckinSocket(eventId);

  // a mesma consulta da recepção: o react-query serve as duas telas do mesmo
  // cache, sem uma segunda ida ao servidor
  const { data: inscritos } = useSearchCheckin(eventId, '', {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  const grupos = useMemo(() => gruposDosInscritos(inscritos || []), [inscritos]);

  // os contadores acompanham o recorte escolhido — se o check-in de hoje é só
  // de um grupo, o "faltam X" precisa ser o daquele grupo
  const stats = useMemo(
    () => contarCheckin(filtrarPorGrupo(inscritos || [], grupo)),
    [inscritos, grupo]
  );

  // o grupo escolhido pode deixar de existir; sem isto a tela ficaria vazia
  // sem explicação nenhuma
  useEffect(() => {
    if (
      grupo !== TODOS_OS_GRUPOS &&
      grupos.length > 0 &&
      !grupos.includes(grupo)
    ) {
      setGrupo(TODOS_OS_GRUPOS);
    }
  }, [grupos, grupo]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => navigate(`/admin/eventos/${eventId}/detalhes/geral`)}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Check-in do evento
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ minWidth: 220 }}>
            <InputSelect
              label="Grupo"
              size="small"
              value={grupo}
              onChange={(event) => setGrupo(String(event.target.value))}
              menuOptions={[
                { value: TODOS_OS_GRUPOS, name: 'Todos os grupos' },
                ...grupos.map((nome) => ({ value: nome, name: nome })),
              ]}
            />
          </Box>

          {/* o operador precisa saber se a tela ainda está viva */}
          <Tooltip
            title={
              connected
                ? 'Conectado: a fila atualiza em tempo real'
                : 'Sem conexão em tempo real — a fila atualiza a cada 15 segundos'
            }
          >
            <Chip
              size="small"
              icon={connected ? <CloudDone /> : <CloudOff />}
              label={connected ? 'Ao vivo' : 'Reconectando'}
              color={connected ? 'success' : 'default'}
              variant={connected ? 'filled' : 'outlined'}
            />
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <CheckinStats stats={stats} />
      </Box>

      <Tabs
        value={posto}
        onChange={(_, value: Posto) => setPosto(value)}
        sx={{ mb: 2 }}
      >
        <Tab
          value="recepcao"
          label="Recepção e crachá"
          icon={<HowToReg />}
          iconPosition="start"
        />
        <Tab
          value="foto"
          label="Foto e conferência"
          icon={<PhotoCamera />}
          iconPosition="start"
        />
      </Tabs>

      {posto === 'recepcao' ? (
        <ReceptionStation eventId={eventId} grupo={grupo} />
      ) : (
        <PhotoStation eventId={eventId} />
      )}
    </Box>
  );
}

export { Checkin };
