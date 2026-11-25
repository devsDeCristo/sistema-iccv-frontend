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
  ReceiptLong,
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
import CustomChip from '../../../components/customChip';
import { formatarPercentual } from '../../../features/events/taxaDeServico';

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
 * O Pix pago aqui dentro — no PayPal, no Mercado Pago, no PagBank e no Ton,
 * com a igreja de Pix ligado. O gateway cria a cobrança e devolve o código
 * (QR dinâmico, com valor e validade desta cobrança); quem mostra o QR é o
 * sistema. As outras formas seguem no checkout do gateway.
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
    // Aguardando, a tela tem QR e código lado a lado: numa coluna só, com a
    // largura de 460, ela passava da altura da tela e pedia rolagem
    cartaoLargo: { maxWidth: { xs: 460, md: 880 } },
    colunas: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'auto 1fr' },
      gap: { xs: 2.5, md: 4 },
      alignItems: 'center',
    },
    // fundo branco fixo: no tema escuro o leitor do banco não engata num QR
    // desenhado sobre cinza
    qr: {
      justifySelf: 'center',
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

  /** Evento e valor: centralizados nos avisos, à esquerda na coluna do QR */
  const valorDoEvento = (alinhamento: 'left' | 'center') =>
    pix && (
      <Box textAlign={alinhamento}>
        <Typography variant="body2" color="text.secondary">
          {pix.eventName}
        </Typography>
        {pix.amountCents !== null && (
          <Typography fontSize={28} fontWeight={700}>
            {formatCurrency(pix.amountCents / 100)}
          </Typography>
        )}
        {!!pix.serviceFeeCents && (
          <CustomChip
            size="small"
            icon={<ReceiptLong sx={{ fontSize: 14 }} />}
            label={`inclui ${formatCurrency(pix.serviceFeeCents / 100)} de taxa de serviço${
              pix.amountCents
                ? ` (${formatarPercentual(
                    Math.round(
                      (pix.serviceFeeCents / pix.amountCents) * 10000
                    ) / 100
                  )})`
                : ''
            }`}
            customColor={theme.palette.chips.alert}
            sx={{ mt: 0.5, '& .MuiChip-icon': { color: 'inherit' } }}
          />
        )}
      </Box>
    );

  const aguardando = !!pix && situacaoDe(pix, agora) === 'aguardando';

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
      <Box sx={styles.colunas}>
        {/* o QR vem primeiro: ao lado no computador, em cima no celular */}
        <Box sx={styles.qr} role="img" aria-label="QR Code do Pix">
          <QRCodeCanvas value={pix.code} size={240} level="M" />
        </Box>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {valorDoEvento('left')}

          <Typography variant="body2" color="text.secondary">
            Abra o app do seu banco, escolha pagar com Pix e leia o QR Code — ou
            copie o código e cole na opção Pix Copia e Cola.
          </Typography>

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
      </Box>
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
        // no formato do QR aguardando, que é o caso comum ao abrir a tela
        <Skeleton
          variant="rounded"
          sx={{
            maxWidth: { xs: 460, md: 880 },
            height: { xs: 520, md: 380 },
            mx: 'auto',
          }}
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
        <Paper sx={{ ...styles.cartao, ...(aguardando && styles.cartaoLargo) }}>
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

            {/* aguardando, o valor vai para a coluna ao lado do QR */}
            {!aguardando && valorDoEvento('center')}

            {corpo()}
          </Stack>
        </Paper>
      )}
    </PageStyle>
  );
}

export { EventPixPayment };
