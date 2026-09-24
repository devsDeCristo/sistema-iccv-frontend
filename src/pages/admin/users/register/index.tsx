import Swal from 'sweetalert2';
import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { Form } from '../../../../features/admin/users/components/form';
import { Button, Paper } from '@mui/material';
import { usePermission } from '../../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  GET_USERS,
  REGISTER_USERS_SCHEMA,
} from '../../../../features/admin/users/constants';
import { consentimentoParaEnvio } from '../../../../features/admin/users/utils';
import { RegisterUsersFormType } from '../../../../types/user';
import { formatCPF, removeMask } from '../../../../utils';
import { usePostCreateUser } from '../../../../features/admin/users/api/postUser';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../../../config/lib/react-query/query-client';

function RegisterUser() {
  const cpfLogin = localStorage.getItem('cpf') || '';
  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: '',
    cpf: formatCPF(cpfLogin) ? formatCPF(cpfLogin) : '',
    birthday: null,
    cellphone: '',
    emergencyContact: '',
    email: '',
    worker: 1,
    profession: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    hypertensive: 0,
    diabetes: 0,
    sensitiveDataConsent: false,
    consentimentoOriginal: false,
    notes: '',
    leadershipPosition: '',
    indicatedBy: '',
    religion: '',
    congregation: '',
    pastorName: '',
    // role: 5,
    //eventId,
  };
  const navigate = useNavigate();

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser } = usePostCreateUser({
    onSuccess: () => {
      queryClient.invalidateQueries(GET_USERS);
      methods.reset(DEFAULT_VALUES);
      // localStorage.setItem('access_token', response.access_token);
      // localStorage.setItem('user', JSON.stringify(response.user));

      //navigate('/cadastrar-cursilho');
      Swal.fire({
        title: 'Cadastro efetuado com sucesso',
        icon: 'success',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/admin/usuarios');
        }
      });
    },
  });

  function onSubmitForm(data: RegisterUsersFormType) {
    const {
      sensitiveDataConsent: _consentimento,
      consentimentoOriginal: _original,
      ...valores
    } = data;
    const formatData = {
      ...valores,
      ...consentimentoParaEnvio(data),
      worker: !!data.worker,
      hypertensive: !!data.hypertensive,
      diabetes: !!data.diabetes,
      cellphone: removeMask(data.cellphone),
      cpf: removeMask(data.cpf),
      emergencyContact: data.emergencyContact
        ? removeMask(data.emergencyContact)
        : undefined,
      profession: data.profession,
      zipCode: data.zipCode === '' ? undefined : data.zipCode,
      street: data.street === '' ? undefined : data.street,
      number: data.number === '' ? undefined : data.number,
      indicatedBy: data.indicatedBy === '' ? undefined : data.indicatedBy,
      religion: data.religion === '' ? undefined : data.religion,
      congregation: data.congregation === '' ? undefined : data.congregation,
      pastorName: data.pastorName === '' ? undefined : data.pastorName,
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
      <Header title="Novo Usuário" buttonBack={permission} />
      <Paper sx={{ padding: 3 }}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmitForm)}>
            <Form />
            <Button
              variant="contained"
              fullWidth
              sx={{ marginTop: 2 }}
              type="submit"
            >
              Cadastrar
            </Button>
          </form>
        </FormProvider>
      </Paper>
    </PageStyle>
  );
}

export { RegisterUser };
