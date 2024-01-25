import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterUsersFormType } from './../../../features/users/types';
import { REGISTER_USERS_SCHEMA } from '../../../features/users/constants';

function RegisterUser() {
  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
  });
  const permission = usePermission();
  function onSubmitForm(data: RegisterUsersFormType) {
    console.log(data);
  }
  return (
    <PageStyle>
      <Header title="Cadastro de usuários" buttonBack={permission} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitForm)}>
          <Form />
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            type="submit"
            //  onClick={() => localStorage.setItem('user', 'iccv')}
          >
            Salvar
          </Button>
        </form>
      </FormProvider>
    </PageStyle>
  );
}

export { RegisterUser };
