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
          id: role.id,
          price: role.price || 0,
          description: role.description,
          registered: role.registered || 0,
        })),
      })) || [],
  });
  const getDefaultEventLogoValues = (
    event?: EventDetails
  ): EventLogoFormType => ({
    logoUrl: event?.data?.logoUrl ? event?.data?.logoUrl : undefined,
    coverUrl: event?.data?.coverUrl ? event?.data?.coverUrl : undefined,
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
    mode: 'onChange',
  });
  const methodsDateAndTime = useForm<DateAndLocalFormType>({
    resolver: zodResolver(DATE_AND_LOCAL_SCHEMA),
    defaultValues: getDefaultDateAndLocalValues(event),
    mode: 'onChange',
  });
  const methodsRegistrationSettings = useForm<RegistrationSettingsFormType>({
    resolver: zodResolver(REGISTRATION_SETTINGS_SCHEMA),
    defaultValues: getDefaultRegistrationSettingsValues(event),
    mode: 'onChange',
  });
  const methodsEventLogo = useForm<EventLogoFormType>({
    resolver: zodResolver(EVENT_LOGO_SCHEMA),
    defaultValues: getDefaultEventLogoValues(event),
    mode: 'onChange',
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
  const { mutate: mutatePutUpdateEvent, isLoading: isLoadingEdit } =
    usePutUpdateEvent({
      onSuccess: () => {
        navigate('/admin/eventos');
      },
    });

  async function registrationSettingsSubmit() {
    const [
      validDateAndTime,
      validGeneralInfo,
      validEventLogo,
      validRegistrationSettings,
    ] = await Promise.all([
      methodsDateAndTime.trigger(),
      methodsGeneralInfo.trigger(),
      methodsEventLogo.trigger(),
      methodsRegistrationSettings.trigger(),
    ]);

    if (
      !validDateAndTime ||
      !validGeneralInfo ||
      !validEventLogo ||
      !validRegistrationSettings
    ) {
      console.log(
        methodsDateAndTime.formState.errors,
        methodsGeneralInfo.formState.errors,
        methodsEventLogo.formState.errors,
        methodsRegistrationSettings.formState.errors
      );

      toast.error(
        'Não foi possível editar o evento. Verifique se todos os dados foram preenchidos corretamente.'
      );
      return;
    }

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
        const groupRolesWithouRegistered =
          registrationSettingsData.groupRoles.map(
            ({ roles, ...groupRole }) => ({
              ...groupRole,
              roles: roles.map(({ registered, ...role }) => ({
                ...role,
              })),
            })
          );
        registrationSettingsData.groupRoles = groupRolesWithouRegistered;
        try {
          const finalData = {
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
              // ...(methodsEventLogo.getValues().eventLogo?.[0]
              //   ? methodsEventLogo.getValues().logoUrl
              //     ? {
              //         logoUrl: methodsEventLogo.getValues().logoUrl,
              //       }
              //     : {}
              //   : {}),
              // ...(methodsEventLogo.getValues().eventCover?.[0]
              //   ? methodsEventLogo.getValues().coverUrl
              //     ? {
              //         coverUrl: methodsEventLogo.getValues().coverUrl,
              //       }
              //     : {}
              //   : {}),
            },
          };
          // console.log(finalData);
          mutatePutUpdateEvent({
            data: finalData,
            id: id!,
            files: {
              logoFile: methodsEventLogo.getValues().eventLogo?.[0],
              coverFile: methodsEventLogo.getValues().eventCover?.[0],
            },
          });
        } catch (error) {
          console.error('Erro ao converter arquivos:', error);
          toast.error('Erro ao processar as imagens');
        }
      }
    });
  }

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
      props: { isActive: methodsGeneralInfo.getValues().isActive },
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
                  onClick={handleClose}
                >
                  cancelar
                </Button>
                <Button
                  variant="contained"
                  sx={{ marginTop: 2, width: '200px' }}
                  type="submit"
                  disabled={isLoadingEdit}
                  // disabled={!canProceedToNextStep()}
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
