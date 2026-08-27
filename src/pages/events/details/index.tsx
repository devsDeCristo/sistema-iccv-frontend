import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import GoogleMap from '../../../components/mapWord';

import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { EventDetails } from '../../../features/admin/events/types';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import { ConfirmationNumber, WhatsApp } from '@mui/icons-material';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import ReactQuillViewer from '../../../components/reactQuill';

function EventsDetails() {
  const { id = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data: groupsData } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );
  const groups = groupsData?.present || [];
  const { data: eventData, isLoading } = useGetEvents(
    { eventId: id },
    { enabled: !!id }
  );
  const event = eventData as EventDetails;

  /**
   * Grupos deste evento em que o usuário está inscrito e que possuem link.
   * O link deixou de ser por evento e passou a ser por grupo, então quem está
   * em mais de um grupo vê um botão para cada.
   */
  const registeredGroupsWithLink = useMemo(() => {
    if (!event || groups.length === 0) return [];

    return groups.filter(
      (group) =>
        !!group.link?.trim() &&
        event.groupRoles?.some((eventGroup) => eventGroup.id === group.id)
    );
  }, [event, groups]);

  const scrollToTop = () => {
    const outlet = document.getElementById('layout-scroll');
    if (outlet) {
      outlet.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }
    const target = document.scrollingElement || document.documentElement;
    target.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToTop();
  }, []);

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
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      text: {
        fontSize: '0.9rem',
      },
      textGroup: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      paper: {
        p: 3,
      },
      error: {
        color: theme.palette.warning.main,
        fontWeight: 500,
      },

      stackRight: { width: { xs: '100%', lg: '65%' } },
      stackLeft: { width: { xs: '100%', lg: '35%' }, gap: 4 },

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
        height: 40,
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
  const havaOneFieldLocal = !!(
    event?.data?.localName ||
    event?.data?.address ||
    event?.data?.neighborhood ||
    event?.data?.city ||
    event?.data?.state ||
    event?.data?.zipCode
  );
  const stringLocal = () => {
    let local = 'Local:';
    if (event?.data?.localName) local += ` ${event.data.localName}`;
    if (event?.data?.address) local += ` - ${event.data.address}`;
    if (event?.data?.neighborhood) local += ` - ${event.data.neighborhood} `;
    if (event?.data?.city) local += ` - ${event.data.city}  `;
    if (event?.data?.state) local += ` - ${event.data.state} `;
    if (event?.data?.zipCode) local += ` - ${event.data.zipCode}`;

    return local;
  };

  if (isLoading) {
    return (
      <PageStyle>
        <Header title="Detalhes do Evento" buttonBack pageBack="/home" />

        <Stack sx={styles.bannerContainer}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 5 }}
          />
        </Stack>

        <Stack sx={styles.stackContainer}>
          <Stack gap={3} sx={styles.stackRight}>
            <Paper sx={styles.paper}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </Paper>
            <Paper sx={styles.paper}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="70%" />
            </Paper>
          </Stack>

          <Stack sx={styles.stackLeft}>
            <Paper sx={styles.paper}>
              <Skeleton variant="text" width="50%" height={32} />
              <Skeleton variant="text" width="70%" />
              <Box sx={styles.vacancyBox}>
                {[0, 1, 2].map((item) => (
                  <Box key={item}>
                    <Grid container sx={styles.gridRow}>
                      <Grid item xs={5}>
                        <Skeleton variant="text" width="80%" />
                      </Grid>
                      <Grid item xs={7}>
                        <Skeleton variant="text" width="60%" />
                      </Grid>
                    </Grid>
                    {item < 2 && <Divider sx={styles.divider} />}
                  </Box>
                ))}
              </Box>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={40}
                sx={{ ...styles.button, borderRadius: 1 }}
              />
            </Paper>
          </Stack>
        </Stack>
      </PageStyle>
    );
  }

  return (
    <PageStyle>
      <Header
        title="Detalhes do Evento"
        // só admin e super admin chegam num evento em teste: o aviso é para
        // não confundir o ensaio com um evento que já está no ar
        description={`${event?.type || ''}${
          event?.status === 'TEST' ? ' · Evento de teste' : ''
        }`}
        buttonBack
        pageBack="/home"
      />

      {/* Banner */}
      <Stack sx={styles.bannerContainer}>
        {/* {event?.data?.coverUrl && ( */}
        <img
          src={event?.data?.coverUrl || CapaLogin}
          alt="Banner do Evento"
          style={styles.bannerImage as any}
        />
        {/* )} */}
        {event?.data?.logoUrl && (
          <img
            src={event?.data?.logoUrl}
            alt="Logo do Evento"
            style={styles.bannerLogo as any}
          />
        )}
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
            <ReactQuillViewer value={event?.data?.description || ''} />
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
              {true
                ? event?.groupRoles?.map((group, index) => {
                    const vagas = getVagasRestantes(group);

                    return (
                      <Box key={group.id}>
                        <Grid container sx={styles.gridRow}>
                          <Grid item xs={!event.data?.hideVacancies ? 5 : 12}>
                            <Typography sx={styles.textGroup}>
                              {group.name}
                            </Typography>
                          </Grid>
                          {!event.data?.hideVacancies && (
                            <Grid item xs={7}>
                              {vagas > 0 ? (
                                <Typography>
                                  {vagas} vaga(s) restante(s)
                                </Typography>
                              ) : (
                                <Typography sx={styles.error}>
                                  Lista de Espera!
                                </Typography>
                              )}
                            </Grid>
                          )}
                        </Grid>

                        {index < (event?.groupRoles?.length || 0) - 1 && (
                          <Divider sx={styles.divider} />
                        )}
                      </Box>
                    );
                  })
                : null}
            </Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ConfirmationNumber />}
              sx={{ ...styles.button, textTransform: 'none' }}
              onClick={() => {
                navigate(`/eventos/${event.id}/inscricao`);
              }}
            >
              Inscreva-se
            </Button>

            {registeredGroupsWithLink.map((group) => (
              <Button
                key={group.id}
                variant="contained"
                fullWidth
                startIcon={<WhatsApp />}
                sx={{
                  ...styles.button,
                  textTransform: 'none',
                  color: 'white',
                  backgroundColor: '#25D366',
                  '&:hover': { backgroundColor: '#1ebe5d' },
                }}
                onClick={() => {
                  window.open(group.link || '', '_blank', 'noopener,noreferrer');
                }}
              >
                {registeredGroupsWithLink.length > 1
                  ? `Entre no Grupo: ${group.name}`
                  : 'Entre no Grupo do Evento!'}
              </Button>
            ))}
          </Paper>
          {havaOneFieldLocal && (
            <Paper sx={styles.paper}>
              <Typography sx={styles.title}>Localização</Typography>
              <Tooltip title={stringLocal()} arrow placement="right-end">
                <Typography sx={styles.subtitle}>{stringLocal()}</Typography>
              </Tooltip>
              {event?.data?.linkMaps && (
                <GoogleMap
                  linkMap={event?.data?.linkMaps as string}
                  width="100%"
                />
              )}
            </Paper>
          )}
        </Stack>
      </Stack>
    </PageStyle>
  );
}

export { EventsDetails };
