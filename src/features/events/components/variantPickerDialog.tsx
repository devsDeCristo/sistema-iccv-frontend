import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, Remove, ShoppingBagOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { formatCurrency } from '../../../utils';
import { EventProduct } from '../../admin/events/types';
import {
  QUANTIDADE_MAXIMA_POR_ITEM,
  temDisponivel,
} from '../../admin/events/products';

interface VariantPickerDialogProps {
  /** produto aberto; `null` fecha o diálogo */
  produto: EventProduct | null;
  quantidades: Record<string, number>;
  loading?: boolean;
  onAlterar: (variantId: string, delta: number, maximo: number) => void;
  onClose: () => void;
}

/**
 * Escolha das opções de um produto, em diálogo.
 *
 * As opções saíram do cartão: produto com oito tamanhos virava uma coluna de
 * seletores e esticava a grade inteira. Aqui elas têm espaço para ser uma lista
 * de verdade, com estoque à vista, e o cartão fica só com o que foi escolhido.
 *
 * A quantidade é por opção, e não um "escolha o tamanho": a pessoa leva uma
 * camisa P para ela e uma G para o marido na mesma compra. Por isso o diálogo
 * não tem "cancelar" — cada toque já vale, e o botão só fecha.
 */
function VariantPickerDialog({
  produto,
  quantidades,
  loading,
  onAlterar,
  onClose,
}: VariantPickerDialogProps) {
  const theme = useTheme();

  // o último produto aberto segura o conteúdo enquanto o diálogo se fecha; sem
  // isso ele esvazia antes da animação terminar e pisca
  const ultimo = useRef<EventProduct | null>(produto);
  if (produto) ultimo.current = produto;
  const atual = produto ?? ultimo.current;

  const escolhidas = (atual?.variants ?? []).reduce(
    (soma, variante) => soma + (quantidades[variante.id!] ?? 0),
    0
  );

  const styles = {
    miniatura: {
      width: 56,
      height: 56,
      flexShrink: 0,
      borderRadius: 2,
      overflow: 'hidden',
      display: 'grid',
      placeItems: 'center',
      color: 'text.disabled',
      bgcolor: alpha(theme.palette.text.primary, 0.05),
    },
    foto: {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'cover' as const,
    },
    linha: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    },
    passo: {
      flexShrink: 0,
      borderRadius: 999,
      bgcolor: alpha(theme.palette.text.primary, 0.06),
    },
    contador: {
      minWidth: 22,
      textAlign: 'center' as const,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    },
  };

  return (
    <Dialog
      open={!!produto}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="titulo-opcoes-do-produto"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {atual && (
        <>
          <Stack
            direction="row"
            gap={1.5}
            alignItems="center"
            sx={{ p: { xs: 2, sm: 2.5 } }}
          >
            <Box sx={styles.miniatura}>
              {atual.image ? (
                <Box
                  component="img"
                  src={atual.image}
                  alt={atual.name}
                  sx={styles.foto}
                />
              ) : (
                <ShoppingBagOutlined />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                id="titulo-opcoes-do-produto"
                fontWeight={600}
                sx={{ lineHeight: 1.3, overflowWrap: 'anywhere' }}
              >
                {atual.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(atual.price)} cada
              </Typography>
            </Box>
          </Stack>

          {/* rolagem só aqui dentro: com muitas opções o diálogo cresceria até
              empurrar o botão para fora da tela */}
          <DialogContent
            dividers
            sx={{ px: { xs: 2, sm: 2.5 }, py: 0.5, maxHeight: '55vh' }}
          >
            {atual.variants.map((variante, index) => {
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
                  <Stack direction="row" sx={styles.linha}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        color={esgotado ? 'text.disabled' : 'text.primary'}
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {variante.name}
                      </Typography>
                      {(esgotado || ultimas) && (
                        <Typography
                          variant="caption"
                          color={esgotado ? 'text.disabled' : 'warning.main'}
                          sx={{ display: 'block', lineHeight: 1.2 }}
                        >
                          {esgotado
                            ? 'Esgotado'
                            : disponivel === 1
                              ? 'Última unidade'
                              : `Últimas ${disponivel}`}
                        </Typography>
                      )}
                    </Box>

                    {!esgotado && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={styles.passo}
                      >
                        <IconButton
                          size="small"
                          aria-label={`Remover uma unidade de ${atual.name} ${variante.name}`}
                          disabled={quantidade === 0 || loading}
                          onClick={() => onAlterar(variante.id!, -1, maximo)}
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
                          aria-label={`Adicionar uma unidade de ${atual.name} ${variante.name}`}
                          disabled={quantidade >= maximo || loading}
                          onClick={() => onAlterar(variante.id!, 1, maximo)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </DialogContent>

          <DialogActions
            sx={{
              gap: 1,
              px: { xs: 2, sm: 2.5 },
              py: 2,
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                {escolhidas === 0
                  ? 'Nada escolhido'
                  : `${escolhidas} ${escolhidas === 1 ? 'unidade' : 'unidades'}`}
              </Typography>
              <Typography
                fontWeight={700}
                sx={{ lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(atual.price * escolhidas)}
              </Typography>
            </Box>

            <Button variant="contained" onClick={onClose} autoFocus>
              Pronto
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export { VariantPickerDialog };
