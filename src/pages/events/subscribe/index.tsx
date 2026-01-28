import { useNavigate, useParams } from 'react-router-dom';
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
import React, { useState } from 'react';
import { ArrowForward, Check } from '@mui/icons-material';
import { usePostRegisterUserInEvent } from '../../../features/admin/events/api/postRegisterUserInEvent';
import Swal from 'sweetalert2';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import { usePostCreateCheckoutEvent } from '../../../features/admin/events/api/postCreateCheckoutEvent';


function Subscribe() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loadingPayment, setLoadingPayment] = useState(false);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';

  const { data: eventData, isLoading } = useGetEvents(
    { eventId: id },
    { enabled: !!id }
  );
  const { data: groupsData } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  const event = eventData as EventDetails;
  const groups = groupsData as PayLoadGroup;

  const [currentStep, setCurrentStep] = useState(1);
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
  },
  onError: () => {
    navigate('/eventos/' + id);
  },
});

  const { mutate: mutateRegisterUserInEvent, isLoading: isLoadingRegister } =
    usePostRegisterUserInEvent({
      onSuccess: (data: any) => {
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
        // const admin = JSON.parse(localStorage.getItem('user') || '{}')?.id=='ea1c20f8-a2e1-41f4-9dd3-6e7c7a9a7666';

        // if(!admin){
        //   Swal.fire({
        //     title: 'Inscrição(ões) realizada(s) com sucesso!',
        //     text: allRegistered
        //       ? 'Suas inscrições foram confirmadas.'
        //       : 'Algumas inscrições ficaram na lista de espera.',
        //     icon: 'success',
        //     confirmButtonText: 'OK',
        //   }).then(() => {
        //     navigate('/eventos/' + id);
        //   });
        //   return;
        // }

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
            setLoadingPayment(true);
            mutateCreateCheckoutEvent({
              eventId: event!.id,
              userId,
              data: { roleId },
            });
          } else {
            navigate('/eventos/' + id);
          }
        });
      },

      onError: () => {
        Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao realizar a inscrição, tente novamente.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });

  const selectRoleSubmit = (data: SelectRoleFormType) => {
    if (event && event.id && data.groupRole) {
      const roleIds = data.groupRole.flatMap((gr) => gr.roleIds);
      mutateRegisterUserInEvent({
        eventId: event.id,
        userId,
        data: { roleId: roleIds },
      });
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
      props: { groupRoles: groupRolesSelected || null },
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
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        mt: 'auto',
        ml: 'auto',
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
      <Header title="Inscrever-se" buttonBack />
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" gutterBottom>
            {event.name}
          </Typography>
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
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  variant="outlined"
                  sx={{ marginTop: 2, width: '120px' }}
                  onClick={currentStep === 1 ? handleClose : handleBack}
                >
                  {currentStep === 1 ? 'Cancelar' : 'Voltar'}
                </Button>
                <Button
                  variant="contained"
                  sx={{ marginTop: 2, width: '120px' }}
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
        </Paper>
      )}
    </PageStyle>
  );
}

export { Subscribe };
