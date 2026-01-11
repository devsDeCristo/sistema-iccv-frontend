import { useParams } from 'react-router-dom';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { EventDetails } from '../../../features/admin/events/types';
import { Paper, Stack, Typography, useTheme } from '@mui/material';
import GoogleMap from '../../../components/mapWord';


function EventsDetails() {
  const { id = '' } = useParams();
  const { data: eventData } = useGetEvents(
    {
      eventId: id,
    },
    {
      enabled: !!id,
    }
  );
  const event = eventData as EventDetails;
  console.log(event);
  const theme = useTheme();

  const styles = {
    title: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: '1rem',
      fontWeight: 'normal',
      color:theme.palette.text.secondary
      
    },
    text:{
       fontSize: '0.9rem',
      fontWeight: 'normal',
      marginTop: '1rem',

    },
    paper: {
      padding: 3,
    },
  };

  return (
    <PageStyle>
      <Header
        title={'Detalhes do Evento'}
        description={event?.type || ''}
        buttonBack
        pageBack="/eventos"
      />
      <Stack direction="row" spacing={2} width="80%" ml="10%">
        <Stack gap={3} width="70%">
          <Paper sx={styles.paper}>
            <Stack direction="column" justifyContent="space-between">
              <Typography sx={styles.title}>{event?.name}</Typography>
              <Typography sx={styles.subtitle}>
                {`Período: ${new Date(
                  event?.startDate || ''
                ).toLocaleDateString()} - ${new Date(
                  event?.endDate || ''
                ).toLocaleDateString()}`}
              </Typography>
            </Stack>
           
            <Typography sx={styles.text}>
              {event?.data?.shortDescription}
            </Typography>
          </Paper>

          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>{'Sobre o Evento'}</Typography>
            <Typography sx={styles.text}>
              {event?.data?.description}
            </Typography>
          </Paper>
          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>{'Localização'}</Typography>
            <GoogleMap linkMap={event.data?.linkMaps as string} width={'100%'} />
          </Paper>
        </Stack>
        <Stack width="30%">
          <Paper sx={styles.paper}>
            <Typography sx={styles.title}>{'Inscrições'}</Typography>
          </Paper>
        </Stack>
      </Stack>
    </PageStyle>
  );
}

export { EventsDetails };
