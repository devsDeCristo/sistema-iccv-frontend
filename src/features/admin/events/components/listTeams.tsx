import {
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  Pagination,
  Stack,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Paper,
} from '@mui/material';

import { useParams } from 'react-router-dom';
import { useGetTeams } from '../api/getTeams';
import { Loading } from '../../../../components/loading';
import { useState } from 'react';
import { Team } from '../types';
import { Delete, Diversity3, Edit, MoreVert } from '@mui/icons-material';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { ModalTeam } from './modalTeam';
import { useDeleteTeam } from '../api/deleteTeam';
import { UserAvatar } from '../../../../components/userAvatar';
import { useGridPagination } from '../../../../hooks/useGridPagination';

function ListTeams({ search }: { search: string }) {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const { data: teamsData = [], isLoading } = useGetTeams(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const teams = teamsData as Team[];
  const [openModalTeam, setOpenModalTeam] = useState(false);
  const [selectTeam, setSelectTeam] = useState<Team | null>(null);
  const [anchorElOptionsMobile, setAnchorElOptionsMobile] =
    useState<null | HTMLElement>(null);
  const [dataOptionsMobile, setDataOptionsMobile] = useState<Team | null>(null);
  const [openModalDeleteTeam, setOpenModalDeleteTeam] = useState(false);
  const [selectedDeleteIdTeam, setSelectedDeleteIdTeam] = useState<
    string | null
  >(null);

  const { mutate } = useDeleteTeam();

  const handleEditClick = (team: Team | null) => {
    setOpenModalTeam(true);
    setSelectTeam(team);
  };
  const handleCloseMenu = () => {
    setAnchorElOptionsMobile(null);
    setDataOptionsMobile(null);
  };

  const handleDeleteClick = (teamId: string) => {
    setOpenModalDeleteTeam(true);
    setSelectedDeleteIdTeam(teamId);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteIdTeam) {
      mutate({ eventId, teamId: selectedDeleteIdTeam });
      setOpenModalDeleteTeam(false);
    }
  };
  const filteredData = (teamsData: Team[]) =>
    teamsData.filter((team) =>
      team.name?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR', {
        sensitivity: 'base',
        numeric: true,
      })
    );

  const { paginatedData, totalPages, page, setPage, rangeStart, rangeEnd, total } =
    useGridPagination(filteredData(teams));

  const handleChange = (_: unknown, value: number) => {
    setPage(value);
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
        {paginatedData.map((team) => (
          <Grid item xs={12} md={6} xl={4} key={team.id}>
            <Card sx={styles.card}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={styles.iconWrapper}>
                  <Diversity3 sx={{ fontSize: '20px' }} />
                </Box>
                <Stack sx={{ width: '90%' }} gap={0.5}>
                  <Tooltip title={team.name || ''} arrow>
                    <Typography sx={styles.roomName}>
                      {team.name || 'Quarto sem nome'}
                    </Typography>
                  </Tooltip>
                  <Tooltip title={team.note || ''} arrow>
                    <Typography
                      variant="caption"
                      sx={styles.twoLinesText}
                      mt={-0.5}
                    >
                      {team.note}
                    </Typography>
                  </Tooltip>
                </Stack>
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
                    {team.users.length || 0}/{team.capacity || 0} (
                   <b>
                        {isNaN(team.users.length / team.capacity) ||
                        !isFinite(team.users.length / team.capacity)
                          ? 0
                          : (
                              (team.users.length / team.capacity || 0) *
                              100
                            ).toFixed(0)}
                        %
                      </b>
                    )
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(team.users.length / team.capacity) * 100 || 0}
                  sx={styles.progressBar}
                />
              </Stack>
              {team.users.length === 0 ? (
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mt: 'auto', mb: 'auto' }}
                >
                  <Diversity3 />
                  <Typography variant="body2" color="text.secondary">
                    Sem participantes
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="column" gap={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Liders:
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {team.users
                      .filter((user) => user.roleTeam === 'LEADER')
                      .map((user) => (
                        <UserAvatar
                          key={user.id}
                          name={user.fullName}
                          photoUrl={user.profilePhotoUrl}
                          sx={styles.avatar}
                        />
                      ))}
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    Participantes:
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {team.users
                      .filter((user) => user.roleTeam === 'MEMBER')
                      .map((user) => (
                        <UserAvatar
                          key={user.id}
                          name={user.fullName}
                          photoUrl={user.profilePhotoUrl}
                          sx={styles.avatar}
                        />
                      ))}
                  </Stack>
                </Stack>
              )}

              {/* opções para edição e exclusão para mobile*/}
              <Stack
                key={team.id + 'mobile'}
                direction="row"
                sx={styles.actionButtonsMobile}
              >
                <IconButton
                  onClick={(e) => {
                    setAnchorElOptionsMobile(e.currentTarget);
                    setDataOptionsMobile(team);
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Stack>

              {/* opções para edição e exclusão para md*/}
              <Stack direction="row" sx={styles.actionButtons}>
                <IconButton
                  color="warning"
                  onClick={() => handleEditClick(team)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(team.id)}
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
          Exibindo {rangeStart}–{rangeEnd} de {total} equipes
        </Typography>
        <Pagination count={totalPages} page={page} onChange={handleChange} />
      </Paper>
      <ModalTeam
        open={openModalTeam}
        handleClose={() => {
          setOpenModalTeam(false);
          setSelectTeam(null);
        }}
        team={selectTeam}
        eventId={eventId || ''}
      />

      <ConfirmModal
        open={openModalDeleteTeam}
        onClose={() => setOpenModalDeleteTeam(false)}
        title="Deletar time"
        message="Você tem certeza que deseja deletar esse time?"
        onConfirm={handleConfirmDelete}
      />
      <Menu
        anchorEl={anchorElOptionsMobile}
        open={Boolean(anchorElOptionsMobile && dataOptionsMobile)}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleEditClick(dataOptionsMobile);
          }}
        >
          <Edit color="warning" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteClick(dataOptionsMobile?.id || '')}
        >
          <Delete color="error" sx={{ mr: 1 }} />
          Deletar
        </MenuItem>
      </Menu>
    </Box>
  );
}

export { ListTeams };
