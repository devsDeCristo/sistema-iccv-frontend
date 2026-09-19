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
          ? 'Sem este cadastro, o inscrito paga e a inscrição continua pendente.'
          : 'Em modo de teste, só o endereço cadastrado no painel recebe aviso.'}
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

      {/*
         Quem assina leva uma legenda; quem não assina continua levando alerta.
         Sem assinatura, o segredo da URL é a única coisa entre um POST forjado
         e uma inscrição marcada como paga — e isso não é nota de rodapé.
      */}
      {integracao.signsWebhook ? (
        <Typography variant="caption" color="text.secondary">
          Contém um segredo desta igreja: não compartilhe.
        </Typography>
      ) : (
        <Alert severity="warning" sx={{ py: 0.25, alignItems: 'center' }}>
          Trate como senha: sem assinatura, este segredo é a única tranca.
        </Alert>
      )}
    </Stack>
  );
}

export { WebhookUrls };
