import { useState } from 'react';
import {
  Alert,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Check, ContentCopy } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { PaymentProviderIntegration } from '../types';

interface Props {
  integracao: PaymentProviderIntegration;
}

/**
 * Os endereços que precisam ser cadastrados no painel do provedor.
 *
 * Cada URL carrega um segredo próprio desta igreja nesta casa — é ele que
 * prova, do lado de cá, que a notificação veio mesmo de lá. Por isso a tela
 * avisa que ela não deve ser compartilhada, e por isso o botão é de copiar e
 * não um link clicável: o endereço é para ser colado no painel do provedor, e
 * abrir no navegador só o joga no histórico.
 */
function WebhookUrls({ integracao }: Props) {
  const theme = useTheme();
  const [copiada, setCopiada] = useState<string | null>(null);

  if (!integracao.webhooks.length) return null;

  const copiar = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiada(key);
      setTimeout(() => setCopiada(null), 2000);
    } catch {
      // navegador sem permissão de área de transferência (http, iframe): o
      // endereço continua visível na tela para copiar na mão
      toast.info('Copie o endereço manualmente.');
    }
  };

  const styles = {
    linha: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1,
      borderRadius: 1,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.default,
    },
    url: {
      flex: 1,
      minWidth: 0,
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.palette.text.secondary,
      wordBreak: 'break-all' as const,
    },
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Cadastre estes endereços no painel do provedor
      </Typography>

      {integracao.webhooks.map((webhook) => (
        <Box key={webhook.key} sx={styles.linha}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {webhook.label}
            </Typography>
            <Typography sx={styles.url}>{webhook.url}</Typography>
          </Box>

          <Tooltip title={copiada === webhook.key ? 'Copiado' : 'Copiar'}>
            <IconButton
              size="small"
              onClick={() => copiar(webhook.url, webhook.key)}
            >
              {copiada === webhook.key ? (
                <Check fontSize="small" color="success" />
              ) : (
                <ContentCopy fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ))}

      <Alert
        severity={integracao.signsWebhook ? 'info' : 'warning'}
        sx={{ py: 0.5 }}
      >
        {integracao.signsWebhook
          ? 'O endereço contém um segredo desta igreja. Não compartilhe nem publique.'
          : `A ${integracao.label} não assina as notificações: o segredo deste endereço é a única coisa que impede alguém de marcar uma inscrição como paga. Trate-o como senha.`}
      </Alert>
    </Stack>
  );
}

export { WebhookUrls };
