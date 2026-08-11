import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { CheckinStats as CheckinStatsType } from '../types';

interface CheckinStatsProps {
  stats?: CheckinStatsType;
}

function Contador({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 76 }}>
      <Typography variant="h5" fontWeight={600} color={color}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function CheckinStats({ stats }: CheckinStatsProps) {
  const total = stats?.total || 0;
  const done = stats?.done || 0;
  const percentual = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-around"
        flexWrap="wrap"
        useFlexGap
      >
        <Contador label="Inscritos" value={total} />
        <Contador label="Não chegaram" value={stats?.pending || 0} />
        <Contador
          label="Na fila"
          value={stats?.queued || 0}
          color="info.main"
        />
        <Contador
          label="Em atendimento"
          value={stats?.inProgress || 0}
          color="warning.main"
        />
        <Contador label="Concluídos" value={done} color="success.main" />
      </Stack>
      <Box sx={{ mt: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={percentual}
          color="success"
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
        >
          {percentual}% do evento com check-in concluído
        </Typography>
      </Box>
    </Paper>
  );
}

export { CheckinStats };
