import {
  Paper,
  CardContent,
  Typography,
  Box,
  Stack,
  useTheme,
  Button,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  AttachMoney,
  HourglassBottom,
  LocalActivity,
  AttachFile,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';

import { paymentsWithRoles } from '../types';
import { useGetPayments } from '../api/getPaymentByUser';
import { ModalPayment } from './modalPayment';
import React from 'react';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import { usePostGuardianTerm } from '../../admin/events/api/postGuardianTerm';
import CustomChip from '../../../components/customChip';
import { pagamentosEmAberto, separarPorPendencia } from '../utils';

interface PaymentData {
  coverUrl: string;
  logoUrl?: string;
  name?: string;
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

function EventCard({ payment }: { payment: paymentsWithRoles & { data: PaymentData } }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dataModal, setDataModal] = React.useState<any>(null);
  const [guardianModalOpen, setGuardianModalOpen] = React.useState(false);
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
 
  const styles = {
      bannerLogo: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: 110,

        p: '6px',
        borderRadius: 2,
      },
    card: {
      borderRadius: 3,
      overflow: 'hidden',
      maxWidth: 320,
      position: 'relative',
      width: '100%',
    },
    imageBox: { position: 'relative' },
    cardMedia: { objectFit: 'cover' },
    chipTopLeft: {
      background: theme.palette.background.paper,
      fontSize: '0.8rem',
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      padding: '4px 8px',
      color: theme.palette.text.primary,
      position: 'absolute',
      top: 0,
      left: 20,
      display: 'flex',
      gap: 1,
    },
    chipTopRight: { position: 'absolute', top: 12, right: 12 },
    chipEvento: { background: '#e0f2ff', color: '#0077cc' },

    cardContent: {
      pt: 2,
      mb: 4,
      display: 'flex',
      gap: 2,
      flexDirection: 'column',
      /**
       * Os cartões de uma linha têm a mesma altura, e o que cada um tem para
       * dizer varia: um mostra aviso de termo, o vizinho não. Com
       * `space-between` a sobra caía no meio do cartão mais curto — título em
       * cima, um buraco, e a informação colada nos botões, como se o cartão
       * tivesse sido esticado. Alinhado ao topo, a sobra vai para baixo, onde
       * já mora o rodapé de botões, e as linhas de informação de todos os
       * cartões começam na mesma altura.
       */
      justifyContent: 'flex-start',

      height: "calc(100% - 160px)",

    },
    title: { fontSize: '1.1rem', fontWeight: 500 },
    description: { fontSize: '0.875rem', color: 'text.secondary', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' },
    icon: { color: theme.palette.text.secondary, fontSize: '20px' },
    infoText: { fontSize: '0.875rem' },
    progressBox: { flexGrow: 1 },
    progressBar: {
      height: 8,
      borderRadius: 5,
      '&.MuiLinearProgress-colorPrimary': {
        backgroundColor: '#ebececff',
      },
    },
    stackButton: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      borderRadius: 2,
    },
  };
  return (<>
    <Paper sx={styles.card}>
      <Box sx={styles.imageBox}>
        <CardMedia
          component="img"
          height="120"
          image={
            payment?.data['coverUrl'] || CapaLogin
          }
          alt={payment?.data?.name}
          sx={styles.cardMedia}
        />
        
      {payment?.data?.logoUrl && (
          <img
            src={payment?.data?.logoUrl}
            alt="Logo do Evento"
            style={styles.bannerLogo as any}
          />
        )}

      </Box>

      <CardContent sx={styles.cardContent}>
        <Stack>
          <Typography sx={styles.title}>{payment?.eventName}</Typography>

        </Stack>

        <Stack gap={1} bottom={0}>

  

          {/* a linha aparece mesmo na igreja que não cobra online: o que o
            módulo desligado tira é o botão de pagar, não a dívida */}
          <Stack direction="row" alignItems="center" gap={1}>
            <AttachMoney sx={styles.icon} />
            <Typography sx={styles.infoText} color={emAberto === 0 ? 'success.main' : 'warning.main'}>
              {emAberto === 0 ?"Pagamento(s) concluído(s)":`${emAberto} Pagamento(s) pendente(s)`}
            </Typography>
          </Stack>
          {!modulePayment && emAberto > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5, mt: -0.5 }}>
              Acerte com a organização.
            </Typography>
          )}
          <Stack direction="row" alignItems="center" gap={1}>
            <LocalActivity sx={styles.icon} />
            <Typography sx={styles.infoText} color="text.secondary">
              {payment?.registeredRoles.length} inscrições
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <HourglassBottom sx={styles.icon} />
            <Typography sx={styles.infoText} color="text.secondary">
              {payment?.waitlistRoles.length} Lista de espera
            </Typography>
          </Stack>

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
              {payment.minorApprovalStatus !== 'APPROVED' && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setGuardianModalOpen(true)}
                >
                  {payment.signedTermUrl ? 'Reenviar termo' : 'Anexar termo'}
                </Button>
              )}
            </Stack>
          )}

        </Stack>

        <Stack sx={styles.stackButton} direction="row" justifyContent="space-between" gap={1}>
          <Button
          fullWidth
            variant="outlined"
            
            size="small"

            onClick={() => navigate(`/eventos/${payment.eventId}`)}
          >
            Ver Evento
          </Button>
          {modulePayment && (
            <Button
              fullWidth
              variant="contained"
              size="small"
              color='success'
              onClick={() => handleOpenModal(payment)}
            >
              Pagamentos
            </Button>
          )}
        </Stack>
      </CardContent>
    </Paper>
      {modulePayment && (
        <ModalPayment
          open={Boolean(dataModal)}
          handleClose={handleCloseModal}
          payments={dataModal}
          eventId={payment.eventId}
          userId={JSON.parse(localStorage.getItem('user') || '{}').id}
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


/**
 * Título de uma das duas listas da página.
 *
 * O contador fica no chip ao lado do título, e não dentro do texto: é o número
 * que a pessoa procura quando abre a tela devendo alguma coisa.
 */
function Secao({
  icone,
  titulo,
  descricao,
  quantidade,
  cor,
  children,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
  quantidade: number;
  cor: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1}>
        {icone}
        <Typography fontWeight={600}>{titulo}</Typography>
        <CustomChip size="small" label={quantidade} customColor={cor} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        {descricao}
      </Typography>
      {children}
    </Box>
  );
}

function Cards() {
  const { id } =JSON.parse(localStorage.getItem('user') || '{}');
  const theme = useTheme();

  const { data = [] } = useGetPayments({ userId: id || '' });
  const payments = data as paymentsWithRoles[];
  const { pendentes, emDia } = separarPorPendencia(payments);

  const grade = (lista: paymentsWithRoles[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {lista.map((payment: paymentsWithRoles) => (
        <EventCard
          key={payment.eventId}
          payment={payment as paymentsWithRoles & { data: PaymentData }}
        />
      ))}
    </Box>
  );

  // sem nada pendente não há o que separar: dois títulos para uma lista só
  // seriam moldura em volta de nada
  if (pendentes.length === 0) return grade(emDia);

  return (
    <Stack gap={4}>
      <Secao
        icone={<ErrorOutline sx={{ color: theme.palette.chips.alert }} />}
        titulo="Esperando você"
        descricao="Pagamento em aberto ou termo de autorização faltando nestes eventos."
        quantidade={pendentes.length}
        cor={theme.palette.chips.alert}
      >
        {grade(pendentes)}
      </Secao>

      {emDia.length > 0 && (
        <Secao
          icone={<CheckCircleOutline sx={{ color: theme.palette.chips.success }} />}
          titulo="Em dia"
          descricao="Nada pendente por aqui."
          quantidade={emDia.length}
          cor={theme.palette.chips.success}
        >
          {grade(emDia)}
        </Secao>
      )}
    </Stack>
  );
}

export { Cards };
