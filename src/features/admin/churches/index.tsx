import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import {
  useGetChurches,
  GET_CHURCHES,
  Church,
} from '../users/api/getChurches';
import { useCreateChurch } from './api/createChurch';
import { useUpdateChurch } from './api/updateChurch';
import { useDeleteChurch } from './api/deleteChurch';
import { useState } from 'react';
import { queryClient } from '../../../config/lib/react-query/query-client';

const temVinculos = (church: Church) =>
  (church._count?.events ?? 0) > 0 || (church._count?.users ?? 0) > 0;

/**
 * Gestão das igrejas — o tenant do sistema. Cada uma recorta os eventos, as
 * pessoas e as notícias do painel de quem pertence a ela, por isso a tela é só
 * do super admin.
 */
export function Churches() {
  const { data: churches = [], isLoading } = useGetChurches();
  const { mutate: createChurch, isLoading: isCreating } = useCreateChurch();
  const { mutate: updateChurch, isLoading: isUpdating } = useUpdateChurch();
  const { mutate: deleteChurch, isLoading: isDeleting } = useDeleteChurch();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = (church?: Church) => {
    if (church) {
      setEditingId(church.id);
      setFormData({ name: church.name });
    } else {
      setEditingId(null);
      setFormData({ name: '' });
    }
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '' });
    setError(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError('Nome da igreja é obrigatório');
      return;
    }

    if (editingId) {
      updateChurch(
        { churchId: editingId, data: { name: formData.name } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(GET_CHURCHES);
            handleCloseDialog();
          },
          onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao atualizar');
          },
        }
      );
    } else {
      createChurch(
        { name: formData.name },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(GET_CHURCHES);
            handleCloseDialog();
          },
          onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao criar');
          },
        }
      );
    }
  };

  const handleDelete = (churchId: string) => {
    setError(null);

    deleteChurch(churchId, {
      onSuccess: () => {
        queryClient.invalidateQueries(GET_CHURCHES);
        setConfirmDelete(null);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Erro ao deletar');
      },
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Gerenciamento de Igrejas"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nova Igreja
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Typography>Carregando igrejas...</Typography>
          ) : churches.length === 0 ? (
            <Alert severity="info">Nenhuma igreja cadastrada</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Eventos
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Pessoas
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {churches.map((church) => (
                    <TableRow
                      key={church.id}
                      sx={{
                        '&:hover': { backgroundColor: '#fafafa' },
                      }}
                    >
                      <TableCell>{church.name}</TableCell>
                      <TableCell align="center">
                        {church._count?.events ?? 0}
                      </TableCell>
                      <TableCell align="center">
                        {church._count?.users ?? 0}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(church)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {/* igreja com evento ou pessoa vinculada não sai:
                              o banco levaria os eventos junto (cascade) */}
                          <Tooltip
                            title={
                              temVinculos(church)
                                ? 'Transfira os eventos e as pessoas antes de remover'
                                : 'Remover igreja'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setConfirmDelete(church.id)}
                                color="error"
                                disabled={temVinculos(church)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Igreja' : 'Nova Igreja'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nome da Igreja"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            placeholder="Ex: Igreja Primeira Assembléia"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {editingId ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => {
          setConfirmDelete(null);
          setError(null);
        }}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          {/* o backend recusa igreja com vínculo; sem este alerta o clique
              parecia não fazer nada */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Tem certeza que deseja deletar esta igreja? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
