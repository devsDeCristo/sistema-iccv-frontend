import Swal from 'sweetalert2';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
// import { usePermission } from '../../../hooks/usePermission';
import { usePostCreRelationEventToUser } from '../../../features/admin/users/api/postRelationEventUser';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import {
  EmojiPeople,
  // Logout,
  Work,
} from '@mui/icons-material';
import { useState } from 'react';
import { Loading } from '../../../components/loading';
import { useParams } from 'react-router-dom';
import { Event, EventDetails } from '../../../features/admin/events/types';

// import { setBearerToken } from '../../../config/lib/axios/api-client';

function AssociateEvent() {
  const [worker, setWorker] = useState<number | null>(null);
  const theme = useTheme();
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') as string)
    : '';
  const params = useParams();
  const eventId = params.eventId || import.meta.env.VITE_EVENT_ID;
  //const linkInviteGroupWpp = import.meta.env.VITE_LINK_INVITE_GROUP_WPP;
  const { data: eventData, isLoading } = useGetEvents(
    {
      eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  // const event = eventData as EventDetails;
  // const usersParticipant = event?.users?.filter((user) => !user?.worker);

  // const usersWorker = event?.users?.filter((user) => user?.worker);

  // const exhaustedParticipant =
  //   (usersParticipant?.length ?? 0) >= event?.capacity;
  // const exhaustedWorker = (usersWorker?.length ?? 0) >= event?.capacityWorker;
  // const userIsRegister =
  //   !Array.isArray(eventData) &&
  //   eventData &&
  //   eventData.users?.find((event) => event.id === user?.id);

  // const nameEvent =
  //   (!Array.isArray(eventData) && eventData && eventData.name) ||
  //   'Cursilho da cristandade';

  // const { mutate: mutatePostCreateReEventUser } = usePostCreRelationEventToUser(
  //   {
  //     onSuccess: () => {
  //       Swal.fire({
  //         title: 'Cadastro efetuado com sucesso',
  //         icon: 'success',
  //       }).then((result) => {
  //         if (result.isConfirmed && !worker) {
  //           if (!Array.isArray(eventData) && eventData?.groupLink)
  //             window.open(
  //               (!Array.isArray(eventData) &&
  //                 eventData &&
  //                 eventData?.groupLink) ||
  //                 '',
  //               '_blank'
  //             );
  //         }
  //         if (result.isConfirmed) {
  //           window.location.replace('/eventos');
  //         }
  //       });
  //     },
  //   }
  // );

  // const handleButton = () => {
  //   if (user === null) {
  //     return;
  //   }
  //   const idUser = user?.id;
  //   mutatePostCreateReEventUser({
  //     idUser,
  //     idEvent: eventId,
  //     worker: worker === 0 ? false : true,
  //   });
  // };
  const styles = {
    boxContainer: {
      display: 'flex',
      padding: '12px 0px',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      //backgroundColor: 'red',
      width: '100%',
      height: '100%',
    },
    typography: { color: 'text.primary', textAlign: 'center' },
    containerOptions: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 2,
      display: 'flex',
      width: '100%',
      flexWrap: 'wrap',
    },
    boxOption: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: { xs: 'row', sm: 'column' },
      padding: 2,
      width: { xs: '100%', sm: 'fit-content' },
      borderRadius: 2,
      paddingX: 4,
      gap: { xs: '2', sm: '0' },
    },
    icon: {
      height: { xs: '24px', sm: '60px' },
      width: { xs: '24px', sm: '60px' },
    },
    button: { marginTop: 2, width: '100%', maxWidth: '450px' },
  };

  return (
    <PageStyle>
      {!isLoading ? (
        <Box sx={styles.boxContainer}>
          {/* {!userIsRegister && (
            <>
              <Header title={nameEvent} />
              <Typography sx={styles.typography}>
                Como você irá participar do evento?
              </Typography>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={worker}
              >
                <Stack sx={styles.containerOptions}>
                  {!exhaustedParticipant && (
                    <Box
                      sx={[
                        styles.boxOption,
                        {
                          border:
                            worker == 0
                              ? `1px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.text.primary}`,
                        },
                      ]}
                      onClick={() => setWorker(0)}
                    >
                      <EmojiPeople
                        sx={[
                          styles.icon,
                          {
                            color:
                              worker == 0
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                          },
                        ]}
                      />
                      <Typography sx={styles.typography}>
                        Cursilhista (1ª vez)
                      </Typography>
                      <Radio value={0} />
                    </Box>
                  )}
                  {!exhaustedWorker && (
                    <Box
                      sx={[
                        styles.boxOption,
                        {
                          border:
                            worker == 1
                              ? `1px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.text.primary}`,
                        },
                      ]}
                      onClick={() => setWorker(1)}
                    >
                      <Work
                        sx={[
                          styles.icon,
                          {
                            color:
                              worker == 1
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                          },
                        ]}
                      />
                      <Typography sx={styles.typography}>
                        Cursilheiro (Trabalhar)
                      </Typography>
                      <Radio value={1} />
                    </Box>
                  )}
                </Stack>
              </RadioGroup>
              <Button
                variant="contained"
                sx={styles.button}
                disabled={worker === null}
                type="submit"
                onClick={handleButton}
              >
                Clique aqui para se inscrever
              </Button>
            </>
          )}
          {userIsRegister && (
            <Typography sx={styles.typography}>
              {'Olá ' +
                user?.fullName +
                ', Você já está cadastrado no ' +
                nameEvent +
                ' !'}
            </Typography>
          )} */}
          {/* <Button
            variant="contained"
            sx={styles.button}
            type="submit"
            color="secondary"
            startIcon={<Logout />}
            onClick={() => {
              localStorage.clear();
              window.location.replace('/login');
            }}
          >
            Sair
          </Button> */}
        </Box>
      ) : (
        <Loading />
      )}
    </PageStyle>
  );
}

export { AssociateEvent };
