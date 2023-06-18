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

function ListUsers() {
  const mockUsers = [
    {
      id: 1,
      name: 'Felipe',
    },
    {
      id: 2,
      name: 'Miqueias T',
    },
  ];

  return mockUsers.map((user) => {
    return (
      <Grid item xs={12} md={6} key={user.id}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Usuários:</Typography>
            <Stack direction="row" spacing={0.5}>
              {mockUsers.map((user) => {
                return (
                  <Tooltip key={user.id} title={user.name} arrow>
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

export { ListUsers };
