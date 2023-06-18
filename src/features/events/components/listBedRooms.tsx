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

function ListBedRooms() {
  const mockBread = [
    {
      id: 1,
      notes: 'Quarto 1',
      users: [
        {
          name: 'Felipe Queiroz',
        },
        {
          name: 'Pamella Queiroz',
        },
        {
          name: 'Lunna Queiroz',
        },
      ],
    },
    {
      id: 12,
      notes: 'Quarto 2',
      users: [
        {
          name: 'Felipe Queiroz',
        },
        {
          name: 'Pamella Queiroz',
        },
        {
          name: 'Lunna Queiroz',
        },
      ],
    },
  ];

  return mockBread.map((bread) => {
    return (
      <Grid item xs={12} md={6} key={bread.id}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Observações:</Typography>
            <Typography>{bread.notes}</Typography>
          </Box>
          <Box component="div" display="flex" alignItems="center" gap={0.5}>
            <Typography component="label">Usuários:</Typography>
            <Stack direction="row" spacing={0.5}>
              {bread.users.map((user) => {
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

export { ListBedRooms };
