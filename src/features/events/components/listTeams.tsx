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
import { useParams } from 'react-router-dom';
import { useGetTeams } from '../api/getTeams';
import { Loading } from '../../../components/loading';

function ListTeams() {
  const { id: eventId = 0 } = useParams();
  const { data: teamsData = [], isLoading } = useGetTeams({
    eventId: Number(eventId),
  });

  return teamsData.map((team) => {
    return isLoading ? (
      <Loading />
    ) : (
      <Grid item xs={12} md={6} key={team.id}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Observações:</Typography>
            <Typography>{team.name}</Typography>
          </Box>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Usuários:</Typography>
            <Stack direction="row" spacing={0.5}>
              {team.users.map((user) => {
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

export { ListTeams };
