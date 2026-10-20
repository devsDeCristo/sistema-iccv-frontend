import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { FormGeneralInfo } from '../../../../features/admin/events/components/formGeneralInfo';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import {
  CategoryEventFormType,
  EquipeFormType,
  DateAndLocalFormType,
  EventLogoFormType,
  EventType,
  GeneralInfoFormType,
  GroupRole,
  ProductsFormType,
  RegistrationSettingsFormType,
  ModulesFormType,
  TermsFormType,
} from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CATEGORY_EVENT_SCHEMA,
  DATE_AND_LOCAL_SCHEMA,
  EVENT_LOGO_SCHEMA,
  GENERAL_INFO_SCHEMA,
  PRODUCTS_SCHEMA,
  REGISTRATION_SETTINGS_SCHEMA,
  STEPS,
  MODULES_SCHEMA,
  TERMS_SCHEMA,
  GROUP_ROLE_RETIRO,
  GROUP_ROLE_CURSILHO,
} from '../../../../features/admin/events/constants';
import { usePostCreateEvent } from '../../../../features/admin/events/api/postEvent';
import { useNavigate } from 'react-router-dom';
import { StepProgress } from '../../../../components/step';
import React, { useEffect, useState } from 'react';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import { FormRegistrationSettings } from '../../../../features/admin/events/components/formRegistrationSettings';
import { FormDateAndLocal } from '../../../../features/admin/events/components/formDateAndLocal';
import { SelectCategoryEvent } from '../../../../features/admin/events/components/selectCategoryEvent';
import { FormLogoAndCover } from '../../../../features/admin/events/components/formLogoAndCover';
import { FormTerms } from '../../../../features/admin/events/components/formTerms';
import { FormEventModules } from '../../../../features/admin/events/components/formEventModules';
import { toast } from 'react-toastify';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { useRole } from '../../../../hooks/useRole';
import { FormProducts } from '../../../../features/admin/events/components/formProducts';
import { produtosParaEnvio } from '../../../../features/admin/events/products';
import {
  SEM_CERTIFICADO,
  certificadoParaEnvio,
} from '../../../../features/admin/events/api/certificado';
import { coresParaSalvar } from '../../../../features/admin/events/eventColors';
import { textoDoTermo } from '../../../../features/admin/events/terms';
import {
  FormEquipe,
  equipeParaEnvio,
} from '../../../../features/admin/events/components/formEquipe';

function Register() {
  const navigate = useNavigate();
  const { isSuperAdmin, igrejasQueAdministra } = useRole();
  // mesma condição do campo no formulário: só quem tem escolha precisa escolher
  const precisaEscolherIgreja = isSuperAdmin || igrejasQueAdministra.length > 1;
  const [currentStep, setCurrentStep] = useState(1);
  const methodsCategoryEvent = useForm<CategoryEventFormType>({
    resolver: zodResolver(CATEGORY_EVENT_SCHEMA),
  });

  const methodsGeneralInfo = useForm<GeneralInfoFormType>({
    resolver: zodResolver(GENERAL_INFO_SCHEMA),
    defaultValues: {
      status: 'ACTIVE',
    },
  });
  const methodsDateAndTime = useForm<DateAndLocalFormType>({
    resolver: zodResolver(DATE_AND_LOCAL_SCHEMA),
  });

  const methodsEventLogo = useForm<EventLogoFormType>({
    resolver: zodResolver(EVENT_LOGO_SCHEMA),
  });
  const methodsTerms = useForm<TermsFormType>({
    resolver: zodResolver(TERMS_SCHEMA),
    // a regra de sempre; o switch da etapa de termos sobe para 18
    defaultValues: { minorAgeLimit: 16 },
  });
  const methodsModules = useForm<ModulesFormType>({
    resolver: zodResolver(MODULES_SCHEMA),
    // tudo ligado: é o estado de quem não mexeu, e o de todos os eventos que
    // já existem
    defaultValues: {
      moduleBedrooms: true,
      moduleTeams: true,
      moduleTransport: true,
      showQuadrante: false,
      certificate: SEM_CERTIFICADO,
    },
    mode: 'onChange',
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
  const methodsProducts = useForm<ProductsFormType>({
    resolver: zodResolver(PRODUCTS_SCHEMA),
    defaultValues: { publicStore: false, products: [] },
  });
  // a equipe é opcional; a busca de pessoas é pela igreja do evento
  const methodsEquipe = useForm<EquipeFormType>({
    defaultValues: { admins: [], tesoureiros: [] },
  });
  const igrejaDoEvento =
    methodsGeneralInfo.watch('churchId') ||
    (igrejasQueAdministra.length === 1 ? igrejasQueAdministra[0].id : null);
  const { mutate: mutatePostCreateEvent, isLoading: isCreatingEvent } =
    usePostCreateEvent({
      onSuccess: () => {
        queryClient.invalidateQueries('GET_EVENTS');
        navigate('/admin/eventos');
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
      // o super admin não tem igreja no perfil para o backend herdar, então
      // sem esta escolha a criação volta com 400 lá no fim do formulário
      if (precisaEscolherIgreja && !methodsGeneralInfo.getValues().churchId) {
        methodsGeneralInfo.setError('churchId', {
          message: 'Escolha a igreja do evento',
        });
        return;
      }

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
  function modulesSubmit() {
    methodsModules.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  function termsSubmit() {
    methodsTerms.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  function registrationSettingsSubmit() {
    methodsRegistrationSettings.trigger().then((isValid) => {
      if (isValid) {
        handleNext();
      }
    });
  }
  /** Produtos são opcionais: a lista vazia passa direto */
  function productsSubmit() {
    methodsProducts.trigger().then((isValid) => {
      if (isValid) {
        setCurrentStep((passo) => passo + 1);
      }
    });
  }
  /**
   * Última etapa: a equipe é opcional. Os grupos e os produtos já foram
   * conferidos nas etapas deles, mas são conferidos de novo — o stepper deixa
   * clicar nas etapas e voltar a mexer neles.
   */
  function equipeSubmit() {
    if (isCreatingEvent) return;

    Promise.all([
      methodsRegistrationSettings.trigger(),
      methodsProducts.trigger(),
    ]).then(async ([gruposValidos, produtosValidos]) => {
      if (gruposValidos && produtosValidos) {
        const generalInfoData = methodsGeneralInfo.getValues();
        const dateAndTimeData = methodsDateAndTime.getValues();
        const registrationSettingsData =
          methodsRegistrationSettings.getValues();
        const eventLogoData = methodsEventLogo.getValues();
        const modulesData = methodsModules.getValues();
        const termsData = methodsTerms.getValues();

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
            churchId: generalInfoData.churchId,
            status: generalInfoData.status,
            startDate: new Date(dateAndTimeData.startDate),
            endDate: new Date(dateAndTimeData.endDate),
            type: eventTypeSelected!,
            groupRoles: registrationSettingsData.groupRoles,
            products: produtosParaEnvio(methodsProducts.getValues().products),
            ...equipeParaEnvio(methodsEquipe.getValues()),
            certificate: certificadoParaEnvio(modulesData.certificate),
            data: {
              description: generalInfoData.description,
              shortDescription: generalInfoData.shortDescription,
              hideVacancies: generalInfoData.hideVacancies,
              publicStore: !!methodsProducts.getValues().publicStore,
              localName: dateAndTimeData.localName,
              zipCode: dateAndTimeData.zipCode,
              state: dateAndTimeData.state,
              city: dateAndTimeData.city,
              neighborhood: dateAndTimeData.neighborhood,
              address: dateAndTimeData.address,
              number: dateAndTimeData.number,
              linkMaps: dateAndTimeData.linkMaps,
              registrationTerm: textoDoTermo(termsData.registrationTerm),
              minorAgeLimit: termsData.minorAgeLimit ?? 16,
              colors: coresParaSalvar(eventLogoData),
              modules: {
                bedrooms: modulesData.moduleBedrooms,
                teams: modulesData.moduleTeams,
                transport: modulesData.moduleTransport,
              },
              showQuadrante: modulesData.showQuadrante,
              // logoUrl: logoSvgText,
              // coverUrl: coverSvgText,
              // logoFile: logoSvgText, // Base64 string
              // coverFile: coverSvgText, // Base64 string
            },
          };
          // console.log(finalDataBase64);
          mutatePostCreateEvent({
            data: finalDataBase64,
            files: {
              logoFile: eventLogoData.eventLogo?.[0],
              coverFile: eventLogoData.eventCover?.[0],
              termFile: termsData.eventTerm?.[0],
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
      props: { status: methodsGeneralInfo.getValues().status },
    },
    {
      step: 4,
      formMethods: methodsModules,
      onSubmit: modulesSubmit,
      component: FormEventModules,
      props: {},
    },
    {
      step: 5,
      formMethods: methodsEventLogo,
      onSubmit: eventLogoSubmit,
      component: FormLogoAndCover,
      props: {
        eventName: methodsGeneralInfo.getValues().name,
        eventType: eventTypeSelected,
      },
    },
    {
      step: 6,
      formMethods: methodsTerms,
      onSubmit: termsSubmit,
      component: FormTerms,
      props: {},
    },
    {
      step: 7,
      formMethods: methodsRegistrationSettings,
      onSubmit: registrationSettingsSubmit,
      component: FormRegistrationSettings,
      props: {},
    },
    {
      step: 8,
      formMethods: methodsProducts,
      onSubmit: productsSubmit,
      component: FormProducts,
      props: {},
    },
    {
      step: 9,
      formMethods: methodsEquipe,
      onSubmit: equipeSubmit,
      component: FormEquipe,
      props: { churchId: igrejaDoEvento },
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
                startIcon={currentStep === 1 ? '' : <ArrowBack />}
                sx={{ marginTop: 2, width: '120px' }}
                onClick={currentStep === 1 ? handleClose : handleBack}
                disabled={isCreatingEvent}
              >
                {currentStep === 1 ? 'Cancelar' : 'Voltar'}
              </Button>
              <Button
                variant="contained"
                sx={{ marginTop: 2, width: '120px' }}
                type="submit"
                // sem trava pelo `isValid`: o react-hook-form só o calcula para
                // formulário que já mudou, e o passo opcional sem nada preenchido
                // (produtos, por exemplo) ficava travado. O clique já valida o
                // passo e mostra os erros
                disabled={isCreatingEvent}
                endIcon={
                  isCreatingEvent ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : currentStep === STEPS.length ? (
                    <Check />
                  ) : (
                    <ArrowForward />
                  )
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
