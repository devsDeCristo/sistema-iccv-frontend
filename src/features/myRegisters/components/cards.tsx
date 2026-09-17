import {
  Paper,
  CardContent,
  Typography,
  Box,
  Stack,
  useTheme,
  Button,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  AttachMoney,
  HourglassBottom,
  LocalActivity,
  
} from '@mui/icons-material';

import { paymentsWithRoles } from '../types';
import { useGetPayments } from '../api/getPaymentByUser';
import { ModalPayment } from './modalPayment';
import React from 'react';
import CapaLogin from '../../../assets/capaLogin2.jpg';

interface PaymentData {
  coverUrl: string;
  logoUrl?: string;
  name?: string;
}

function EventCard({ payment }: { payment: paymentsWithRoles & { data: PaymentData } }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dataModal, setDataModal] = React.useState<any>(null);

  // A igreja dona deste evento cobra online? Antes era uma variável do front
  // inteiro; agora cada cartão responde pela igreja dele, e dois eventos de
  // igrejas diferentes aparecem lado a lado com respostas diferentes.
  const modulePayment = payment.modulePayment;

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
      justifyContent: 'space-between',

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
  // compra de produto em aberto também é dívida: sem ela aqui o cartão diria
  // "tudo pago" com a camisa ainda por pagar
  const fullPaid = [
    ...(payment?.registeredRoles ?? []).map((role) => role.paymentStatus),
    ...(payment?.productPurchases ?? []).map((compra) => compra.status),
  ].every((status) => status === 'PAID');

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

          {modulePayment && (
            <Stack direction="row" alignItems="center" gap={1}>
              <AttachMoney sx={styles.icon} />
              <Typography sx={styles.infoText} color={fullPaid ? 'success.main' : 'warning.main'}>
                {fullPaid ?"Todas as inscrições pagas":"Inscrições aguardando pagamento"}
              </Typography>
            </Stack>
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
      )} </>


  );
}


function Cards() {
  const { id } =JSON.parse(localStorage.getItem('user') || '{}');
  
  const { data = [] } = useGetPayments({ userId: id || '' });
  const payments = data as paymentsWithRoles[];
  

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.isArray(payments)
        ? payments
            .map((payment: paymentsWithRoles) => <EventCard key={payment.eventId} payment={payment as paymentsWithRoles & { data: PaymentData }} />)
        : null}
      </Box>
     
    </>
  );
}

export { Cards };
