import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
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
  const { data: eventData } = useGetEvents({ eventId: id }, { enabled: !!id });
  const event = eventData as EventDetails;

  const registeredInEvent = useMemo(() => {
    if (!event || groups.length === 0) return false;
    return groups.some((group) =>
      event.groupRoles.some((eventGroup) => eventGroup.id === group.id)
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

            {registeredInEvent && (
              <Button
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
                  window.open(event?.groupLink || '', '_blank');
                }}
              >
                Entre no Grupo do Evento!
              </Button>
            )}
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
