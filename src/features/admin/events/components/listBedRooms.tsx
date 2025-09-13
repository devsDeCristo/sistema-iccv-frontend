import {
  Avatar,
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Pagination,
  Stack,
  Paper,
  useTheme,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';

import { useGetBedrooms } from '../api/getBedrooms';
import { useParams } from 'react-router-dom';
import { Loading } from '../../../../components/loading';
import { Edit, Delete, Bed, MoreVert } from '@mui/icons-material';
import { useState } from 'react';
import { ModalBedRoom } from './modalBedRoom';
import { Bedroom } from '../types';
import { useDeleteBedroom } from '../api/deleteBedroom';
import { ConfirmModal } from '../../../../components/ConfirmModal';

function ListBedRooms({ search }: { search: string }) {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const { data: bedroomsData = [], isLoading } = useGetBedrooms(
    { eventId },
    { enabled: !!eventId }
  );

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [selectBedRoom, setSelectBedRoom] = useState<Bedroom | null>(null);
  const [page, setPage] = useState(1);
  const [openModalDeleteBedRoom, setOpenModalDeleteBedRoom] = useState(false);
  const [anchorElOptionsMobile, setAnchorElOptionsMobile] =
    useState<null | HTMLElement>(null);
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
      mutate({ eventId, bedRoomId: selectedDeleteIdBedRoom });
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
      bedroom.name?.toLowerCase().includes(search.toLowerCase())
    );

  const itemsPerPage = 8;
  const { paginatedData, totalPages } = paginateData(
    filteredData(bedroomsData),
    page,
    itemsPerPage
  );

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'end',
    },
    paperPagination: {
      padding: 2,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    card: {
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: 1,
      position: 'relative',
      height: '100%',
    },
    iconWrapper: {
      background: theme.palette.background.hover,
      borderRadius: '50%',
      height: '35px',
      width: '35px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    roomName: {
      fontSize: '1.3rem',
      fontWeight: 500,
      maxWidth: '85%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
       width:"fit-content",
    },
    chip: {
      margin: '2px',
      height: '24px',
      //color: 'white',
      fontSize: '0.9rem',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
    },
    actionButtons: {
      position: 'absolute',
      top: 8,
      right: 8,
      display: { xs: 'none', md: 'flex' },
    },
    actionButtonsMobile: {
      position: 'absolute',
      top: 8,
      right: 8,
      display: { xs: 'flex', md: 'none' },
    },
    avatar: {
      width: 35,
      height: 35,
    },
    twoLinesText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      width:"fit-content",
    },
  };

  return (
    <Box sx={styles.container}>
      {isLoading && <Loading />}
      <Grid container spacing={2}>
        {paginatedData.map((bedroom) => (
          <Grid item xs={12} md={6} xl={4} key={bedroom.id}>
            <Card sx={styles.card}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={styles.iconWrapper}>
                  <Bed sx={{ fontSize: '20px' }} />
                </Box>
                <Stack sx={{ width: '90%' }}>
                  <Tooltip title={bedroom.name || ''} arrow>
                    <Typography sx={styles.roomName}>
                      {bedroom.name || 'Quarto sem nome'}
                    </Typography>
                  </Tooltip>
                  {/* duas linhas no máximo para a nota do quarto */}
                  <Tooltip title={bedroom.note || ''} arrow>
                    <Typography
                      variant="caption"
                      sx={styles.twoLinesText}
                      mt={-0.5}
                    >
                      {bedroom.note}
                    </Typography>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {bedroom.tag.map((tag) => (
                  <Chip key={tag + 'chips'} label={tag} sx={styles.chip} />
                ))}
              </Stack>
              {bedroom.users.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum usuário atribuído
                </Typography>
              ) : (
                <Stack direction="column" gap={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" fontWeight={500}>
                      Capacidade:
                    </Typography>
                    <Typography variant="body2">
                      {bedroom.users.length || 0}/{bedroom.capacity || 0} (
                      <b>
                        {isNaN(bedroom.users.length / bedroom.capacity) ||
                        !isFinite(bedroom.users.length / bedroom.capacity)
                          ? 0
                          : (
                              (bedroom.users.length / bedroom.capacity || 0) *
                              100
                            ).toFixed(0)}
                        %
                      </b>
                      )
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(bedroom.users.length / bedroom.capacity) * 100}
                    sx={styles.progressBar}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    Participantes:
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {bedroom.users.map((user) => (
                      <Tooltip title={user.fullName} arrow key={user.id}>
                        <Avatar
                          alt={user.fullName}
                          src={user.profilePhotoUrl}
                          sx={styles.avatar}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* opções para edição e exclusão para mobile*/}
              <Stack direction="row" sx={styles.actionButtonsMobile}>
                <IconButton
                  onClick={(e) => setAnchorElOptionsMobile(e.currentTarget)}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorElOptionsMobile}
                  open={Boolean(anchorElOptionsMobile)}
                  onClose={() => setAnchorElOptionsMobile(null)}
                  onClick={() => setAnchorElOptionsMobile(null)}
                >
                  <MenuItem onClick={() => handleEditClick(bedroom)}>
                    <Edit color="warning" sx={{ mr: 1 }} />
                    Editar
                  </MenuItem>
                  <MenuItem onClick={() => handleDeleteClick(bedroom.id)}>
                    <Delete color="error" sx={{ mr: 1 }} />
                    Deletar
                  </MenuItem>
                </Menu>
              </Stack>

              {/* opções para edição e exclusão para md*/}
              <Stack direction="row" sx={styles.actionButtons}>
                <IconButton
                  color="warning"
                  onClick={() => handleEditClick(bedroom)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(bedroom.id)}
                >
                  <Delete />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={styles.paperPagination}>
        <Typography variant="body2">
          Total de Quartos: {bedroomsData.length}
        </Typography>
        <Pagination count={totalPages} page={page} onChange={handleChange} />
      </Paper>
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
