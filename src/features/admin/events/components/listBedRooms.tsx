import {
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Pagination,
  Stack,
  Paper,
  useTheme,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';

import { useGetBedrooms } from '../api/getBedrooms';
import { useParams } from 'react-router-dom';
import { Loading } from '../../../../components/loading';
import { Edit, Delete, Bed, MoreVert, Lock } from '@mui/icons-material';
import { useState } from 'react';
import { ModalBedRoom } from './modalBedRoom';
import { Bedroom } from '../types';
import CustomChip from '../../../../components/customChip';
import { useDeleteBedroom } from '../api/deleteBedroom';
import { UserAvatar } from '../../../../components/userAvatar';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { useGridPagination } from '../../../../hooks/useGridPagination';

function ListBedRooms({
  search,
  groupNames,
}: {
  search: string;
  /** Grupos do evento, para as tags de restrição do modal de quarto */
  groupNames?: string[];
}) {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const { data: bedroomsData = [], isLoading } = useGetBedrooms(
    { eventId },
    { enabled: !!eventId }
  );

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [selectBedRoom, setSelectBedRoom] = useState<Bedroom | null>(null);
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

  const filteredData = (bedroomsData: Bedroom[]) =>
    bedroomsData
      .filter((bedroom) =>
        bedroom.name?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR', {
          sensitivity: 'base',
          numeric: true,
        })
      );

  const {
    paginatedData,
    totalPages,
    page,
    setPage,
    rangeStart,
    rangeEnd,
    total,
  } = useGridPagination(filteredData(bedroomsData));

  const handleChange = (_: unknown, page: number) => {
    setPage(page);
  };

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
      width: 'fit-content',
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
      width: 'fit-content',
    },
  };

  return (
    <Box sx={styles.container}>
      {isLoading && <Loading />}
      <Grid container spacing={2}>
        {paginatedData.map((bedroom) => {
          const totalUsuarios = bedroom.users?.length || 0;
          const capacidade = Number(bedroom.capacity) || 0;
          const percentualOcupacao =
            capacidade > 0
              ? Math.min(Math.round((totalUsuarios / capacidade) * 100), 100)
              : 0;

          return (
            <Grid item xs={12} md={6} xl={4} key={bedroom.id}>
              <Card sx={styles.card}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box sx={styles.iconWrapper}>
                    <Bed sx={{ fontSize: '20px' }} />
                  </Box>
                  <Stack sx={{ width: '90%' }} gap={0.5}>
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
                    <CustomChip
                      key={tag + 'chips'}
                      label={tag}
                      size="small"
                      customColor={theme.palette.text.secondary}
                    />
                  ))}
                  {/* quarto restrito precisa se anunciar na lista: é o que
                      explica por que o check-in não aloca todo mundo nele */}
                  {(bedroom.groupTags || []).map((grupo) => (
                    <CustomChip
                      key={grupo + 'grupo'}
                      label={grupo}
                      size="small"
                      customColor={theme.palette.primary.main}
                      icon={
                        <Lock
                          sx={{
                            fontSize: 13,
                            // o ícone herda a cor do texto do chip
                            color: 'inherit !important',
                          }}
                        />
                      }
                    />
                  ))}
                </Stack>
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
                      {totalUsuarios}/{capacidade} (<b>{percentualOcupacao}%</b>
                      )
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percentualOcupacao}
                    sx={styles.progressBar}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    Participantes:
                  </Typography>
                  {totalUsuarios === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum usuário atribuído
                    </Typography>
                  ) : (
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {bedroom.users.map((user) => (
                        <UserAvatar
                          key={user.id}
                          name={user.fullName}
                          photoUrl={user.profilePhotoUrl}
                          sx={styles.avatar}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>

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
          );
        })}
      </Grid>
      <Paper sx={styles.paperPagination}>
        <Typography variant="body2">
          Exibindo {rangeStart}–{rangeEnd} de {total} quartos
        </Typography>
        <Pagination count={totalPages} page={page} onChange={handleChange} />
      </Paper>
      <ModalBedRoom
        open={openModalBedRoom}
        handleClose={() => setOpenModalBedRoom(false)}
        bedRoom={selectBedRoom}
        eventId={eventId || ''}
        groupNames={groupNames}
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
