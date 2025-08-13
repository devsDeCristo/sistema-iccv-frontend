import { Header } from '../../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../../components/pageStyle';
import { Form } from '../../../../features/admin/users/components/form';
import { Box, Button } from '@mui/material';
import { usePermission } from '../../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  REGISTER_USERS_SCHEMA,
} from '../../../../features/admin/users/constants';
import { RegisterUsersFormType, User } from '../../../../types/user';
import { formatCPF, formatPhoneNumber, removeMask } from '../../../../utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsers } from '../../../../features/admin/users/api/getUsers';
import { useEffect, useState } from 'react';
import { usePutUser } from '../../../../features/admin/users/api/putUser';
import { InputPhoto } from '../../../../features/admin/users/components/inputPhoto';
import { usePostProfilePhotoUser } from '../../../../features/admin/users/api/postProfilePhotoUser';
// import { getRole } from '../utils';
import { WebcamModal } from '../../../../features/admin/users/components/webcamModal';

function EditUser() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [isOpenWebcamModal, setIsOpenWebcamModal] = useState(false);
  const { data, refetch } = useGetUsers({ userId: id });
  const userData = data as User;

  const DEFAULT_VALUES: RegisterUsersFormType = {
    fullName: userData?.fullName || '',
    cpf: userData?.cpf ? formatCPF(userData?.cpf) : '',
    birthday: userData?.birthday ? new Date(userData?.birthday) : null,
    cellphone: userData?.cellphone
      ? formatPhoneNumber(userData?.cellphone)
      : '',
    emergencyContact: userData?.emergencyContact
      ? formatPhoneNumber(userData?.emergencyContact)
      : '',
    email: userData?.email || '',
    worker: userData?.worker ? 1 : 0,
    profession: userData?.profession || '',
    neighborhood: userData?.neighborhood || '',
    city: userData?.city || '',
    state: userData?.state || '',
    hypertensive: userData?.hypertensive ? 1 : 0,
    diabetes: userData?.diabetes ? 1 : 0,
    indicatedBy: userData?.indicatedBy || '',
    religion: userData?.religion || '',
    badgeName: userData?.badgeName || '',
    notes: userData?.notes || '',
    leadershipPosition: userData?.leadershipPosition || '',
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

  const { mutate: mutatePutUser } = usePutUser({
    onSuccess: () => {
      navigate('/admin/usuarios');
    },
  });
  const { mutate: mutatePostProfilePhotoUser } = usePostProfilePhotoUser({
    onSuccess: () => {
      refetch();
      onCloseWebcamModal();
    },
  });

  function onCloseWebcamModal() {
    setIsOpenWebcamModal(false);
  }

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
    };
    mutatePutUser({
      userId: id,
      data: formatData,
    });
  }

  function onSavePhoto(file: File | null) {
    if (userData?.id && file) {
      const formData = new FormData();
      formData.append('photo', file);
      mutatePostProfilePhotoUser({ userId: userData.id, data: formData });
    }
  }

  return (
    <PageStyle>
      <Header
        title="Edição de usuário"
        buttonBack={permission}
        pageBack={'/admin/usuarios'}
      />
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button variant="contained" onClick={() => setIsOpenWebcamModal(true)}>
          Abrir webcam
        </Button>
        <WebcamModal
          isOpen={isOpenWebcamModal}
          onClose={onCloseWebcamModal}
          onSavePhoto={onSavePhoto}
        />
        <InputPhoto
          profilePhoto={userData?.profilePhotoUrl}
          onSavePhoto={onSavePhoto}
        />
      </Box>
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
