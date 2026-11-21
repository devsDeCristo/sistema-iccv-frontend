import {
  alpha,
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BusinessOutlined,
  ChevronRight,
  PaymentsOutlined,
  PeopleOutline,
  PlaceOutlined,
  Work,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../components/customChip';
import { cardTabelaSx, dataGridSx } from '../../../components/listPageStyles';
import { formatarData, formatarSalario, prazo } from '../formulario';
import { Info, LogoDaVaga } from './cardDaVaga';
import { OportunidadeDaIgreja } from '../types';

/** Uma ação da linha: ícone com dica; sem `cor`, a primária */
export interface AcaoDaLinha {
  titulo: string;
  icone: React.ReactNode;
  onClick: () => void;
  cor?: string;
}

interface Props {
  oportunidades: OportunidadeDaIgreja[];
  carregando: boolean;
  onInteressados: (oportunidade: OportunidadeDaIgreja) => void;
  /**
   * As ações de cada linha, conforme a situação. Vêm de fora: o admin
   * aprova, encerra e exclui.
   */
  acoesDaLinha: (oportunidade: OportunidadeDaIgreja) => AcaoDaLinha[];
}

const situacao = (o: OportunidadeDaIgreja) =>
  o.status === 'PENDING'
    ? 'Pendente'
    : o.status === 'REJECTED'
      ? 'Recusada'
      : !o.encerrada
        ? 'Aberta'
        : o.isOpen
          ? 'Vencida'
          : 'Encerrada';

/**
 * As vagas da igreja, no painel; as ações de cada uma ficam na própria
 * linha. As propostas do membro são cards (`MinhasPropostas`)
 */
function ListaDaIgreja({
  oportunidades,
  carregando,
  onInteressados,
  acoesDaLinha,
}: Props) {
  const theme = useTheme();

  const corDaSituacao = (o: OportunidadeDaIgreja) =>
    o.status === 'PENDING'
      ? theme.palette.warning.main
      : o.status === 'REJECTED'
        ? theme.palette.error.main
        : o.encerrada
          ? theme.palette.text.secondary
          : theme.palette.success.main;

  const acao = ({
    titulo,
    icone,
    onClick,
    cor = theme.palette.primary.main,
  }: AcaoDaLinha) => (
    <Tooltip key={titulo} title={titulo} arrow>
      <IconButton
        size="small"
        aria-label={titulo}
        onClick={onClick}
        sx={{
          color: cor,
          bgcolor: alpha(cor, 0.08),
          '&:hover': { bgcolor: alpha(cor, 0.18) },
        }}
      >
        {icone}
      </IconButton>
    </Tooltip>
  );

  const columns: GridColDef<OportunidadeDaIgreja>[] = [
    {
      field: 'title',
      headerName: 'Vaga',
      flex: 2,
      minWidth: 280,
      // a logo e as informações com ícone, como no card da vitrine
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ minWidth: 0, py: 1.25 }}
        >
          <LogoDaVaga vaga={row} tamanho={44} />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={700} noWrap>
              {row.title}
            </Typography>
            <Stack
              direction="row"
              columnGap={1.5}
              rowGap={0.25}
              flexWrap="wrap"
              sx={{
                mt: 0.25,
                '& p': { fontWeight: 500, color: 'text.secondary' },
              }}
            >
              <Info icone={<BusinessOutlined />}>{row.company}</Info>
              {row.location && (
                <Info icone={<PlaceOutlined />}>{row.location}</Info>
              )}
              {row.salario && (
                <Info icone={<PaymentsOutlined />}>
                  {formatarSalario(row.salario)}
                </Info>
              )}
            </Stack>
            {row.status === 'REJECTED' && (
              <Typography
                variant="caption"
                color="error.main"
                component="div"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {row.rejectionReason
                  ? `Motivo: ${row.rejectionReason}`
                  : 'Recusada sem motivo informado'}
              </Typography>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'interests',
      headerName: 'Candidaturas',
      width: 230,
      valueGetter: ({ row }) => row.interests.length,
      // candidatura só existe na vaga aprovada
      renderCell: ({ row }) =>
        row.status !== 'APPROVED' ? (
          <Typography color="text.disabled">—</Typography>
        ) : (
          <Button
            size="small"
            startIcon={<PeopleOutline />}
            endIcon={<ChevronRight />}
            onClick={() => onInteressados(row)}
            aria-label={`Ver as candidaturas em ${row.title}`}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {row.interests.length}
            {/* deixa claro que a contagem abre a página dos candidatos */}
            <Box
              component="span"
              sx={{ ml: 0.75,mt:0.2, fontWeight: 500, fontSize: 12, opacity: 0.8 }}
            >
              · Clique para ver
            </Box>
          </Button>
        ),
    },
    {
      field: 'createdAt',
      headerName: 'Publicada',
      width: 140,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1, minWidth: 0 }}>
          <Typography fontSize={13}>{formatarData(row.createdAt)}</Typography>
          {(row.proposedBy ?? row.createdBy) && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              component="div"
            >
              {row.proposedBy ? 'proposta por' : 'por'}{' '}
              {(row.proposedBy ?? row.createdBy)!.fullName.split(' ')[0]}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'closesAt',
      headerName: 'Até',
      width: 140,
      valueFormatter: ({ value }) =>
        value ? formatarData(value as string) : '—',
      // embaixo da data, quanto falta; perto do fim, na cor de atenção
      renderCell: ({ row }) => {
        if (!row.closesAt)
          return <Typography color="text.disabled">—</Typography>;
        const ate =
          row.status === 'APPROVED' && !row.encerrada
            ? prazo(row.closesAt)
            : null;
        const perto = !!ate && /hoje|amanhã|Faltam/.test(ate);
        return (
          <Box sx={{ py: 1, minWidth: 0 }}>
            <Typography fontSize={13}>{formatarData(row.closesAt)}</Typography>
            {ate && (
              <Typography
                variant="caption"
                component="div"
                noWrap
                sx={{
                  color: perto ? 'warning.main' : 'text.secondary',
                  fontWeight: perto ? 700 : 400,
                }}
              >
                {ate}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'isOpen',
      headerName: 'Situação',
      width: 120,
      valueGetter: ({ row }) => situacao(row),
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={situacao(row)}
          customColor={corDaSituacao(row)}
        />
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 170,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.75}>
          {acoesDaLinha(row).map(acao)}
        </Stack>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={oportunidades}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
            minHeight: 56,
          },
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
              <Work sx={{ fontSize: 34, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Nenhuma oportunidade aqui
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDaIgreja };
