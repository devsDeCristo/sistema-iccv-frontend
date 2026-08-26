import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, MeetingRoom } from '@mui/icons-material';
import { CheckinParticipant } from '../types';

interface BadgeDeliveredModalProps {
  /** Participante da última entrega; null mantém o modal fechado */
  participante: CheckinParticipant | null;
  onClose: () => void;
}

/**
 * Confirmação da entrega do crachá.
 *
 * O quarto é alocado no mesmo instante da entrega, e é uma informação que o
 * recepcionista precisa ler em voz alta para a pessoa que está no balcão.
 * Num toast isso passa batido: o modal segura a tela até alguém confirmar.
 */
function BadgeDeliveredModal({
  participante,
  onClose,
}: BadgeDeliveredModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={!!participante}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-cracha-entregue"
    >
      <DialogTitle id="titulo-cracha-entregue" sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <CheckCircle color="success" />
          Crachá entregue
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack gap={2}>
          <Box>
            <Typography variant="h6" lineHeight={1.2}>
              {participante?.fullName}
            </Typography>
            {!!participante?.groups?.length && (
              <Typography variant="body2" color="text.secondary">
                {participante.groups.join(', ')}
              </Typography>
            )}
          </Box>

          {participante?.bedroom ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={0.5}
                mb={0.5}
              >
                <MeetingRoom fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Quarto
                </Typography>
              </Stack>
              {/* o nome do quarto é o que o operador fala em voz alta: fica
                  maior que o resto do modal de propósito */}
              <Typography variant="h5" fontWeight={600}>
                {participante.bedroom}
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning">
              Não havia vaga automática para este participante. Defina o quarto
              manualmente na aba Quartos.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Encaminhe ao posto de foto.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {/* autoFocus para o balcão fechar com Enter e voltar a digitar */}
        <Button onClick={onClose} variant="contained" autoFocus fullWidth>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { BadgeDeliveredModal };
