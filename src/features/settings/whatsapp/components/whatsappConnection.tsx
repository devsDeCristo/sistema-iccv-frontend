import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close, LinkOff, QrCode2, Smartphone } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';

import { Input } from '../../../../components/input';
import { formatDateTime } from '../../../../utils';
import { useGetWhatsappStatus } from '../api/getWhatsappStatus';
import {
  useCancelPairing,
  useConnectWhatsapp,
  useDisconnectWhatsapp,
  useRequestPairingCode,
} from '../api/whatsappSession';
import { WhatsappStatus } from '../types';

const ROTULO: Record<WhatsappStatus, string> = {
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Aguardando pareamento',
  CONNECTED: 'Conectado',
};

const COR: Record<WhatsappStatus, 'default' | 'warning' | 'success'> = {
  DISCONNECTED: 'default',
  CONNECTING: 'warning',
  CONNECTED: 'success',
};

/** 5544999999999 → +55 44 99999-9999 */
function formataNumero(numero?: string | null) {
  if (!numero) return null;

  const ddi = numero.slice(0, 2);
  const ddd = numero.slice(2, 4);
  const resto = numero.slice(4);
  const meio = resto.length > 8 ? resto.slice(0, 5) : resto.slice(0, 4);

  return `+${ddi} ${ddd} ${meio}-${resto.slice(meio.length)}`;
}

/**
 * Painel do número que dispara as mensagens.
 *
 * São dois caminhos de pareamento, os mesmos que o WhatsApp oferece para
 * conectar um aparelho: ler o QR, ou digitar no celular um código de oito
 * caracteres. O segundo existe porque nem sempre quem opera está com o celular
 * na frente do computador.
 */
function WhatsappConnection() {
  const theme = useTheme();
  const [numero, setNumero] = useState('');
  const [modoCodigo, setModoCodigo] = useState(false);

  const { data: conexao, isLoading } = useGetWhatsappStatus();
  const status = conexao?.status ?? 'DISCONNECTED';

  const { mutate: conectar, isLoading: conectando } = useConnectWhatsapp();
  const { mutate: pedirCodigo, isLoading: pedindoCodigo } =
    useRequestPairingCode();
  const { mutate: desconectar, isLoading: desconectando } =
    useDisconnectWhatsapp();

  // cancelar volta a tela ao começo: sem QR na frente, o modo de digitar o
  // número também não faz mais sentido
  const { mutate: cancelar, isLoading: cancelando } = useCancelPairing({
    onSuccess: () => {
      setModoCodigo(false);
      setNumero('');
    },
  });

  const ocupado = conectando || pedindoCodigo || desconectando || cancelando;

  const styles = {
    cartao: {
      backgroundColor: 'background.paperSecondary',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      p: { xs: 2.5, md: 3 },
    },
    caixaQr: {
      display: 'inline-flex',
      p: 2,
      borderRadius: 2,
      // o leitor do WhatsApp precisa do QR escuro sobre claro, mesmo no tema escuro
      backgroundColor: '#FFFFFF',
    },
    codigo: {
      display: 'inline-block',
      px: 2.5,
      py: 1.5,
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: 'primary.main',
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '6px',
    },
  };

  if (isLoading) {
    return (
      <Box sx={styles.cartao}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={styles.cartao}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Smartphone color="primary" />
            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                Número de origem
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formataNumero(conexao?.phoneNumber) ??
                  'Nenhum número conectado'}
                {conexao?.pushName ? ` · ${conexao.pushName}` : ''}
              </Typography>
            </Box>
          </Stack>

          <Chip label={ROTULO[status]} color={COR[status]} size="small" />
        </Stack>

        {conexao?.connectedAt && status === 'CONNECTED' && (
          <Typography variant="caption" color="text.secondary">
            Conectado desde {formatDateTime(conexao.connectedAt)}
          </Typography>
        )}

        {conexao?.lastError && status !== 'CONNECTED' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {conexao.lastError}
          </Alert>
        )}

        <Divider sx={{ my: 2.5 }} />

        {status === 'CONNECTED' ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LinkOff />}
            disabled={ocupado}
            onClick={() => desconectar()}
          >
            Desconectar número
          </Button>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              No celular do número que vai disparar, abra o WhatsApp em{' '}
              <strong>Configurações → Aparelhos conectados → Conectar um
              aparelho</strong>.
            </Typography>

            {status === 'CONNECTING' && conexao?.qr && !modoCodigo && (
              <Stack spacing={1.5} alignItems="flex-start">
                <Box sx={styles.caixaQr}>
                  <QRCodeCanvas value={conexao.qr} size={220} level="M" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  O código se renova sozinho a cada poucos segundos — aponte a
                  câmera e espere.
                </Typography>
              </Stack>
            )}

            {conexao?.pairingCode && (
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="body2">
                  Digite este código no celular:
                </Typography>
                <Box sx={styles.codigo}>{conexao.pairingCode}</Box>
              </Stack>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ sm: 'center' }}
            >
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                disabled={ocupado}
                onClick={() => {
                  setModoCodigo(false);
                  conectar();
                }}
              >
                {status === 'CONNECTING' ? 'Gerar novo QR' : 'Conectar por QR'}
              </Button>

              <Button
                variant="text"
                disabled={ocupado}
                onClick={() => setModoCodigo((atual) => !atual)}
                sx={{ textTransform: 'none' }}
              >
                {modoCodigo ? 'Prefiro o QR' : 'Parear digitando o número'}
              </Button>

              {/* sem esta saída o QR fica no ar até alguém ler: a tela seguiria
                  em "aguardando pareamento" sem jeito de voltar atrás */}
              {status === 'CONNECTING' && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<Close />}
                  disabled={ocupado}
                  onClick={() => cancelar()}
                  sx={{ textTransform: 'none' }}
                >
                  Cancelar
                </Button>
              )}
            </Stack>

            {modoCodigo && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ sm: 'flex-start' }}
              >
                <Box sx={{ width: { xs: '100%', sm: 280 } }}>
                  <Input
                    label="Número com DDI e DDD"
                    placeholder="5544999999999"
                    value={numero}
                    onChange={(evento) =>
                      setNumero(evento.target.value.replace(/\D/g, ''))
                    }
                    inputProps={{ inputMode: 'numeric', maxLength: 15 }}
                  />
                </Box>
                <Button
                  variant="contained"
                  disabled={ocupado || numero.length < 12}
                  onClick={() => pedirCodigo(numero)}
                  sx={{ height: 56 }}
                >
                  {pedindoCodigo ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Gerar código'
                  )}
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Box>

    </Stack>
  );
}

export { WhatsappConnection };
