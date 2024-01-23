import {
  Avatar,
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import { stringAvatar } from '../../../utils';
import { useGetBedrooms } from '../api/getBedrooms';
import { useParams } from 'react-router-dom';
import { Loading } from '../../../components/loading';

function ListBedRooms() {
  const { id: eventId = 0 } = useParams();
  const { data: bedroomsData = [], isLoading } = useGetBedrooms({
    eventId: Number(eventId),
  });

  return bedroomsData.map((bedroom) => {
    return isLoading ? (
      <Loading />
    ) : (
      <Grid item xs={12} md={6} key={bedroom.id}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Observações:</Typography>
            <Typography>{bedroom.note}</Typography>
          </Box>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Usuários:</Typography>
            <Stack direction="row" spacing={0.5}>
              {bedroom.users.map((user) => {
                return (
                  <Tooltip title={user.user.fullName} arrow key={user.user.id}>
                    <Avatar {...stringAvatar(user.user.fullName)} />
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
        </Card>
      </Grid>
    );
  });
}

export { ListBedRooms };
