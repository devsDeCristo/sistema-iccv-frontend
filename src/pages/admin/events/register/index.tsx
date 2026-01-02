import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { Form } from '../../../../features/admin/events/components/form';
import { Box, Button, Paper, Typography } from '@mui/material';
import { RegisterEventFormType } from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  REGISTER_EVENT_SCHEMA,
  STEPS,
} from '../../../../features/admin/events/constants';
import { usePostCreateEvent } from '../../../../features/admin/events/api/postEvent';
import { useNavigate } from 'react-router-dom';
import { StepProgress } from '../../../../components/step';
import { useState } from 'react';
import { ArrowForward } from '@mui/icons-material';

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const methods = useForm<RegisterEventFormType>({
    resolver: zodResolver(REGISTER_EVENT_SCHEMA),
  });

  const { mutate: mutatePostCreateEvent } = usePostCreateEvent({
    onSuccess: () => {
      navigate('/admin/eventos');
    },
  });

  function onSubmitForm(data: RegisterEventFormType) {
    mutatePostCreateEvent({
      data,
    });
  }
  // function
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // Se só tem uma integração disponível, seleciona automaticamente
      // if (currentStep === 1 && filteredIntegrations.length === 1) {
      //   setSelectedIntegration(filteredIntegrations[0].id);
      // }
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
  // const canProceed = () => {
  //   switch (currentStep) {
  //     case 1:
  //       // return true;
  //       return selectedCompany && selectedAccount && selectedType;
  //     case 2:
  //       // return true;
  //       return selectedIntegration;
  //     case 3:
  //       return configData?.covenantCode?.length >= 7;
  //     // case 4:
  //     // case 5:
  //     //   return configData?.covenantCode;
  //     //   return true;
  //     default:
  //       return false;
  //   }
  // };
  return (
    <PageStyle>
      <Header title="Cadastrar evento" buttonBack />
      <Paper
        sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}
      >
        <StepProgress
          steps={STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          // onStepClick={(index) => setStep(index)}
          className="sm:pl-10 sm:pr-15"
        />
        {currentStep === 1 && (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmitForm)}>
              <Form />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="contained"
                  sx={{ marginTop: 2, width: '120px' }}
                  type="submit"
                  endIcon={<ArrowForward />}
                >
                  Próximo
                </Button>
              </Box>
            </form>
          </FormProvider>
        )}
        {currentStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ marginTop: 4, marginBottom: 2 }}>
              Step 2
            </Typography>
          </Box>
        )}
      </Paper>
    </PageStyle>
  );
}

export { Register };
