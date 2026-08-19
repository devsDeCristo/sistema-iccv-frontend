import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Form } from '../../../features/admin/users/components/form';
import { Box, Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGISTER_USERS_SCHEMA } from '../../../features/admin/users/constants';
import {
  DEFAULT_USER_ROLE,
  formValuesToUserPayload,
  userToFormValues,
} from '../../../features/admin/users/utils';
import { RegisterUsersFormType, User } from '../../../types/user';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsers } from '../../../features/admin/users/api/getUsers';
import { useEffect, useState } from 'react';
import { usePutUser } from '../../../features/admin/users/api/putUser';
import { InputPhoto } from '../../../features/admin/users/components/inputPhoto';
import { usePostProfilePhotoUser } from '../../../features/admin/users/api/postProfilePhotoUser';
// import { getRole } from '../utils';
import { WebcamModal } from '../../../features/admin/users/components/webcamModal';

function EditUser() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [isOpenWebcamModal, setIsOpenWebcamModal] = useState(false);
  // foto fica pendente até o submit — quem envia é o botão "Salvar"
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    undefined
  );
  const { data } = useGetUsers({ userId: id });
  const userData = data as User;

  const DEFAULT_VALUES: RegisterUsersFormType = {
    ...userToFormValues(userData),
    role: DEFAULT_USER_ROLE,
  };

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    methods.reset(DEFAULT_VALUES);
  }, [data]);

  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const permission = usePermission();

  const { mutateAsync: mutatePutUser, isLoading: isSavingUser } = usePutUser();
  const {
    mutateAsync: mutatePostProfilePhotoUser,
    isLoading: isSavingPhoto,
  } = usePostProfilePhotoUser();

  function onCloseWebcamModal() {
    setIsOpenWebcamModal(false);
  }

  function onSelectPhoto(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    onCloseWebcamModal();
  }

  async function onSubmitForm(data: RegisterUsersFormType) {
    const formatData = {
      ...formValuesToUserPayload(data),
      role: DEFAULT_USER_ROLE,
    };

    try {
      await mutatePutUser({
        userId: id,
        data: formatData,
      });

      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await mutatePostProfilePhotoUser({ userId: id, data: formData });
      }

      navigate('/admin/usuarios');
    } catch {
      // erros já são exibidos por handleResponseThrowError
    }
  }

  return (
    <PageStyle>
      <Header
        title="Edição de usuário"
        buttonBack={permission}
        pageBack={'/admin/usuarios'}
      />
      <Box display="flex" justifyContent="flex-start" alignItems="center">
        <WebcamModal
          isOpen={isOpenWebcamModal}
          onClose={onCloseWebcamModal}
          onSelectPhoto={onSelectPhoto}
        />
        <InputPhoto
          profilePhoto={userData?.profilePhotoUrl}
          previewPhoto={photoPreview}
          onSelectPhoto={onSelectPhoto}
          onOpenWebcam={() => setIsOpenWebcamModal(true)}
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
            disabled={isSavingUser || isSavingPhoto}
          >
            {isSavingUser || isSavingPhoto ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </FormProvider>
    </PageStyle>
  );
}

export { EditUser };
