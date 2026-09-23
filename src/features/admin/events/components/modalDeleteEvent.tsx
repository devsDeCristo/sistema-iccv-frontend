import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useDeleteEvent } from '../api/deleteEvent';

/** O que a pessoa digita para liberar o botão */
const PALAVRA_DE_CONFIRMACAO = 'APAGAR';

type EventoParaApagar = { id: string; name: string };

type ModalDeleteEventProps = {
  /** evento escolhido; `null` fecha o diálogo */
  evento: EventoParaApagar | null;
  onFechar: () => void;
};

/**
 * Confirmação de exclusão de evento.
 *
 * Apagar evento não é desfazível e não é rotina — é o perfil de desenvolvimento
 * resolvendo um evento criado errado. Por isso a lista do que vai junto está
 * escrita, e não resumida em "tem certeza?": o risco aqui é a pessoa achar que
 * apaga só a linha da tabela.
 *
 * A palavra digitada existe para separar o clique da intenção. Num menu onde as
 * outras ações são ver e editar, "apagar" fica a um pixel de distância delas.
 */
function ModalDeleteEvent({ evento, onFechar }: ModalDeleteEventProps) {
  const theme = useTheme();
  const [confirmacao, setConfirmacao] = useState('');

  const { mutate: apagar, isLoading } = useDeleteEvent({
    onSuccess: () => onFechar(),
  });

  useEffect(() => {
    if (evento) setConfirmacao('');
  }, [evento]);

  const liberado =
    confirmacao.trim().toUpperCase() === PALAVRA_DE_CONFIRMACAO && !isLoading;

  return (
    <Dialog
      open={!!evento}
      onClose={isLoading ? undefined : onFechar}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-apagar-evento"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.12),
            }}
          >
            <WarningAmberOutlined />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography id="titulo-apagar-evento" variant="h6" fontSize={18}>
              Apagar evento
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {evento?.name}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2">
          Vão junto os grupos e regras de inscrição, quartos, equipes, lista de
          espera, produtos e o histórico de cobrança do evento. Não há como
          desfazer.
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Evento com inscritos não é apagado — o servidor recusa.
        </Typography>

        <TextField
          size="small"
          fullWidth
          autoFocus
          value={confirmacao}
          onChange={(evt) => setConfirmacao(evt.target.value)}
          label={`Digite ${PALAVRA_DE_CONFIRMACAO} para confirmar`}
          disabled={isLoading}
        />
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, gap: 1 }}>
        <Button color="inherit" onClick={onFechar} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!liberado}
          onClick={() =>
            evento && apagar({ eventId: evento.id, eventName: evento.name })
          }
        >
          {isLoading ? 'Apagando…' : 'Apagar evento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { ModalDeleteEvent };
export type { EventoParaApagar };
