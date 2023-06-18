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

function ListTeams() {
  const mockTeam = [
    {
      id: 1,
      name: 'Servico',
      users: [
        {
          name: 'Felipe Queiroz',
        },
        {
          name: 'Miqueias Tenorio',
        },
      ],
    },
    {
      id: 2,
      name: 'Decuria Joao',
      users: [
        {
          name: 'Pr Queiroz',
        },
        {
          name: 'Pr Kleber',
        },
      ],
    },
  ];

  return mockTeam.map((team) => {
    return (
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
                  <Tooltip title={user.name} arrow>
                    <Avatar {...stringAvatar(user.name)} />
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
