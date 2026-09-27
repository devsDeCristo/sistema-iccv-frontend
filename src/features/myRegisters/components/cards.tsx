import {
  alpha,
  Paper,
  Typography,
  Box,
  Chip,
  Stack,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  HourglassBottom,
  LocalActivity,
  AttachFile,
  PlaceOutlined,
  CalendarMonthOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';

import { paymentsWithRoles } from '../types';
import { useGetPayments } from '../api/getPaymentByUser';
import { ModalPayment } from './modalPayment';
import { ModalIngresso } from './modalIngresso';
import React from 'react';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import { usePostGuardianTerm } from '../../admin/events/api/postGuardianTerm';
import CustomChip from '../../../components/customChip';
import { pagamentosEmAberto } from '../utils';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { Event } from '../../admin/events/types';
import { ehCorHex } from '../../admin/events/eventColors';
import { formatarPeriodo } from '../../events/utils';

/** O `data` do evento, só com o que o ingresso usa */
interface PaymentData {
  coverUrl?: string;
  logoUrl?: string;
  name?: string;
  localName?: string;
  city?: string;
  state?: string;
  colors?: { primary?: string };
}

/**
 * Curtos de propósito: no cartão de 320px o rótulo antigo ("Aguardando
 * liberação (menor de idade)") ocupava a linha inteira e jogava o botão de
 * anexar para a linha de baixo, esticando o cartão — e com ele os vizinhos.
 * Quem é menor de idade já sabe do que se trata, e o modal repete o assunto.
 */
const GUARDIAN_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Liberação pendente',
  APPROVED: 'Liberação aprovada',
  REJECTED: 'Termo recusado',
};

function GuardianTermDialog({
  open,
  eventId,
  userId,
  onClose,
}: {
  open: boolean;
  eventId: string;
  userId: string;
  onClose: () => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const { mutate, isLoading } = usePostGuardianTerm({
    onSuccess: () => {
      setFile(null);
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Anexar termo de autorização assinado</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Envie o termo assinado pelos pais/responsáveis. O admin do evento
          precisa conferir e liberar a inscrição.
        </Typography>
        <Button component="label" variant="outlined" startIcon={<AttachFile />} fullWidth>
          {file ? file.name : 'Escolher arquivo (PDF ou imagem)'}
          <input
            hidden
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!file || isLoading}
          onClick={() => file && mutate({ eventId, userId, termFile: file })}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Raio do furo do picote, entre o ingresso e o canhoto */
const RAIO_DO_FURO = 12;

/**
 * A inscrição no formato de ingresso: a parte principal com o evento (capa,
 * nome, local e os tipos de ingresso) e, depois do picote, o canhoto com a
 * situação da inscrição e dos pagamentos.
 *
 * No celular o canhoto desce para baixo do ingresso, e o picote vira
 * horizontal.
 */
function EventCard({
  payment,
  compacto = false,
  periodo,
}: {
  payment: paymentsWithRoles & { data: PaymentData };
  /**
   * Versão da coluna estreita da home: canhoto sempre embaixo, em uma linha
   * só, e medidas menores
   */
  compacto?: boolean;
  /**
   * Quando o evento acontece. A inscrição não traz a data; quem tem o evento em
   * mãos (a home, pelo catálogo) passa, e ela entra no lugar do local
   */
  periodo?: { startDate: string | Date; endDate?: string | Date };
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dataModal, setDataModal] = React.useState<any>(null);
  const [guardianModalOpen, setGuardianModalOpen] = React.useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = React.useState(false);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';

  const requiresGuardianApproval =
    !!payment.minorApprovalStatus && payment.minorApprovalStatus !== 'NOT_REQUIRED';
  const guardianChipColor =
    payment.minorApprovalStatus === 'APPROVED'
      ? theme.palette.chips.success
      : payment.minorApprovalStatus === 'REJECTED'
      ? theme.palette.chips.canceled
      : theme.palette.chips.pending;

  // A igreja dona deste evento cobra online? Antes era uma variável do front
  // inteiro; agora cada cartão responde pela igreja dele, e dois eventos de
  // igrejas diferentes aparecem lado a lado com respostas diferentes.
  const modulePayment = payment.modulePayment;

  // compra de produto em aberto também é dívida: sem ela aqui o cartão diria
  // "tudo pago" com a camisa ainda por pagar
  const emAberto = pagamentosEmAberto(payment);

  const dados = payment.data ?? {};
  const cor = ehCorHex(dados.colors?.primary)
    ? dados.colors!.primary!
    : theme.palette.primary.main;
  const local =
    dados.localName || [dados.city, dados.state].filter(Boolean).join(' · ');
  const inscrito = payment.registeredRoles.length > 0;
  const naEspera = payment.waitlistRoles.length > 0;
  const compras = payment.productPurchases?.length ?? 0;

  // cada regra é um tipo de ingresso; as da lista de espera vêm marcadas
  const tipos = [
    ...payment.registeredRoles.map((papel) => ({
      chave: papel.roleId,
      texto: `${papel.group} · ${papel.description}`,
      espera: false,
    })),
    ...payment.waitlistRoles.map((papel) => ({
      chave: `espera:${papel.roleId}`,
      texto: `${papel.group} · ${papel.description}`,
      espera: true,
    })),
  ];

  function handleOpenModal(paymentData: paymentsWithRoles & { data: PaymentData }) {
    const dataArray=[...paymentData.registeredRoles,...paymentData.waitlistRoles].map((role:any)=>{
      
      return {
        key: `inscricao:${role.roleId}`,
        method: role.paymentMethod||'',
        roleId: role.roleId,
        tipo: paymentData.registeredRoles.includes(role) ? 'REGISTERED' : 'WAITLIST',
        status: role.paymentStatus||'WAITING',
        name: role.description || "aaaa",
        groupName: role.group,
        products: role.products ?? [],
      };
    });
   
    // compras de produto feitas depois da inscrição: cada uma é um pagamento
    // próprio, e vai para o checkout pelo id dele
    const compras = (paymentData.productPurchases ?? []).map((compra) => ({
      key: `compra:${compra.id}`,
      paymentId: compra.id,
      method: compra.method || '',
      tipo: 'REGISTERED' as const,
      status: compra.status || 'WAITING',
      name: 'Compra de produtos',
      groupName: '',
      products: compra.productItems,
    }));

    setDataModal([...dataArray, ...compras]);
  }

  const handleCloseModal = () => {
    setDataModal(null);
  }

  const raio = Number(theme.shape.borderRadius) * 3;
  const baseDoVeu =
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.text.primary;
  const linhaDoPicote = `2px dashed ${alpha(theme.palette.text.primary, 0.18)}`;

  // o valor do celular sempre, ou o de tela larga a partir de `sm`
  const lado = (celular: string | number, largo: string | number) =>
    compacto ? celular : { xs: celular, sm: largo };

  const styles = {
    ingresso: {
      display: 'flex',
      flexDirection: lado('column', 'row'),
      borderRadius: `${raio}px`,
      // os furos do picote saem para fora do ingresso
      overflow: 'visible',
      // o ingresso inteiro abre os detalhes: não há mais botões nele
      cursor: 'pointer',
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: 160,
      }),
      '&:hover, &:focus-visible': { transform: 'translateY(-2px)' },
    },
    principal: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      // a capa acompanha o canto arredondado só do lado de fora
      overflow: 'hidden',
      borderRadius: lado(`${raio}px ${raio}px 0 0`, `${raio}px 0 0 ${raio}px`),
    },
    capa: {
      position: 'relative',
      height: compacto ? 56 : 64,
      // o mesmo tratamento do cartaz do catálogo: filtro de 38% e o véu que
      // escurece para a direita, na cor base do tema — ver `CartazDoEvento`
      backgroundImage: [
        `linear-gradient(90deg, transparent 10%, ${alpha(baseDoVeu, 0.48)} 58%, ${alpha(baseDoVeu, 0.76)} 100%)`,
        `linear-gradient(${alpha('#000', 0.38)}, ${alpha('#000', 0.38)})`,
        `url(${dados.coverUrl || CapaLogin})`,
      ].join(', '),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    logo: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height: compacto ? 32 : 48,
      maxWidth: '60%',
      objectFit: 'contain',
    },
    linha: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      color: 'text.secondary',
      fontSize: '0.875rem',
      minWidth: 0,
    },
    icone: { fontSize: 18, flexShrink: 0 },
    canhoto: {
      position: 'relative',
      width: lado('100%', 128),
      flexShrink: 0,
      display: 'flex',
      flexDirection: compacto ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: compacto ? 'space-between' : 'center',
      gap: compacto ? 1 : 0.75,
      p: compacto ? 1.5 : 2,
      textAlign: 'center',
      borderLeft: lado('none', linhaDoPicote),
      borderTop: lado(linhaDoPicote, 'none'),
      // os dois furos, na cor do fundo da página, em cima da linha do picote
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        width: RAIO_DO_FURO * 2,
        height: RAIO_DO_FURO * 2,
        borderRadius: '50%',
        backgroundColor: theme.palette.background.default,
      },
      '&::before': {
        top: lado(-RAIO_DO_FURO - 1, -RAIO_DO_FURO),
        left: lado(-RAIO_DO_FURO, -RAIO_DO_FURO - 1),
      },
      '&::after': {
        top: lado(-RAIO_DO_FURO - 1, 'auto'),
        bottom: lado('auto', -RAIO_DO_FURO),
        left: lado('auto', -RAIO_DO_FURO - 1),
        right: lado(-RAIO_DO_FURO, 'auto'),
      },
    },
    selo: {
      width: compacto ? 28 : 48,
      height: compacto ? 28 : 48,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: cor,
      backgroundColor: alpha(cor, 0.12),
    },
  };

  return (<>
    <Paper
      sx={styles.ingresso}
      role="button"
      tabIndex={0}
      aria-label={`Detalhes da inscrição em ${payment.eventName}`}
      onClick={() => setDetalhesAbertos(true)}
      onKeyDown={(tecla) => {
        if (tecla.key === 'Enter' || tecla.key === ' ') {
          tecla.preventDefault();
          setDetalhesAbertos(true);
        }
      }}
    >
      <Box sx={styles.principal}>
        <Box sx={styles.capa}>
          {dados.logoUrl && (
            <Box component="img" src={dados.logoUrl} alt="" sx={styles.logo} />
          )}
        </Box>

        <Stack gap={compacto ? 0.75 : 1} sx={{ p: compacto ? 2 : 2.5, pt: compacto ? 1.25 : 1.5, flex: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: cor,
              }}
            >
              INGRESSO
            </Typography>
            <Typography
              sx={{
                fontSize: compacto ? '0.9375rem' : '1rem',
                fontWeight: 700,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {payment.eventName}
            </Typography>
          </Box>

          {periodo ? (
            <Box sx={styles.linha}>
              <CalendarMonthOutlined sx={styles.icone} />
              {formatarPeriodo(periodo.startDate, periodo.endDate, {
                comAno: true,
              })}
            </Box>
          ) : local && (
            <Box sx={styles.linha}>
              <PlaceOutlined sx={styles.icone} />
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {local}
              </Box>
            </Box>
          )}

          {(tipos.length > 0 || compras > 0) && (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {tipos.map((tipo) => (
                <Chip
                  key={tipo.chave}
                  size="small"
                  variant="outlined"
                  icon={tipo.espera ? <HourglassBottom /> : <LocalActivity />}
                  label={tipo.espera ? `${tipo.texto} (espera)` : tipo.texto}
                  sx={{ maxWidth: '100%' }}
                />
              ))}
              {compras > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<ShoppingBagOutlined />}
                  label={compras === 1 ? '1 compra na loja' : `${compras} compras na loja`}
                />
              )}
            </Stack>
          )}

          {requiresGuardianApproval && (
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Tooltip title={payment.minorApprovalRejectionReason || ''}>
                <span>
                  <CustomChip
                    label={GUARDIAN_STATUS_LABEL[payment.minorApprovalStatus!]}
                    customColor={guardianChipColor}
                    size="small"
                  />
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box sx={styles.canhoto}>
        <Stack
          direction={compacto ? 'row' : 'column'}
          alignItems="center"
          gap={0.75}
          sx={{ minWidth: 0 }}
        >
        <Box sx={styles.selo}>
          {inscrito ? (
            <LocalActivity sx={{ fontSize: compacto ? 16 : 24 }} />
          ) : naEspera ? (
            <HourglassBottom sx={{ fontSize: compacto ? 16 : 24 }} />
          ) : (
            <ShoppingBagOutlined sx={{ fontSize: compacto ? 16 : 24 }} />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap={compacto}>
          {inscrito
            ? compacto
              ? 'Confirmada'
              : 'Inscrição confirmada'
            : naEspera
              ? 'Na lista de espera'
              : 'Compra na loja'}
        </Typography>
        </Stack>

        {/* o status aparece mesmo na igreja que não cobra online: o que o
            módulo desligado tira é o botão de pagar, não a dívida */}
        {(inscrito || compras > 0) && (
          <CustomChip
            size="small"
            label={
              emAberto === 0
                ? 'Tudo pago'
                : compacto
                  ? `${emAberto} pendente${emAberto === 1 ? '' : 's'}`
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
        )}
        {!modulePayment && emAberto > 0 && (
          <Typography variant="caption" color="text.secondary">
            Acerte com a organização.
          </Typography>
        )}
      </Box>
    </Paper>
      <ModalIngresso
        open={detalhesAbertos}
        onClose={() => setDetalhesAbertos(false)}
        payment={payment}
        subtitulo={
          periodo
            ? formatarPeriodo(periodo.startDate, periodo.endDate, {
                comAno: true,
              })
            : local
        }
        onVerEvento={() => navigate(`/eventos/${payment.eventId}`)}
        onPagar={() => {
          setDetalhesAbertos(false);
          handleOpenModal(payment);
        }}
        onAnexarTermo={() => setGuardianModalOpen(true)}
      />
      {modulePayment && (
        <ModalPayment
          open={Boolean(dataModal)}
          handleClose={handleCloseModal}
          payments={dataModal}
          eventId={payment.eventId}
          userId={userId}
        />
      )}
      {requiresGuardianApproval && (
        <GuardianTermDialog
          open={guardianModalOpen}
          eventId={payment.eventId}
          userId={userId}
          onClose={() => setGuardianModalOpen(false)}
        />
      )}
    </>
  );
}


type ItemDoHistorico = { payment: paymentsWithRoles; event?: Event };

/** Chave do grupo sem data: inscrição de evento que não está no catálogo */
const SEM_DATA = 'Sem data';

/**
 * O histórico de inscrições: da mais recente para a mais antiga, agrupado por
 * ano. É o lugar de rever tudo em que a pessoa já esteve; o que está pendente
 * se vê no próprio ingresso e no detalhe dele.
 *
 * A inscrição não traz a data do evento: ela sai do catálogo de eventos (a
 * mesma consulta da home). Evento fora do catálogo vai para o fim, sem data.
 */
function Cards() {
  const { id } = JSON.parse(localStorage.getItem('user') || '{}');
  const { data = [] } = useGetPayments({ userId: id || '' });
  const { data: catalogo } = useGetEvents({});

  const porAno = React.useMemo(() => {
    const eventos = new Map(
      (Array.isArray(catalogo) ? (catalogo as Event[]) : []).map((event) => [
        event.id,
        event,
      ])
    );
    const quando = (item: ItemDoHistorico) =>
      item.event ? new Date(item.event.startDate).getTime() : -Infinity;

    const grupos = new Map<string, ItemDoHistorico[]>();
    (data as paymentsWithRoles[])
      .map((payment) => ({ payment, event: eventos.get(payment.eventId) }))
      .sort((a, b) => quando(b) - quando(a))
      .forEach((item) => {
        const ano = item.event
          ? String(new Date(item.event.startDate).getFullYear())
          : SEM_DATA;
        grupos.set(ano, [...(grupos.get(ano) ?? []), item]);
      });

    return [...grupos.entries()];
  }, [data, catalogo]);

  if (porAno.length === 0) {
    return (
      <Typography color="text.secondary">
        Você ainda não tem inscrições. Quando se inscrever em um evento, ele
        aparece aqui.
      </Typography>
    );
  }

  return (
    <Stack gap={4}>
      {porAno.map(([ano, itens]) => (
        <Box key={ano}>
          <Stack direction="row" alignItems="baseline" gap={1} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {ano}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {itens.length === 1 ? '1 inscrição' : `${itens.length} inscrições`}
            </Typography>
          </Stack>
          {/* o ingresso horizontal (canhoto ao lado) precisa de ~400px:
              quantos couberem nisso, e um por linha no celular — onde ele
              vira vertical sozinho */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
            }}
          >
            {itens.map(({ payment, event }) => (
              <EventCard
                key={payment.eventId}
                payment={payment as paymentsWithRoles & { data: PaymentData }}
                periodo={event}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export { Cards, EventCard };
export type { PaymentData };
