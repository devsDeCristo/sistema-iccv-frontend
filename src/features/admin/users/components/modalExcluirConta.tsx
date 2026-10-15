import {
  Alert,
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
import { PersonRemoveOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { User } from '../../../../types/user';
import { useExcluirConta } from '../api/acoesDaConta';

/** O que a pessoa digita para liberar o botão */
const PALAVRA_DE_CONFIRMACAO = 'EXCLUIR';

type ModalExcluirContaProps = {
  /** a conta escolhida; `null` fecha o diálogo */
  user: User | null;
  onFechar: () => void;
};

/**
 * Exclusão de conta, só do dev.
 *
 * Mesmo desenho da exclusão de evento: o que acontece está escrito e a palavra
 * digitada separa o clique da intenção — o item fica no mesmo menu de "ver" e
 * "editar". Conta com histórico (inscrição, pagamento, check-in…) o servidor
 * recusa, e a recusa aparece aqui mesmo, com o que a conta tem; para tirar a
 * pessoa do sistema sem apagar o histórico, o caminho é bloquear.
 */
function ModalExcluirConta({ user, onFechar }: ModalExcluirContaProps) {
  const theme = useTheme();
  const [confirmacao, setConfirmacao] = useState('');
  const [recusa, setRecusa] = useState<string | null>(null);
  const { mutate: excluir, isLoading } = useExcluirConta();

  useEffect(() => {
    if (user) {
      setConfirmacao('');
      setRecusa(null);
    }
  }, [user]);

  const liberado =
    confirmacao.trim().toUpperCase() === PALAVRA_DE_CONFIRMACAO && !isLoading;

  const confirmar = () => {
    if (!user) return;
    excluir(user.id, {
      onSuccess: () => {
        toast.success('Conta excluída');
        onFechar();
      },
      onError: (erro: any) => {
        setRecusa(
          erro?.response?.data?.message ||
            'Não foi possível excluir a conta. Tente de novo.'
        );
      },
    });
  };

  return (
    <Dialog
      open={!!user}
      onClose={isLoading ? undefined : onFechar}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-excluir-conta"
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
            <PersonRemoveOutlined />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography id="titulo-excluir-conta" variant="h6" fontSize={18}>
              Excluir conta
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

        <Typography variant="body2">
          O cadastro sai do sistema de vez, junto com as permissões, as contas
          Google vinculadas e os aceites de termo. Não há como desfazer.
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Conta com inscrição, pagamento, check-in, quarto, equipe ou notícia
          não é excluída — o servidor recusa. Para tirar a pessoa do sistema sem
          apagar esse histórico, bloqueie a conta.
        </Typography>

        {recusa && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            {recusa}
          </Alert>
        )}

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
          onClick={confirmar}
        >
          {isLoading ? 'Excluindo…' : 'Excluir conta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { ModalExcluirConta };
