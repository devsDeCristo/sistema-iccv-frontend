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

import { useGetTransports } from '../api/getTransports';
import { useParams } from 'react-router-dom';
import { Loading } from '../../../../components/loading';
import {
  Edit,
  Delete,
  DirectionsBus,
  MoreVert,
  Lock,
} from '@mui/icons-material';
import { useState } from 'react';
import { ModalTransport } from './modalTransport';
import { Transport } from '../types';
import CustomChip from '../../../../components/customChip';
import { useDeleteTransport } from '../api/deleteTransport';
import { UserAvatar } from '../../../../components/userAvatar';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { useGridPagination } from '../../../../hooks/useGridPagination';

function ListTransports({
  search,
  groupNames,
}: {
  search: string;
  /** Grupos do evento, para as tags de restrição do modal de transporte */
  groupNames?: string[];
}) {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const { data: transportsData = [], isLoading } = useGetTransports(
    { eventId },
    { enabled: !!eventId }
  );

  const [openModalTransport, setOpenModalTransport] = useState(false);
  const [selectTransport, setSelectTransport] = useState<Transport | null>(
    null
  );
  const [openModalDeleteTransport, setOpenModalDeleteTransport] =
    useState(false);
  const [anchorElOptionsMobile, setAnchorElOptionsMobile] =
    useState<null | HTMLElement>(null);
  const [selectedDeleteIdTransport, setSelectedDeleteIdTransport] = useState<
    string | null
  >(null);

  const { mutate } = useDeleteTransport();

  const handleEditClick = (transport: Transport) => {
    setOpenModalTransport(true);
    setSelectTransport(transport);
  };

  const handleDeleteClick = (transportId: string) => {
    setOpenModalDeleteTransport(true);
    setSelectedDeleteIdTransport(transportId);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteIdTransport) {
      mutate({ eventId, transportId: selectedDeleteIdTransport });
      setOpenModalDeleteTransport(false);
    }
  };

  const filteredData = (transportsData: Transport[]) =>
    transportsData
      .filter((transport) =>
        transport.name?.toLowerCase().includes(search.toLowerCase())
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
  } = useGridPagination(filteredData(transportsData));

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
        {paginatedData.map((transport) => {
          const totalUsuarios = transport.users?.length || 0;
          const capacidade = Number(transport.capacity) || 0;
          const percentualOcupacao =
            capacidade > 0
              ? Math.min(Math.round((totalUsuarios / capacidade) * 100), 100)
              : 0;

          return (
            <Grid item xs={12} md={6} xl={4} key={transport.id}>
              <Card sx={styles.card}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box sx={styles.iconWrapper}>
                    <DirectionsBus sx={{ fontSize: '20px' }} />
                  </Box>
                  <Stack sx={{ width: '90%' }} gap={0.5}>
                    <Tooltip title={transport.name || ''} arrow>
                      <Typography sx={styles.roomName}>
                        {transport.name || 'Transporte sem nome'}
                      </Typography>
                    </Tooltip>
                    {/* duas linhas no máximo para a nota do transporte */}
                    <Tooltip title={transport.note || ''} arrow>
                      <Typography
                        variant="caption"
                        sx={styles.twoLinesText}
                        mt={-0.5}
                      >
                        {transport.note}
                      </Typography>
                    </Tooltip>
                  </Stack>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {transport.tag.map((tag) => (
                    <CustomChip
                      key={tag + 'chips'}
                      label={tag}
                      size="small"
                      customColor={theme.palette.text.secondary}
                    />
                  ))}
                  {/* transporte restrito precisa se anunciar na lista: é o que
                      explica por que nem todo inscrito cabe nele */}
                  {(transport.groupTags || []).map((grupo) => (
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
                      {transport.users.map((user) => (
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
                    <MenuItem onClick={() => handleEditClick(transport)}>
                      <Edit color="warning" sx={{ mr: 1 }} />
                      Editar
                    </MenuItem>
                    <MenuItem onClick={() => handleDeleteClick(transport.id)}>
                      <Delete color="error" sx={{ mr: 1 }} />
                      Deletar
                    </MenuItem>
                  </Menu>
                </Stack>

                {/* opções para edição e exclusão para md*/}
                <Stack direction="row" sx={styles.actionButtons}>
                  <IconButton
                    color="warning"
                    onClick={() => handleEditClick(transport)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(transport.id)}
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
          Exibindo {rangeStart}–{rangeEnd} de {total} transportes
        </Typography>
        <Pagination count={totalPages} page={page} onChange={handleChange} />
      </Paper>
      <ModalTransport
        open={openModalTransport}
        handleClose={() => setOpenModalTransport(false)}
        transport={selectTransport}
        eventId={eventId || ''}
        groupNames={groupNames}
      />
      <ConfirmModal
        open={openModalDeleteTransport}
        onClose={() => setOpenModalDeleteTransport(false)}
        title="Deletar transporte"
        message="Você tem certeza que deseja deletar esse transporte?"
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export { ListTransports };
