import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { FormGeneralInfo } from '../../../../features/admin/events/components/formGeneralInfo';
import { Box, Button, Paper, Typography } from '@mui/material';
import {
  DateAndTimeFormType,
  GeneralInfoFormType,
  RegisterEventFormType,
  RegistrationSettingsFormType,
} from '../../../../features/admin/events/types';
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
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formSegistrationSettings';

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const methodsGeneralInfo = useForm<GeneralInfoFormType>({
    resolver: zodResolver(REGISTER_EVENT_SCHEMA),
  });
  const methodsDateAndTime = useForm<DateAndTimeFormType>({
    resolver: zodResolver(REGISTER_EVENT_SCHEMA),
  });
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
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
  function generalInfoSubmit() {
    methodsGeneralInfo.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  function dateAndTimeSubmit() {
    methodsDateAndTime.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  function registrationSettingsSubmit() {
    methodsRegistrationSettings.trigger().then((isValid) => {
      if (isValid) {
        const generalInfoData = methodsGeneralInfo.getValues();
        const dateAndTimeData = methodsDateAndTime.getValues();
        const registrationSettingsData =
          methodsRegistrationSettings.getValues();
        const finalData = {
          ...generalInfoData,
          ...dateAndTimeData,
          ...registrationSettingsData,
        };
        onSubmitForm(finalData);
      }
    });
  }

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
          <FormProvider {...methodsGeneralInfo}>
            <form onSubmit={methodsGeneralInfo.handleSubmit(generalInfoSubmit)}>
              <FormGeneralInfo />
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
        {currentStep === 3 && (
          <FormProvider {...methodsRegistrationSettings}>
            <form
              onSubmit={methodsRegistrationSettings.handleSubmit(
                registrationSettingsSubmit
              )}
            >
              <FormRegistrationSettings />
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
      </Paper>
    </PageStyle>
  );
}

export { Register };
