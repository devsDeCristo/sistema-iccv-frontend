import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import GoogleMap from '../../../components/mapWord';

import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { EventDetails } from '../../../features/admin/events/types';

function EventsDetails() {
  const { id = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: eventData } = useGetEvents({ eventId: id }, { enabled: !!id });
  const event = eventData as EventDetails;

  const styles = useMemo(
    () => ({
      title: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        mb: '0.5rem',
      },
      subtitle: {
        fontSize: '0.9rem',
        color: theme.palette.text.secondary,
        mt: '-0.7rem',
        mb: '0.7rem',
      },
      text: {
        fontSize: '0.9rem',
      },
      paper: {
        p: 3,
      },
      error: {
        color: theme.palette.warning.main,
        fontWeight: 500,
      },

      stackRight: { width: { xs: '100%', lg: '65%' } },
      stackLeft: { width: { xs: '100%', lg: '35%' } },

      stackContainer: {
        position: 'relative',
        flexDirection: { xs: 'column-reverse', lg: 'row' },
        width: { xs: '100%', lg: '80%' },
        ml: 'auto',
        mr: 'auto',
        gap: 4,
      },

      /* Banner */
      bannerContainer: {
        mt: 3,
        width: { xs: '100%', lg: '80%' },
        ml: 'auto',
        mr: 'auto',
        position: 'relative',

        height: 150,
        mb: 4,
      },
      bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 5,
      },
      bannerLogo: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: 130,
       
        p: '6px',
        borderRadius: 2,
      },

      /* Inscrições */
      vacancyBox: {
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        mb: 2,
        p: 2,
      },
      gridRow: {
        mb: 1,
      },
      divider: {
        mb: 1.5,
      },
      button: {
        mt: 2,
        textTransform: 'none',
      },
    }),
    [theme]
  );

  const getVagasRestantes = (group: EventDetails['groupRoles'][0]) => {
    const totalRegistrados = group.roles.reduce(
      (sum, role) => sum + (role?.registered || 0),
      0
    );

    return Math.max((group.capacity || 0) - totalRegistrados, 0);
  };

  return (
    <PageStyle>
      <Header
        title="Detalhes do Evento"
        description={event?.type || ''}
        buttonBack
        pageBack="/eventos"
      />

      {/* Banner */}
      <Stack sx={styles.bannerContainer}>
        <img
          src={event?.data?.coverUrl}
          alt="Banner do Evento"
          style={styles.bannerImage as any}
        />

        <img
          src={event?.data?.logoUrl}
          alt="Logo do Evento"
          style={styles.bannerLogo as any}
        />
      </Stack>

      <Stack sx={styles.stackContainer}>
        {/* Coluna esquerda */}
        <Stack gap={3} sx={styles.stackRight}>
          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>{event?.name}</Typography>
            <Typography sx={styles.subtitle}>
              {`Período: ${new Date(
                event?.startDate || ''
              ).toLocaleDateString()} - ${new Date(
                event?.endDate || ''
              ).toLocaleDateString()}`}
            </Typography>
            <Typography sx={styles.text}>
              {event?.data?.shortDescription}
            </Typography>
          </Paper>

          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>Sobre o Evento</Typography>
            <Typography sx={styles.text}>{event?.data?.description}</Typography>
          </Paper>

          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>Localização</Typography>
            <Typography sx={styles.subtitle}>
              {`Local: ${event?.data?.localName} - ${event?.data?.address}, ${event?.data?.neighborhood}, ${event?.data?.city} - ${event?.data?.state}, ${event?.data?.zipCode}`}
            </Typography>
            <GoogleMap linkMap={event?.data?.linkMaps as string} width="100%" />
          </Paper>
        </Stack>

        {/* Coluna direita */}
        <Stack sx={styles.stackLeft}>
          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>Inscrições</Typography>
            <Typography sx={styles.subtitle}>
              Informações sobre vagas disponíveis
            </Typography>

            <Box sx={styles.vacancyBox}>
              {event?.groupRoles?.map((group, index) => {
                const vagas = getVagasRestantes(group);

                return (
                  <Box key={group.id}>
                    <Grid container sx={styles.gridRow}>
                      <Grid item xs={5}>
                        <Typography>{group.name}</Typography>
                      </Grid>

                      <Grid item xs={7}>
                        {vagas > 0 ? (
                          <Typography>{vagas} vaga(s) restante(s)</Typography>
                        ) : (
                          <Typography sx={styles.error}>
                            Lista de Espera!
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    {index < (event?.groupRoles?.length || 0) - 1 && (
                      <Divider sx={styles.divider} />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={styles.button}
              onClick={() => {
                navigate(`/eventos/${event.id}/inscricao`);
              }}
            >
              Inscreva-se
            </Button>
          </Paper>
        </Stack>
      </Stack>
    </PageStyle>
  );
}

export { EventsDetails };
