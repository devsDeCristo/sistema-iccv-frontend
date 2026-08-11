import { useState } from 'react';
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
import { useGetCheckinStats } from '../../../features/admin/checkin/api/getCheckin';
import { useCheckinSocket } from '../../../features/admin/checkin/hooks/useCheckinSocket';
import { CHECKIN_REFETCH_MS } from '../../../features/admin/checkin/constants';

type Posto = 'recepcao' | 'foto';

function Checkin() {
  const { id: eventId = '' } = useParams();
  const navigate = useNavigate();
  const [posto, setPosto] = useState<Posto>('recepcao');

  const { connected } = useCheckinSocket(eventId);
  const { data: stats } = useGetCheckinStats(eventId, {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
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
        <ReceptionStation eventId={eventId} />
      ) : (
        <PhotoStation eventId={eventId} />
      )}
    </Box>
  );
}

export { Checkin };
