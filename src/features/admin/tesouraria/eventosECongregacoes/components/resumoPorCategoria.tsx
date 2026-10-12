import { alpha, Box, Paper, Stack, Typography } from '@mui/material';

import { superficieSx } from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import { TipoDoLancamento } from '../modelo';
import { COR_ENTRADA, COR_SAIDA } from '../../constants';

interface Props {
  tipo: TipoDoLancamento;
  itens: { categoria: string; total: number }[];
}

/**
 * Para onde foi (ou de onde veio) o dinheiro do período: cada categoria com o
 * valor e a fatia do total. A barra é da cor do tipo, sobre um trilho do mesmo
 * tom mais claro; o valor e a porcentagem ficam no texto, e não só na barra.
 */
function ResumoPorCategoria({ tipo, itens }: Props) {
  const cor = tipo === 'INCOME' ? COR_ENTRADA : COR_SAIDA;
  const total = itens.reduce((soma, item) => soma + item.total, 0);

  return (
    <Paper sx={{ ...superficieSx, p: 2.5, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography fontWeight={600}>
          {tipo === 'INCOME' ? 'Entradas' : 'Saídas'} por categoria
        </Typography>
        <Typography
          fontWeight={600}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(total)}
        </Typography>
      </Stack>

      {itens.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {tipo === 'INCOME' ? 'Nenhuma entrada' : 'Nenhuma saída'} no período
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {itens.map((item) => {
            const fatia = total ? (item.total / total) * 100 : 0;
            return (
              <Box key={item.categoria}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography fontSize={14} noWrap>
                    {item.categoria}
                  </Typography>
                  <Typography
                    fontSize={14}
                    sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                  >
                    {formatCurrency(item.total)}
                    <Typography
                      component="span"
                      fontSize={12}
                      color="text.secondary"
                      sx={{
                        ml: 1,
                        display: 'inline-block',
                        minWidth: 34,
                        textAlign: 'right',
                      }}
                    >
                      {Math.round(fatia)}%
                    </Typography>
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(cor, 0.14),
                  }}
                >
                  <Box
                    sx={{
                      width: `${fatia}%`,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: cor,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export { ResumoPorCategoria };
