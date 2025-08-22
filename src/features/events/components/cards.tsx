import {
  Paper,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Stack,
  useTheme,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../../admin/events/api/getEvents';
import dayjs from 'dayjs';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { Event } from '../../admin/events/types';
// import { Work } from '@mui/icons-material';

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const usersParticipant = event.users?.filter((user) => !user.worker);
  const percentOcupped =
    ((usersParticipant?.length ?? 0) / event.capacity) * 100;
  const exhausted = (usersParticipant?.length ?? 0) >= event.capacity;
  // const percentOcupped = 44; // (event.users.length / event.capacity) * 100;
  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;
  const isUserRegistered = event.users?.some((u) => u.id === userId);
  // const usersWorker = event.users?.filter((user) => user.worker);

  const styles = {
    card: {
      borderRadius: 3,
      overflow: 'hidden',
      maxWidth: 320,
      position: 'relative',
      width: '100%',
      opacity: event.isActive ? 1 : 0.6,
    },
    imageBox: { position: 'relative' },
    cardMedia: { objectFit: 'cover' },
    chipTopLeft: {
      position: 'absolute',
      top: 12,
      left: 12,
      display: 'flex',
      gap: 1,
    },
    chipTopRight: { position: 'absolute', top: 12, right: 12 },
    chipEvento: { background: '#e0f2ff', color: '#0077cc' },
    chipStatus: {
      background: event.isActive ? (exhausted ? theme.palette.chips.canceled : theme.palette.chips.success) : theme.palette.text.primary,
      color: theme.palette.text.primary,
    },
    cardContent: {
      pt:6,
      mb: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    title: { fontSize: '1.1rem', fontWeight: 500 },
    description: { fontSize: '0.875rem', color: 'text.secondary' },
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
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      borderRadius: 2,
    },
  };

  return (
    <Paper sx={styles.card}>
      <Box sx={styles.imageBox}>
        {/* <CardMedia
          component="img"
          height="180"
          image={
            'https://www.guiaviagensbrasil.com/imagens/Imagem%20do%20mar%20calma%20e%20belo%20da%20Praia%20da%20Engenhoca-Itacar%C3%A9-Bahia-BA.jpg'
          }
          alt={event.name}
          sx={styles.cardMedia}
        /> */}
        <Box sx={styles.chipTopLeft}>
          <Chip
            label="evento"
            color="primary"
            size="small"
            sx={styles.chipEvento}
          />
        </Box>
        <Box sx={styles.chipTopRight}>
          <Chip
            label={
              event.isActive ? exhausted ? 'Esgotado' :'Aberto' : 'Finalizado'
            }
            size="small"
            sx={styles.chipStatus}
          />
        </Box>
      </Box>

      <CardContent sx={styles.cardContent}>
        <Stack>
          <Typography sx={styles.title}>{event.name}</Typography>
          <Typography sx={styles.description}>
            O Cursilho da Cristandade é um encontro intensivo para aprofundar a
            fé e fortalecer o compromisso cristão na vida diária.
          </Typography>
        </Stack>

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

          {/* <Stack direction="row" alignItems="center" gap={1}>
            <Work sx={styles.icon} />
            <Typography sx={styles.infoText} color="text.secondary">
              {usersWorker?.length} / {event.capacityWorker} Inscritos para
              trabalhar
            </Typography>
          </Stack> */}

          <Stack direction="row" alignItems="center" gap={1}>
            <GroupOutlinedIcon sx={styles.icon} />
            <Typography sx={styles.infoText} color="text.secondary">
              {usersParticipant?.length} / {event.capacity} Inscritos para
              participar
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
        {isUserRegistered ? (
          <Alert severity="success" sx={{ width: '100%' }} icon={false}>
            Você já está inscrito neste evento!
          </Alert>
        ) : (
          <Button
            variant="contained"
            disabled={!event.isActive || isUserRegistered}
            size="small"
            sx={styles.button}
            onClick={() => navigate(`/cadastrar-cursilho/${event.id}`)}
          >
            Inscrever-se
          </Button>
        )}
      </CardContent>
    </Paper>
  );
}

function Cards() {
  const { data = [] } = useGetEvents({});

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.isArray(data)
        ? data
            .filter((event) => event.isActive)
            .map((event: Event) => <EventCard key={event.id} event={event} />)
        : null}
    </Box>
  );
}

export { Cards };
