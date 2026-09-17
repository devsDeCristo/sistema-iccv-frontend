import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, Remove, ShoppingBagOutlined } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { formatCurrency } from '../../../utils';
import { EventProduct } from '../../admin/events/types';
import {
  QUANTIDADE_MAXIMA_POR_ITEM,
  temDisponivel,
} from '../../admin/events/products';

type ItemEscolhido = { variantId: string; quantity: number };

interface ProductOfferProps {
  products: EventProduct[];
  /** o evento cobra online: muda só o texto do botão de seguir */
  modulePayment: boolean;
  loading: boolean;
  onConfirm: (items: ItemEscolhido[]) => void;
  onSkip: () => void;
  /** linha em destaque acima do título ("Inscrição confirmada") */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  skipLabel?: string;
}

/**
 * Escolha de produtos do evento: logo depois da inscrição confirmada, ou
 * depois, pela página do evento.
 *
 * Variante com seletor de quantidade, e não um "escolha o tamanho": a pessoa
 * leva uma camisa P para ela e uma G para o marido na mesma compra. O total
 * fica à vista o tempo todo, porque é ele que vai somar no pagamento.
 */
function ProductOffer({
  products,
  modulePayment,
  loading,
  onConfirm,
  onSkip,
  eyebrow,
  title = 'Produtos do evento',
  subtitle = 'Adicione itens à sua inscrição, se quiser. O valor é cobrado no mesmo pagamento.',
  skipLabel = 'Não, obrigado',
}: ProductOfferProps) {
  const theme = useTheme();
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const precoPorVariante = useMemo(() => {
    const mapa = new Map<string, number>();
    products.forEach((produto) =>
      produto.variants.forEach((variante) =>
        mapa.set(variante.id!, produto.price)
      )
    );
    return mapa;
  }, [products]);

  const itens = Object.entries(quantidades)
    .filter(([, quantidade]) => quantidade > 0)
    .map(([variantId, quantity]) => ({ variantId, quantity }));

  const total = itens.reduce(
    (soma, item) =>
      soma + (precoPorVariante.get(item.variantId) ?? 0) * item.quantity,
    0
  );
  const unidades = itens.reduce((soma, item) => soma + item.quantity, 0);

  const alterar = (variantId: string, delta: number, maximo: number) =>
    setQuantidades((atual) => {
      const proxima = Math.min(
        maximo,
        Math.max(0, (atual[variantId] ?? 0) + delta)
      );
      return { ...atual, [variantId]: proxima };
    });

  const styles = {
    /**
     * Cartão horizontal, com miniatura: a foto 4:3 no topo fazia cada produto
     * ocupar quase a tela inteira do celular, e a variante — que é o que se
     * escolhe — ficava lá embaixo.
     */
    cartao: {
      p: { xs: 1.5, sm: 2 },
      borderRadius: 2.5,
      bgcolor: 'background.paperSecondary',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 0 0 1px rgba(255,255,255,.07)'
          : '0 1px 2px rgba(16,24,40,.05), 0 4px 12px -4px rgba(16,24,40,.10)',
      display: 'flex',
      gap: { xs: 1.5, sm: 2 },
      alignItems: 'flex-start',
    },
    miniatura: {
      width: { xs: 64, sm: 80 },
      height: { xs: 64, sm: 80 },
      flexShrink: 0,
      borderRadius: 2,
      objectFit: 'cover' as const,
      display: 'grid',
      placeItems: 'center',
      color: 'text.disabled',
      bgcolor: alpha(theme.palette.text.primary, 0.05),
    },
    descricao: {
      mt: 0.25,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    linhaVariante: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    },
    contador: {
      minWidth: 24,
      textAlign: 'center' as const,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    },
    // o resumo acompanha a rolagem no celular: com vários produtos o botão de
    // seguir some lá embaixo e a pessoa não sabe quanto já somou
    resumo: {
      position: 'sticky' as const,
      bottom: 0,
      zIndex: 1,
      mt: 3,
      mx: { xs: -2, sm: -3 },
      mb: { xs: -2, sm: -3 },
      px: { xs: 2, sm: 3 },
      py: 2,
      bgcolor: 'background.paper',
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  };

  return (
    <Box>
      <Stack gap={0.5} sx={{ mb: 3 }}>
        {eyebrow && (
          <Typography
            variant="overline"
            color="success.main"
            sx={{ fontWeight: 600, lineHeight: 1.6 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          alignItems: 'start',
        }}
      >
        {products.map((produto) => (
          <Box key={produto.id} sx={styles.cartao}>
            {produto.image ? (
              <Box
                component="img"
                src={produto.image}
                alt={produto.name}
                sx={styles.miniatura}
              />
            ) : (
              <Box sx={styles.miniatura}>
                <ShoppingBagOutlined />
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                gap={1}
              >
                <Typography fontWeight={600} sx={{ minWidth: 0 }}>
                  {produto.name}
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatCurrency(produto.price)}
                </Typography>
              </Stack>

              {produto.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={produto.description}
                  sx={styles.descricao}
                >
                  {produto.description}
                </Typography>
              )}

              <Stack sx={{ mt: 1 }}>
                {produto.variants.map((variante, index) => {
                  const quantidade = quantidades[variante.id!] ?? 0;
                  const disponivel = variante.available;
                  const esgotado = !temDisponivel(disponivel);
                  const maximo = Math.min(
                    QUANTIDADE_MAXIMA_POR_ITEM,
                    disponivel ?? QUANTIDADE_MAXIMA_POR_ITEM
                  );
                  const ultimas =
                    typeof disponivel === 'number' &&
                    disponivel > 0 &&
                    disponivel <= 5;

                  return (
                    <Box key={variante.id}>
                      {index > 0 && <Divider />}
                      <Stack direction="row" sx={styles.linhaVariante}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={1}
                          sx={{ minWidth: 0 }}
                        >
                          <Typography
                            variant="body2"
                            color={esgotado ? 'text.disabled' : 'text.primary'}
                          >
                            {variante.name}
                          </Typography>
                          {esgotado && (
                            <Typography variant="caption" color="text.disabled">
                              Esgotado
                            </Typography>
                          )}
                          {ultimas && (
                            <Typography variant="caption" color="warning.main">
                              {disponivel === 1
                                ? 'Última unidade'
                                : `Últimas ${disponivel}`}
                            </Typography>
                          )}
                        </Stack>

                        {!esgotado && (
                          <Stack direction="row" alignItems="center">
                            <IconButton
                              size="small"
                              aria-label={`Remover uma unidade de ${produto.name} ${variante.name}`}
                              disabled={quantidade === 0 || loading}
                              onClick={() => alterar(variante.id!, -1, maximo)}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={styles.contador}
                              aria-live="polite"
                            >
                              {quantidade}
                            </Typography>
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label={`Adicionar uma unidade de ${produto.name} ${variante.name}`}
                              disabled={quantidade >= maximo || loading}
                              onClick={() => alterar(variante.id!, 1, maximo)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={styles.resumo}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {unidades === 0
                ? 'Nenhum produto escolhido'
                : `${unidades} ${unidades === 1 ? 'item' : 'itens'} escolhido${
                    unidades === 1 ? '' : 's'
                  }`}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(total)}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} gap={1}>
            <Button
              variant="text"
              color="inherit"
              onClick={onSkip}
              disabled={loading}
              sx={{ color: 'text.secondary' }}
            >
              {skipLabel}
            </Button>
            <Button
              variant="contained"
              disabled={unidades === 0 || loading}
              onClick={() => onConfirm(itens)}
              sx={{ minWidth: 220 }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : modulePayment ? (
                'Ir para o pagamento'
              ) : (
                'Confirmar compra'
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export { ProductOffer };
