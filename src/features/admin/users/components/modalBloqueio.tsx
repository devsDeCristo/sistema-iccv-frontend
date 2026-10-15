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
import { BlockOutlined, LockOpenOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { User } from '../../../../types/user';
import { formatDateTime } from '../../../../utils';
import { useBloquearConta, useDesbloquearConta } from '../api/acoesDaConta';

const MOTIVO_MAXIMO = 500;

type ModalBloqueioProps = {
  /** a pessoa escolhida; `null` fecha o diálogo */
  user: User | null;
  onFechar: () => void;
};

const mensagemDoErro = (erro: any) =>
  erro?.response?.data?.message || 'Não foi possível concluir. Tente de novo.';

/**
 * Bloquear ou desbloquear a conta, conforme a situação dela.
 *
 * Bloquear pede o motivo: ele fica só para o painel (a pessoa lê apenas
 * "Sua conta está bloqueada. Fale com a organização."), e é o que explica o
 * bloqueio a quem abrir a conta depois. Desbloquear mostra o motivo, quem e
 * quando bloqueou, para a decisão ser tomada sabendo o porquê.
 */
function ModalBloqueio({ user, onFechar }: ModalBloqueioProps) {
  const theme = useTheme();
  const [motivo, setMotivo] = useState('');
  const bloqueio = user?.block ?? null;
  const bloquear = useBloquearConta();
  const desbloquear = useDesbloquearConta();
  const ocupado = bloquear.isLoading || desbloquear.isLoading;

  useEffect(() => {
    if (user) setMotivo('');
  }, [user]);

  const cor = bloqueio ? theme.palette.success.main : theme.palette.error.main;
  const motivoValido = motivo.trim().length >= 3;

  const confirmar = () => {
    if (!user) return;
    if (bloqueio) {
      desbloquear.mutate(user.id, {
        onSuccess: () => {
          toast.success('Conta desbloqueada');
          onFechar();
        },
        onError: (erro) => {
          toast.error(mensagemDoErro(erro));
        },
      });
      return;
    }
    bloquear.mutate(
      { userId: user.id, reason: motivo.trim() },
      {
        onSuccess: () => {
          toast.success('Conta bloqueada');
          onFechar();
        },
        onError: (erro) => {
          toast.error(mensagemDoErro(erro));
        },
      }
    );
  };

  return (
    <Dialog
      open={!!user}
      onClose={ocupado ? undefined : onFechar}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-bloqueio"
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
              color: cor,
              bgcolor: alpha(cor, 0.12),
            }}
          >
            {bloqueio ? <LockOpenOutlined /> : <BlockOutlined />}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography id="titulo-bloqueio" variant="h6" fontSize={18}>
              {bloqueio ? 'Desbloquear conta' : 'Bloquear conta'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {user?.fullName}
            </Typography>
          </Box>
        </Stack>

        {bloqueio ? (
          <>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Motivo do bloqueio
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {bloqueio.reason}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="p"
                sx={{ mt: 1 }}
              >
                {bloqueio.blockedBy?.fullName
                  ? `Por ${bloqueio.blockedBy.fullName}, em `
                  : 'Em '}
                {formatDateTime(bloqueio.blockedAt)}
              </Typography>
            </Box>
            <Typography variant="body2">
              A pessoa volta a entrar no sistema com a senha ou a conta Google
              dela.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">
              A pessoa não consegue mais entrar no sistema, e quem estiver
              logado com esta conta é desconectado na hora. Inscrições e
              pagamentos que ela já tem continuam como estão.
            </Typography>
            <TextField
              label="Motivo"
              placeholder="Por que esta conta está sendo bloqueada"
              multiline
              minRows={3}
              fullWidth
              autoFocus
              value={motivo}
              disabled={ocupado}
              onChange={(evt) =>
                setMotivo(evt.target.value.slice(0, MOTIVO_MAXIMO))
              }
              helperText={`Só o painel vê. A pessoa recebe apenas "Sua conta está bloqueada. Fale com a organização." · ${motivo.length}/${MOTIVO_MAXIMO}`}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, pt: 0 }}>
        <Button onClick={onFechar} disabled={ocupado}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={bloqueio ? 'success' : 'error'}
          disabled={ocupado || (!bloqueio && !motivoValido)}
          onClick={confirmar}
        >
          {bloqueio ? 'Desbloquear' : 'Bloquear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { ModalBloqueio };
