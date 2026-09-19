import {
  alpha,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { GavelOutlined } from '@mui/icons-material';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuillViewer from '../../../components/reactQuill';

interface EventTermsDialogProps {
  open: boolean;
  /** o termo do evento, em HTML */
  term: string;
  eventName?: string;
  /** a inscrição já está sendo enviada */
  loading?: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * O termo do evento, antes de a inscrição sair.
 *
 * É a última parada do fluxo: quem chegou aqui já escolheu grupo e regra, e o
 * que falta é ler e concordar. Por isso o texto ocupa o diálogo inteiro e o
 * aceite fica preso no rodapé, onde não precisa ser caçado.
 *
 * O aceite só liga depois que a rolagem chega ao fim do termo — marcar sem ter
 * passado pelo texto inteiro não deveria ser possível. Termo curto, que cabe na
 * tela sem rolagem, já nasce liberado: não há fim a alcançar.
 *
 * Fechar cancela e devolve para o formulário: a inscrição ainda não foi
 * enviada, nada se perde.
 */
function EventTermsDialog({
  open,
  term,
  eventName,
  loading = false,
  onAccept,
  onCancel,
}: EventTermsDialogProps) {
  const theme = useTheme();
  const [aceito, setAceito] = useState(false);
  const [leuAteOFim, setLeuAteOFim] = useState(false);
  const caixaDoTermo = useRef<HTMLDivElement>(null);
  /** os mesmos valores do estado, para a medição não depender de render */
  const liberado = useRef(false);
  const alturaLida = useRef(0);

  const conferirRolagem = useCallback(() => {
    const caixa = caixaDoTermo.current;
    if (!caixa) return;

    // a folga é para alturas fracionárias e zoom do navegador: sem ela a conta
    // não fecha exata no fim e o aceite nunca libera
    const chegouAoFim =
      caixa.scrollTop + caixa.clientHeight >= caixa.scrollHeight - 8;

    if (chegouAoFim) {
      liberado.current = true;
      alturaLida.current = caixa.scrollHeight;
      setLeuAteOFim(true);
      return;
    }

    // rolar de volta para reler não tranca de novo — o que tranca é texto novo
    // aparecendo embaixo depois da leitura, como uma imagem que só terminou de
    // carregar agora e empurrou o fim para baixo
    if (liberado.current && caixa.scrollHeight > alturaLida.current + 8) {
      liberado.current = false;
      setLeuAteOFim(false);
      setAceito(false);
    }
  }, []);

  useEffect(() => {
    // reabrir depois de cancelar não pode trazer o aceite anterior marcado
    if (!open) {
      setAceito(false);
      setLeuAteOFim(false);
      liberado.current = false;
      alturaLida.current = 0;
      return;
    }

    const caixa = caixaDoTermo.current;
    if (!caixa) return;

    // a altura do termo ainda vai mudar — imagem que termina de carregar,
    // fonte que troca, janela que gira. O observador refaz a conta a cada
    // mudança, e é ele quem libera o termo curto, que nunca recebe rolagem
    const observador = new ResizeObserver(conferirRolagem);
    observador.observe(caixa);
    Array.from(caixa.children).forEach((filho) => observador.observe(filho));

    conferirRolagem();

    return () => observador.disconnect();
  }, [open, conferirRolagem]);

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onCancel()}
      fullWidth
      maxWidth="sm"
      aria-labelledby="titulo-termo-do-evento"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle id="titulo-termo-do-evento" sx={{ pb: 1.5 }}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <GavelOutlined fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
              Termos da inscrição
            </Typography>
            {eventName && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {eventName}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        ref={caixaDoTermo}
        onScroll={conferirRolagem}
        sx={{ maxHeight: '55vh' }}
      >
        <ReactQuillViewer value={term} />
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1.5,
          px: { xs: 2.5, sm: 3 },
          py: 2,
        }}
      >
        <Box>
          <FormControlLabel
            sx={{ mr: 0 }}
            control={
              <Checkbox
                checked={aceito}
                disabled={loading || !leuAteOFim}
                onChange={(e) => setAceito(e.target.checked)}
              />
            }
            label={
              <Typography
                variant="body2"
                color={leuAteOFim ? 'text.primary' : 'text.disabled'}
              >
                Li e aceito todos os termos
              </Typography>
            }
          />

          {!leuAteOFim && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', pl: 1.5 }}
            >
              Role o termo até o fim para liberar o aceite.
            </Typography>
          )}
        </Box>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent="flex-end"
          gap={1}
        >
          <Button color="inherit" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onAccept}
            disabled={!aceito || loading}
            endIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            Prosseguir
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export { EventTermsDialog };
