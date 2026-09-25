import {
  Box,
  Button,
  Card,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircleOutline, Undo } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { DataGrid, GridColDef, GridToolbar, ptBR } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { formatCPF } from '../../../../utils';
import CustomChip from '../../../../components/customChip';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { PaymentResponse } from '../../../../types/user';
import { useGetPayments } from '../api/getPayments';
import { usePatchProductsDelivery } from '../api/patchProductsDelivery';
import {
  capaDoProduto,
  descreverItemDoPedido,
  PedidoDeProduto,
  pedidosDeProdutos,
} from '../products';
import { EventProduct } from '../types';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLOR } from '../constants';

interface ListProductOrdersProps {
  search: string;
  /** id do produto escolhido no filtro; vazio é "todos" */
  produtoId?: string;
  /** status de pagamento escolhido no filtro; vazio é "todos" */
  status?: string;
  /** produtos do evento, pela foto e pelo filtro — a lista não traz imagem */
  products?: EventProduct[];
  /** o clique no status leva para a aba de pagamentos, com a pessoa na busca */
  onVerPagamento: (pedido: PedidoDeProduto) => void;
}

/**
 * Aba Produtos: quem comprou o quê, como está o pagamento daquela compra e se
 * ela já foi entregue.
 *
 * Uma linha por compra, com os itens dentro: quem leva duas camisas paga uma
 * vez, e duas linhas dariam a entender que são dois pedidos com dois status.
 * Ingresso e valor ficam de fora de propósito — para dinheiro existe a aba de
 * pagamentos, e é para lá que o status leva.
 *
 * Os dados são os mesmos pagamentos da outra aba: a compra de produto vive
 * dentro do pagamento, então não há uma segunda consulta a fazer.
 */
function ListProductOrders({
  search,
  produtoId,
  status,
  products,
  onVerPagamento,
}: ListProductOrdersProps) {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();

  /**
   * Fotos por produto, vindas do evento que a página já carregou.
   *
   * A foto é base64 no banco, e por isso ela não viaja na lista de pagamentos:
   * seriam os mesmos quilobytes repetidos uma vez por linha. Aqui cada produto
   * entra uma vez só, e a tabela olha no mapa — sem requisição nova.
   */
  const fotos = useMemo(
    () =>
      new Map(
        (products ?? [])
          .filter((produto) => produto.id && capaDoProduto(produto))
          .map((produto) => [produto.id!, capaDoProduto(produto)!])
      ),
    [products]
  );

  const { data: paymentsData, isLoading } = useGetPayments(
    { eventId },
    { enabled: !!eventId }
  );

  const { mutate: registrarEntrega, isLoading: salvandoEntrega } =
    usePatchProductsDelivery();

  const pedidos = pedidosDeProdutos(paymentsData as PaymentResponse[]);

  const busca = search.trim().toLowerCase();
  const filtrados = pedidos.filter((pedido) => {
    const combinaBusca =
      !busca ||
      pedido.fullName?.toLowerCase().includes(busca) ||
      pedido.cpf?.includes(search.trim()) ||
      pedido.email?.toLowerCase().includes(busca) ||
      pedido.itens.some(
        (item) =>
          item.produto.toLowerCase().includes(busca) ||
          item.opcao.toLowerCase().includes(busca)
      );

    // a compra entra inteira quando tem o produto filtrado: o pagamento é um
    // só, e esconder os outros itens dele contaria meia verdade na entrega
    const combinaProduto =
      !produtoId || pedido.itens.some((item) => item.produtoId === produtoId);

    return (
      combinaBusca && combinaProduto && (!status || pedido.status === status)
    );
  });

  const columns: GridColDef[] = [
    {
      field: 'foto',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <UserAvatar
          name={params.row.fullName}
          photoUrl={params.row.profilePhotoUrl}
          sx={{ width: '30px', height: '30px' }}
        />
      ),
    },
    {
      field: 'fullName',
      headerName: 'Comprador',
      flex: 2,
      minWidth: 180,
      cellClassName: 'celula-destaque',
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {formatCPF(params.row.cpf)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'itens',
      headerName: 'Produtos',
      flex: 3,
      minWidth: 260,
      sortable: false,
      // é o texto que a exportação lê; sem isto a planilha sairia com
      // "[object Object]" no lugar da compra
      valueGetter: (params) =>
        (params.row as PedidoDeProduto).itens
          .map(descreverItemDoPedido)
          .join('; '),
      renderCell: (params) => (
        <Stack gap={0.75} sx={{ py: 0.75 }}>
          {(params.row as PedidoDeProduto).itens.map((item) => (
            <Stack key={item.id} direction="row" alignItems="center" gap={1.25}>
              {/* o mesmo avatar dos inscritos: a foto amplia ao passar o
                  mouse, e produto sem foto cai nas iniciais do nome */}
              <UserAvatar
                name={item.produto}
                photoUrl={fotos.get(item.produtoId)}
                variant="rounded"
                sx={{ width: '34px', height: '34px' }}
              />
              <Typography variant="body2">
                {descreverItemDoPedido(item)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ),
    },
    {
      field: 'unidades',
      headerName: 'Itens',
      width: 80,
      cellClassName: 'celula-numerica',
    },
    {
      field: 'avulsa',
      headerName: 'Compra',
      width: 140,
      // texto no lugar do booleano: é o que a exportação leva para a planilha
      valueGetter: (params) =>
        params.row.avulsa ? 'Avulsa' : 'Com a inscrição',
    },
    {
      field: 'status',
      headerName: 'Status do pagamento',
      width: 160,
      renderCell: (params) => (
        <Tooltip title="Ver na aba de pagamentos">
          <Box
            onClick={() => onVerPagamento(params.row as PedidoDeProduto)}
            sx={{ cursor: 'pointer' }}
          >
            <CustomChip
              label={PAYMENT_STATUS(params.value)}
              customColor={PAYMENT_STATUS_COLOR(params.value, theme)}
              clickable
            />
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'entregueEm',
      headerName: 'Entrega',
      width: 200,
      // a data crua é o que a planilha leva; na tela ela vira chip
      valueGetter: (params) =>
        params.row.entregueEm
          ? dayjs(params.row.entregueEm).format('DD/MM/YYYY HH:mm')
          : '',
      renderCell: (params) => {
        const pedido = params.row as PedidoDeProduto;
        const pago = pedido.status === 'PAID';

        // o desfazer fica na própria linha, junto do que ele desfaz
        if (pedido.entregueEm) {
          return (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <CustomChip
                size="small"
                icon={<CheckCircleOutline fontSize="small" />}
                label={dayjs(pedido.entregueEm).format('DD/MM/YY HH:mm')}
                customColor={theme.palette.chips.success}
              />
              <Tooltip title="Desfazer registro de entrega">
                <span>
                  <Button
                    size="small"
                    variant="text"
                    disabled={salvandoEntrega}
                    onClick={() =>
                      registrarEntrega({
                        paymentId: pedido.id,
                        delivered: false,
                      })
                    }
                    sx={{ minWidth: 0, px: 0.5, color: 'text.secondary' }}
                  >
                    <Undo fontSize="small" />
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          );
        }

        // sem o pagamento confirmado o botão fica travado, e o servidor
        // recusa do mesmo jeito: entregar antes de receber é o que o
        // controle existe para impedir
        return (
          <Tooltip title={pago ? '' : 'Só depois que o pagamento estiver pago'}>
            <span>
              <Button
                size="small"
                variant="outlined"
                disabled={!pago || salvandoEntrega}
                onClick={() =>
                  registrarEntrega({ paymentId: pedido.id, delivered: true })
                }
                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Registrar entrega
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Card sx={cardTabelaSx}>
      <DataGrid
        getRowHeight={() => 'auto'}
        rows={filtrados}
        columns={columns}
        loading={isLoading}
        autoHeight
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={dataGridSx(theme)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />
    </Card>
  );
}

export { ListProductOrders };
