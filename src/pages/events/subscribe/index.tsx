import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import {
  EventDetails,
  GroupRole,
  PayLoadGroup,
  SelectGroupRoleFormType,
  SelectRoleFormType,
} from '../../../features/admin/events/types';
import {
  alpha,
  Box,
  Button,
  Paper,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { FormSelectGroupRole } from '../../../features/admin/events/components/formSelectGroupRole';
import { FormSelectRole } from '../../../features/admin/events/components/formSelectRole';
import { FormProvider, useForm } from 'react-hook-form';
import {
  GROUP_ROLE_SELECT_SCHEMA,
  ROLE_SELECT_SCHEMA,
  STEPS_SUB,
} from '../../../features/admin/events/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowForward, Check } from '@mui/icons-material';
import { usePostRegisterUserInEvent } from '../../../features/admin/events/api/postRegisterUserInEvent';
import Swal from 'sweetalert2';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import { usePostCreateCheckoutEvent } from '../../../features/admin/events/api/postCreateCheckoutEvent';
import { usePostBuyEventProducts } from '../../../features/admin/events/api/postBuyEventProducts';
import { temDisponivel } from '../../../features/admin/events/products';
import { ProductOffer } from '../../../features/events/components/productOffer';
import { ExitProductOfferDialog } from '../../../features/events/components/exitProductOfferDialog';
import { EventTermsDialog } from '../../../features/events/components/eventTermsDialog';
import { temTermo } from '../../../features/admin/events/terms';
import { usePostGuardianTerm } from '../../../features/admin/events/api/postGuardianTerm';
import { useGetUsers } from '../../../features/admin/users/api/getUsers';
import { calculateAge } from '../../../utils';
import { User } from '../../../types/user';

function Subscribe() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';

  const {
    data: eventData,
    isLoading,
    refetch: refetchEvent,
  } = useGetEvents({ eventId: id }, { enabled: !!id });
  const { data: groupsData } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );
  const { data: loggedUserData } = useGetUsers(
    { userId },
    { enabled: !!userId }
  );
  const loggedUser = loggedUserData as User | undefined;

  const event = eventData as EventDetails;

  const isMinor = Boolean(
    loggedUser?.birthday &&
      event?.startDate &&
      calculateAge(new Date(loggedUser.birthday), new Date(event.startDate)) < 16
  );
  const [signedTermFile, setSignedTermFile] = useState<File | null>(null);
  const { mutate: mutatePostGuardianTerm } = usePostGuardianTerm();

  const termoDoEvento = event?.data?.registrationTerm || '';
  const exigeTermo = temTermo(termoDoEvento);
  /**
   * As regras escolhidas, esperando o aceite do termo. Enquanto está aqui a
   * inscrição ainda não foi enviada: evento com termo não cria inscrição para
   * depois pedir o aceite — sem aceite não há inscrição nenhuma.
   */
  const [inscricaoAguardandoTermo, setInscricaoAguardandoTermo] = useState<
    string[] | null
  >(null);

  // Sem a igreja na resposta, assume ligado: é o padrão da coluna, e quem
  // recusa de fato é o servidor, que devolve 503 ao tentar abrir o checkout.
  const modulePayment = event?.church?.modulePayment ?? true;
  const groups = groupsData as PayLoadGroup;

  const [currentStep, setCurrentStep] = useState(1);
  /**
   * Preenchido quando a inscrição foi confirmada e o evento tem produto à
   * venda: a tela troca o formulário pela oferta. Guarda o que o pagamento
   * precisa para seguir depois dela.
   */
  const [ofertaDeProdutos, setOfertaDeProdutos] = useState<{
    roleId: string[];
    allRegistered: boolean;
  } | null>(null);

  /**
   * Sair da oferta sem seguir perde o pagamento combinado: os produtos
   * escolhidos aqui iriam no mesmo link do ingresso. Dá para comprar depois
   * pela página do evento, mas como compra separada — então qualquer saída
   * antes de seguir para o pagamento é confirmada: menu, voltar do navegador,
   * seta do cabeçalho.
   *
   * Ref, e não estado: quem libera a saída é o próprio fluxo, que navega logo
   * em seguida, e o bloqueador precisa ler o valor já atualizado nesse
   * instante, sem esperar outro render.
   */
  const saidaLiberada = useRef(false);
  const deveSegurarSaida = () => !!ofertaDeProdutos && !saidaLiberada.current;

  const bloqueioDeRota = useBlocker(
    ({ currentLocation, nextLocation }) =>
      deveSegurarSaida() && currentLocation.pathname !== nextLocation.pathname
  );

  // recarregar ou fechar a aba não passa pelo roteador: o navegador só deixa
  // mostrar o aviso genérico dele
  useEffect(() => {
    if (!ofertaDeProdutos) return;

    const avisar = (evento: BeforeUnloadEvent) => {
      if (!deveSegurarSaida()) return;
      evento.preventDefault();
      evento.returnValue = '';
    };

    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [ofertaDeProdutos]);

  // variante esgotada não conta: produto sem nada à venda nem aparece
  const produtosAVenda = (event?.products ?? []).filter((produto) =>
    produto.variants.some((variante) => temDisponivel(variante.available))
  );
  const [groupRolesSelected, setGroupRolesSelected] = useState<
    GroupRole[] | null
  >(null);

  const methodsSelectGroupRole = useForm<SelectGroupRoleFormType>({
    resolver: zodResolver(GROUP_ROLE_SELECT_SCHEMA),
    defaultValues: {
      groupRoleId: [],
    },
  });
  const methodsSelectRole = useForm<SelectRoleFormType>({
    resolver: zodResolver(ROLE_SELECT_SCHEMA),
    defaultValues: {
      groupRole: [],
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS_SUB.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleClose = () => {
    navigate(-1);
  };
  const selectGroupRoleSubmit = (data: SelectGroupRoleFormType) => {
    methodsSelectGroupRole.trigger().then((isValid) => {
      if (isValid) {
        setGroupRolesSelected(
          event.groupRoles.filter((gr) => data.groupRoleId.includes(gr.id!))
        );
        handleNext();
      }
    });
  };

  const { mutate: mutateCreateCheckoutEvent } = usePostCreateCheckoutEvent({
    onSuccess: (data: any) => {
      const link = data.link;

      window.open(link, '_blank', 'noopener,noreferrer');
      setLoadingPayment(false);
      navigate('/eventos/' + id);
    },
    onError: () => {
      navigate('/eventos/' + id);
    },
  });

  /**
   * O que vem depois da inscrição (e da oferta de produtos, quando houver).
   *
   * `pagarAgora` pula a pergunta "deseja pagar agora?": quem acabou de clicar
   * em "Adicionar e ir para o pagamento" já respondeu.
   */
  function seguirParaPagamento(
    roleId: string[],
    allRegistered: boolean,
    pagarAgora = false,
    /** a compra de produtos, quando ela virou pagamento próprio */
    paymentIds: string[] = []
  ) {
    // daqui em diante a saída é do fluxo, não um abandono da oferta
    saidaLiberada.current = true;

    if (!modulePayment) {
      Swal.fire({
        title: 'Inscrição(ões) realizada(s) com sucesso!',
        text: allRegistered
          ? 'Suas inscrições foram confirmadas.'
          : 'Algumas inscrições ficaram na lista de espera.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/eventos/' + id);
      });
      return;
    }

    const abrirCheckout = () => {
      setLoadingPayment(true);
      mutateCreateCheckoutEvent({
        eventId: event!.id,
        userId,
        data: { roleId, paymentIds },
      });
    };

    if (pagarAgora) {
      abrirCheckout();
      return;
    }

    // Caso 1 e 2: existe pelo menos uma registrada
    Swal.fire({
      title: 'Inscrição(ões) realizada(s) com sucesso!',
      text: allRegistered
        ? 'Deseja realizar o pagamento agora?'
        : 'Algumas inscrições ficaram na lista de espera. Deseja realizar o pagamento apenas das confirmadas?',
      icon: 'success',
      showCancelButton: true,
      cancelButtonText: 'Não',
      confirmButtonText: 'Sim',
      confirmButtonColor: theme.palette.success.main,
      cancelButtonColor: theme.palette.error.main,
    }).then((result) => {
      if (result.isConfirmed) {
        abrirCheckout();
      } else {
        navigate('/eventos/' + id);
      }
    });
  }

  const { mutate: mutateRegisterUserInEvent, isLoading: isLoadingRegister } =
    usePostRegisterUserInEvent({
      onSuccess: (data: any) => {
        setInscricaoAguardandoTermo(null);

        if (isMinor && signedTermFile && event?.id) {
          mutatePostGuardianTerm({
            eventId: event.id,
            userId,
            termFile: signedTermFile,
          });
        }

        const payload = data as any[];
        const roleId = payload.map((i) => i.roleId);
        const allRegistered = payload.every((i) => i.type === 'REGISTERED');
        const allWaitlist = payload.every((i) => i.type === 'WAITLIST');

        // Caso 3: tudo ficou em lista de espera
        if (allWaitlist) {
          Swal.fire({
            title: 'Inscrição(ões) realizada(s) com sucesso!',
            text: 'No momento suas inscrições ficaram na lista de espera. Você será notificado caso surja vaga.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            navigate('/eventos/' + id);
          });
          return;
        }

        // produtos só depois da inscrição confirmada, e antes do pagamento:
        // quem caiu inteiro na lista de espera já saiu lá em cima
        if (produtosAVenda.length > 0) {
          setOfertaDeProdutos({ roleId, allRegistered });
          return;
        }

        seguirParaPagamento(roleId, allRegistered);
      },

      onError: () => {
        setInscricaoAguardandoTermo(null);
        Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao realizar a inscrição, tente novamente.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });

  const { mutate: comprarProdutos, isLoading: comprandoProdutos } =
    usePostBuyEventProducts({
      onSuccess: (compra) => {
        if (!ofertaDeProdutos) return;
        // o id vai sempre: se os produtos entraram no ingresso ele é o do
        // próprio ingresso, e o servidor não cobra duas vezes a mesma linha
        seguirParaPagamento(
          ofertaDeProdutos.roleId,
          ofertaDeProdutos.allRegistered,
          true,
          [compra.paymentId]
        );
      },
      // a mensagem do servidor já saiu em toast ("Camisa (P) esgotou"); a
      // pessoa continua na oferta, agora com o estoque atualizado
      onError: () => {
        refetchEvent();
      },
    });

  const enviarInscricao = (roleIds: string[], aceitouTermo: boolean) => {
    mutateRegisterUserInEvent({
      eventId: event.id,
      userId,
      data: {
        roleId: roleIds,
        ...(aceitouTermo ? { acceptedTerms: true } : {}),
      },
    });
  };

  const selectRoleSubmit = (data: SelectRoleFormType) => {
    if (event && event.id && data.groupRole) {
      const roleIds = data.groupRole.flatMap((gr) => gr.roleIds);

      // com termo, nada é enviado antes do aceite; sem termo, o fluxo é o de
      // sempre e a pessoa não vê diálogo nenhum
      if (exigeTermo) {
        setInscricaoAguardandoTermo(roleIds);
        return;
      }

      enviarInscricao(roleIds, false);
    }
  };
  const stepMethods = [
    {
      step: 1,
      formMethods: methodsSelectGroupRole,
      onSubmit: selectGroupRoleSubmit,
      component: FormSelectGroupRole,
      props: { event, groups },
    },
    {
      step: 2,
      formMethods: methodsSelectRole,
      onSubmit: selectRoleSubmit,
      component: FormSelectRole,
      props: {
        groupRoles: groupRolesSelected || null,
        isMinor,
        minorTermUrl: event?.data?.minorTermUrl,
        signedTermFile,
        onSignedTermFileChange: setSignedTermFile,
      },
    },
  ];

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return methodsSelectGroupRole.formState.isValid;
      case 2:
        return methodsSelectRole.formState.isValid;
      default:
        return false;
    }
  };

  const Loading = () => (
    <Box
      sx={{
        zIndex: 1300,
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        textAlign: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: 'blur(4px)',
        backgroundColor: alpha(theme.palette.background.default, 0.8),
      }}
    >
      <Typography variant="h6" gutterBottom>
        Carregando Pagamento...
      </Typography>
      <Skeleton variant="rectangular" width={200} height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width={150} height={20} />
    </Box>
  );

  return (
    <PageStyle>
      {' '}
      {loadingPayment && <Loading />}
      <Header
        title={ofertaDeProdutos ? 'Produtos do evento' : 'Inscrever-se'}
        buttonBack
      />
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              wordBreak: 'break-word',
            }}
          >
            {event.name}
          </Typography>
          {ofertaDeProdutos ? (
            <ProductOffer
              products={produtosAVenda}
              modulePayment={modulePayment}
              loading={comprandoProdutos || loadingPayment}
              eyebrow="Inscrição confirmada"
              onConfirm={(items) =>
                comprarProdutos({
                  eventId: event.id,
                  userId,
                  items,
                  attachToRegistration: true,
                })
              }
              onSkip={() =>
                seguirParaPagamento(
                  ofertaDeProdutos.roleId,
                  ofertaDeProdutos.allRegistered
                )
              }
            />
          ) : (
            <FormProvider
              {...(stepMethods[currentStep - 1].formMethods as any)}
              key={currentStep - 1}
            >
              <form
                onSubmit={(
                  stepMethods[currentStep - 1].formMethods as any
                ).handleSubmit(stepMethods[currentStep - 1].onSubmit)}
              >
                {React.createElement(
                  stepMethods[currentStep - 1].component as any,
                  stepMethods[currentStep - 1].props as any
                )}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{ width: { xs: '100%', sm: '120px' } }}
                    onClick={currentStep === 1 ? handleClose : handleBack}
                  >
                    {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ width: { xs: '100%', sm: '120px' } }}
                    type="submit"
                    disabled={!canProceedToNextStep() || isLoadingRegister}
                    endIcon={
                      currentStep === STEPS_SUB.length ? (
                        <Check />
                      ) : (
                        <ArrowForward />
                      )
                    }
                  >
                    {currentStep === STEPS_SUB.length ? 'Finalizar' : 'Próximo'}
                  </Button>
                </Box>
              </form>
            </FormProvider>
          )}
        </Paper>
      )}
      <EventTermsDialog
        open={!!inscricaoAguardandoTermo}
        term={termoDoEvento}
        eventName={event?.name}
        loading={isLoadingRegister}
        onAccept={() => {
          if (inscricaoAguardandoTermo) {
            enviarInscricao(inscricaoAguardandoTermo, true);
          }
        }}
        onCancel={() => setInscricaoAguardandoTermo(null)}
      />
      <ExitProductOfferDialog
        open={bloqueioDeRota.state === 'blocked'}
        onStay={() => bloqueioDeRota.reset?.()}
        onLeave={() => bloqueioDeRota.proceed?.()}
      />
    </PageStyle>
  );
}

export { Subscribe };
