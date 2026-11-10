import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Check,
  CheckCircleOutline,
  ContentCopy,
  ErrorOutline,
  HourglassEmpty,
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-toastify';

import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { ProviderLogo } from '../../../features/settings/payments/components/providerLogo';
import {
  PixCheckout,
  useGetPixCheckout,
  usePostConferirPix,
} from '../../../features/events/api/pixCheckout';
import { formatCurrency } from '../../../utils';

type Situacao =
  'aguardando' | 'pago' | 'analise' | 'expirado' | 'substituido' | 'encerrado';

/** Em que pé está a cobrança, na ordem em que uma coisa ganha da outra */
function situacaoDe(pix: PixCheckout, agora: number): Situacao {
  if (pix.status === 'PAID') return 'pago';
  if (pix.status === 'IN_ANALYSIS') return 'analise';
  if (pix.status !== 'WAITING') return 'encerrado';
  if (!pix.active) return 'substituido';
  if (new Date(pix.expiresAt).getTime() <= agora) return 'expirado';
  return 'aguardando';
}

const relogio = (segundos: number) =>
  `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(
    segundos % 60
  ).padStart(2, '0')}`;

/**
 * O Pix pago aqui dentro — hoje só o do PayPal, que não tem página própria
 * para ele: devolve o código, e quem mostra o QR é o sistema.
 *
 * O código vem sempre do servidor, pela referência que está no endereço. Nada
 * do que é pago sai da URL nem é montado no navegador: um QR trocado na tela é
 * dinheiro na conta de outra pessoa, e Pix não volta.
 *
 * A tela só lê. Quem dá baixa é o servidor, pelo aviso do gateway; a consulta
 * a cada cinco segundos existe para a tela virar "pago" sozinha, e o "Já
 * paguei" para quando o aviso demora — ele manda o servidor perguntar ao
 * gateway na hora.
 *
 * A marca do gateway e a frase "processado pelo…" ficam em todos os estados:
 * é o nome que o inscrito vai ver como recebedor no app do banco.
 */
function EventPixPayment() {
  const { id: eventId = '', referenceId = '' } = useParams();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const navigate = useNavigate();
  const theme = useTheme();

  const [agora, setAgora] = useState(Date.now());
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const tique = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(tique);
  }, []);

  const params = { eventId, userId, referenceId };

  const {
    data: pix,
    isLoading,
    isError,
  } = useGetPixCheckout(params, {
    enabled: !!userId && !!referenceId,
    retry: false,
    // só enquanto há o que esperar: pago, expirado ou substituído não mudam
    // sozinhos, e a aba pode ficar aberta o dia inteiro
    refetchInterval: (dados) =>
      dados && situacaoDe(dados, Date.now()) === 'aguardando' ? 5000 : false,
  });

  const { mutate: conferir, isLoading: conferindo } = usePostConferirPix({
    onSuccess: (dados) => {
      if (dados.status === 'WAITING') {
        toast.info(
          'Ainda não recebemos a confirmação. Se você já pagou, aguarde alguns instantes e tente de novo.'
        );
      }
    },
  });

  const copiar = async () => {
    if (!pix) return;

    try {
      await navigator.clipboard.writeText(pix.code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // navegador sem permissão de área de transferência: o código continua
      // visível na tela para copiar na mão
      toast.info('Selecione o código e copie manualmente.');
    }
  };

  const styles = {
    cartao: {
      maxWidth: 460,
      mx: 'auto',
      p: { xs: 2.5, sm: 3.5 },
      borderRadius: 3,
    },
    // fundo branco fixo: no tema escuro o leitor do banco não engata num QR
    // desenhado sobre cinza
    qr: {
      alignSelf: 'center',
      p: 1.5,
      lineHeight: 0,
      borderRadius: 2,
      backgroundColor: '#fff',
      border: `1px solid ${theme.palette.divider}`,
    },
    codigo: {
      p: 1.25,
      borderRadius: 1,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.default,
      fontFamily: 'monospace',
      fontSize: 12,
      color: theme.palette.text.secondary,
      wordBreak: 'break-all' as const,
      maxHeight: 76,
      overflowY: 'auto' as const,
    },
  };

  const irParaMinhasInscricoes = () => navigate('/minhasInscricoes');
  const voltarAoEvento = () => navigate(`/eventos/${eventId}`);

  const jaPaguei = (
    <Button
      variant="outlined"
      fullWidth
      disabled={conferindo}
      onClick={() => conferir(params)}
    >
      {conferindo ? 'Conferindo…' : 'Já paguei'}
    </Button>
  );

  const aviso = (
    icone: ReactNode,
    titulo: string,
    texto: string,
    acoes: ReactNode
  ) => (
    <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ py: 1 }}>
      {icone}
      <Typography fontWeight={700} fontSize={18}>
        {titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {texto}
      </Typography>
      <Stack spacing={1} width="100%" sx={{ pt: 1 }}>
        {acoes}
      </Stack>
    </Stack>
  );

  const corpo = () => {
    if (!pix) return null;

    const situacao = situacaoDe(pix, agora);

    if (situacao === 'pago') {
      return aviso(
        <CheckCircleOutline sx={{ fontSize: 56, color: 'success.main' }} />,
        'Pagamento confirmado',
        'Recebemos o seu Pix. Não é preciso fazer mais nada.',
        <Button variant="contained" fullWidth onClick={voltarAoEvento}>
          Voltar ao evento
        </Button>
      );
    }

    if (situacao === 'analise') {
      return aviso(
        <HourglassEmpty sx={{ fontSize: 56, color: 'warning.main' }} />,
        'Pagamento em análise',
        'O pagamento chegou e está sendo conferido pela organização do evento.',
        <Button variant="outlined" fullWidth onClick={irParaMinhasInscricoes}>
          Ir para Minhas inscrições
        </Button>
      );
    }

    if (situacao === 'encerrado') {
      return aviso(
        <ErrorOutline sx={{ fontSize: 56, color: 'text.secondary' }} />,
        'Pagamento encerrado',
        'Este pagamento não está mais disponível. Veja a situação em Minhas inscrições.',
        <Button variant="contained" fullWidth onClick={irParaMinhasInscricoes}>
          Ir para Minhas inscrições
        </Button>
      );
    }

    if (situacao === 'expirado' || situacao === 'substituido') {
      return aviso(
        <ErrorOutline sx={{ fontSize: 56, color: 'warning.main' }} />,
        situacao === 'expirado'
          ? 'Este código expirou'
          : 'Este código foi substituído',
        situacao === 'expirado'
          ? 'Se você já pagou, toque em "Já paguei". Se não, gere um novo pagamento em Minhas inscrições.'
          : 'Um pagamento mais novo foi gerado para esta inscrição. Use o mais recente, em Minhas inscrições. Se você já pagou este, toque em "Já paguei".',
        <>
          <Button
            variant="contained"
            fullWidth
            onClick={irParaMinhasInscricoes}
          >
            Ir para Minhas inscrições
          </Button>
          {jaPaguei}
        </>
      );
    }

    const restante = Math.max(
      0,
      Math.floor((new Date(pix.expiresAt).getTime() - agora) / 1000)
    );

    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Abra o app do seu banco, escolha pagar com Pix e leia o QR Code — ou
          copie o código e cole na opção Pix Copia e Cola.
        </Typography>

        <Box sx={styles.qr} role="img" aria-label="QR Code do Pix">
          <QRCodeCanvas value={pix.code} size={220} level="M" />
        </Box>

        <Box sx={styles.codigo}>{pix.code}</Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={copiado ? <Check /> : <ContentCopy />}
          onClick={copiar}
        >
          {copiado ? 'Código copiado' : 'Copiar código Pix'}
        </Button>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={14} />
            <Typography variant="body2" color="text.secondary">
              Aguardando pagamento
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Expira em <strong>{relogio(restante)}</strong>
          </Typography>
        </Stack>

        {jaPaguei}
      </Stack>
    );
  };

  return (
    <PageStyle>
      <Header
        title="Pagamento por Pix"
        buttonBack
        pageBack={`/eventos/${eventId}`}
      />

      {isLoading ? (
        <Skeleton
          variant="rounded"
          height={520}
          sx={{ maxWidth: 460, mx: 'auto' }}
        />
      ) : isError || !pix ? (
        <Paper sx={styles.cartao}>
          {aviso(
            <ErrorOutline sx={{ fontSize: 56, color: 'text.secondary' }} />,
            'Pagamento não encontrado',
            'Este endereço não corresponde a um pagamento seu. Gere o pagamento de novo em Minhas inscrições.',
            <Button
              variant="contained"
              fullWidth
              onClick={irParaMinhasInscricoes}
            >
              Ir para Minhas inscrições
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={styles.cartao}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ProviderLogo provider={pix.provider} size={44} />
              <Box>
                <Typography fontWeight={700}>
                  Processado pelo {pix.providerLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No app do seu banco, o recebedor pode aparecer com esse nome.
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {pix.eventName}
              </Typography>
              {pix.amountCents !== null && (
                <Typography fontSize={28} fontWeight={700}>
                  {formatCurrency(pix.amountCents / 100)}
                </Typography>
              )}
            </Box>

            {corpo()}
          </Stack>
        </Paper>
      )}
    </PageStyle>
  );
}

export { EventPixPayment };
