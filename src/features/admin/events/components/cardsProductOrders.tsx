import { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  Inventory2Outlined,
  LocalShippingOutlined,
  PendingActionsOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';

import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { UserAvatar } from '../../../../components/userAvatar';
import { PaymentResponse } from '../../../../types/user';
import { useGetPayments } from '../api/getPayments';
import {
  pedidosDeProdutos,
  ResumoDeProduto,
  resumoDeProdutos,
} from '../products';
import { EventProduct } from '../types';

interface CardsProductOrdersProps {
  eventId: string;
  /** produtos do evento, pela foto — a lista de pagamentos não traz imagem */
  products?: EventProduct[];
  /** produto filtrado hoje; vazio é "todos" */
  produtoId?: string;
  /** clicar numa linha filtra a tabela abaixo por aquele produto */
  onSelecionarProduto: (produtoId: string) => void;
}

/**
 * As métricas da aba Produtos.
 *
 * Duas camadas, porque são duas perguntas diferentes. A régua de cards responde
 * a do evento inteiro — quantas compras, quantas peças, quanto falta receber e
 * quanto falta entregar. A lista abaixo responde a do estoque: quantas peças de
 * cada produto, e em que pé elas estão.
 *
 * **Por que uma lista e não um card por produto.** Um evento pode vender
 * dezenas de produtos, e uma régua de cards que cresce com o catálogo empurra a
 * tabela para fora da tela — além de ficar ilegível em três por linha. A lista
 * dá uma linha a cada produto, ordenada do mais vendido para o menos, com
 * altura máxima e rolagem: o catálogo cresce e o bloco não.
 *
 * **Por que a barra.** O número sozinho ("120 peças") não diz o que fazer com
 * ele. A barra parte o total em entregue, a entregar e aguardando pagamento —
 * a mesma divisão que a coluna de entrega da tabela usa —, então dá para ver
 * numa passada quais produtos têm fila de separação.
 *
 * A lista nasce recolhida. O que a aba serve primeiro é a tabela de pedidos —
 * quem abre aqui está atrás do estoque, e é uma pergunta de vez em quando, não
 * de toda visita. Fechada, o bloco cabe em uma linha e o resumo dela (quantos
 * produtos, quantas peças) já fica no próprio cabeçalho.
 *
 * As variantes só aparecem no produto escolhido. Mostrar todas de uma vez
 * transformaria o bloco na parede de números que a lista existe para evitar; e
 * o momento em que os tamanhos importam é justamente o de separar um produto.
 *
 * As contagens ignoram busca e filtros de propósito — ver `resumoDeProdutos`.
 */
function CardsProductOrders({
  eventId,
  products,
  produtoId,
  onSelecionarProduto,
}: CardsProductOrdersProps) {
  const theme = useTheme();
  const { data, isLoading } = useGetPayments(
    { eventId },
    { enabled: !!eventId }
  );

  const resumo = useMemo(
    () => resumoDeProdutos(pedidosDeProdutos(data as PaymentResponse[])),
    [data]
  );

  const fotos = useMemo(
    () =>
      new Map(
        (products ?? [])
          .filter((produto) => produto.id && produto.image)
          .map((produto) => [produto.id!, produto.image!])
      ),
    [products]
  );

  const cores = {
    entregues: theme.palette.chips.success,
    aEntregar: theme.palette.chips.info,
    pendentes: theme.palette.chips.alert,
  };

  const cards: StatusCard[] = [
    {
      title: 'Compras',
      value: resumo.pedidos,
      subtitle: 'Pedidos com produto',
      icon: <ShoppingBagOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Peças vendidas',
      value: resumo.unidades,
      subtitle: 'Somando todas as compras',
      icon: <Inventory2Outlined sx={{ fontSize: 20 }} />,
      color: cores.aEntregar,
    },
    {
      title: 'Aguardando pagamento',
      value: resumo.pagamentosPendentes,
      subtitle: 'Não se entrega antes disso',
      icon: <PendingActionsOutlined sx={{ fontSize: 20 }} />,
      color: cores.pendentes,
    },
    {
      title: 'A entregar',
      value: resumo.aEntregar,
      subtitle: `${resumo.entregues} já ${
        resumo.entregues === 1 ? 'entregue' : 'entregues'
      }`,
      icon: <LocalShippingOutlined sx={{ fontSize: 20 }} />,
      color: cores.entregues,
    },
  ];

  const styles = {
    painel: {
      p: { xs: 1.5, sm: 2 },
      display: 'flex',
      flexDirection: 'column',
    },
    sanfona: {
      bgcolor: 'transparent',
      // o Accordion é um Paper, e o tema carimba sombra em todo Paper pelo
      // `styleOverrides.root` — que o `elevation={0}` não desfaz, porque
      // override ganha de prop. Sem isto a sanfona vira uma caixa flutuante
      // dentro de outra que já tem a sua.
      boxShadow: 'none',
      // o filete que o MUI desenha acima de todo Accordion serve para separar
      // um do outro numa pilha; aqui há um só, dentro de um Paper com borda
      '&::before': { display: 'none' },
      '& .MuiAccordionSummary-root': {
        minHeight: 0,
        px: 0,
        '&.Mui-expanded': { minHeight: 0 },
      },
      '& .MuiAccordionSummary-content': {
        my: 0,
        '&.Mui-expanded': { my: 0 },
      },
      '& .MuiAccordionDetails-root': { px: 0, pt: 1.5, pb: 0 },
    },
    lista: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      // o catálogo cresce, o bloco não: a partir de umas cinco linhas a lista
      // rola dentro de si em vez de empurrar a tabela para fora da tela
      maxHeight: 264,
      overflowY: 'auto',
      pr: 0.5,
    },
    linha: (selecionado: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1,
      borderRadius: 2,
      cursor: 'pointer',
      textAlign: 'left',
      border: `1px solid ${
        selecionado ? alpha(theme.palette.primary.main, 0.5) : 'transparent'
      }`,
      backgroundColor: selecionado
        ? alpha(theme.palette.primary.main, 0.08)
        : 'transparent',
      transition: theme.transitions.create([
        'background-color',
        'border-color',
      ]),
      '&:hover': { backgroundColor: theme.palette.action.hover },
    }),
    barra: {
      display: 'flex',
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: alpha(theme.palette.text.primary, 0.08),
    },
  };

  const Legenda = ({ cor, texto }: { cor: string; texto: string }) => (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Box
        sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cor }}
      />
      <Typography variant="caption" color="text.secondary">
        {texto}
      </Typography>
    </Stack>
  );

  const Fatia = ({
    valor,
    total,
    cor,
    titulo,
  }: {
    valor: number;
    total: number;
    cor: string;
    titulo: string;
  }) =>
    valor > 0 ? (
      <Tooltip title={`${titulo}: ${valor}`}>
        <Box
          sx={{ width: `${(valor / total) * 100}%`, backgroundColor: cor }}
        />
      </Tooltip>
    ) : null;

  const Linha = ({ item }: { item: ResumoDeProduto }) => {
    const selecionado = produtoId === item.produtoId;

    return (
      <Box
        role="button"
        tabIndex={0}
        // clicar de novo no produto já escolhido volta para "todos": é o
        // caminho de volta esperado de um filtro que se liga por clique
        onClick={() => onSelecionarProduto(selecionado ? '' : item.produtoId)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelecionarProduto(selecionado ? '' : item.produtoId);
          }
        }}
        sx={styles.linha(selecionado)}
      >
        <UserAvatar
          name={item.produto}
          photoUrl={fotos.get(item.produtoId)}
          variant="rounded"
          sx={{ width: '34px', height: '34px' }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" gap={1}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ flex: 1 }}
            >
              {item.produto}
            </Typography>
            <Typography variant="body2" fontWeight={600} flexShrink={0}>
              {item.unidades}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                {' '}
                {item.unidades === 1 ? 'peça' : 'peças'}
              </Typography>
            </Typography>
          </Stack>

          <Box sx={{ ...styles.barra, mt: 0.75 }}>
            <Fatia
              valor={item.entregues}
              total={item.unidades}
              cor={cores.entregues}
              titulo="Entregues"
            />
            <Fatia
              valor={item.aEntregar}
              total={item.unidades}
              cor={cores.aEntregar}
              titulo="A entregar"
            />
            <Fatia
              valor={item.pendentes}
              total={item.unidades}
              cor={cores.pendentes}
              titulo="Aguardando pagamento"
            />
          </Box>

          {selecionado && item.variantes.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75 }}
            >
              {item.variantes
                .map((variante) => `${variante.opcao} ×${variante.unidades}`)
                .join(' · ')}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Stack gap={2}>
        <StatusCards cards={cards} isLoading sx={{ mb: 0 }} />
        <Skeleton variant="rounded" height={140} />
      </Stack>
    );
  }

  // evento sem venda nenhuma não ganha um painel vazio: a tabela abaixo já diz
  // que não há pedidos, e dois vazios empilhados são só ruído
  if (!resumo.pedidos) return null;

  return (
    <Stack gap={2}>
      <StatusCards cards={cards} sx={{ mb: 0 }} />

      <Paper sx={styles.painel}>
        <Accordion disableGutters square elevation={0} sx={styles.sanfona}>
          <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
            <Stack
              direction="row"
              alignItems="baseline"
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Peças por produto
              </Typography>
              {/* fechada, a sanfona ainda precisa dizer o que guarda */}
              <Typography variant="caption" color="text.secondary">
                {resumo.porProduto.length}{' '}
                {resumo.porProduto.length === 1 ? 'produto' : 'produtos'} ·{' '}
                {resumo.unidades} {resumo.unidades === 1 ? 'peça' : 'peças'}
              </Typography>
            </Stack>
          </AccordionSummary>

          <AccordionDetails>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Clique em um produto para filtrar a lista e ver os tamanhos.
              </Typography>

              <Stack direction="row" gap={1.5} flexWrap="wrap">
                <Legenda cor={cores.entregues} texto="Entregues" />
                <Legenda cor={cores.aEntregar} texto="A entregar" />
                <Legenda cor={cores.pendentes} texto="Aguardando pagamento" />
              </Stack>
            </Stack>

            <Box sx={styles.lista}>
              {resumo.porProduto.map((item) => (
                <Linha key={item.produtoId} item={item} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Stack>
  );
}

export { CardsProductOrders };
