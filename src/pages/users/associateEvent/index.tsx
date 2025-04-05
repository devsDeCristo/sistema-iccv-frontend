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
import { usePostCreRelationEventateUser } from '../../../features/users/api/postRelationEventUser';
import { useGetEvents } from '../../../features/events/api/getEvents';
import { CorporateFare, Person } from '@mui/icons-material';
import { useState } from 'react';
import { Event } from '../../../features/events/types';

// import { setBearerToken } from '../../../config/lib/axios/api-client';

function AssociateEvent() {
  const [worker, setWorker] = useState<number | null>(null);
  const theme = useTheme();
  const user = localStorage.getItem('user');
  const eventId = import.meta.env.VITE_EVENT_ID;
  const linkInviteGroupWpp = import.meta.env.VITE_LINK_INVITE_GROUP_WPP;
  const { data: eventData, isLoading } = useGetEvents(
    {
      eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  const userIsRegister =
    !Array.isArray(eventData) &&
    eventData &&
    eventData.users?.find((event) => event.id === JSON.parse(user || '')?.id);

  const nameEvent =
    (!Array.isArray(eventData) && eventData && eventData.name) ||
    'Cursilho da cristandade';
  console.log(userIsRegister, 'userIsRegister');

  const { mutate: mutatePostCreateReEventUser } =
    usePostCreRelationEventateUser({
      onSuccess: () => {
        Swal.fire({
          title: 'Cadastro efetuado com sucesso',
          icon: 'success',
        }).then((result) => {
          if (result.isConfirmed && !worker) {
            window.open(linkInviteGroupWpp, '_blank');
          }
          //if (result.isConfirmed) navigate('/login');
        });
      },
    });

  const handleButton = () => {
    if (user === null) {
      return;
    }
    const idUser = JSON.parse(user)?.id;
    const formatData = {
      idUser,
      idEvent: eventId,
      worker: worker === 0 ? false : true,
    };
    mutatePostCreateReEventUser(formatData);
  };
  const styles = {
    boxContainer: {
      display: 'flex',
      padding: '12px 0px',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      alignSelf: 'stretch',
      width: '100%',
    },
    typography: { color: 'text.primary', textAlign: 'center' },
    boxOption: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      padding: 2,
      width: 'auto',
      borderRadius: 2,
      paddingX: 4,
    },
    icon: {
      width: '80px',
      height: '80px',
      color: 'text.disabled',
    },
  };

  return (
    <PageStyle>
      {!userIsRegister && <Header title={nameEvent} />}
      {!isLoading && (
        <Box sx={styles.boxContainer}>
          {!userIsRegister && (
            <>
              <Typography sx={styles.typography}>
                Como você irá participar do evento?
              </Typography>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={worker}
                // onChange={(event, newValue) => {
                //   //    setWorker(newValue);
                // }}
              >
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: { xs: 2, xsm: 5 },
                    width: '100%',
                  }}
                >
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
                    <Person sx={styles.icon} />
                    <Typography sx={styles.typography}>
                      Cursilheiro (1ª vez)
                    </Typography>
                    <Radio value={0} />
                  </Box>
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
                    <CorporateFare sx={styles.icon} />
                    <Typography sx={styles.typography}>
                      Cursilhista (Trabalhar)
                    </Typography>
                    <Radio value={1} />
                  </Box>
                </Stack>
              </RadioGroup>
              <Button
                variant="contained"
                fullWidth
                disabled={worker === null}
                sx={{ marginTop: 2 }}
                type="submit"
                onClick={handleButton}
              >
                Clique aqui para se inscrever
              </Button>
            </>
          )}
          {userIsRegister && (
            <>
              <Typography sx={styles.typography}>
                {'Você já está cadastrado no ' + nameEvent + ' !'}
              </Typography>
              {/* <Typography sx={styles.typography}>
                {'Deseja participar do grupo do whatsapp? Clique abaixo!'}
              </Typography>
              <Button
                onClick={() => {
                  window.open(linkInviteGroupWpp, '_blank');
                }}
              /> */}
            </>
          )}
        </Box>
      )}
    </PageStyle>
  );
}

export { AssociateEvent };
