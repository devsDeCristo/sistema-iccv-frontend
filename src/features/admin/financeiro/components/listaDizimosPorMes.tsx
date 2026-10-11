import { useMemo } from 'react';
import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { EditOutlined, VolunteerActivism } from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import {
  formatBRNumber,
  formatCurrency,
  formatPhoneNumber,
} from '../../../../utils';
import { MESES_CURTOS } from '../constants';
import { Dizimista } from '../types';
import { CelulaDaFamilia, CelulaDoMembro } from './celulasDoDizimista';
import {
  EmFamilia,
  classeDaFamilia,
  emBlocos,
  estiloDasFamilias,
} from '../../membros/familias';

/** A linha do total da igreja, no fim da tabela */
const TOTAL = '__total__';

type Linha = EmFamilia<Dizimista> & { total?: boolean };

interface Props {
  dizimistas: Dizimista[];
  ano: number;
  /** o total da igreja em cada mês, para a última linha */
  porMesDaIgreja: number[];
  totalDaIgreja: number;
  carregando: boolean;
  /** o lápis da linha: o valor do dízimo do membro */
  onEditar: (dizimista: Dizimista) => void;
}

/**
 * Os dizimistas — os membros da igreja —, cada um numa linha: contato, o
 * valor do dízimo, quanto dizimou em cada mês do ano e o total; a última
 * linha soma a igreja. As famílias ficam juntas, como na tela de Membros. O
 * lápis edita o valor do dízimo.
 *
 * Família e membro com as mesmas células de `celulasDoDizimista` (foto, nome, CPF).
 * O valor vai sem o "R$" (as doze colunas não caberiam com ele); o mês sem
 * dízimo mostra um traço, e o que ainda não chegou fica vazio.
 */
function ListaDizimosPorMes({
  dizimistas,
  ano,
  porMesDaIgreja,
  totalDaIgreja,
  carregando,
  onEditar,
}: Props) {
  const theme = useTheme();

  const agora = new Date();
  // meses que já passaram (ou o corrente): os de depois ficam vazios
  const ultimoMes =
    ano < agora.getFullYear()
      ? 12
      : ano > agora.getFullYear()
        ? 0
        : agora.getMonth() + 1;

  const linhas = useMemo<Linha[]>(() => {
    const blocos = emBlocos(dizimistas);
    if (!blocos.length) return [];
    return [
      ...blocos,
      {
        ...blocos[0],
        id: TOTAL,
        fullName: 'Total da igreja',
        family: null,
        posicao: null,
        cor: null,
        porMes: porMesDaIgreja,
        totalNoAno: totalDaIgreja,
        total: true,
      },
    ];
  }, [dizimistas, porMesDaIgreja, totalDaIgreja]);

  const valorDoMes = (valor: number, mes: number, total?: boolean) => {
    if (mes > ultimoMes) return null;
    return (
      <Typography
        fontSize={13}
        fontWeight={total ? 700 : valor ? 600 : 400}
        color={valor ? 'text.primary' : 'text.disabled'}
      >
        {valor ? formatBRNumber(valor) : '—'}
      </Typography>
    );
  };

  const columns: GridColDef<Linha>[] = [
    {
      field: 'familia',
      headerName: 'Família',
      width: 150,
      valueGetter: ({ row }) => row.family?.name ?? '',
      // a linha do total não tem família: nem o traço de "sem família"
      renderCell: ({ row }) =>
        row.total ? null : <CelulaDaFamilia row={row} />,
    },
    {
      field: 'fullName',
      headerName: 'Membro',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) =>
        // a linha do total não é uma pessoa: só o rótulo, em negrito
        row.total ? (
          // a mesma altura das linhas com foto
          <Typography fontSize={14} fontWeight={700} sx={{ py: 2 }}>
            {row.fullName}
          </Typography>
        ) : (
          <CelulaDoMembro row={row} />
        ),
    },
    {
      field: 'contato',
      headerName: 'Contato',
      width: 160,
      valueGetter: ({ row }) =>
        row.total ? '' : `${formatPhoneNumber(row.cellphone)} ${row.email}`,
      renderCell: ({ row }) =>
        row.total ? null : (
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={13}>
              {formatPhoneNumber(row.cellphone)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={row.email}
              component="div"
            >
              {row.email}
            </Typography>
          </Box>
        ),
    },
    {
      field: 'titheAmount',
      headerName: 'Dízimo',
      // o cabeçalho curto cabe; a dica explica o que é
      description:
        'Valor do dízimo. Na importação do banco separa dízimo (este valor) de oferta (outro valor)',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      valueGetter: ({ row }) => (row.total ? null : row.titheAmount),
      renderCell: ({ row }) =>
        row.total ? null : (
          <Typography
            fontSize={13}
            color={row.titheAmount ? 'text.primary' : 'text.disabled'}
          >
            {row.titheAmount ? formatCurrency(row.titheAmount) : '—'}
          </Typography>
        ),
    },
    ...MESES_CURTOS.map((nome, indice): GridColDef<Linha> => ({
      field: `mes${indice + 1}`,
      headerName: nome,
      width: 64,
      align: 'right',
      headerAlign: 'right',
      // a exportação leva o número, não o texto da célula
      valueGetter: ({ row }) => row.porMes[indice],
      renderCell: ({ row }) =>
        valorDoMes(row.porMes[indice], indice + 1, row.total),
    })),
    {
      field: 'totalNoAno',
      headerName: 'Total',
      width: 115,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Typography fontSize={13} fontWeight={700}>
          {formatCurrency(row.totalNoAno)}
        </Typography>
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 52,
      filterable: false,
      disableExport: true,
      align: 'right',
      renderCell: ({ row }) =>
        row.total ? null : (
          <Tooltip title="Valor do dízimo">
            <IconButton size="small" onClick={() => onEditar(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={linhas}
        columns={columns.map((coluna) => ({
          ...coluna,
          sortable: false,
          disableColumnMenu: true,
        }))}
        loading={carregando}
        // a mesma altura da visão por ano: a foto do membro define a linha
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        columnHeaderHeight={44}
        getRowClassName={({ row }) =>
          row.total ? 'linha-total' : classeDaFamilia(row.cor)
        }
        sx={{
          ...dataGridSx(theme),
          ...estiloDasFamilias(60),
          // o total da igreja se destaca: fundo e uma linha acima dele
          '& .linha-total': {
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
            borderTop: `2px solid ${theme.palette.divider}`,
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
              <VolunteerActivism
                sx={{ fontSize: 34, color: 'text.disabled' }}
              />
              <Typography color="text.secondary">
                Nenhum membro nesta igreja ainda
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDizimosPorMes };
