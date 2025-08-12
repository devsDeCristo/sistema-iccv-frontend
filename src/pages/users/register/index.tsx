import Swal from 'sweetalert2';
import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/admin/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  REGISTER_USERS_SCHEMA,
} from '../../../features/admin/users/constants';
import { RegisterUsersFormType } from '../../../types/user';
import { formatCPF, removeMask } from '../../../utils';
import { usePostCreateUser } from '../../../features/admin/users/api/postUser';
import { useNavigate } from 'react-router-dom';

function RegisterUser() {
  const cpfLogin = localStorage.getItem('cpf') || '';
  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: '',
    cpf: formatCPF(cpfLogin) ? formatCPF(cpfLogin) : '',
    birthday: new Date(),
    cellphone: '',
    emergencyContact: '',
    email: '',
    worker: 1,
    profession: '',
    neighborhood: '',
    city: '',
    state: '',
    hypertensive: 0,
    diabetes: 0,
    notes: '',
    leadershipPosition: '',
    indicatedBy: '',
    religion: '',
    // role: 5,
    //eventId,
  };
  const navigate = useNavigate();

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser, isLoading } = usePostCreateUser({
    onSuccess: (response: any) => {
      methods.reset(DEFAULT_VALUES);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      Swal.fire({
        title: 'Cadastro efetuado com sucesso',
        icon: 'success',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/eventos');
        }
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'Erro ao cadastrar',
        text: error.response.data.message,
        icon: 'error',
      });
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
      profession: data.profession,
      indicatedBy: data.indicatedBy === '' ? undefined : data.indicatedBy,
      religion: data.religion === '' ? undefined : data.religion,
      notes: data.notes === '' ? undefined : data.notes,
      leadershipPosition:
        data.leadershipPosition ===
          ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION ||
        data.leadershipPosition === ''
          ? undefined
          : data.leadershipPosition,
      role: 5,
      password: '$2b$10$QGF/lucztAy.bqQFEQcSOOjP3fGMZfSsCIl4t.dfFo15Hh0v/C8xW',
    };

    mutatePostCreateUser(formatData);
  }

  return (
    <PageStyle>
      <Header title="Faça seu cadastro" buttonBack={permission} />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitForm)}>
          <Form />
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar-se'}
          </Button>
        </form>
      </FormProvider>
    </PageStyle>
  );
}

export { RegisterUser };
