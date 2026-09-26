import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Paper, Skeleton, Typography } from '@mui/material';
import { ShoppingBagOutlined } from '@mui/icons-material';
import Swal from 'sweetalert2';

import CapaLogin from '../../../assets/capaLogin2.jpg';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import { usePostBuyEventProducts } from '../../../features/admin/events/api/postBuyEventProducts';
import {
  ehPagamentoForaDoSite,
  usePostCreateCheckoutEvent,
} from '../../../features/admin/events/api/postCreateCheckoutEvent';
import { temDisponivel } from '../../../features/admin/events/products';
import {
  EventDetails,
  PayLoadGroup,
} from '../../../features/admin/events/types';
import { ProductOffer } from '../../../features/events/components/productOffer';

/**
 * Loja do evento — a camisa que a pessoa decidiu levar uma semana depois de se
 * inscrever.
 *
 * A página é vitrine: o nome do evento fica no cabeçalho e o resto é produto.
 * Cada compra daqui é um pagamento próprio, separado do ingresso: o ingresso
 * pode já estar pago, e a compra nova aparece como compra nova, no painel e
 * em Minhas Inscrições. A vitrine abre para todos; com a loja restrita (o
 * padrão), só inscrito confirmado compra — os outros veem o aviso, e o
 * servidor recusa do mesmo jeito.
 */
function EventProducts() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const [abrindoPagamento, setAbrindoPagamento] = useState(false);

  const {
    data: eventData,
    isLoading: carregandoEvento,
    refetch: recarregarEvento,
  } = useGetEvents({ eventId: id }, { enabled: !!id });
  const { data: groupsData, isLoading: carregandoGrupos } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  const event = eventData as EventDetails | undefined;
  const grupos = (groupsData as PayLoadGroup | undefined)?.present ?? [];
  const modulePayment = event?.church?.modulePayment ?? true;

  // `present` são os grupos com inscrição confirmada, de todos os eventos
  const inscrito = grupos.some((grupo) =>
    event?.groupRoles?.some((grupoDoEvento) => grupoDoEvento.id === grupo.id)
  );
  const produtosAVenda = (event?.products ?? []).filter((produto) =>
    produto.variants.some((variante) => temDisponivel(variante.available))
  );

  // loja pública: qualquer pessoa com cadastro compra; restrita, só inscrito
  const compraRestrita = !inscrito && !event?.data?.publicStore;

  const voltarAoEvento = () => navigate(`/eventos/${id}`);

  const { mutate: abrirCheckout } = usePostCreateCheckoutEvent({
    onSuccess: (data: any) => {
      window.open(data.link, '_blank', 'noopener,noreferrer');
      voltarAoEvento();
    },
    // a compra já existe: o pagamento continua disponível em Minhas Inscrições
    onError: (erro) => {
      setAbrindoPagamento(false);

      /**
       * Igreja que não recebe pelo site: a compra está feita e o valor se
       * acerta com a organização. Aviso em modal, e não o toast vermelho de
       * erro — não há falha nenhuma aqui.
       */
      if (ehPagamentoForaDoSite(erro)) {
        Swal.fire({
          title: 'Compra registrada!',
          text: 'Esta igreja não recebe pagamento pelo site. O valor é combinado diretamente com a organização do evento.',
          icon: 'info',
          confirmButtonText: 'Entendi',
        }).then(() => navigate('/minhasInscricoes'));
        return;
      }

      navigate('/minhasInscricoes');
    },
  });

  const { mutate: comprar, isLoading: comprando } = usePostBuyEventProducts({
    onSuccess: (compra) => {
      if (modulePayment) {
        setAbrindoPagamento(true);
        abrirCheckout({
          eventId: id,
          userId,
          data: { paymentIds: [compra.paymentId] },
        });
        return;
      }

      Swal.fire({
        title: 'Compra registrada!',
        text: 'O pagamento é feito diretamente com a organização do evento.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(voltarAoEvento);
    },
    // a mensagem do servidor já saiu em toast; o estoque na tela é atualizado
    onError: () => {
      recarregarEvento();
    },
  });

  const carregando = carregandoEvento || carregandoGrupos;

  const aviso = (titulo: string, texto: string) => (
    <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
      <ShoppingBagOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
      <Typography fontWeight={600} sx={{ mt: 1 }}>
        {titulo}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 2, maxWidth: 420, mx: 'auto' }}
      >
        {texto}
      </Typography>
      <Button variant="outlined" onClick={voltarAoEvento}>
        Voltar ao evento
      </Button>
    </Paper>
  );

  return (
    <PageStyle>
      {/* o nome do evento está no cartaz, logo abaixo: repetir aqui era a
          terceira linha de texto antes do primeiro produto */}
      <Header title="Loja do evento" buttonBack pageBack={`/eventos/${id}`} />

      {carregando ? (
        <Skeleton variant="rounded" height={420} />
      ) : produtosAVenda.length === 0 ? (
        aviso(
          'Nenhum produto disponível',
          'Este evento não tem produtos à venda no momento.'
        )
      ) : (
        <ProductOffer
          products={produtosAVenda}
          modulePayment={modulePayment}
          coverUrl={event?.data?.coverUrl || CapaLogin}
          logoUrl={event?.data?.logoUrl}
          eventName={event?.name}
          loading={comprando || abrindoPagamento}
          subtitle="Pagamento separado da inscrição"
          skipLabel="Voltar ao evento"
          onSkip={voltarAoEvento}
          onConfirm={(items) => comprar({ eventId: id, userId, items })}
          bloqueio={
            compraRestrita
              ? 'As compras desta loja são exclusivas para quem tem inscrição confirmada no evento. Quem está na lista de espera pode comprar quando a vaga sair.'
              : undefined
          }
        />
      )}
    </PageStyle>
  );
}

export { EventProducts };
