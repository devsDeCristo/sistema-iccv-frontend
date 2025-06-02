import {
  Avatar,
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Button,
  Pagination,
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

function ListBedRooms({ search }: { search: string }) {
  const { id: eventId = '' } = useParams();
  const { data: bedroomsData = [], isLoading } = useGetBedrooms(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [selectBedRoom, setSelectBedRoom] = useState<Bedroom | null>(null);
  const [page, setPage] = useState(1);

  const [openModalDeleteBedRoom, setOpenModalDeleteBedRoom] = useState(false);
  const [selectedDeleteIdBedRoom, setSelectedDeleteIdBedRoom] = useState<
    string | null
  >(null);

  const { mutate } = useDeleteBedroom();

  const handleEditClick = (bedroom: Bedroom) => {
    setOpenModalBedRoom(true);
    setSelectBedRoom(bedroom);
  };

  const handleDeleteClick = (bedRoomId: string) => {
    setOpenModalDeleteBedRoom(true);
    setSelectedDeleteIdBedRoom(bedRoomId);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteIdBedRoom) {
      mutate({ eventId: eventId, bedRoomId: selectedDeleteIdBedRoom });
      setOpenModalDeleteBedRoom(false);
    }
  };
  const handleChange = (_: unknown, page: number) => {
    setPage(page);
  };

  const paginateData = (
    data: Bedroom[],
    page: number,
    itemsPerPage: number
  ) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
    };
  };
  const filteredData = (bedroomsData: Bedroom[]) =>
    bedroomsData.filter((bedroom) =>
      bedroom.note?.toLowerCase().includes(search.toLowerCase())
    );
  const itemsPerPage = 8;
  const { paginatedData, totalPages } = paginateData(
    filteredData(bedroomsData),
    page,
    itemsPerPage
  );
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'end',
      }}
    >
      {isLoading && <Loading />}
      <Grid container spacing={2}>
        {paginatedData.map((bedroom) => (
          <Grid item xs={12} md={6} key={bedroom.id}>
            <Card variant="outlined" sx={{ padding: 1 }}>
              <Box
                component="div"
                display="flex"
                justifyContent="space-between"
              >
                <Box>
                  <Box
                    component="div"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    flexWrap={'wrap'}
                  >
                    <Typography component="label" fontWeight={'bold'}>
                      Observações:
                    </Typography>
                    <Typography>{bedroom.note}</Typography>
                  </Box>
                  <Box
                    component="div"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    flexWrap={'wrap'}
                  >
                    <Typography component="label" fontWeight={'bold'}>
                      Quantidade:
                    </Typography>
                    <Typography>{bedroom.users.length || 0}</Typography>
                  </Box>
                  <Box
                    component="div"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    flexWrap={'wrap'}
                  >
                    <Typography component="label" fontWeight={'bold'}>
                      Usuários:
                    </Typography>
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      flexDirection="row"
                      gap="5px"
                    >
                      {bedroom.users.map((user) => (
                        <Tooltip title={user.fullName} arrow key={user.id}>
                          <Avatar {...stringAvatar(user.fullName)} />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box gap={3} display="flex">
                  <Button
                    sx={{
                      minWidth: 0,
                      padding: '12px',
                    }}
                    variant="contained"
                    onClick={() => handleEditClick(bedroom)}
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
                    onClick={() => handleDeleteClick(bedroom.id)}
                  >
                    <Delete />
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Pagination count={totalPages} page={page} onChange={handleChange} />
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
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export { ListBedRooms };
