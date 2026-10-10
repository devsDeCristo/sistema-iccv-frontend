import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EVENT_STATUS_LABELS } from '../constants';
import { EventStatus } from '../types';
import {
  ResultadoDoStatusEmMassa,
  usePutStatusEmMassa,
} from '../api/putStatusEmMassa';

/** O que cada status muda para quem se inscreve */
const AJUDA: Record<EventStatus, string> = {
  ACTIVE: 'Aberto ao público: aparece na área do usuário para qualquer pessoa.',
  TEST: 'Ensaio antes de abrir: só admin e super admin enxergam.',
  INACTIVE: 'Desligado: não aparece para ninguém na área do usuário.',
};

const ORDEM: EventStatus[] = ['ACTIVE', 'TEST', 'INACTIVE'];

/**
 * O mesmo status para os eventos marcados na lista.
 *
 * O servidor confere cada evento: só muda os da igreja que a pessoa
 * administra. Os outros voltam listados aqui, sem desfazer o que deu certo.
 */
function ModalStatusEmMassa({
  open,
  eventIds,
  onClose,
  onConcluir,
}: {
  open: boolean;
  eventIds: string[];
  onClose: () => void;
  /** depois de aplicar: os ids que o servidor recusou ficam marcados */
  onConcluir: (recusados: string[]) => void;
}) {
  const theme = useTheme();
  const { mutate: aplicar, isLoading } = usePutStatusEmMassa();
  const [status, setStatus] = useState<EventStatus>('ACTIVE');
  const [resultado, setResultado] = useState<ResultadoDoStatusEmMassa | null>(
    null
  );

  useEffect(() => {
    if (!open) return;
    setStatus('ACTIVE');
    setResultado(null);
  }, [open]);

  const quantos = eventIds.length;

  const cor = (valor: EventStatus) =>
    valor === 'ACTIVE'
      ? theme.palette.chips.success
      : valor === 'TEST'
        ? theme.palette.chips.alert
        : theme.palette.chips.canceled;

  const enviar = () =>
    aplicar(
      { eventIds, status },
      {
        onSuccess: (resposta) => {
          if (!resposta.falhas.length) {
            toast.success(
              resposta.atualizados === 1
                ? 'Status do evento atualizado.'
                : `${resposta.atualizados} eventos atualizados.`
            );
            onConcluir([]);
            return;
          }
          // com recusa, a janela fica aberta mostrando quais e por quê
          setResultado(resposta);
        },
        onError: (erro: any) => {
          toast.error(
            [erro?.response?.data?.message].flat()[0] ??
              'Não foi possível mudar o status.'
          );
        },
      }
    );

  const fecharResultado = () =>
    onConcluir(resultado?.falhas.map((falha) => falha.eventId) ?? []);

  return (
    <Dialog
      open={open}
      onClose={() => !isLoading && (resultado ? fecharResultado() : onClose())}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Mudar status</DialogTitle>

      {resultado ? (
        <>
          <DialogContent>
            {resultado.atualizados > 0 && (
              <Alert severity="success" sx={{ mb: 1.5 }}>
                {resultado.atualizados === 1
                  ? '1 evento atualizado.'
                  : `${resultado.atualizados} eventos atualizados.`}
              </Alert>
            )}
            <Alert severity="warning">
              <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: 14 }}>
                {resultado.falhas.length === 1
                  ? '1 evento ficou de fora'
                  : `${resultado.falhas.length} eventos ficaram de fora`}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {resultado.falhas.map((falha) => (
                  <Typography
                    key={falha.eventId}
                    component="li"
                    sx={{ fontSize: 13 }}
                  >
                    <strong>{falha.nome ?? 'Evento'}</strong>: {falha.motivo}
                  </Typography>
                ))}
              </Box>
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Os que ficaram de fora continuam marcados na lista.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="contained" onClick={fecharResultado}>
              Fechar
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {quantos === 1
                ? '1 evento selecionado.'
                : `${quantos} eventos selecionados.`}{' '}
              Escolha o novo status.
            </Typography>

            <Stack gap={1} role="radiogroup" aria-label="Status">
              {ORDEM.map((valor) => {
                const marcado = status === valor;
                const tinta = cor(valor);
                return (
                  <Box
                    key={valor}
                    role="radio"
                    aria-checked={marcado}
                    tabIndex={0}
                    onClick={() => setStatus(valor)}
                    onKeyDown={(evento) => {
                      if (evento.key === ' ' || evento.key === 'Enter') {
                        evento.preventDefault();
                        setStatus(valor);
                      }
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${
                        marcado ? tinta : theme.palette.divider
                      }`,
                      backgroundColor: marcado
                        ? alpha(tinta, 0.08)
                        : 'transparent',
                      transition: theme.transitions.create([
                        'border-color',
                        'background-color',
                      ]),
                      '&:focus-visible': {
                        outline: `2px solid ${tinta}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: tinta,
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: marcado ? tinta : 'text.primary',
                        }}
                      >
                        {EVENT_STATUS_LABELS[valor]}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                    >
                      {AJUDA[valor]}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={enviar}
              disabled={isLoading}
              // o tema capitaliza botão: "Aplicar A 2"
              sx={{ minWidth: 150, textTransform: 'none' }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Aplicar a ${quantos}`
              )}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export { ModalStatusEmMassa };
