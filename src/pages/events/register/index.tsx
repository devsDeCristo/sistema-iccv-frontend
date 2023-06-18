import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/events/components/form';
import { Button } from '@mui/material';

function Register() {
  const methods = useForm();

  return (
    <PageStyle>
      <Header title="Cadastrar evento" buttonBack pageBack="/eventos" />
      <FormProvider {...methods}>
        <Form />
        <Button variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Salvar
        </Button>
      </FormProvider>
    </PageStyle>
  );
}

export { Register };
