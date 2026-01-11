import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { FormGeneralInfo } from '../../../../features/admin/events/components/formGeneralInfo';
import { Box, Button, Paper } from '@mui/material';
import {
  CategoryEventFormType,
  DateAndLocalFormType,
  EventLogoFormType,
  EventType,
  GeneralInfoFormType,
  GroupRole,
  RegistrationSettingsFormType,
} from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  STEPS,
  GROUP_ROLE_RETIRO,
  GROUP_ROLE_CURSILHO,
} from '../../../../features/admin/events/constants';
import { usePostCreateEvent } from '../../../../features/admin/events/api/postEvent';
import { useNavigate } from 'react-router-dom';
import { StepProgress } from '../../../../components/step';
import React, { useEffect, useState } from 'react';
import { ArrowForward, Check } from '@mui/icons-material';
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formRegistrationSettings';
import { FormDateAndLocal } from '../../../../features/admin/events/components/formDateAndLocal';
import { SelectCategoryEvent } from '../../../../features/admin/events/components/selectCategoryEvent';
import { FormLogoAndCover } from '../../../../features/admin/events/components/formLogoAndCover';
import { toast } from 'react-toastify';
import { queryClient } from '../../../../config/lib/react-query/query-client';

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const methodsCategoryEvent = useForm<CategoryEventFormType>({
    resolver: zodResolver(CATEGORY_EVENT_SCHEMA),
  });

  const methodsGeneralInfo = useForm<GeneralInfoFormType>({
    resolver: zodResolver(GENERAL_INFO_SCHEMA),
    defaultValues: {
      isActive: true,
    },
  });
  const methodsDateAndTime = useForm<DateAndLocalFormType>({
    resolver: zodResolver(DATE_AND_LOCAL_SCHEMA),
  });

  const methodsEventLogo = useForm<EventLogoFormType>({
    resolver: zodResolver(EVENT_LOGO_SCHEMA),
  });
  const [eventTypeSelected, setEventTypeSelected] = useState<
    EventType | undefined
  >(undefined);
  const getDefaultGroupRoles = (eventType: EventType): GroupRole[] => {
    return eventType === 'RETIRO' ? GROUP_ROLE_RETIRO : GROUP_ROLE_CURSILHO;
  };
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
    resolver: zodResolver(REGISTRATION_SETTINGS_SCHEMA),
    defaultValues: {
      groupRoles: eventTypeSelected
        ? getDefaultGroupRoles(eventTypeSelected!)
        : [],
    },
  });
  useEffect(() => {
    if (!eventTypeSelected) return;
    const defaultGroupRoles: GroupRole[] =
      eventTypeSelected === 'RETIRO' ? GROUP_ROLE_RETIRO : GROUP_ROLE_CURSILHO;

    methodsRegistrationSettings.reset({
      groupRoles: defaultGroupRoles,
    });
  }, [eventTypeSelected]);
  const { mutate: mutatePostCreateEvent } = usePostCreateEvent({
    onSuccess: () => {
      queryClient.invalidateQueries('GET_EVENTS');
      navigate('/admin/eventos');
    },
    onError: (error) => {
      toast.error(`Erro ao criar evento: ${error}`);
    },
  });

  function categoryEventSubmit() {
    methodsCategoryEvent.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
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
  function eventLogoSubmit() {
    methodsEventLogo.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  function registrationSettingsSubmit() {
    methodsRegistrationSettings.trigger().then(async (isValid) => {
      if (isValid) {
        const generalInfoData = methodsGeneralInfo.getValues();
        const dateAndTimeData = methodsDateAndTime.getValues();
        const registrationSettingsData =
          methodsRegistrationSettings.getValues();
        const eventLogoData = methodsEventLogo.getValues();

        try {
          // OPÇÃO 2: Converter para Base64 e enviar como JSON
          // const logoBase64 = eventLogoData.eventLogo?.[0]
          //   ? await fileToBase64(eventLogoData.eventLogo[0])
          //   : undefined;
          // const coverBase64 = eventLogoData.eventCover?.[0]
          //   ? await fileToBase64(eventLogoData.eventCover[0])
          //   : undefined;
          // OPÇÃO 3: Para SVG, pode enviar como texto XML direto
          // const logoSvgText = eventLogoData.eventLogo?.[0]
          //   ? await svgFileToText(eventLogoData.eventLogo[0])
          //   : undefined;
          // const coverSvgText = eventLogoData.eventCover?.[0]
          //   ? await svgFileToText(eventLogoData.eventCover[0])
          //   : undefined;
          const finalDataBase64 = {
            name: generalInfoData.name,
            groupLink: generalInfoData.groupLink || '',
            isActive: generalInfoData.isActive,
            startDate: new Date(dateAndTimeData.startDate),
            endDate: new Date(dateAndTimeData.endDate),
            type: eventTypeSelected!,
            groupRoles: registrationSettingsData.groupRoles,
            data: {
              description: generalInfoData.description,
              shortDescription: generalInfoData.shortDescription,
              localName: dateAndTimeData.localName,
              zipCode: dateAndTimeData.zipCode,
              state: dateAndTimeData.state,
              city: dateAndTimeData.city,
              neighborhood: dateAndTimeData.neighborhood,
              address: dateAndTimeData.address,
              number: dateAndTimeData.number,
              linkMaps: dateAndTimeData.linkMaps,
              // logoUrl: logoSvgText,
              // coverUrl: coverSvgText,
              // logoFile: logoSvgText, // Base64 string
              // coverFile: coverSvgText, // Base64 string
            },
          };
          console.log(finalDataBase64);
          mutatePostCreateEvent({
            data: finalDataBase64,
            files: {
              logoFile: eventLogoData.eventLogo?.[0],
              coverFile: eventLogoData.eventCover?.[0],
            },
          });
        } catch (error) {
          console.error('Erro ao converter arquivos:', error);
          toast.error('Erro ao processar as imagens');
        }
      }
    });
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
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

  const stepMethods = [
    {
      step: 1,
      formMethods: methodsCategoryEvent,
      onSubmit: categoryEventSubmit,
      component: SelectCategoryEvent,
      props: { selectEventType: setEventTypeSelected },
    },
    {
      step: 2,
      formMethods: methodsGeneralInfo,
      onSubmit: generalInfoSubmit,
      component: FormGeneralInfo,
      props: {},
    },
    {
      step: 3,
      formMethods: methodsDateAndTime,
      onSubmit: dateAndTimeSubmit,
      component: FormDateAndLocal,
      props: {},
    },
    {
      step: 4,
      formMethods: methodsEventLogo,
      onSubmit: eventLogoSubmit,
      component: FormLogoAndCover,
      props: {},
    },
    {
      step: 5,
      formMethods: methodsRegistrationSettings,
      onSubmit: registrationSettingsSubmit,
      component: FormRegistrationSettings,
      props: {},
    },
  ];

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return methodsCategoryEvent.formState.isValid;
      case 2:
        return methodsGeneralInfo.formState.isValid;
      case 3:
        return methodsDateAndTime.formState.isValid;
      case 4:
        return methodsEventLogo.formState.isValid;
      case 5:
        return methodsRegistrationSettings.formState.isValid;
      default:
        return false;
    }
  };

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
