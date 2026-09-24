import {
  alpha,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ReceiptLongOutlined } from '@mui/icons-material';
import { formatCurrency } from '../../../utils';

/** Uma linha do resumo: o grupo escolhido e, quando já houver, o ingresso. */
interface ItemDoResumo {
  grupoId: string;
  grupo: string;
  ingresso?: string;
  preco?: number;
}

/** Uma linha de produto da sacola, quando a inscrição passa pela loja. */
interface ProdutoDoResumo {
  variantId: string;
  produto: string;
  variante: string;
  quantidade: number;
  /** preço unitário */
  preco: number;
}

/**
 * O que vai ser comprado, do lado do formulário.
 *
 * A tela pedia grupo, depois ingresso, cada um com um preço solto na linha — e
 * em nenhum momento dizia quanto ia dar. Quem escolhia dois grupos descobria o
 * total no checkout, fora do sistema. O resumo acompanha a escolha passo a
 * passo: primeiro os grupos, depois os ingressos entrando um a um, e o total
 * embaixo.
 *
 * Igreja que não cobra online não mostra total nenhum: ali o valor é acertado
 * na secretaria, e um total na tela pareceria uma cobrança que o sistema não
 * vai fazer.
 */
function SubscribeSummary({
  itens,
  produtos = [],
  mostrarValores,
}: {
  itens: ItemDoResumo[];
  /** o que foi para a sacola no passo da loja */
  produtos?: ProdutoDoResumo[];
  mostrarValores: boolean;
}) {
  const theme = useTheme();

  const totalDosIngressos = itens.reduce(
    (soma, item) => soma + (item.preco ?? 0),
    0
  );
  const totalDosProdutos = produtos.reduce(
    (soma, produto) => soma + produto.preco * produto.quantidade,
    0
  );
  const total = totalDosIngressos + totalDosProdutos;
  const temIngresso = itens.some((item) => item.ingresso);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.text.primary, 0.08),
        // no desktop ele acompanha a rolagem: o resumo é para ser consultado
        // enquanto se escolhe, não depois
        position: { md: 'sticky' },
        top: { md: 24 },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <ReceiptLongOutlined
          sx={{ fontSize: 18, color: theme.palette.primary.main }}
        />
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>
          Sua inscrição
        </Typography>
      </Stack>

      {itens.length === 0 ? (
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Escolha um grupo para começar. O que você selecionar aparece aqui.
        </Typography>
      ) : (
        <Stack gap={1.25}>
          {itens.map((item) => (
            <Box key={item.grupoId}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                gap={1}
              >
                <Typography
                  sx={{ fontSize: '0.875rem', fontWeight: 600, minWidth: 0 }}
                >
                  {item.grupo}
                </Typography>
                {mostrarValores && item.preco !== undefined && (
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.preco > 0 ? formatCurrency(item.preco) : 'Grátis'}
                  </Typography>
                )}
              </Stack>

              <Typography
                sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
              >
                {item.ingresso ?? 'ingresso a escolher'}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {produtos.length > 0 && (
        <>
          <Divider sx={{ my: 1.75 }} />
          <Typography
            sx={{
              mb: 1,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Produtos
          </Typography>

          <Stack gap={1}>
            {produtos.map((produto) => (
              <Stack
                key={produto.variantId}
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                gap={1}
              >
                <Typography sx={{ fontSize: '0.8125rem', minWidth: 0 }}>
                  {produto.quantidade}× {produto.produto}
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {' '}
                    · {produto.variante}
                  </Box>
                </Typography>
                {mostrarValores && (
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatCurrency(produto.preco * produto.quantidade)}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </>
      )}

      {mostrarValores && temIngresso && (
        <>
          <Divider sx={{ my: 1.75 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Total
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 800 }}>
              {total > 0 ? formatCurrency(total) : 'Grátis'}
            </Typography>
          </Stack>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}
          >
            O pagamento acontece depois de confirmar a inscrição.
          </Typography>
        </>
      )}
    </Paper>
  );
}

export { SubscribeSummary };
export type { ItemDoResumo, ProdutoDoResumo };
