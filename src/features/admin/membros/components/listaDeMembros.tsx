import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  ButtonBase,
  Card,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccountCircleOutlined,
  DeleteOutline,
  DriveFileRenameOutline,
  FamilyRestroom,
  GroupRemove,
  LinkOff,
  MoreVert,
  People,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  ptBR,
} from '@mui/x-data-grid';

import { UserAvatar } from '../../../../components/userAvatar';
import { BarraDeSelecao } from '../../../../components/barraDeSelecao';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { formatCPF, formatPhoneNumber } from '../../../../utils';
import { Familia, Membro } from '../types';
import { FaixaDaFamilia } from './faixaDaFamilia';
import {
  EmFamilia,
  abreAFamilia,
  classeDaFamilia,
  emBlocos,
  estiloDasFamilias,
} from '../familias';

type Linha = EmFamilia<Membro>;

interface Props {
  membros: Membro[];
  familias: Familia[];
  carregando: boolean;
  onJuntar: (membros: Membro[]) => void;
  onRenomear: (familia: Familia) => void;
  onDesfazer: (familia: Familia) => void;
  onTirarDaFamilia: (membro: Membro) => void;
  onRemover: (membro: Membro) => void;
}

/**
 * Os membros, com as famílias juntas: uma faixa da cor da família à esquerda
 * e um fundo leve dela ligam as linhas de uma mesma família, e o nome dela
 * aparece na primeira. Marcar membros abre a barra para juntá-los numa
 * família.
 */
function ListaDeMembros({
  membros,
  familias,
  carregando,
  onJuntar,
  onRenomear,
  onDesfazer,
  onTirarDaFamilia,
  onRemover,
}: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const linhas = useMemo(() => emBlocos(membros), [membros]);
  const [selecionados, setSelecionados] = useState<GridRowSelectionModel>([]);
  const [menu, setMenu] = useState<{
    ancora: HTMLElement;
    membro?: Membro;
    familia?: Familia;
  } | null>(null);

  const familiaPorId = useMemo(
    () => new Map(familias.map((f) => [f.id, f])),
    [familias]
  );

  const columns: GridColDef<Linha>[] = [
    {
      field: 'familia',
      headerName: 'Família',
      width: 190,
      sortable: false,
      valueGetter: ({ row }) => row.family?.name ?? '',
      renderCell: ({ row }) => {
        if (!row.family || !row.posicao || !row.cor) {
          return (
            <Typography fontSize={13} color="text.disabled">
              —
            </Typography>
          );
        }
        const cor = row.cor;
        const familia = familiaPorId.get(row.family.id);
        return (
          <>
            <FaixaDaFamilia posicao={row.posicao} cor={cor} />
            {abreAFamilia(row.posicao) && familia && (
              <ButtonBase
                onClick={(evento) =>
                  setMenu({ ancora: evento.currentTarget, familia })
                }
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1.5,
                  gap: 0.75,
                  color: cor,
                  fontWeight: 700,
                  fontSize: 13,
                  '&:hover': { backgroundColor: alpha(cor, 0.12) },
                }}
              >
                <FamilyRestroom sx={{ fontSize: 16 }} />
                {row.family.name}
              </ButtonBase>
            )}
          </>
        );
      },
    },
    {
      field: 'fullName',
      headerName: 'Membro',
      flex: 2,
      minWidth: 230,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ py: 1 }}
        >
          <UserAvatar
            name={row.fullName}
            photoUrl={row.profilePhotoUrl}
            sx={{ width: 32, height: 32, fontSize: 13 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
              {row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCPF(row.cpf)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'contato',
      headerName: 'Contato',
      flex: 1.3,
      minWidth: 180,
      sortable: false,
      valueGetter: ({ row }) =>
        `${formatPhoneNumber(row.cellphone)} ${row.email}`,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={13}>
            {formatPhoneNumber(row.cellphone)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'memberSince',
      headerName: 'Membro desde',
      width: 130,
      sortable: false,
      valueFormatter: ({ value }) =>
        value ? new Date(value as string).toLocaleDateString('pt-BR') : '—',
    },
    {
      field: 'acoes',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableExport: true,
      align: 'right',
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          aria-label={`Ações de ${row.fullName}`}
          onClick={(evento) =>
            setMenu({ ancora: evento.currentTarget, membro: row })
          }
        >
          <MoreVert fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const escolhidos = linhas.filter((l) => selecionados.includes(l.id));

  return (
    <>
      <BarraDeSelecao
        quantos={selecionados.length}
        rotuloDaRegiao="Membros selecionados"
        acao={{
          rotulo: 'Juntar em família',
          rotuloCurto: 'Família',
          icone: <FamilyRestroom />,
          onClick: () => {
            onJuntar(escolhidos);
            setSelecionados([]);
          },
        }}
        onLimpar={() => setSelecionados([])}
      />
      <Card
        elevation={0}
        sx={{
          ...cardTabelaSx,
          // a página rola o bastante para a barra flutuante não cobrir a tabela
          mb: selecionados.length ? { xs: 5.5, sm: 6.5 } : 0,
        }}
      >
        <DataGrid
          rows={linhas}
          columns={columns}
          loading={carregando}
          getRowHeight={() => 'auto'}
          autoHeight
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selecionados}
          onRowSelectionModelChange={setSelecionados}
          keepNonExistentRowsSelected
          hideFooterSelectedRowCount
          disableColumnMenu
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          columnHeaderHeight={44}
          // o fundo leve da família, linha a linha
          getRowClassName={({ row }) => classeDaFamilia(row.cor)}
          sx={{
            ...dataGridSx(theme),
            ...estiloDasFamilias(56),
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          slots={{
            noRowsOverlay: () => (
              <Stack
                height="100%"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                py={5}
              >
                <People sx={{ fontSize: 34, color: 'text.disabled' }} />
                <Typography color="text.secondary">
                  Nenhum membro ainda
                </Typography>
              </Stack>
            ),
          }}
        />
      </Card>

      <Menu anchorEl={menu?.ancora} open={!!menu} onClose={() => setMenu(null)}>
        {menu?.familia && [
          <MenuItem
            key="renomear"
            onClick={() => {
              onRenomear(menu.familia as Familia);
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <DriveFileRenameOutline fontSize="small" />
            </ListItemIcon>
            Renomear família
          </MenuItem>,
          <MenuItem
            key="desfazer"
            onClick={() => {
              onDesfazer(menu.familia as Familia);
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <GroupRemove fontSize="small" />
            </ListItemIcon>
            Desfazer família
          </MenuItem>,
        ]}
        {menu?.membro && [
          // a tela de Usuários é só do super admin: a igreja chega no cadastro
          // da pessoa por aqui (e pelos inscritos do evento)
          <MenuItem
            key="cadastro"
            onClick={() => {
              navigate(`/admin/usuario/${(menu.membro as Membro).id}/editar`);
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <AccountCircleOutlined fontSize="small" />
            </ListItemIcon>
            Ver cadastro
          </MenuItem>,
          menu.membro.family && (
            <MenuItem
              key="tirar"
              onClick={() => {
                onTirarDaFamilia(menu.membro as Membro);
                setMenu(null);
              }}
            >
              <ListItemIcon>
                <LinkOff fontSize="small" />
              </ListItemIcon>
              Tirar da família
            </MenuItem>
          ),
          <MenuItem
            key="remover"
            onClick={() => {
              onRemover(menu.membro as Membro);
              setMenu(null);
            }}
            sx={{ color: theme.palette.chips.canceled }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            Deixar de ser membro
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
}

export { ListaDeMembros };
