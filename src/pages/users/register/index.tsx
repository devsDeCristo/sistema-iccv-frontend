import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_USERS_SCHEMA } from '../../../features/users/constants';
import { RegisterUsersFormType } from '../../../types/user';
import { removeMask } from '../../../utils';
import { usePostCreateUser } from '../../../features/users/api/postUser';

function RegisterUser() {
  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser } = usePostCreateUser({
    onSuccess: () => {
      console.log('onSuccess');
      methods.reset();
    },
  });

  function onSubmitForm(data: RegisterUsersFormType) {
    const formatData = {
      ...data,
      worker: !!data.worker,
      hypertensive: !!data.hypertensive,
      diabetes: !!data.diabetes,
      cellphone: removeMask(data.cellphone),
      cpf: removeMask(data.cpf),
      emergencyContact: data.emergencyContact
        ? removeMask(data.emergencyContact)
        : undefined,
      profession: 'Teste',
      role: 1,
      profilePhotoUrl: 'url',
      leadershipPosition: 'Teste',
    };
    mutatePostCreateUser(formatData);
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
