import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
// import { Form } from '../../../../features/admin/events/components/formGeneralInfo';
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import { EventDetails } from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DateAndLocalFormType,
  EventLogoFormType,
  GeneralInfoFormType,
  RegistrationSettingsFormType,
} from '../../../../features/admin/events/types';
import {
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  PANELS,
  REGISTRATION_SETTINGS_SCHEMA,
} from '../../../../features/admin/events/constants';
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formRegistrationSettings';
import { FormDateAndLocal } from '../../../../features/admin/events/components/formDateAndLocal';

import { FormLogoAndCover } from '../../../../features/admin/events/components/formLogoAndCover';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEvents } from '../../../../features/admin/events/api/getEvents';
import { usePutUpdateEvent } from '../../../../features/admin/events/api/putEvent';
import React, { useEffect, useMemo, useState } from 'react';
import { FormGeneralInfo } from '../../../../features/admin/events/components/formGeneralInfo';
import {
  // svgFileToText,
  svgTextToFile,
} from '../../../../features/admin/events/utils/fileConverters';
import { toast } from 'react-toastify';
import { Check } from '@mui/icons-material';

function Edit() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: eventData, isLoading } = useGetEvents(
    {
      eventId: id,
    },
    {
      enabled: !!id,
    }
  );
  const event = eventData as EventDetails;

  const getDefaultGeneralInfoValues = (
    event?: EventDetails
  ): GeneralInfoFormType => ({
    name: event?.name || '',
    description: event?.data?.description || '',
    shortDescription: event?.data?.shortDescription || '',
    groupLink: event?.groupLink || '',
    isActive: event?.isActive ?? true,
  });
  const getDefaultDateAndLocalValues = (
    event?: EventDetails
  ): DateAndLocalFormType => ({
    startDate: event?.startDate ? new Date(event.startDate) : new Date(),
    endDate: event?.endDate ? new Date(event.endDate) : new Date(),
    localName: event?.data?.localName || '',
    zipCode: event?.data?.zipCode || '',
    state: event?.data?.state || '',
    city: event?.data?.city || '',
    neighborhood: event?.data?.neighborhood || '',
    address: event?.data?.address || '',
    number: event?.data?.number || '',
    linkMaps: event?.data?.linkMaps || '',
  });
  const getDefaultRegistrationSettingsValues = (
    event?: EventDetails
  ): RegistrationSettingsFormType => ({
    groupRoles:
      event?.groupRoles.map((groupRole) => ({
        id: groupRole.id,
        name: groupRole.name,
        capacity: groupRole.capacity,
        roles: groupRole.roles.map((role) => ({
          price: role.price,
          description: role.description,
        })),
      })) || [],
  });
  const getDefaultEventLogoValues = (
    event?: EventDetails
  ): EventLogoFormType => ({
    eventLogo: event?.data?.logoFile
      ? [svgTextToFile(event.data.logoFile, 'logo.svg')]
      : undefined,
    eventCover: event?.data?.coverFile
      ? [svgTextToFile(event.data.coverFile, 'cover.svg')]
      : undefined,
  });

  const [currentStep, setCurrentStep] = useState(1);
  // const methodsCategoryEvent = useForm<CategoryEventFormType>({
  //   resolver: zodResolver(CATEGORY_EVENT_SCHEMA),
  //   defaultValues: {
  //     eventType: event?.type,
  //   },
  // });
  const methodsGeneralInfo = useForm<GeneralInfoFormType>({
    resolver: zodResolver(GENERAL_INFO_SCHEMA),
    defaultValues: getDefaultGeneralInfoValues(event),
  });
  const methodsDateAndTime = useForm<DateAndLocalFormType>({
    resolver: zodResolver(DATE_AND_LOCAL_SCHEMA),
    defaultValues: getDefaultDateAndLocalValues(event),
  });
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
    resolver: zodResolver(REGISTRATION_SETTINGS_SCHEMA),
    defaultValues: getDefaultRegistrationSettingsValues(event),
  });
  const methodsEventLogo = useForm<EventLogoFormType>({
    resolver: zodResolver(EVENT_LOGO_SCHEMA),
    defaultValues: getDefaultEventLogoValues(event),
  });
  const eventTypeSelected = useMemo(() => event?.type, [event]);
  useEffect(() => {
    if (event) {
      methodsGeneralInfo.reset(getDefaultGeneralInfoValues(event));
      methodsDateAndTime.reset(getDefaultDateAndLocalValues(event));
      methodsRegistrationSettings.reset(
        getDefaultRegistrationSettingsValues(event)
      );
      methodsEventLogo.reset(getDefaultEventLogoValues(event));
    }
  }, [event]);
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

  function registrationSettingsSubmit() {
    if (!id) {
      toast.error('Erro ao editar o evento');
      return;
    }
    methodsRegistrationSettings.trigger().then(async (isValid) => {
      if (isValid) {
        const generalInfoData = methodsGeneralInfo.getValues();
        const dateAndTimeData = methodsDateAndTime.getValues();
        const registrationSettingsData =
          methodsRegistrationSettings.getValues();
        // const eventLogoData = methodsEventLogo.getValues();

        try {
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
              // logoFile: logoSvgText, // Base64 string
              // coverFile: coverSvgText, // Base64 string
            },
          };
          console.log(finalDataBase64);
          // mutatePutUpdateEvent({ data: finalDataBase64, id: id! });
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

  const panelsMethods = [
    {
      step: 1,
      formMethods: methodsGeneralInfo,
      onSubmit: registrationSettingsSubmit,
      component: FormGeneralInfo,
      props: {},
    },
    {
      step: 2,
      formMethods: methodsDateAndTime,
      onSubmit: registrationSettingsSubmit,
      component: FormDateAndLocal,
      props: {},
    },
    {
      step: 3,
      formMethods: methodsEventLogo,
      onSubmit: registrationSettingsSubmit,
      component: FormLogoAndCover,
      props: {},
    },
    {
      step: 4,
      formMethods: methodsRegistrationSettings,
      onSubmit: registrationSettingsSubmit,
      component: FormRegistrationSettings,
      props: {},
    },
  ];

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return methodsGeneralInfo.formState.isValid;
      case 2:
        return methodsDateAndTime.formState.isValid;
      case 3:
        return methodsEventLogo.formState.isValid;
      case 4:
        return methodsRegistrationSettings.formState.isValid;
      default:
        return false;
    }
  };
  return (
    <PageStyle>
      <Header title="Editar evento" buttonBack />
      {isLoading ? (
        <Skeleton variant="rounded" height={495} />
      ) : (
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
              {PANELS.map(({ label, id, icon: Icon }) => (
                <Tab
                  key={id}
                  label={label}
                  value={id}
                  icon={<Icon />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Stack>
          <FormProvider
            {...(panelsMethods[currentStep - 1].formMethods as any)}
            key={currentStep - 1}
          >
            <form
              onSubmit={(
                panelsMethods[currentStep - 1].formMethods as any
              ).handleSubmit(panelsMethods[currentStep - 1].onSubmit)}
            >
              {React.createElement(
                panelsMethods[currentStep - 1].component as any,
                panelsMethods[currentStep - 1].props as any
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
                  sx={{ marginTop: 2, width: '200px' }}
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
      )}
    </PageStyle>
  );
}

export { Edit };
