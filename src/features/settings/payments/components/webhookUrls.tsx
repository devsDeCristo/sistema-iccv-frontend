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
import { PROVIDER_WEBHOOK_SETUP } from '../constants';

interface Props {
  integracao: PaymentProviderIntegration;
}

/**
 * O endereço de notificação, para quem depende de cadastro na conta.
 *
 * Dois casos caem aqui: o Ton, cuja API resolve webhook por conta e não por
 * pedido, e o Mercado Pago, que aceita a URL na cobrança mas só notifica em
 * modo de teste o endereço cadastrado no painel. PagBank e InfinitePay não têm
 * o que cadastrar e não veem esta parte — ver `PROVIDER_WEBHOOK_SETUP`.
 *
 * A URL carrega um segredo próprio desta igreja nesta casa: é ele que prova,
 * do lado de cá, que a notificação veio mesmo de lá. Daí o aviso de não
 * compartilhar, e daí o botão ser de copiar e não um link clicável — abrir no
 * navegador só joga o segredo no histórico.
 */
function WebhookUrls({ integracao }: Props) {
  const theme = useTheme();
  const [copiada, setCopiada] = useState<string | null>(null);

  if (!integracao.webhooks.length) return null;

  const soPeloPainel = PROVIDER_WEBHOOK_SETUP[integracao.provider] === 'painel';

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
      <Typography variant="subtitle2" fontWeight={700}>
        Cadastre no painel da {integracao.label}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {soPeloPainel
          ? `A API da ${integracao.label} resolve notificação por conta, e não por cobrança. Sem este cadastro o inscrito paga e a inscrição continua marcada como pendente.`
          : `O endereço já vai dentro de cada cobrança, mas em modo de teste a ${integracao.label} só avisa o que estiver cadastrado no painel, em Webhooks › URL modo teste. É da mesma tela que sai a assinatura secreta.`}
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
