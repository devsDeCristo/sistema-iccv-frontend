import { useBlocker, useNavigate, useParams } from 'react-router-dom';
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
  Grid,
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
import { SubscribeHero } from '../../../features/events/components/subscribeHero';
import { SubscribeStepper } from '../../../features/events/components/subscribeStepper';
import {
  ItemDoResumo,
  ProdutoDoResumo,
  SubscribeSummary,
} from '../../../features/events/components/subscribeSummary';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';

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
  /**
   * O aviso do termo de menor foi lido.
   *
   * Estado da página, e não campo do formulário: o schema de seleção de regra
   * é o mesmo para todo mundo, e exigir o aceite nele travaria também a
   * inscrição de quem é maior de idade — que nem chega a ver o aviso.
   */
  const [avisoMenorLido, setAvisoMenorLido] = useState(false);
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

  /**
   * A sacola da loja, espelhada aqui para o resumo somar ingresso e produto no
   * mesmo lugar. Quem manda na escolha continua sendo a vitrine; isto é cópia
   * para leitura.
   */
  const [produtosNaSacola, setProdutosNaSacola] = useState<ProdutoDoResumo[]>(
    []
  );

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
        // a inscrição já está feita; igreja sem cobrança online só devolve a
        // pessoa para o evento, sem alarde
        silenciarSemCobranca: true,
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
        avisoLido: avisoMenorLido,
        onAvisoLidoChange: setAvisoMenorLido,
      },
    },
  ];

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return methodsSelectGroupRole.formState.isValid;
      case 2:
        // menor de 16 só avança depois de marcar que leu o aviso do termo
        return (
          methodsSelectRole.formState.isValid && (!isMinor || avisoMenorLido)
        );
      default:
        return false;
    }
  };

  /**
   * O que a pessoa escolheu até agora, para o resumo ao lado.
   *
   * Lê os dois formulários em tempo real: os grupos entram no passo 1 e o
   * ingresso de cada um no passo 2, então a mesma linha do resumo nasce sem
   * preço e ganha o valor quando o ingresso é escolhido.
   */
  const gruposEscolhidos = methodsSelectGroupRole.watch('groupRoleId') ?? [];
  const escolhasDeIngresso = methodsSelectRole.watch('groupRole') ?? [];

  const itensDoResumo: ItemDoResumo[] = (event?.groupRoles ?? [])
    .filter((grupo) => grupo.id && gruposEscolhidos.includes(grupo.id))
    .map((grupo) => {
      const escolha = escolhasDeIngresso.find(
        (item) => item?.groupRoleId === grupo.id
      );
      const ingresso = grupo.roles?.find(
        (role) => role.id && escolha?.roleIds?.includes(role.id)
      );

      return {
        grupoId: grupo.id!,
        grupo: grupo.name,
        ingresso: ingresso?.description,
        preco: ingresso?.price,
      };
    });

  /**
   * Os passos da régua. "Produtos" só existe quando o evento tem o que vender —
   * anunciar um passo que não vai acontecer é pior que não anunciar nenhum.
   */
  const passos = [
    'Grupos',
    'Ingressos',
    ...(produtosAVenda.length > 0 ? ['Produtos'] : []),
  ];
  const passoAtual = ofertaDeProdutos ? passos.length : currentStep;

  const etapaNoCartaz = ofertaDeProdutos
    ? 'Produtos do evento'
    : currentStep === 1
      ? 'Inscrição · escolha dos grupos'
      : 'Inscrição · escolha dos ingressos';

  const styles = {
    superficie: {
      p: { xs: 2, sm: 3 },
      borderRadius: 3,
      border: '1px solid',
      borderColor: alpha(theme.palette.text.primary, 0.08),
    },
    acoes: {
      display: 'flex',
      flexDirection: { xs: 'column-reverse', sm: 'row' },
      justifyContent: 'space-between',
      gap: 1.5,
      mt: 3,
      pt: 2.5,
      borderTop: '1px solid',
      borderColor: alpha(theme.palette.text.primary, 0.08),
    },
    voltar: {
      height: 42,
      px: 2.5,
      borderRadius: 999,
      textTransform: 'none',
      fontWeight: 600,
    },
    /** a mesma pílula de ação principal da página do evento e da home */
    avancar: {
      height: 42,
      px: 3,
      borderRadius: 999,
      textTransform: 'none',
      fontWeight: 600,
      color: '#fff',
      backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
      boxShadow: `0 12px 28px -12px ${alpha(
        AZUL_VIVO,
        theme.palette.mode === 'dark' ? 0.5 : 0.95
      )}`,
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: 220,
      }),
      '&:hover, &:focus-visible': {
        transform: 'scale(1.035)',
      },
      '&.Mui-disabled': {
        color: alpha('#fff', 0.7),
        backgroundImage: 'none',
        backgroundColor: alpha(theme.palette.text.primary, 0.18),
        boxShadow: 'none',
      },
    },
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
      {loadingPayment && <Loading />}

      {isLoading ? (
        <Skeleton
          variant="rounded"
          width="100%"
          height={132}
          sx={{ mb: 2.5 }}
        />
      ) : (
        <SubscribeHero
          event={event}
          etapa={etapaNoCartaz}
          onVoltar={handleClose}
        />
      )}

      {isLoading ? (
        <Skeleton variant="rounded" width="100%" height={320} />
      ) : (
        <>
          {/* a régua continua na loja: ali ela marca o terceiro passo, que é
            justamente o que está acontecendo */}
          <SubscribeStepper passos={passos} atual={passoAtual} />

          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <Paper sx={styles.superficie}>
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
                    onSelecaoChange={setProdutosNaSacola}
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

                      <Box sx={styles.acoes}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          sx={styles.voltar}
                          onClick={currentStep === 1 ? handleClose : handleBack}
                        >
                          {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                        </Button>

                        <Button
                          type="submit"
                          sx={styles.avancar}
                          disabled={
                            !canProceedToNextStep() || isLoadingRegister
                          }
                          endIcon={
                            currentStep === STEPS_SUB.length ? (
                              <Check />
                            ) : (
                              <ArrowForward />
                            )
                          }
                        >
                          {currentStep === STEPS_SUB.length
                            ? 'Confirmar inscrição'
                            : 'Continuar'}
                        </Button>
                      </Box>
                    </form>
                  </FormProvider>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <SubscribeSummary
                itens={itensDoResumo}
                produtos={produtosNaSacola}
                mostrarValores={modulePayment}
              />
            </Grid>
          </Grid>
        </>
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
