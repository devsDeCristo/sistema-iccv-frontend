import {
  Avatar,
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { stringAvatar } from '../../../utils';
import { useGetBedrooms } from '../api/getBedrooms';
import { useParams } from 'react-router-dom';
import { Loading } from '../../../components/loading';
import { Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { ModalBedRoom } from './modalBedRoom';
import { Bedroom } from '../types';
import { useDeleteBedroom } from '../api/deleteBedroom';
import { ConfirmModal } from '../../../components/ConfirmModal';

function ListBedRooms() {
  const { id: eventId = 0 } = useParams();
  const { data: bedroomsData = [], isLoading } = useGetBedrooms({
    eventId: Number(eventId),
  });

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [selectBedRoom, setSelectBedRoom] = useState<Bedroom>();

  const [openModalDeleteBedRoom, setOpenModalDeleteBedRoom] = useState(false);

  const { mutate } = useDeleteBedroom();

  return bedroomsData.map((bedroom) => {
    return isLoading ? (
      <Loading />
    ) : (
      <Grid item xs={12} md={6} key={bedroom.id}>
        <Card variant="outlined" sx={{ padding: 1 }}>
          <Box component="div" display="flex" justifyContent="space-between">
            <Box>
              <Box component="div" display="flex" alignItems="center" gap={0.5}>
                <Typography component="label">Observações:</Typography>
                <Typography>{bedroom.note}</Typography>
              </Box>
              <Box component="div" display="flex" alignItems="center" gap={0.5}>
                <Typography component="label">Usuários:</Typography>
                <Stack direction="row" spacing={0.5}>
                  {bedroom.users.map((user) => {
                    return (
                      <Tooltip
                        title={user.user.fullName}
                        arrow
                        key={user.user.id}
                      >
                        <Avatar {...stringAvatar(user.user.fullName)} />
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
            <Box gap={3} display="flex">
              <Button
                sx={{
                  minWidth: 0,
                  padding: '12px',
                }}
                variant="contained"
                onClick={() => {
                  setOpenModalBedRoom(true);
                  setSelectBedRoom(bedroom);
                }}
              >
                <Edit />
              </Button>
              <Button
                sx={{
                  minWidth: 0,
                  padding: '12px',
                  ':hover': { backgroundColor: 'red' },
                }}
                variant="contained"
                onClick={() => setOpenModalDeleteBedRoom(true)}
              >
                <Delete />
              </Button>
            </Box>
          </Box>
        </Card>

        <ModalBedRoom
          open={openModalBedRoom}
          handleClose={() => setOpenModalBedRoom(false)}
          bedRoom={selectBedRoom}
          eventId={eventId || ''}
        />

        <ConfirmModal
          open={openModalDeleteBedRoom}
          onClose={() => setOpenModalDeleteBedRoom(false)}
          title="Deletar quarto"
          message="Você tem certeza que deseja deletar esse quarto?"
          onConfirm={() => {
            setOpenModalDeleteBedRoom(false);
            mutate({ eventId: Number(eventId), bedRoomId: bedroom.id });
          }}
        />
      </Grid>
    );
  });
}

export { ListBedRooms };
