import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close,
  DialpadOutlined,
  LinkOff,
  QrCode2,
  WhatsApp,
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';

import CustomChip from '../../../../components/customChip';
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

type Modo = 'qr' | 'codigo';

const ROTULO: Record<WhatsappStatus, string> = {
  DISCONNECTED: 'Desconectado',
  CONNECTING: 'Aguardando pareamento',
  CONNECTED: 'Conectado',
};

/**
 * Passo a passo de cada caminho, na ordem em que a pessoa executa.
 *
 * O texto fica aqui fora porque é ele que carrega a instrução: quem opera não
 * conhece o caminho no aplicativo, e ficar adivinhando onde clicar no celular é
 * o que trava o pareamento na prática.
 */
const PASSOS: Record<Modo, ReactNode[]> = {
  qr: [
    'Pegue o celular do número que vai disparar e abra o WhatsApp.',
    <>
      Toque em{' '}
      <strong>
        Configurações → Aparelhos conectados → Conectar um aparelho
      </strong>
      .
    </>,
    'Aponte a câmera para o código que aparece ao lado.',
  ],
  codigo: [
    'Informe ao lado o número com DDI e DDD, só os dígitos.',
    <>
      No celular, vá em{' '}
      <strong>Aparelhos conectados → Conectar um aparelho</strong> e escolha{' '}
      <strong>Conectar com número de telefone</strong>.
    </>,
    'Digite lá os 8 caracteres que aparecerem ao lado.',
  ],
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
 * A tela é dividida em duas: em cima, quem é o número e como ele está; embaixo,
 * só enquanto não há ninguém conectado, o pareamento. São dois caminhos, os
 * mesmos que o WhatsApp oferece para conectar um aparelho — ler o QR ou digitar
 * um código de oito caracteres —, e cada um vem com os passos do lado do que
 * precisa ser feito, porque a metade difícil acontece no celular, não aqui.
 */
function WhatsappConnection() {
  const theme = useTheme();
  const [numero, setNumero] = useState('');
  const [modo, setModo] = useState<Modo>('qr');

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
      setModo('qr');
      setNumero('');
    },
  });

  const ocupado = conectando || pedindoCodigo || desconectando || cancelando;

  // Quem lê o QR está de olho no celular, não no monitor: sem este aviso a
  // pessoa volta para a tela e tem que deduzir, pelo card, que deu certo.
  const statusAnterior = useRef(status);
  useEffect(() => {
    if (statusAnterior.current === 'CONNECTING' && status === 'CONNECTED') {
      toast.success('Número conectado. As notícias já saem por ele.');
    }

    statusAnterior.current = status;
  }, [status]);

  const cor = {
    DISCONNECTED: theme.palette.text.disabled,
    CONNECTING: theme.palette.chips.alert,
    CONNECTED: theme.palette.chips.success,
  }[status];

  const styles = {
    cartao: {
      backgroundColor: 'background.paperSecondary',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      p: { xs: 2.5, md: 3 },
    },
    marcador: {
      width: 46,
      height: 46,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: cor,
      backgroundColor: alpha(cor, 0.12),
      border: `1px solid ${alpha(cor, 0.28)}`,
    },
    rotulo: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase' as const,
      color: 'text.secondary',
    },
    titulo: { fontSize: '1.0625rem', fontWeight: 600 },
    abas: {
      '& .MuiToggleButton-root': {
        textTransform: 'none',
        borderRadius: 2,
        px: 2,
        gap: 0.75,
        borderColor: 'divider',
      },
    },
    numeroDoPasso: {
      width: 24,
      height: 24,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      fontSize: '12px',
      fontWeight: 700,
      color: 'primary.main',
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    // altura fixa para a tela não pular quando o QR entra no lugar do convite
    painel: {
      width: { xs: '100%', md: 320 },
      flexShrink: 0,
      minHeight: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      p: 2.5,
      borderRadius: 3,
      border: '1px dashed',
      borderColor: 'divider',
      // um tom abaixo do cartão, para o painel se destacar sem virar caixa
      backgroundColor: 'background.paper',
      textAlign: 'center' as const,
    },
    caixaQr: {
      display: 'inline-flex',
      p: 1.5,
      borderRadius: 2,
      // o leitor do WhatsApp precisa do QR escuro sobre claro, mesmo no tema escuro
      backgroundColor: '#FFFFFF',
    },
    codigo: {
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
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={46} height={46} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width={120} height={14} />
            <Skeleton width={200} height={24} />
          </Box>
        </Stack>
      </Box>
    );
  }

  const detalhe = {
    CONNECTED: `${
      conexao?.pushName ? `${conexao.pushName} · ` : ''
    }conectado desde ${
      conexao?.connectedAt ? formatDateTime(conexao.connectedAt) : 'agora'
    }`,
    CONNECTING: 'Esperando a confirmação no celular.',
    DISCONNECTED: 'Sem número, as notícias não saem nos grupos do WhatsApp.',
  }[status];

  /** O que fica no painel da direita, conforme o caminho e o momento */
  const renderPainel = () => {
    if (modo === 'codigo') {
      if (conexao?.pairingCode) {
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Digite no celular:
            </Typography>
            <Box sx={styles.codigo}>{conexao.pairingCode}</Box>
            <Typography variant="caption" color="text.secondary">
              O código vale por poucos minutos.
            </Typography>
          </>
        );
      }

      return (
        <>
          <DialpadOutlined sx={{ fontSize: 44, color: 'text.disabled' }} />
          <Box sx={{ width: '100%' }}>
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
            sx={{ borderRadius: 2, textTransform: 'none', minWidth: 160 }}
          >
            {pedindoCodigo ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Gerar código'
            )}
          </Button>
        </>
      );
    }

    if (conexao?.qr) {
      return (
        <>
          <Box sx={styles.caixaQr}>
            <QRCodeCanvas value={conexao.qr} size={220} level="M" />
          </Box>
          <Typography variant="caption" color="text.secondary">
            O código se renova sozinho a cada poucos segundos — aponte a câmera
            e espere.
          </Typography>
        </>
      );
    }

    if (status === 'CONNECTING') {
      return (
        <>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Preparando o código…
          </Typography>
        </>
      );
    }

    return (
      <>
        <QrCode2 sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">
          O código aparece aqui.
        </Typography>
        <Button
          variant="contained"
          startIcon={<QrCode2 />}
          disabled={ocupado}
          onClick={() => conectar()}
          sx={{ borderRadius: 2, textTransform: 'none', minWidth: 160 }}
        >
          {conectando ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Gerar QR code'
          )}
        </Button>
      </>
    );
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={styles.cartao}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={styles.marcador}>
              <WhatsApp />
            </Box>

            <Box>
              <Typography sx={styles.rotulo}>Número de origem</Typography>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
                {formataNumero(conexao?.phoneNumber) ??
                  'Nenhum número conectado'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {detalhe}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <CustomChip size="small" label={ROTULO[status]} customColor={cor} />

            {status === 'CONNECTED' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LinkOff />}
                disabled={ocupado}
                onClick={() => desconectar()}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Desconectar
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {status !== 'CONNECTED' && (
        <Box sx={styles.cartao}>
          <Typography sx={styles.titulo}>Conectar um número</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            O celular precisa estar em mãos nos dois caminhos. Escolha o que for
            mais prático agora.
          </Typography>

          {/* a escolha do número é a decisão de maior consequência desta tela,
              e ela é feita antes de qualquer clique aqui */}
          <Alert severity="info" sx={{ mt: 2.5, borderRadius: 2 }}>
            <AlertTitle sx={{ mb: 0.5 }}>
              Use um número do ministério, não o seu pessoal
            </AlertTitle>

            <Typography variant="body2">
              O sistema entra como mais um aparelho conectado, do mesmo jeito
              que o WhatsApp Web — o WhatsApp não tem uma porta oficial para
              isso. No ritmo daqui, poucos avisos por semana em grupos onde as
              pessoas entraram por vontade própria, o risco é pequeno; mas nunca
              é zero. Uma denúncia de quem recebe, ou um envio que pareça
              automático demais, pode custar um bloqueio ao número.
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Por isso vale um chip separado, o da secretaria por exemplo. Se um
              dia acontecer, o que se perde são os avisos — e não as suas
              conversas, contatos e grupos.
            </Typography>
          </Alert>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={modo}
            onChange={(_, valor: Modo | null) => valor && setModo(valor)}
            sx={{ ...styles.abas, mt: 2.5 }}
          >
            <ToggleButton value="qr">
              <QrCode2 fontSize="small" />
              Ler o QR code
            </ToggleButton>
            <ToggleButton value="codigo">
              <DialpadOutlined fontSize="small" />
              Digitar o número
            </ToggleButton>
          </ToggleButtonGroup>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ mt: 2.5 }}
          >
            <Stack spacing={2} sx={{ flex: 1, pt: 0.5 }}>
              {PASSOS[modo].map((passo, indice) => (
                <Stack
                  // a lista é fixa e nunca reordena: o índice serve de chave
                  key={indice}
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                >
                  <Box sx={styles.numeroDoPasso}>{indice + 1}</Box>
                  <Typography variant="body2" sx={{ pt: 0.25 }}>
                    {passo}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Box sx={styles.painel}>{renderPainel()}</Box>
          </Stack>

          {conexao?.lastError && (
            <Alert severity="warning" sx={{ mt: 2.5, borderRadius: 2 }}>
              {conexao.lastError}
            </Alert>
          )}

          {/* sem esta saída o QR fica no ar até alguém ler: a tela seguiria em
              "aguardando pareamento" sem jeito de voltar atrás */}
          {status === 'CONNECTING' && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="text"
                color="error"
                startIcon={<Close />}
                disabled={ocupado}
                onClick={() => cancelar()}
                sx={{ textTransform: 'none' }}
              >
                Cancelar pareamento
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  );
}

export { WhatsappConnection };
