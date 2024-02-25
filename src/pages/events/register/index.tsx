import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/events/components/form';
import { Button } from '@mui/material';
import { RegisterEventFormType } from '../../../features/events/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_EVENT_SCHEMA } from '../../../features/events/constants';
import { usePostCreateEvent } from '../../../features/events/api/postEvent';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const methods = useForm<RegisterEventFormType>({
    resolver: zodResolver(REGISTER_EVENT_SCHEMA),
  });

  const { mutate: mutatePostCreateEvent } = usePostCreateEvent({
    onSuccess: () => {
      navigate('/eventos');
    },
  });

  function onSubmitForm(data: RegisterEventFormType) {
    mutatePostCreateEvent({
      data,
    });
  }

  return (
    <PageStyle>
      <Header title="Cadastrar evento" buttonBack pageBack="/eventos" />
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

export { Register };
