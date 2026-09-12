import { Alert, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CheckCircle } from '@mui/icons-material';

import { ProviderLogo } from './providerLogo';
import { PAYMENT_METHOD_LABEL, PaymentProviderIntegration } from '../types';

interface Props {
  integracao: PaymentProviderIntegration | null;
}

/**
 * A resposta, em destaque, para a única pergunta que a tela precisa responder
 * de imediato: **para onde vai o dinheiro desta igreja agora**.
 *
 * Sem ela essa informação ficava escondida num selo dentro de um dos quatro
 * cartões, e descobri-la exigia varrer a grade. É a decisão mais cara da tela,
 * e a que mais custa errar — merece a primeira linha.
 */
function RecebendoAgora({ integracao }: Props) {
  const theme = useTheme();

  if (!integracao) {
    return (
      <Alert severity="warning">
        <strong>Nenhum banco está recebendo.</strong> Os inscritos desta igreja
        não conseguem pagar pelo sistema. Configure uma integração abaixo e
        marque como “Usar esta”.
      </Alert>
    );
  }

  const cor = theme.palette.chips.success;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(cor, 0.35)}`,
        backgroundColor: alpha(cor, 0.08),
      }}
    >
      <ProviderLogo provider={integracao.provider} size={48} />

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <CheckCircle sx={{ fontSize: 16, color: cor }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: cor }}>
            RECEBENDO AGORA
          </Typography>
        </Stack>

        <Typography fontSize={18} fontWeight={600} sx={{ mt: 0.25 }}>
          {integracao.label}
          {integracao.mode === 'SANDBOX' && (
            <Typography
              component="span"
              fontSize={13}
              fontWeight={600}
              sx={{ ml: 1, color: theme.palette.chips.alert }}
            >
              em sandbox — não movimenta dinheiro de verdade
            </Typography>
          )}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={0.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}
      >
        {integracao.paymentMethods.map((metodo) => (
          <Chip
            key={metodo}
            size="small"
            label={PAYMENT_METHOD_LABEL[metodo] ?? metodo}
            sx={{ backgroundColor: alpha(cor, 0.14), color: 'text.primary' }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export { RecebendoAgora };
