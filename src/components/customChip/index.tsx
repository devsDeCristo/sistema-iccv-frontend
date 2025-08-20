import React from 'react';
import { Chip, ChipProps, alpha } from '@mui/material';
import { styled } from '@mui/system';

interface CustomChipProps extends ChipProps {
  customColor: string;
}

const StyledChip = styled(Chip)<{ customColor: string }>(({ customColor }) => ({
  color: customColor,
  backgroundColor: alpha(customColor, 0.1),
  fontWeight: 'bold',
}));

const CustomChip: React.FC<CustomChipProps> = ({ customColor, ...props }) => {
  return <StyledChip customColor={customColor} {...props} />;
};

export default CustomChip;
