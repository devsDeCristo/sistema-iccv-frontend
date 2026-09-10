import {
  alpha,
  Box,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { EventGroup } from '../types';
import { percentual } from '../utils';

/**
 * Ocupação de um grupo de inscrição.
 *
 * É a leitura que o admin realmente faz. "145 de 148 vagas" no evento inteiro
 * esconde que a equipe já fechou em 78/78 enquanto os cursilhistas ainda têm
 * três lugares — e é essa diferença que decide se ainda dá para chamar alguém
 * da lista de espera.
 */
export function GrupoOcupacao({ grupo }: { grupo: EventGroup }) {
  const theme = useTheme();

  const capacidade = grupo.capacity;
  const semTeto = capacidade === null;
  const lotado = capacidade !== null && grupo.taken >= capacidade;
  const ocupacao = percentual(grupo.taken, capacidade);

  const cor = lotado ? theme.palette.chips.alert : theme.palette.chips.success;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        gap={1}
      >
        <Typography
          noWrap
          sx={{ fontSize: 13, color: 'text.secondary', minWidth: 0 }}
        >
          {grupo.name}
        </Typography>

        <Typography
          sx={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: lotado ? cor : 'text.primary',
          }}
        >
          {semTeto ? `${grupo.taken}` : `${grupo.taken}/${grupo.capacity}`}
          {lotado && (
            <Box
              component="span"
              sx={{ ml: 0.75, fontSize: 11, fontWeight: 700 }}
            >
              LOTADO
            </Box>
          )}
        </Typography>
      </Stack>

      {/* grupo sem teto não ganha barra: uma barra sem fim conhecido só
          inventaria uma proporção que ninguém definiu */}
      {!semTeto && (
        <LinearProgress
          variant="determinate"
          value={ocupacao}
          sx={{
            mt: 0.5,
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(cor, 0.16),
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: cor },
          }}
        />
      )}
    </Box>
  );
}
