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
import { useParams } from 'react-router-dom';
import { useGetTeams } from '../api/getTeams';
import { Loading } from '../../../components/loading';
import { useState } from 'react';
import { Team } from '../types';
import { Delete, Edit } from '@mui/icons-material';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { ModalTeam } from './modalTeam';
import { useDeleteTeam } from '../api/deleteTeam';

function ListTeams() {
  const { id: eventId = '' } = useParams();
  const { data: teamsData = [], isLoading } = useGetTeams(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  const [openModalTeam, setOpenModalTeam] = useState(false);
  const [selectTeam, setSelectTeam] = useState<Team | null>(null);

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
  // teamsData.map((team) => {
  return (
    <>
      {isLoading && <Loading />}
      <Grid container spacing={2}>
        {teamsData.map((team) => (
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
                  >
                    <Typography component="label">Observações:</Typography>
                    <Typography>{team.name}</Typography>
                  </Box>
                  <Box
                    component="div"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                  >
                    <Typography component="label">Usuários:</Typography>
                    <Stack direction="row" spacing={0.5}>
                      {team.users.map((user) => {
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
    </>
  );
}

export { ListTeams };
