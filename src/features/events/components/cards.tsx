import {
  Paper,
  Typography,
  Box,
  Stack,
  useTheme,
  Button,
  LinearProgress,
  CardMedia,
  alpha,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../../admin/events/api/getEvents';
import dayjs from 'dayjs';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import { Event } from '../../admin/events/types';
import { Person } from '@mui/icons-material';
import CapaLogin from '../../../assets/capaLogin2.jpg';

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const capacity = event.capacity ?? 0;
  const users = event.users ?? 0;
  const percentOcupped = ((users ?? 0) / capacity) * 100;
  const type = event.type;

  const styles = {
    bannerLogo: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height: 110,

      p: '6px',
      borderRadius: 2,
    },
    card: {
      borderRadius: 3,
      overflow: 'hidden',
      maxWidth: 320,
      position: 'relative',
      width: '100%',
      opacity: event.isActive ? 1 : 0.6,
      cursor: 'pointer',
    },
    imageBox: {
      position: 'relative',
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    cardMedia: { objectFit: 'cover' },
    chipTopLeft: {
      background: theme.palette.background.paper,
      fontSize: '0.8rem',
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      padding: '4px 8px',
      color: theme.palette.text.primary,
      position: 'absolute',
      top: 0,
      left: 20,
      display: 'flex',
      gap: 1,
    },
    chipTopRight: { position: 'absolute', top: 12, right: 12 },
    chipEvento: { background: '#e0f2ff', color: '#0077cc' },

    cardContent: {
      p: 2,

      display: 'flex',
      height: 'calc(100% - 120px)',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: 500,
      height: '50px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    description: {
      fontSize: '0.875rem',
      color: 'text.secondary',
      height: '60px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'justify',
    },
    icon: { color: theme.palette.text.secondary, fontSize: '20px' },
    infoText: { fontSize: '0.875rem' },
    progressBox: { flexGrow: 1 },
    progressBar: {
      height: 8,
      borderRadius: 5,
      '&.MuiLinearProgress-colorPrimary': {
        backgroundColor: '#ebececff',
      },
    },
    button: {
      width: '100%',
      mt: 1,
      height: 36,
      borderRadius: 2,
    },
  };

  return (
    <Paper
      sx={styles.card}
      onClick={() => {
        navigate(`/eventos/${event.id}`);
      }}
    >
      <Box sx={styles.imageBox}>
        <CardMedia
          component="img"
          height="120"
          image={event?.data?.coverUrl || CapaLogin}
          alt={event.name}
          sx={styles.cardMedia}
        />
        {event?.data?.logoUrl && (
          <img
            src={event?.data?.logoUrl}
            alt="Logo do Evento"
            style={styles.bannerLogo as any}
          />
        )}
        <Box sx={styles.chipTopLeft}>{type}</Box>
      </Box>

      <Box sx={styles.cardContent}>
        <Stack
          direction={'column'}
          justifyContent={'space-between'}
          alignItems={'flex-start'}
          sx={{ height: '100%' }}
          gap={1}
        >
          <Typography sx={styles.title}>{event.name}</Typography>
          <Divider sx={{ width: '100%' }} />
          {event?.data?.shortDescription && (
            <Typography sx={styles.description}>
              {event.data?.shortDescription}
            </Typography>
          )}

          <Divider sx={{ width: '30%', ml: '35%', mt: 1, mb: 1 }} />

          <Stack gap={1}>
            <Stack direction="row" alignItems="center" gap={1}>
              <CalendarMonthOutlinedIcon sx={styles.icon} />
              <Typography sx={styles.infoText} color="text.secondary">
                {dayjs(event.startDate).format('DD/MM/YYYY')} ás{' '}
                {dayjs(event.startDate).format('HH:mm')}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <RoomOutlinedIcon sx={styles.icon} />
              <Typography sx={styles.infoText} color="text.secondary">
                Chácara Moriá
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1}>
              <Person  sx={styles.icon} />
              <Typography sx={styles.infoText} color="text.secondary">
                {users} / {capacity} Inscritos
              </Typography>
            </Stack>
          </Stack>

          <Box sx={styles.progressBox}>
            <LinearProgress
              valueBuffer={100}
              value={percentOcupped}
              variant="determinate"
              sx={styles.progressBar}
            />
          </Box>
        </Stack>

        <Button
          variant="contained"
          disabled={!event.isActive}
          size="small"
          sx={styles.button}
          onClick={() => navigate(`/eventos/${event.id}`)}
        >
          Ver mais
        </Button>
      </Box>
    </Paper>
  );
}

function Cards() {
  const { data = [] } = useGetEvents({});
  const events = data as Event[];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.isArray(events)
        ? events
            .filter((event) => event.isActive)
            .map((event: Event) => <EventCard key={event.id} event={event} />)
        : null}
    </Box>
  );
}

export { Cards };
