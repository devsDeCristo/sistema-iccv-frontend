import {
  alpha,
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, HighlightOff, OpenInNew } from '@mui/icons-material';
import { ProdutoDaSolicitacao } from '../types';

interface Props {
  produtos: ProdutoDaSolicitacao[];
  /** mostra só os primeiros e um "+ N produtos" (no card) */
  limite?: number;
  /**
   * Na janela do admin: cada produto numa linha com caixa de marcar
   * (`ProdutosParaMarcar`). Sem isto, a lista compacta do card, com a decisão
   * já tomada.
   */
  marcar?: { marcados: Set<string>; onAlternar: (id: string) => void };
}

/**
 * Os produtos para o admin decidir: uma caixa com uma linha por produto,
 * clicável inteira (a linha é o `label` da caixa de marcar). A quantidade vem
 * num destaque, o nome inteiro, e o aceito fica tingido de verde. O "Ver"
 * abre a loja sem marcar a linha: link dentro de `label` não aciona a caixa.
 */
function ProdutosParaMarcar({
  produtos,
  marcar,
}: {
  produtos: ProdutoDaSolicitacao[];
  marcar: NonNullable<Props['marcar']>;
}) {
  const theme = useTheme();
  const verde = theme.palette.chips.success;

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {produtos.map((p, i) => {
        const marcado = marcar.marcados.has(p.id);
        return (
          <Box
            key={p.id}
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.5,
              py: 1,
              cursor: 'pointer',
              borderTop: i ? `1px solid ${theme.palette.divider}` : 'none',
              bgcolor: marcado ? alpha(verde, 0.08) : 'transparent',
              transition: theme.transitions.create('background-color'),
              '&:hover': {
                bgcolor: marcado
                  ? alpha(verde, 0.13)
                  : alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            <Checkbox
              size="small"
              checked={marcado}
              onChange={() => marcar.onAlternar(p.id)}
              inputProps={{ 'aria-label': `Aceitar ${p.name}` }}
              sx={{
                p: 0.25,
                color: theme.palette.text.secondary,
                '&.Mui-checked': { color: verde },
              }}
            />
            <Box
              sx={{
                flex: 'none',
                minWidth: 34,
                px: 0.75,
                borderRadius: 999,
                textAlign: 'center',
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: '22px',
                fontVariantNumeric: 'tabular-nums',
                bgcolor: alpha(theme.palette.text.primary, 0.07),
              }}
            >
              {p.quantity}×
            </Box>
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 14,
                overflowWrap: 'anywhere',
              }}
            >
              {p.name}
            </Typography>
            {p.link && (
              <Button
                size="small"
                component="a"
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNew sx={{ fontSize: '15px !important' }} />}
                aria-label={`Ver ${p.name} na loja`}
                sx={{ flex: 'none', textTransform: 'none', minWidth: 0 }}
              >
                Ver
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Os produtos de uma solicitação: "2× Microfone sem fio", com o link da loja.
 * Decidido, o aceito ganha um ✓ verde e o não aceito fica riscado e apagado.
 */
function ListaDeProdutos({ produtos, limite, marcar }: Props) {
  const theme = useTheme();
  if (marcar) return <ProdutosParaMarcar produtos={produtos} marcar={marcar} />;
  const visiveis = limite ? produtos.slice(0, limite) : produtos;
  const escondidos = produtos.length - visiveis.length;

  return (
    <Stack spacing={0.5}>
      {visiveis.map((p) => {
        const recusado = p.accepted === false;
        return (
          <Stack
            key={p.id}
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ minWidth: 0, minHeight: 28 }}
          >
            {p.accepted === true ? (
              <CheckCircle
                aria-label="Aceito"
                sx={{ fontSize: 17, color: theme.palette.chips.success }}
              />
            ) : p.accepted === false ? (
              <HighlightOff
                aria-label="Não aceito"
                sx={{ fontSize: 17, color: 'text.disabled' }}
              />
            ) : (
              // sem decisão ainda: só um ponto, para alinhar com os decididos
              <Box
                aria-hidden
                sx={{
                  width: 17,
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                  }}
                />
              </Box>
            )}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: recusado ? 'text.disabled' : 'text.primary',
                flex: 'none',
              }}
            >
              {p.quantity}×
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: 13.5,
                minWidth: 0,
                color: recusado ? 'text.disabled' : 'text.primary',
                textDecoration: recusado ? 'line-through' : 'none',
              }}
            >
              {p.name}
            </Typography>
            {p.link && (
              <Tooltip title="Ver produto" arrow>
                <IconButton
                  size="small"
                  component="a"
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver ${p.name} na loja`}
                  sx={{ p: 0.25, color: 'primary.main', flex: 'none' }}
                >
                  <OpenInNew sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      })}
      {escondidos > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ pl: 3.25 }}>
          + {escondidos} {escondidos === 1 ? 'produto' : 'produtos'}
        </Typography>
      )}
    </Stack>
  );
}

export { ListaDeProdutos };
