import { Card, CardContent, CardMedia, Typography, Chip, Box, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { mockEvents } from '../constants';

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  location: string;
  image: string;
  price: number;
 
};
function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 1,
        maxWidth: 320,
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Imagem com chips sobrepostos */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={event.image}
          alt={event.name}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          <Chip label={"evento"} color="primary" size="small" sx={{ background: '#e0f2ff', color: '#0077cc' }} />
        </Box>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip label="Active" size="small" sx={{ background: '#f3e8ff', color: '#a855f7' }} />
        </Box>
      </Box>

      {/* Conteúdo */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {event.startDate}
        </Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
          {event.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {event.location}
        </Typography>

        {/* Barra de progresso e preço
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={event.progress}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#ec4899',
                },
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight="bold">
            {event.progress}%
          </Typography>
        </Box> */}

        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: '#ec4899' }}>
          ${event.price}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Cards() {
  const {data=[]}  = useGetEvents({});


  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.isArray(data)
        ? data.map((event: any) => {
            return <EventCard key={event.id} event={event} />;
          })
        : null}
    </Box>
  );
}

export { Cards };
