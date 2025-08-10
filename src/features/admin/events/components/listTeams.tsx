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
import { stringAvatar } from '../../../../utils';
import { useParams } from 'react-router-dom';
import { useGetTeams } from '../api/getTeams';
import { Loading } from '../../../../components/loading';
import { useState } from 'react';
import { Team } from '../types';
import { Delete, Edit } from '@mui/icons-material';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { ModalTeam } from './modalTeam';
import { useDeleteTeam } from '../api/deleteTeam';

function ListTeams({ search }: { search: string }) {
  const { id: eventId = '' } = useParams();
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
  const [page, setPage] = useState(1);

  const [openModalDeleteTeam, setOpenModalDeleteTeam] = useState(false);
  const [selectedDeleteIdTeam, setSelectedDeleteIdTeam] = useState<
    string | null
  >(null);

  const { mutate } = useDeleteTeam();

  const handleEditClick = (team: Team) => {
    setOpenModalTeam(true);
    setSelectTeam(team);
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
  const handleChange = (_: unknown, value: number) => {
    setPage(value);
  };
  const paginateData = (data: Team[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
    };
  };
  const filteredData = (teamsData: Team[]) =>
    teamsData.filter((team) =>
      team.name?.toLowerCase().includes(search.toLowerCase())
    );
  const itemsPerPage = 8;
  const { paginatedData, totalPages } = paginateData(
    filteredData(teams),
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
        {paginatedData.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
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
                    <Typography>{team.name}</Typography>
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
                    <Typography>{team.users?.length || 0}</Typography>
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
                      {team.users.map((user) => {
                        return (
                          <Tooltip title={user.fullName} arrow key={user.id}>
                            <Avatar {...stringAvatar(user.fullName)} />
                          </Tooltip>
                        );
                      })}
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
                    onClick={() => handleEditClick(team)}
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
                    onClick={() => handleDeleteClick(team.id)}
                  >
                    <Delete />
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* <Box sx={{ paddingY: 2, width: '100%' }}> */}
      <Pagination count={totalPages} page={page} onChange={handleChange} />
      {/* </Box> */}
      <ModalTeam
        open={openModalTeam}
        handleClose={() => setOpenModalTeam(false)}
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
    </Box>
  );
}

export { ListTeams };
