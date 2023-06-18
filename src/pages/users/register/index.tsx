import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';

function RegisterUser() {
  const methods = useForm();
  const permission = usePermission();

  return (
    <PageStyle>
      <Header title="Cadastro de usuários" buttonBack={permission} />
      <FormProvider {...methods}>
        <Form />
        <Button variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Salvar
        </Button>
      </FormProvider>
    </PageStyle>
  );
}

export { RegisterUser };
