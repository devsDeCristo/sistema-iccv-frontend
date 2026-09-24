import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import { useUser } from '../../contexts/userContext';
import { GET_TERMS_STATUS } from './api';


interface StatusDosTermos {
  versao: string;
  aceito: boolean;
  consentimentoDadosSensiveis: boolean;
  precisaDecidirDadosSensiveis: boolean;
}

/**
 * O aceite dos Termos de Uso, cobrado depois do login.
 *
 * Pega quem ainda não aceitou a versão vigente: quem tem conta de antes dos
 * termos, quem foi cadastrado pela organização e todos, de novo, quando o texto
 * muda de versão. Não fecha sem aceitar — a saída é sair da conta.
 *
 * Para cadastro antigo com saúde ou religião guardados sem consentimento, pede
 * também a decisão sobre esses dados. Nada é apagado sem a pessoa escolher.
 */
function TermsGate() {
  const { logout } = useUser();
  const [aceitou, setAceitou] = useState(false);
  const [decisao, setDecisao] = useState<'autorizo' | 'apagar' | ''>('');

  const { data: status } = useQuery(
    [GET_TERMS_STATUS],
    () =>
      apiClient
        .get<StatusDosTermos>('/terms/status')
        .then((resposta) => resposta.data),
    // o texto não muda no meio da sessão
    { staleTime: Infinity, retry: false }
  );

  const { mutate: aceitar, isLoading } = useMutation({
    mutationFn: () =>
      apiClient
        .post<StatusDosTermos>('/terms/accept', {
          accepted: true,
          ...(status?.precisaDecidirDadosSensiveis
            ? { sensitiveDataConsent: decisao === 'autorizo' }
            : {}),
        })
        .then((resposta) => resposta.data),
    onSuccess: (novo: StatusDosTermos) => {
      queryClient.setQueryData([GET_TERMS_STATUS], novo);
    },
    onError: () => {
      toast.error('Não foi possível registrar o aceite. Tente novamente.');
    },
  });

  if (!status) return null;

  const precisaAceitar = !status.aceito;
  const precisaDecidir = status.precisaDecidirDadosSensiveis;
  if (!precisaAceitar && !precisaDecidir) return null;

  const podeContinuar =
    (!precisaAceitar || aceitou) && (!precisaDecidir || decisao !== '');

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {precisaAceitar ? 'Termos de Uso' : 'Seus dados de saúde e religião'}
      </DialogTitle>

      <DialogContent>
        <Stack gap={2.5}>
          {precisaAceitar && (
            <Box>
              <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                Para continuar usando o ICCV Eventos, leia e aceite os Termos de
                Uso. Eles explicam como a plataforma funciona para você e como
                seus dados são tratados.
              </Typography>
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Checkbox
                    checked={aceitou}
                    onChange={(evento) => setAceitou(evento.target.checked)}
                    sx={{ mt: -0.75 }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    Li e aceito os{' '}
                    <Link
                      component={RouterLink}
                      to="/termos"
                      target="_blank"
                      rel="noopener"
                      sx={{ fontWeight: 600 }}
                    >
                      Termos de Uso
                    </Link>
                    .
                  </Typography>
                }
              />
            </Box>
          )}

          {precisaDecidir && (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
                Dados de saúde e religião
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Seu cadastro tem informações de saúde ou de religião. Por lei,
                elas só podem continuar guardadas com a sua autorização. Elas
                servem para organizar os eventos e cuidar da sua saúde durante
                eles.
              </Typography>
              <RadioGroup
                value={decisao}
                onChange={(evento) =>
                  setDecisao(evento.target.value as 'autorizo' | 'apagar')
                }
              >
                <FormControlLabel
                  value="autorizo"
                  control={<Radio />}
                  label={
                    <Typography variant="body2">
                      Autorizo o uso desses dados
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="apagar"
                  control={<Radio />}
                  label={
                    <Typography variant="body2">
                      Não autorizo — apague esses dados do meu cadastro
                    </Typography>
                  }
                />
              </RadioGroup>
              {decisao === 'apagar' && (
                <Alert severity="warning" sx={{ mt: 1, borderRadius: 1.5 }}>
                  Os dados de saúde e de religião serão apagados. Você pode
                  informá-los de novo depois, no seu cadastro.
                </Alert>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={logout} disabled={isLoading}>
          Sair
        </Button>
        <Button
          variant="contained"
          disabled={!podeContinuar || isLoading}
          onClick={() => aceitar()}
        >
          {isLoading ? 'Salvando…' : 'Continuar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { TermsGate };
