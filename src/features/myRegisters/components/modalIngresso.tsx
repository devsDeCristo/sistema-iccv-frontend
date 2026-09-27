import { ReactNode } from 'react';
import {
  alpha,
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AttachFile,
  Close,
  ErrorOutline,
  HourglassBottom,
  LocalActivity,
  PaymentsOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import CustomChip from '../../../components/customChip';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import {
  PAYMENT_STATUS_COLOR,
  statusPaymentOptions,
} from '../../admin/events/constants';
import { descreverItem } from '../../admin/events/products';
import { ehCorHex } from '../../admin/events/eventColors';
import { PaymentProductItem } from '../../admin/events/types';
import { paymentsWithRoles } from '../types';
import { pagamentosEmAberto } from '../utils';

/** Raio dos furos do picote */
const RAIO_DO_FURO = 14;

interface ModalIngressoProps {
  open: boolean;
  onClose: () => void;
  payment: paymentsWithRoles & {
    data?: {
      coverUrl?: string;
      logoUrl?: string;
      colors?: { primary?: string };
    };
  };
  /** quando (na home) ou onde (em Minhas Inscrições) */
  subtitulo?: string;
  onVerEvento: () => void;
  /** fecha este e abre o modal de pagamento de sempre */
  onPagar: () => void;
  /** abre o envio do termo do responsável */
  onAnexarTermo: () => void;
}

type Pendencia = {
  chave: string;
  icone: ReactNode;
  titulo: string;
  texto: string;
  acao?: { rotulo: string; onClick: () => void };
};

/**
 * O que ainda trava a inscrição, em frase, com o que fazer — e não só um chip
 * de status que a pessoa precisa decifrar.
 */
function pendenciasDa(
  payment: ModalIngressoProps['payment'],
  emAberto: number,
  onAnexarTermo: () => void
): Pendencia[] {
  const pendencias: Pendencia[] = [];
  const termo = payment.minorApprovalStatus;

  if (termo === 'PENDING' && !payment.signedTermUrl) {
    pendencias.push({
      chave: 'termo',
      icone: <AttachFile fontSize="small" />,
      titulo: 'Termo do responsável pendente',
      texto:
        'Por ser menor de 16 anos, a inscrição só vale com o termo assinado pelos pais ou responsáveis e a aprovação da organização.',
      acao: { rotulo: 'Anexar termo', onClick: onAnexarTermo },
    });
  } else if (termo === 'PENDING') {
    pendencias.push({
      chave: 'termo',
      icone: <HourglassBottom fontSize="small" />,
      titulo: 'Aguardando aprovação do termo',
      texto:
        'O termo do responsável foi enviado e está com a organização para conferência.',
      acao: { rotulo: 'Reenviar termo', onClick: onAnexarTermo },
    });
  } else if (termo === 'REJECTED') {
    pendencias.push({
      chave: 'termo',
      icone: <ErrorOutline fontSize="small" />,
      titulo: 'Termo do responsável recusado',
      texto:
        payment.minorApprovalRejectionReason ||
        'A organização pediu um novo envio do termo.',
      acao: { rotulo: 'Reenviar termo', onClick: onAnexarTermo },
    });
  }

  if (payment.waitlistRoles.length > 0) {
    const grupos = payment.waitlistRoles.map((papel) => papel.group).join(', ');
    pendencias.push({
      chave: 'espera',
      icone: <HourglassBottom fontSize="small" />,
      titulo: 'Na lista de espera',
      texto: `Sua vaga em ${grupos} ainda não está garantida: você entra se uma vaga abrir.`,
    });
  }

  if (emAberto > 0) {
    pendencias.push({
      chave: 'pagamento',
      icone: <PaymentsOutlined fontSize="small" />,
      titulo:
        emAberto === 1
          ? 'Pagamento pendente'
          : `${emAberto} pagamentos pendentes`,
      texto: payment.modulePayment
        ? 'Use o botão Pagar, aqui embaixo, para concluir.'
        : 'Esta igreja não recebe pelo site: acerte o pagamento com a organização do evento.',
    });
  }

  return pendencias;
}

function Status({ status }: { status: string }) {
  const theme = useTheme();

  return (
    <CustomChip
      size="small"
      label={
        statusPaymentOptions.find((opcao) => opcao.value === status)?.label ||
        status
      }
      customColor={PAYMENT_STATUS_COLOR(status as never, theme)}
    />
  );
}

/** Uma linha do ingresso: o que foi comprado e, embaixo, os produtos */
function Item({
  icone,
  titulo,
  produtos,
  direita,
}: {
  icone: ReactNode;
  titulo: string;
  produtos?: PaymentProductItem[];
  direita: ReactNode;
}) {
  return (
    <Stack direction="row" gap={1.25} alignItems="flex-start">
      <Box sx={{ color: 'text.secondary', mt: 0.25, display: 'flex' }}>
        {icone}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontSize={14} fontWeight={600}>
          {titulo}
        </Typography>
        {(produtos ?? []).map((produto) => (
          <Typography key={produto.id} fontSize={13} color="text.secondary">
            {descreverItem(produto)}
          </Typography>
        ))}
      </Box>
      {direita}
    </Stack>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return (
    <Typography
      fontSize={11}
      fontWeight={700}
      letterSpacing="0.08em"
      color="text.secondary"
      sx={{ mb: 1 }}
    >
      {children}
    </Typography>
  );
}

/**
 * Os detalhes da inscrição, no mesmo formato do ingresso que a pessoa clicou:
 * capa, o evento, cada inscrição com o status do pagamento e os produtos, as
 * compras na loja — e, depois do picote, o canhoto com o que falta e o botão
 * de pagar.
 *
 * É só leitura. Pagar fecha este e abre o modal de pagamento de sempre, onde a
 * pessoa escolhe o que vai levar ao checkout.
 *
 * Os furos do picote são de verdade (máscara), e não bolinhas na cor da
 * página: atrás do modal está o fundo escurecido, que nenhuma cor fixa imita.
 */
function ModalIngresso({
  open,
  onClose,
  payment,
  subtitulo,
  onVerEvento,
  onPagar,
  onAnexarTermo,
}: ModalIngressoProps) {
  const theme = useTheme();
  const dados = payment.data ?? {};
  const cor = ehCorHex(dados.colors?.primary)
    ? dados.colors!.primary!
    : theme.palette.primary.main;
  const baseDoVeu =
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.text.primary;

  const emAberto = pagamentosEmAberto(payment);
  const compras = payment.productPurchases ?? [];
  const podePagar = payment.modulePayment && emAberto > 0;
  const pendencias = pendenciasDa(payment, emAberto, onAnexarTermo);

  // os dois cantos côncavos de cada metade formam os furos do picote
  const furo = (lado: 'top' | 'bottom') => {
    const y = lado === 'top' ? '0' : '100%';
    const recorte = (x: string) =>
      `radial-gradient(circle at ${x} ${y}, transparent ${RAIO_DO_FURO}px, #000 ${RAIO_DO_FURO + 0.5}px)`;
    return {
      WebkitMask: `${recorte('0')} left / 51% 100% no-repeat, ${recorte('100%')} right / 51% 100% no-repeat`,
      mask: `${recorte('0')} left / 51% 100% no-repeat, ${recorte('100%')} right / 51% 100% no-repeat`,
    };
  };

  const raio = Number(theme.shape.borderRadius) * 3;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // o papel do Dialog some: quem desenha o ingresso são as duas metades
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: `${raio}px ${raio}px 0 0`,
          overflow: 'hidden',
          ...furo('bottom'),
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: 96,
            // o mesmo tratamento da capa do ingresso e do cartaz do catálogo
            backgroundImage: [
              `linear-gradient(90deg, transparent 10%, ${alpha(baseDoVeu, 0.48)} 58%, ${alpha(baseDoVeu, 0.76)} 100%)`,
              `linear-gradient(${alpha('#000', 0.38)}, ${alpha('#000', 0.38)})`,
              `url(${dados.coverUrl || CapaLogin})`,
            ].join(', '),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {dados.logoUrl && (
            <Box
              component="img"
              src={dados.logoUrl}
              alt=""
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                height: 60,
                maxWidth: '60%',
                objectFit: 'contain',
              }}
            />
          )}
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Stack gap={2.5} sx={{ p: 3, pb: 3.5 }}>
          <Box>
            <Typography
              fontSize={11}
              fontWeight={700}
              letterSpacing="0.08em"
              sx={{ color: cor }}
            >
              INGRESSO
            </Typography>
            <Typography fontSize={20} fontWeight={700} lineHeight={1.3}>
              {payment.eventName}
            </Typography>
            {subtitulo && (
              <Typography fontSize={14} color="text.secondary">
                {subtitulo}
              </Typography>
            )}
          </Box>

          {pendencias.length > 0 && (
            <Box>
              <Rotulo>PENDÊNCIAS</Rotulo>
              <Stack gap={1}>
                {pendencias.map((pendencia) => (
                  <Stack
                    key={pendencia.chave}
                    direction="row"
                    gap={1.25}
                    alignItems="flex-start"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: `3px solid ${theme.palette.chips.alert}`,
                      backgroundColor: alpha(theme.palette.chips.alert, 0.08),
                    }}
                  >
                    <Box
                      sx={{
                        color: theme.palette.chips.alert,
                        mt: 0.25,
                        display: 'flex',
                      }}
                    >
                      {pendencia.icone}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={14} fontWeight={600}>
                        {pendencia.titulo}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {pendencia.texto}
                      </Typography>
                    </Box>
                    {pendencia.acao && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={pendencia.acao.onClick}
                        sx={{ flexShrink: 0, alignSelf: 'center' }}
                      >
                        {pendencia.acao.rotulo}
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {(payment.registeredRoles.length > 0 ||
            payment.waitlistRoles.length > 0) && (
            <Box>
              <Rotulo>INSCRIÇÕES</Rotulo>
              <Stack gap={1.5}>
                {payment.registeredRoles.map((papel) => (
                  <Item
                    key={papel.roleId}
                    icone={<LocalActivity fontSize="small" />}
                    titulo={`${papel.group} · ${papel.description}`}
                    produtos={papel.products as PaymentProductItem[]}
                    direita={
                      <Status status={papel.paymentStatus || 'WAITING'} />
                    }
                  />
                ))}
                {payment.waitlistRoles.map((papel) => (
                  <Item
                    key={`espera:${papel.roleId}`}
                    icone={<HourglassBottom fontSize="small" />}
                    titulo={`${papel.group} · ${papel.description}`}
                    direita={
                      <CustomChip
                        size="small"
                        label="Lista de espera"
                        customColor={theme.palette.chips.info}
                      />
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}

          {compras.length > 0 && (
            <Box>
              <Rotulo>COMPRAS NA LOJA</Rotulo>
              <Stack gap={1.5}>
                {compras.map((compra) => (
                  <Item
                    key={compra.id}
                    icone={<ShoppingBagOutlined fontSize="small" />}
                    titulo={`Compra de ${new Date(compra.createdAt).toLocaleDateString('pt-BR')}`}
                    produtos={compra.productItems as PaymentProductItem[]}
                    direita={<Status status={compra.status || 'WAITING'} />}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* o canhoto: o que falta e o que dá para fazer */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={1.5}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: `0 0 ${raio}px ${raio}px`,
          borderTop: `2px dashed ${alpha(theme.palette.text.primary, 0.18)}`,
          px: 3,
          py: 2,
          ...furo('top'),
        }}
      >
        <Box sx={{ flex: 1 }}>
          <CustomChip
            size="small"
            label={
              emAberto === 0
                ? 'Tudo pago'
                : emAberto === 1
                  ? '1 pagamento pendente'
                  : `${emAberto} pagamentos pendentes`
            }
            customColor={
              emAberto === 0
                ? theme.palette.chips.success
                : theme.palette.chips.alert
            }
          />
        </Box>
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button onClick={onVerEvento}>Ver evento</Button>
          {podePagar && (
            <Button variant="contained" color="success" onClick={onPagar}>
              Pagar
            </Button>
          )}
        </Stack>
      </Stack>
    </Dialog>
  );
}

export { ModalIngresso };
