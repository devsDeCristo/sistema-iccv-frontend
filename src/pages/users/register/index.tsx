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
// import { usePostProfilePhotoUser } from '../../../features/users/api/postProfilePhotoUser';

function RegisterUser() {
  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: '',
    cpf: '',
    birthday: null,
    cellphone: '',
    emergencyContact: null,
    email: '',
    worker: 0,
    profession: '',
    city: '',
    state: '',
    hypertensive: 0,
    diabetes: 0,
    role: 5,
  };

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser } = usePostCreateUser({
    onSuccess: () => {
      methods.reset(DEFAULT_VALUES);
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
      role: 5,
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
          >
            Salvar
          </Button>
        </form>
      </FormProvider>
    </PageStyle>
  );
}

export { RegisterUser };
