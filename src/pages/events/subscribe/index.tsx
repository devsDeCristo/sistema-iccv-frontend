import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import {
  EventDetails,
  SelectGroupRoleFormType,
  SelectRoleFormType,
} from '../../../features/admin/events/types';
import { Box, Button, Paper, Skeleton, Typography } from '@mui/material';
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

function Subscribe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: eventData, isLoading } = useGetEvents(
    { eventId: id },
    { enabled: !!id }
  );
  const event = eventData as EventDetails;
  const [currentStep, setCurrentStep] = useState(1);

  const methodsSelectGroupRole = useForm<SelectGroupRoleFormType>({
    resolver: zodResolver(GROUP_ROLE_SELECT_SCHEMA),
  });
  const methodsSelectRole = useForm<SelectRoleFormType>({
    resolver: zodResolver(ROLE_SELECT_SCHEMA),
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
  const selectGroupRoleSubmit = () => {
    methodsSelectGroupRole.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  };
  const selectRoleSubmit = (data: SelectRoleFormType) => {
    console.log('Select Role Submit:', data);
  };
  const stepMethods = [
    {
      step: 1,
      formMethods: methodsSelectGroupRole,
      onSubmit: selectGroupRoleSubmit,
      component: FormSelectGroupRole,
      props: { event },
    },
    {
      step: 2,
      formMethods: methodsSelectRole,
      onSubmit: selectRoleSubmit,
      component: FormSelectRole,
      props: {},
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

  return (
    <PageStyle>
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
                  cancelar
                </Button>
                <Button
                  variant="contained"
                  sx={{ marginTop: 2, width: '120px' }}
                  type="submit"
                  disabled={!canProceedToNextStep()}
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
