import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/users/components/form';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  REGISTER_USERS_SCHEMA,
} from '../../../features/users/constants';
import { RegisterUsersFormType } from '../../../types/user';
import { removeMask } from '../../../utils';
import { usePostCreateUser } from '../../../features/users/api/postUser';
import { getRole } from '../utils';

function RegisterUser() {
  const eventId = import.meta.env.VITE_EVENT_ID;
  const linkInviteGroupWpp = import.meta.env.VITE_LINK_INVITE_GROUP_WPP;
  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: '',
    cpf: '',
    birthday: null,
    cellphone: '',
    emergencyContact: '',
    email: '',
    worker: 0,
    profession: '',
    city: '',
    state: '',
    hypertensive: 0,
    diabetes: 0,
    notes: '',
    leadershipPosition: '',
    indicatedBy: '',
    religion: '',
    role: 5,
    eventId,
  };

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser } = usePostCreateUser({
    onSuccess: () => {
      methods.reset(DEFAULT_VALUES);
      window.open(linkInviteGroupWpp, '_blank');
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
      role: data.leadershipPosition ? getRole(data.leadershipPosition) : 5,
    };
    mutatePostCreateUser(formatData);
  }
  return (
    <PageStyle>
      <Header title="Inscrição Cursilho Masculino" buttonBack={permission} />
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
