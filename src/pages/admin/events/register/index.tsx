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
  DATE_AND_TIME_SCHEMA,
  GENERAL_INFO_SCHEMA,
  REGISTER_EVENT_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  STEPS,
} from '../../../../features/admin/events/constants';
import { usePostCreateEvent } from '../../../../features/admin/events/api/postEvent';
import { useNavigate } from 'react-router-dom';
import { StepProgress } from '../../../../components/step';
import React, { useState } from 'react';
import { ArrowForward, Check } from '@mui/icons-material';
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formRegistrationSettings';
import { FormDateAndTime } from '../../../../features/admin/events/components/formDateAndTime';

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const methodsGeneralInfo = useForm<GeneralInfoFormType>({
    resolver: zodResolver(GENERAL_INFO_SCHEMA),
  });
  const methodsDateAndTime = useForm<DateAndTimeFormType>({
    resolver: zodResolver(DATE_AND_TIME_SCHEMA),
  });
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
    resolver: zodResolver(REGISTRATION_SETTINGS_SCHEMA),
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
        // onSubmitForm(finalData);
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
  const stepMethods = [
    {
      step: 1,
      formMethods: methodsGeneralInfo,
      onSubmit: generalInfoSubmit,
      component: FormGeneralInfo,
    },
    {
      step: 2,
      formMethods: methodsDateAndTime,
      onSubmit: dateAndTimeSubmit,
      component: FormDateAndTime,
    },
    {
      step: 3,
      formMethods: methodsRegistrationSettings,
      onSubmit: registrationSettingsSubmit,
      component: FormRegistrationSettings,
    },
  ];

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

        <FormProvider
          {...(stepMethods[currentStep - 1].formMethods as any)}
          key={currentStep - 1}
        >
          <form
            onSubmit={(
              stepMethods[currentStep - 1].formMethods as any
            ).handleSubmit(stepMethods[currentStep - 1].onSubmit)}
          >
            {React.createElement(stepMethods[currentStep - 1].component)}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button
                variant="outlined"
                sx={{ marginTop: 2, width: '120px' }}
                onClick={handleBack}
              >
                cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ marginTop: 2, width: '120px' }}
                type="submit"
                endIcon={
                  currentStep === STEPS.length ? <Check /> : <ArrowForward />
                }
              >
                {currentStep === STEPS.length ? 'Finalizar' : 'Próximo'}
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Paper>
    </PageStyle>
  );
}

export { Register };
