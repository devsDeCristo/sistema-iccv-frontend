import Swal from 'sweetalert2';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { Button } from '@mui/material';
import { usePermission } from '../../../hooks/usePermission';
import { usePostCreRelationEventateUser } from '../../../features/users/api/postRelationEventUser';
import { setBearerToken } from '../../../config/lib/axios/api-client';

function AssociateEvent() {
  const eventId = import.meta.env.VITE_EVENT_ID;
  const linkInviteGroupWpp = import.meta.env.VITE_LINK_INVITE_GROUP_WPP;
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('access_token');

  const permission = usePermission();

  const { mutate: mutatePostCreateReEventUser } =
    usePostCreRelationEventateUser({
      onSuccess: () => {
        //const isWorker = !!methods.getValues('worker');
        const isWorker = false;
        Swal.fire({
          title: 'Cadastro efetuado com sucesso',
          icon: 'success',
        }).then((result) => {
          console.log('result', result);

          if (result.isConfirmed && !isWorker) {
            window.open(linkInviteGroupWpp, '_blank');
          }
        });
      },
    });

  const handleButton = () => {
    if (user === null) {
      return;
    }
    setBearerToken(accessToken);
    const idUser = JSON.parse(user)?.id;
    const formatData = {
      idUser,
      idEvent: eventId,
    };
    mutatePostCreateReEventUser(formatData);
  };
  return (
    <PageStyle>
      <Header title="Inscrição Cursilho Masculino" buttonBack={permission} />

      <Button
        variant="contained"
        fullWidth
        sx={{ marginTop: 2 }}
        type="submit"
        onClick={handleButton}
      >
        Clique aqui para se inscrever
      </Button>
    </PageStyle>
  );
}

export { AssociateEvent };
