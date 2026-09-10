import {
  alpha,
  Backdrop,
  Box,
  Fade,
  IconButton,
  Modal,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Close, HistoryToggleOff } from '@mui/icons-material';
import {
  formatCurrency,
  formatDateTime,
  tempoRelativo,
} from '../../../../utils';
import { PaymentMethod, PaymentStatus } from '../../../../types/user';
import {
  PaymentLog,
  PaymentLogSource,
  useGetPaymentLogs,
} from '../api/getPaymentLogs';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLOR,
} from '../constants';

interface ModalPaymentHistoryProps {
  open: boolean;
  handleClose: () => void;
  /** A cobrança em foco; nula enquanto nenhuma linha foi escolhida */
  payment: { id?: string; fullName?: string; amount?: number } | null;
  eventId: string;
}

/**
 * De onde veio o passo, dito para quem cuida do caixa.
 *
 * "Webhook" e "cron" são palavras nossas, não dele. O que ele precisa saber é
 * se foi gente ou máquina — e, sendo gente, quem.
 */
const ORIGEM: Record<PaymentLogSource, string> = {
  PANEL: 'Pelo painel',
  WEBHOOK: 'Retorno do PagBank',
  CRON: 'Conferência automática',
  SYSTEM: 'Pelo sistema',
};

/**
 * Os campos que aparecem no passo, e só eles.
 *
 * A trilha guarda a linha inteira — id, vínculos, referência do gateway. Nada
 * disso é decisão do financeiro, e listar tudo transformaria o histórico num
 * despejo de tabela. O status fica de fora porque já é o título do passo.
 *
 * Duas ausências pensadas:
 *
 * - `payload` guarda o retorno do gateway **e** a URL do comprovante no mesmo
 *   objeto, e ele é reescrito em toda edição. Anunciar "comprovante
 *   atualizado" a cada salvamento diria que alguém anexou um arquivo quando
 *   ninguém anexou — num histórico de dinheiro, errar assim é pior que calar.
 * - `receivedFrom` repete, mais grosso, o que a linha de origem já diz.
 */
const CAMPOS_VISIVEIS: Record<string, string> = {
  amount: 'Valor',
  method: 'Método',
  discountId: 'Desconto',
};

/** O valor de um campo, na língua da tela */
function valorLegivel(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—';

  if (campo === 'amount') return formatCurrency(Number(valor));
  if (campo === 'method')
    return PAYMENT_METHODS(valor as PaymentMethod) ?? String(valor);
  if (campo === 'discountId') return 'aplicado';

  return String(valor);
}

/**
 * O título do passo: o que aconteceu, em três palavras.
 *
 * Mudança de status é o passo em si — "Pago", "Em análise". Quando nada de
 * status mudou, o título diz o que de fato houve, e o link de pagamento ganha
 * frase própria: para o financeiro, gerar cobrança no PagBank e dar baixa são
 * dois acontecimentos diferentes.
 */
function tituloDoPasso(passo: PaymentLog): string {
  const ehCheckout = passo.model === 'PaymentCheckout';

  if (ehCheckout) {
    if (passo.action.startsWith('create')) return 'Link de pagamento gerado';
    if (passo.action.startsWith('delete')) return 'Link de pagamento removido';

    const mapa: Record<string, string> = {
      ACTIVE: 'Link de pagamento reaberto',
      INACTIVE: 'Link de pagamento encerrado',
      EXPIRED: 'Link de pagamento expirado',
    };
    return mapa[passo.statusAfter ?? ''] ?? 'Link de pagamento atualizado';
  }

  if (passo.action.startsWith('delete')) return 'Cobrança removida';

  const virou = passo.statusAfter;
  const mudouDeStatus = virou && virou !== passo.statusBefore;

  if (passo.action.startsWith('create')) {
    return mudouDeStatus
      ? `Cobrança criada · ${PAYMENT_STATUS(virou as PaymentStatus)}`
      : 'Cobrança criada';
  }

  return mudouDeStatus
    ? PAYMENT_STATUS(virou as PaymentStatus)
    : 'Cobrança atualizada';
}

/** Um passo da linha do tempo: bolinha, fio, e o que aconteceu */
function Passo({ passo, ultimo }: { passo: PaymentLog; ultimo: boolean }) {
  const theme = useTheme();

  const ehCheckout = passo.model === 'PaymentCheckout';
  const cor =
    !ehCheckout && passo.statusAfter
      ? PAYMENT_STATUS_COLOR(passo.statusAfter as PaymentStatus, theme)
      : theme.palette.chips.info;

  const veioDeAlguem = passo.source === 'PANEL' && passo.actorName;
  const origem = veioDeAlguem
    ? `${ORIGEM[passo.source]} · ${passo.actorName}`
    : ORIGEM[passo.source];

  const detalhes = Object.entries(passo.changes ?? {})
    .filter(([campo]) => campo in CAMPOS_VISIVEIS)
    .map(([campo, mudanca]) => {
      const antes = valorLegivel(campo, mudanca.before);
      const depois = valorLegivel(campo, mudanca.after);

      // criação não mostra seta: em "— → R$ 430" a metade vazia só ocupa espaço
      return antes === '—'
        ? `${CAMPOS_VISIVEIS[campo]}: ${depois}`
        : `${CAMPOS_VISIVEIS[campo]}: ${antes} → ${depois}`;
    });

  return (
    <Stack direction="row" gap={1.75}>
      {/* a coluna do fio: bolinha em cima, linha descendo até o próximo */}
      <Stack alignItems="center" sx={{ flexShrink: 0, pt: 0.4 }}>
        <Box
          sx={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            bgcolor: cor,
            boxShadow: `0 0 0 4px ${alpha(cor, 0.2)}`,
          }}
        />
        {!ultimo && (
          <Box
            sx={{
              flexGrow: 1,
              width: '2px',
              mt: 0.75,
              bgcolor: alpha(theme.palette.divider, 0.9),
            }}
          />
        )}
      </Stack>

      <Box sx={{ minWidth: 0, flexGrow: 1, pb: ultimo ? 0 : 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          gap={1}
          flexWrap="wrap"
        >
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            {tituloDoPasso(passo)}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
            {formatDateTime(passo.createdAt)} · {tempoRelativo(passo.createdAt)}
          </Typography>
        </Stack>

        {/* de onde veio é a primeira pergunta do caixa: gente ou máquina? */}
        <Typography sx={{ mt: 0.15, fontSize: 12.5, color: 'text.secondary' }}>
          {origem}
        </Typography>

        {detalhes.length > 0 && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12.5,
              color: 'text.primary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {detalhes.join(' · ')}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/**
 * Por onde a cobrança passou, do nascimento até agora.
 *
 * Fica ao lado de Editar e Estornar porque é a terceira pergunta da mesma
 * linha: antes de mexer no dinheiro, saber o que já fizeram com ele. A ordem é
 * do mais recente para o mais antigo — a última coisa que aconteceu é a que
 * explica o status de hoje.
 */
export function ModalPaymentHistory({
  open,
  handleClose,
  payment,
  eventId,
}: ModalPaymentHistoryProps) {
  const theme = useTheme();

  const { data, isLoading } = useGetPaymentLogs(
    { eventId, paymentId: payment?.id, limit: 100 },
    { enabled: open && !!eventId && !!payment?.id }
  );

  const passos = data?.items ?? [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 560 },
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            p: 3,
            boxShadow: 10,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography fontSize={20} fontWeight={600}>
                Histórico da cobrança
              </Typography>
              <Typography fontSize={13} color="text.secondary" noWrap>
                {payment?.fullName}
                {payment?.amount !== undefined &&
                  ` · ${formatCurrency(payment.amount)}`}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Stack>

          <Box sx={{ mt: 2.5, maxHeight: '65vh', overflowY: 'auto', pr: 1 }}>
            {isLoading ? (
              <Stack gap={2}>
                {[0, 1, 2].map((linha) => (
                  <Skeleton key={linha} variant="rounded" height={58} />
                ))}
              </Stack>
            ) : passos.length === 0 ? (
              <Stack alignItems="center" gap={1} sx={{ py: 4, px: 2 }}>
                <HistoryToggleOff
                  sx={{ fontSize: 34, color: 'text.disabled' }}
                />
                <Typography fontSize={14} color="text.secondary">
                  Nenhum movimento registrado nesta cobrança.
                </Typography>
                {/* honestidade sobre o começo da trilha: cobrança mexida antes
                    de ela existir abre vazia, e sem esta linha isso pareceria
                    defeito */}
                <Typography
                  fontSize={12}
                  color="text.disabled"
                  textAlign="center"
                >
                  O histórico passa a contar a partir da primeira alteração
                  feita depois que ele entrou no ar.
                </Typography>
              </Stack>
            ) : (
              <Stack>
                {passos.map((passo, indice) => (
                  <Passo
                    key={passo.id}
                    passo={passo}
                    ultimo={indice === passos.length - 1}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
