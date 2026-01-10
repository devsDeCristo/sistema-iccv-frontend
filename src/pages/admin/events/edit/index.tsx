import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
// import { Form } from '../../../../features/admin/events/components/formGeneralInfo';
import { Box, Button, Paper, Stack, Tab, Tabs, useTheme } from '@mui/material';
import {
  Event,
  RegisterEventFormType,
} from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CategoryEventFormType,
  DateAndLocalFormType,
  EventLogoFormType,
  EventType,
  GeneralInfoFormType,
  RegistrationSettingsFormType,
} from '../../../../features/admin/events/types';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  STEPS,
} from '../../../../features/admin/events/constants';
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formRegistrationSettings';
import { FormDateAndLocal } from '../../../../features/admin/events/components/formDateAndLocal';
import { SelectCategoryEvent } from '../../../../features/admin/events/components/selectCategoryEvent';
import { FormLogoAndCover } from '../../../../features/admin/events/components/formLogoAndCover';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEvents } from '../../../../features/admin/events/api/getEvents';
import { usePutUpdateEvent } from '../../../../features/admin/events/api/putEvent';
import React, { useEffect, useState } from 'react';
import { FormGeneralInfo } from '../../../../features/admin/events/components/formGeneralInfo';
import { svgFileToText } from '../../../../features/admin/events/utils/fileConverters';
import { toast } from 'react-toastify';
import { Check } from '@mui/icons-material';

function Edit() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: eventData } = useGetEvents(
    {
      eventId: id,
    },
    {
      enabled: !!id,
    }
  );
  const event = eventData as Event;
  // const DEFAULT_VALUES: RegisterEventFormType = {
  //   name: event?.name || '',
  //   groupLink: event?.groupLink || '',
  //   isActive: event?.isActive || false,
  //   price: event?.price || 0,
  //   workerPrice: event?.workerPrice || 0,
  //   capacity: event?.capacity || 0,
  //   capacityWorker: event?.capacityWorker || 0,
  //   endDate: event?.endDate ? new Date(event.endDate) : new Date(),
  //   startDate: new Date(),
  // };
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
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
    resolver: zodResolver(REGISTRATION_SETTINGS_SCHEMA),
  });
  const methodsEventLogo = useForm<EventLogoFormType>({
    resolver: zodResolver(EVENT_LOGO_SCHEMA),
  });
  const [eventTypeSelected, setEventTypeSelected] = useState<
    EventType | undefined
  >(undefined);

  // useEffect(() => {
  //   methods.reset(DEFAULT_VALUES);
  // }, [eventData]);
  const styles = {
    tabs: {
      '& button': {
        color: theme.palette.text.disabled,
        textTransform: 'capitalize',
        minHeight: '20px',
        Height: '100%',
        borderRadius: '5px',
        paddingX: '10px',
      },
      '& .MuiTab-icon': { marginRight: '2px' },

      '& button.Mui-selected': {
        backgroundColor: theme.palette.background.paperSecondary,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: 'transparent',
        border: 'none',
      },
    },
  };
  const { mutate: mutatePutUpdateEvent } = usePutUpdateEvent({
    onSuccess: () => {
      navigate('/admin/eventos');
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // Se só tem uma integração disponível, seleciona automaticamente
      // if (currentStep === 1 && filteredIntegrations.length === 1) {
      //   setSelectedIntegration(filteredIntegrations[0].id);
      // }
      setCurrentStep(currentStep + 1);
    }
  };
  function onSubmitForm(data: RegisterEventFormType) {
    if (!id) return;
    mutatePutUpdateEvent({
      data,
      id,
    });
  }
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
      console.log(isValid, 'sds');

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
          const logoSvgText = eventLogoData.eventLogo?.[0]
            ? await svgFileToText(eventLogoData.eventLogo[0])
            : undefined;
          const coverSvgText = eventLogoData.eventCover?.[0]
            ? await svgFileToText(eventLogoData.eventCover[0])
            : undefined;
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
              logoFile: logoSvgText, // Base64 string
              coverFile: coverSvgText, // Base64 string
            },
          };
          console.log(finalDataBase64);
          mutatePutUpdateEvent({ data: finalDataBase64, id: id! });
        } catch (error) {
          console.error('Erro ao converter arquivos:', error);
          toast.error('Erro ao processar as imagens');
        }
      }
    });
  }
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
      props: { eventTypeSelected },
    },
    {
      step: 5,
      formMethods: methodsRegistrationSettings,
      onSubmit: registrationSettingsSubmit,
      component: FormRegistrationSettings,
      props: { eventTypeSelected },
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
      <Header title="Editar evento" buttonBack />
      <Paper
        sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}
      >
        <Stack>
          <Tabs
            variant="fullWidth"
            value={currentStep}
            sx={styles.tabs}
            onChange={(_, newValue) => {
              setCurrentStep(newValue);
            }}
          >
            {STEPS.map(({ label, id }) => (
              <Tab key={id} label={label} value={id} />
            ))}
          </Tabs>
        </Stack>
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
                endIcon={<Check />}
              >
                Salvar alterações
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Paper>
    </PageStyle>
  );
}

export { Edit };
