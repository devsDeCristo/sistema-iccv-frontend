import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import {
  Add,
  Close,
  Delete,
  EditOutlined,
  Search,
  ChurchOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import {
  campoBuscaSx,
  cardTabelaSx,
  dataGridSx,
  superficieSx,
} from '../../../components/listPageStyles';
import { useGetChurches, Church } from './api/getChurches';
import { useSaveChurch } from './api/saveChurch';
import { useDeleteChurch } from './api/deleteChurch';

const contarEventos = (church: Church) => church._count?.events ?? 0;
const contarAdmins = (church: Church) => church._count?.users ?? 0;

/** Igreja com evento ou administrador vinculado não sai do sistema. */
const temVinculos = (church: Church) =>
  contarEventos(church) > 0 || contarAdmins(church) > 0;

/**
 * Gestão das igrejas — o tenant do sistema.
 *
 * Cada igreja é um painel separado: os eventos, os inscritos deles e as
 * notícias de uma não aparecem para o admin da outra. Mexer nesta lista mexe no
 * recorte de todos os painéis, por isso a tela é só do super admin.
 */
export function Churches() {
  const theme = useTheme();
  const { data, isLoading } = useGetChurches();

  const [busca, setBusca] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Church | null>(null);
  const [nome, setNome] = useState('');
  const [erroDoNome, setErroDoNome] = useState<string | null>(null);

  const fecharForm = () => {
    setFormAberto(false);
    setEmEdicao(null);
    setNome('');
    setErroDoNome(null);
  };

  const { mutate: salvar, isLoading: salvando } = useSaveChurch({
    onSuccess: fecharForm,
  });
  const { mutate: excluir } = useDeleteChurch();

  const abrirForm = (church?: Church) => {
    setEmEdicao(church ?? null);
    setNome(church?.name ?? '');
    setErroDoNome(null);
    setFormAberto(true);
  };

  const enviar = () => {
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3) {
      setErroDoNome('O nome precisa de pelo menos 3 caracteres');
      return;
    }

    salvar({ id: emEdicao?.id, name: nomeLimpo });
  };

  const confirmarExclusao = (church: Church) => {
    Swal.fire({
      title: 'Remover igreja?',
      text: `"${church.name}" sai do sistema e não pode ser recuperada.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      if (resultado.isConfirmed) excluir(church.id);
    });
  };

  const motivoDaRemocao = (church: Church) => {
    if (contarEventos(church) > 0) {
      return 'Tem evento vinculado: removê-la apagaria os eventos junto';
    }

    if (contarAdmins(church) > 0) {
      return 'Tem administrador vinculado: mude o perfil deles antes';
    }

    return 'Remover igreja';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Igreja',
      flex: 2,
      minWidth: 220,
      cellClassName: 'celula-destaque',
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
          <ChurchOutlined sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }} noWrap>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'eventos',
      headerName: 'Eventos',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      cellClassName: 'celula-numerica',
      valueGetter: (params) => contarEventos(params.row as Church),
    },
    {
      // não é "pessoas": inscrito não pertence a igreja nenhuma, o que conta
      // aqui é quem entra no painel dela — admin e financeiro
      field: 'administradores',
      headerName: 'Administradores',
      width: 170,
      align: 'right',
      headerAlign: 'right',
      cellClassName: 'celula-numerica',
      valueGetter: (params) => contarAdmins(params.row as Church),
    },
    {
      field: 'acoes',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 110,
      align: 'right',
      renderCell: (params) => {
        const church = params.row as Church;

        return (
          <Stack direction="row" gap={0.5} justifyContent="flex-end">
            <Tooltip title="Renomear">
              <IconButton size="small" onClick={() => abrirForm(church)}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={motivoDaRemocao(church)}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={temVinculos(church)}
                  onClick={() => confirmarExclusao(church)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const termo = busca.trim().toLowerCase();
  const linhas = (data ?? []).filter(
    (church) => !termo || church.name.toLowerCase().includes(termo)
  );

  const styles = {
    boxFiltro: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      marginY: 2,
      padding: 2,
      ...superficieSx,
    },
    campo: {
      width: { xs: '100%', sm: '380px' },
      ...campoBuscaSx(theme),
    },
    botao: {
      width: { xs: '100%', sm: 'fit-content' },
      borderRadius: 2,
    },
  };

  return (
    <PageStyle>
      <Header
        title="Igrejas"
        description="Cada igreja tem o próprio painel: eventos, inscritos e notícias de uma não aparecem para o admin da outra"
      />

      <Paper sx={styles.boxFiltro}>
        <TextField
          placeholder="Pesquisar por nome"
          variant="outlined"
          size="small"
          value={busca}
          sx={styles.campo}
          onChange={(evento) => setBusca(evento.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: busca ? (
              <InputAdornment position="end">
                <Close
                  sx={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setBusca('')}
                />
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={styles.botao}
          onClick={() => abrirForm()}
        >
          Nova igreja
        </Button>
      </Paper>

      <Card elevation={0} sx={cardTabelaSx}>
        <DataGrid
          rows={linhas}
          columns={columns}
          loading={isLoading}
          autoHeight
          rowHeight={56}
          columnHeaderHeight={44}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={dataGridSx(theme)}
          localeText={{
            ...ptBR.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: termo
              ? 'Nenhuma igreja com esse nome'
              : 'Nenhuma igreja cadastrada',
          }}
        />
      </Card>

      <Dialog
        open={formAberto}
        onClose={fecharForm}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ py: 2 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {emEdicao ? 'Renomear igreja' : 'Nova igreja'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emEdicao
              ? 'O nome aparece na escolha da igreja ao criar evento e ao dar permissão.'
              : 'Ela nasce vazia: depois é só criar o admin e os eventos dela.'}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nome da igreja"
            placeholder="Ex: Igreja Primeira Assembleia"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              if (erroDoNome) setErroDoNome(null);
            }}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') enviar();
            }}
            error={!!erroDoNome}
            helperText={erroDoNome}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={fecharForm} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={enviar} disabled={salvando}>
            {emEdicao ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageStyle>
  );
}
