import React from 'react';
import { Chip, ChipProps, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CustomChipProps extends ChipProps {
  customColor: string;
}

/**
 * Chip de status do sistema: fundo na cor esmaecida, texto e borda na cor cheia.
 *
 * A borda a 28% é a mesma proporção da borda dos cards de status — é o que faz
 * o chip parecer da mesma família. Sem ela o chip virava só uma manchinha de
 * cor, e cada tela tinha acabado com um ajuste local diferente.
 *
 * O corpo menor vale só no `size="small"`: em chip de tamanho normal, 11px
 * ficaria perdido dentro da altura.
 */
const StyledChip = styled(Chip)<{ customColor: string }>(
  ({ customColor, size }) => ({
    color: customColor,
    backgroundColor: alpha(customColor, 0.1),
    border: `1px solid ${alpha(customColor, 0.28)}`,
    fontWeight: 600,
    ...(size === 'small' && { fontSize: '11px' }),
  })
);

const CustomChip: React.FC<CustomChipProps> = ({ customColor, ...props }) => {
  return <StyledChip customColor={customColor} {...props} />;
};

export default CustomChip;
