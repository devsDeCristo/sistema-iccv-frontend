import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckCircleOutline,
  ReceiptLongOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { ReactNode } from 'react';

interface ExitProductOfferDialogProps {
  open: boolean;
  /** ficar na oferta — também é o que acontece com Esc e clique fora */
  onStay: () => void;
  onLeave: () => void;
}

function Linha({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" gap={1.25} alignItems="flex-start">
      <Box sx={{ display: 'flex', pt: '1px', flexShrink: 0 }}>{icone}</Box>
      <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
        {children}
      </Typography>
    </Stack>
  );
}

/**
 * Aviso ao sair da oferta de produtos antes de seguir para o pagamento.
 *
 * Quem chega aqui tende a achar que perde a inscrição ao sair — e não perde.
 * Então o diálogo começa pelo que está garantido e só depois diz o que muda.
 * O botão em destaque é ficar: é a escolha segura, e é a que o Enter aciona.
 */
function ExitProductOfferDialog({
  open,
  onStay,
  onLeave,
}: ExitProductOfferDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onStay}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-sair-da-oferta"
      aria-describedby="descricao-sair-da-oferta"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2.5 }}>
        <Stack alignItems="center" textAlign="center" gap={1}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: 'warning.main',
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              mb: 0.5,
            }}
          >
            <ShoppingBagOutlined />
          </Box>

          <Typography
            id="titulo-sair-da-oferta"
            variant="h6"
            fontWeight={600}
            lineHeight={1.3}
          >
            Sair sem os produtos?
          </Typography>
          <Typography
            id="descricao-sair-da-oferta"
            variant="body2"
            color="text.secondary"
          >
            Os itens escolhidos aqui não vão para o pagamento da sua inscrição.
          </Typography>
        </Stack>

        <Stack
          gap={1.25}
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
          }}
        >
          <Linha
            icone={<CheckCircleOutline fontSize="small" color="success" />}
          >
            Sua inscrição continua confirmada.
          </Linha>
          <Linha
            icone={<ShoppingBagOutlined fontSize="small" color="action" />}
          >
            Você pode comprar os produtos depois, pela página do evento, em uma
            compra separada.
          </Linha>
          <Linha
            icone={<ReceiptLongOutlined fontSize="small" color="action" />}
          >
            O pagamento da inscrição fica em Minhas Inscrições.
          </Linha>
        </Stack>

        <Stack gap={1} sx={{ mt: 3 }}>
          <Button variant="contained" size="large" onClick={onStay} autoFocus>
            Continuar escolhendo
          </Button>
          <Button
            color="inherit"
            onClick={onLeave}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Sair mesmo assim
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export { ExitProductOfferDialog };
