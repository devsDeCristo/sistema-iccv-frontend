import {
  Box,
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridRowSelectionModel,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../api/getEvents';
import { formatDate } from '../../../../utils';
import {
  DeleteOutline,
  EditNoteOutlined,
  PublishedWithChangesOutlined,
  MoreVert,
  LoginOutlined,
  WebOutlined,
} from '@mui/icons-material';
import { useRole } from '../../../../hooks/useRole';
import { Role } from '../../../../constants/roles';
import CustomChip from '../../../../components/customChip';
import { EventPeriodFilter, EventStatus, EventStatusFilter } from '../types';
import { faseDoEvento } from '../utils/eventStatus';
import { EVENT_STATUS_LABELS } from '../constants';
import { ModuloDoEvento, moduloAtivo } from '../eventModules';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { EventoParaApagar, ModalDeleteEvent } from './modalDeleteEvent';
import { ModalStatusEmMassa } from './modalStatusEmMassa';
import { BarraDeSelecao } from '../../../../components/barraDeSelecao';

type AcaoDoEvento = {
  rotulo: string;
  icone: ReactNode;
  cor: string;
  aoClicar: () => void;
};

/**
 * As ações da linha, num menu só.
 *
 * Em botões soltos a coluna crescia a cada ação nova e três ícones coloridos
 * lado a lado disputavam a atenção com os dados da tabela. Nos três pontos cada
 * ação ganha nome escrito, e a cor volta a ser o que separa uma da outra — não
 * o que grita na linha inteira.
 */
function AcoesDoEvento({ acoes }: { acoes: AcaoDoEvento[] }) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Ações">
        <IconButton
          size="medium"
          aria-label="Ações do evento"
          onClick={(evento) => setAncora(evento.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={ancora}
        open={!!ancora}
        onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {acoes.map((acao) => (
          <MenuItem
            key={acao.rotulo}
            onClick={() => {
              setAncora(null);
              acao.aoClicar();
            }}
          >
            <ListItemIcon sx={{ color: acao.cor, minWidth: 34 }}>
              {acao.icone}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              {acao.rotulo}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);

  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
/** O status que cada opção do filtro quer */
const STATUS_DO_FILTRO: Record<EventStatusFilter, EventStatus> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  test: 'TEST',
};

/** Os módulos ligados no evento, com a contagem de cada um */
const modulosDaLinha = (row: any) =>
  [
    { chave: 'bedrooms', quantos: row.bedroom ?? 0, nome: 'quartos' },
    { chave: 'teams', quantos: row.team ?? 0, nome: 'equipes' },
    { chave: 'transport', quantos: row.transport ?? 0, nome: 'transportes' },
  ].filter(({ chave }) => moduloAtivo(row.data, chave as ModuloDoEvento));

function List({
  search,
  status = [],
  period = [],
  churchId = 'all',
}: {
  search: string;
  /** Os status marcados; vazio é todos */
  status?: EventStatusFilter[];
  /** Os períodos marcados (já passou, acontecendo, futuro); vazio é todos */
  period?: EventPeriodFilter[];
  /** 'all' = todas. Só o super admin recebe evento de mais de uma igreja */
  churchId?: string;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDev, isSuperAdmin, isAdmin, perfilNaIgreja, adminDoEvento } =
    useRole();
  /** marcados na tabela: alimentam a barra flutuante e a exportação */
  const [selecionados, setSelecionados] = useState<GridRowSelectionModel>([]);
  const [statusAberto, setStatusAberto] = useState(false);
  const [eventoParaApagar, setEventoParaApagar] =
    useState<EventoParaApagar | null>(null);
  const { data: eventData, isLoading } = useGetEvents({ painel: true });
  const events = Array.isArray(eventData) ? eventData : [];
  const filteredData = events.filter((event: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = event.name.toLowerCase().includes(searchLower);
    const matchesStatus =
      !status.length ||
      status.some((opcao) => event.status === STATUS_DO_FILTRO[opcao]);
    const matchesPeriod =
      !period.length || period.includes(faseDoEvento(event));
    const matchesChurch = churchId === 'all' || event.church?.id === churchId;

    return matchesSearch && matchesStatus && matchesPeriod && matchesChurch;
  });
  const columns: GridColDef[] = [
    // o tipo primeiro: é por ele que se bate o olho na lista (cursilho, retiro)
    {
      field: 'type',
      headerName: 'Tipo',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={params.value || 'Cursilho'}
          size="small"
          customColor={theme.palette.chips.default}
        />
      ),
    },
    // sem coluna de igreja: a lista é sempre de uma igreja, a do seletor —
    // e o super admin vê exatamente o que o admin dela vê
    { field: 'name', headerName: 'Nome', flex: 2, minWidth: 180 },
    {
      // início e fim numa coluna só. O valor é a data de início, e não o
      // texto: ordenar por "dd/mm/aaaa" poria 01/12 antes de 31/01. O texto
      // é só da tela e da exportação (`valueFormatter`)
      field: 'startDate',
      headerName: 'Período',
      width: 120,
      type: 'date',
      valueGetter: (params) => new Date(params.row.startDate),
      valueFormatter: (params) => {
        const row = params.api.getRow(params.id!);
        const [inicio, fim] = [
          formatDate(row.startDate),
          formatDate(row.endDate),
        ];
        return inicio === fim ? inicio : `${inicio} a ${fim}`;
      },
      renderCell: (params) => {
        const inicio = formatDate(params.row.startDate);
        const fim = formatDate(params.row.endDate);
        return (
          <Stack sx={{ py: 1 }}>
            <Typography variant="body2" noWrap>
              {inicio}
            </Typography>
            {/* evento de um dia: "até" a mesma data não diz nada */}
            {fim !== inicio && (
              <Typography variant="caption" color="text.secondary" noWrap>
                até {fim}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'location',
      headerName: 'Local',
      width: 200,
      valueGetter: () => 'Chácara Monte Moriá',
    },
    {
      // inscritos e lista de espera numa coluna só: são a mesma pergunta,
      // "quanto da vaga está tomado"
      field: 'users',
      headerName: 'Vagas',
      width: 130,
      valueGetter: (params) =>
        `${params.row.users ?? 0}/${params.row.capacity ?? 0} inscritos, ${
          params.row.waitlist ?? 0
        } em espera`,
      renderCell: (params) => (
        <Stack gap={0.25} sx={{ py: 1 }}>
          <Typography variant="body2" noWrap>
            <Box component="span" sx={{ fontWeight: 700 }}>
              {params.row.users ?? 0}
            </Box>
            /{params.row.capacity ?? 0} inscritos
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.waitlist ?? 0} em espera
          </Typography>
        </Stack>
      ),
    },
    {
      // um módulo por linha, só os ligados no evento: o que está desligado
      // não tem aba no painel, e um "0 quartos" sugeriria que falta cadastrar
      field: 'modulos',
      headerName: 'Módulos',
      width: 140,
      sortable: false,
      valueGetter: (params) =>
        modulosDaLinha(params.row)
          .map(({ quantos, nome }) => `${quantos} ${nome}`)
          .join(', ') || '—',
      renderCell: (params) => {
        const modulos = modulosDaLinha(params.row);
        return modulos.length ? (
          // linhas coladas: três módulos não passam da altura da coluna Vagas
          <Stack sx={{ py: 1 }}>
            {modulos.map(({ chave, quantos, nome }) => (
              <Typography
                key={chave}
                variant="caption"
                noWrap
                sx={{ lineHeight: 1.35 }}
              >
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {quantos}
                </Box>{' '}
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {nome}
                </Box>
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            Nenhum
          </Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={EVENT_STATUS_LABELS[params.value] || 'Inativo'}
          // teste em cor de atenção: é um evento que existe mas não está no ar
          customColor={
            params.value === 'ACTIVE'
              ? theme.palette.chips.success
              : params.value === 'TEST'
                ? theme.palette.chips.alert
                : theme.palette.chips.canceled
          }
          size="small"
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Ações',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        // linha a linha: a mesma pessoa pode administrar a igreja de um evento
        // e ser só tesouraria na do evento de baixo (ou admin só deste evento)
        const podeEditar =
          isSuperAdmin ||
          perfilNaIgreja(params.row.church?.id) === Role.ADMIN ||
          adminDoEvento(params.row.id);

        return (
          <AcoesDoEvento
            acoes={[
              {
                rotulo: 'Acessar',
                icone: <LoginOutlined fontSize="small" />,
                cor: theme.palette.primary.main,
                aoClicar: () =>
                  navigate(`/admin/eventos/${params.row.id}/detalhes/usuarios`),
              },
              ...(podeEditar
                ? [
                    {
                      rotulo: 'Editar',
                      icone: <EditNoteOutlined fontSize="small" />,
                      cor: theme.palette.chips.alert,
                      aoClicar: () =>
                        navigate(`/admin/eventos/${params.row.id}/editar`),
                    },
                  ]
                : []),
              {
                rotulo: 'Página oficial',
                icone: <WebOutlined fontSize="small" />,
                cor: theme.palette.chips.info,
                // em outra aba: o admin volta para a lista onde parou, em vez
                // de refazer busca e filtros no caminho de volta
                aoClicar: () =>
                  window.open(
                    `/eventos/${params.row.id}`,
                    '_blank',
                    'noopener'
                  ),
              },
              // apagar evento é decisão de negócio, e por ora só o perfil de
              // desenvolvimento a toma; a rota no servidor confere o mesmo
              ...(isDev
                ? [
                    {
                      rotulo: 'Excluir',
                      icone: <DeleteOutline fontSize="small" />,
                      cor: theme.palette.error.main,
                      aoClicar: () =>
                        setEventoParaApagar({
                          id: params.row.id,
                          name: params.row.name,
                        }),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];

  // function onRowClick({ row }: GridRowParams) {
  //   navigate(`/admin/eventos/${row.id}/detalhes/usuarios`);
  // }

  return (
    <Card
      sx={{
        ...cardTabelaSx,
        // o lugar da barra flutuante no fim da página — ver a lista de
        // usuários, que tem a mesma conta
        mb: selecionados.length ? { xs: 5.5, sm: 6.5 } : 0,
      }}
    >
      <BarraDeSelecao
        quantos={selecionados.length}
        rotuloDaRegiao="Eventos selecionados"
        acao={
          isAdmin
            ? {
                rotulo: 'Mudar status',
                rotuloCurto: 'Status',
                icone: <PublishedWithChangesOutlined />,
                onClick: () => setStatusAberto(true),
              }
            : undefined
        }
        onLimpar={() => setSelecionados([])}
      />
      <ModalStatusEmMassa
        open={statusAberto}
        eventIds={selecionados.map(String)}
        onClose={() => setStatusAberto(false)}
        onConcluir={(recusados) => {
          setStatusAberto(false);
          setSelecionados(recusados);
        }}
      />
      <DataGrid
        loading={isLoading}
        // marcar é pela caixa: o clique na linha não marca ninguém
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selecionados}
        onRowSelectionModelChange={setSelecionados}
        // busca e filtro escondem linhas, mas não desmarcam quem foi marcado
        keepNonExistentRowsSelected
        // a contagem fica na barra flutuante
        hideFooterSelectedRowCount
        //onRowClick={onRowClick}
        rows={filteredData}
        columns={columns}
        autoHeight={true}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
        columnHeaderHeight={44}
        // altura pelo conteúdo: a coluna Módulos tem até três linhas
        getRowHeight={() => 'auto'}
        sx={dataGridSx(theme)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />

      <ModalDeleteEvent
        evento={eventoParaApagar}
        onFechar={() => setEventoParaApagar(null)}
      />
    </Card>
  );
}

export { List };
