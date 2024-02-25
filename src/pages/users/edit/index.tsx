import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_USERS_SCHEMA } from '../../../features/users/constants';
import { RegisterUsersFormType, User } from '../../../types/user';
import { formatCPF, formatPhoneNumber, removeMask } from '../../../utils';
import { useParams } from 'react-router-dom';
import { useGetUsers } from '../../../features/users/api/getUsers';
import { useEffect } from 'react';
import { usePutUser } from '../../../features/users/api/putUser';
import { InputPhoto } from '../../../features/users/components/inputPhoto';

function EditUser() {
  const { id = '' } = useParams();
  const { data } = useGetUsers({ userId: id }) as { data: User };

  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: data?.fullName || '',
    cpf: data?.cpf ? formatCPF(data?.cpf) : '',
    birthday: data?.birthday ? new Date(data?.birthday) : null,
    cellphone: data?.cellphone ? formatPhoneNumber(data?.cellphone) : '',
    emergencyContact: data?.emergencyContact
      ? formatPhoneNumber(data?.emergencyContact)
      : null,
    email: data?.email || '',
    worker: data?.worker ? 1 : 0,
    profession: data?.profession || '',
    city: data?.city || '',
    state: data?.state || '',
    hypertensive: data?.hypertensive ? 1 : 0,
    diabetes: data?.diabetes ? 1 : 0,
    role: 5,
  };

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    methods.reset(DEFAULT_VALUES);
  }, [data]);

  const permission = usePermission();

  const { mutate: mutatePutUser } = usePutUser();

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
      eventId: '304f65ba-9225-4542-a613-33577ae3f2b8',
    };
    mutatePutUser({
      userId: id,
      data: formatData,
    });
  }
  return (
    <PageStyle>
      <Header title="Cadastro de usuários" buttonBack={permission} />
      <InputPhoto />
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

export { EditUser };
