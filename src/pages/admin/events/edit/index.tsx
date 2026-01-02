import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { Form } from '../../../../features/admin/events/components/formGeneralInfo';
import { Button } from '@mui/material';
import {
  Event,
  RegisterEventFormType,
} from '../../../../features/admin/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_EVENT_SCHEMA } from '../../../../features/admin/events/constants';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetEvents } from '../../../../features/admin/events/api/getEvents';
import { usePutUpdateEvent } from '../../../../features/admin/events/api/putEvent';
import { useEffect } from 'react';

function Edit() {
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
  const DEFAULT_VALUES: RegisterEventFormType = {
    name: event?.name || '',
    groupLink: event?.groupLink || '',
    isActive: event?.isActive || false,
    price: event?.price || 0,
    workerPrice: event?.workerPrice || 0,
    capacity: event?.capacity || 0,
    capacityWorker: event?.capacityWorker || 0,
    endDate: event?.endDate ? new Date(event.endDate) : new Date(),
    startDate: new Date(),
  };
  const methods = useForm<RegisterEventFormType>({
    resolver: zodResolver(REGISTER_EVENT_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  useEffect(() => {
    methods.reset(DEFAULT_VALUES);
  }, [eventData]);

  const { mutate: mutatePutUpdateEvent } = usePutUpdateEvent({
    onSuccess: () => {
      navigate('/admin/eventos');
    },
  });

  function onSubmitForm(data: RegisterEventFormType) {
    if (!id) return;
    mutatePutUpdateEvent({
      data,
      id,
    });
  }

  return (
    <PageStyle>
      <Header title="Editar evento" buttonBack />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitForm)}>
          <Form />
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            type="submit"
          >
            Salvar
          </Button>
        </form>
      </FormProvider>
    </PageStyle>
  );
}

export { Edit };
