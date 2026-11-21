import { ReactNode } from 'react';
import { alpha, Box, Typography, useTheme } from '@mui/material';

import { corDoStatus, RESPONDIDA, ROTULO_DO_STATUS } from '../constants';
import { MinhaSolicitacao } from '../types';
import { Paleta } from './paletaDaFolha';

/*
 * As peças da folha do pedido, a mesma no card da lista e na prancheta do
 * modal: o rótulo em versalete, o campo sobre a linha e o carimbo da situação.
 */

/** O rótulo de um campo do formulário, em versalete */
export function Rotulo({
  paleta,
  children,
}: {
  paleta: Paleta;
  children: string;
}) {
  return (
    <Typography
      sx={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: paleta.suave,
      }}
    >
      {children}
    </Typography>
  );
}

/** Um campo preenchido do formulário: o rótulo e o valor sobre a linha */
export function Campo({
  rotulo,
  paleta,
  children,
}: {
  rotulo: string;
  paleta: Paleta;
  children: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Rotulo paleta={paleta}>{rotulo}</Rotulo>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          minHeight: 28,
          borderBottom: `1px solid ${paleta.linha}`,
          fontSize: 14,
          fontWeight: 600,
          color: paleta.texto,
          overflowWrap: 'anywhere',
          '& svg': { fontSize: 17, color: paleta.tinta, flex: 'none' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/**
 * O carimbo da situação: decidida, batido com força (borda cheia e
 * inclinado); em andamento, um carimbo tracejado, mais leve.
 */
export function Carimbo({ s }: { s: MinhaSolicitacao }) {
  const theme = useTheme();
  const cor = corDoStatus(theme, s.status);
  const final = RESPONDIDA[s.status];
  return (
    <Box
      role="status"
      aria-label={`Situação: ${ROTULO_DO_STATUS[s.status]}`}
      sx={{
        flex: 'none',
        px: 1.25,
        py: 0.5,
        border: `${final ? 3 : 2}px ${final ? 'solid' : 'dashed'} ${cor}`,
        borderRadius: 1,
        boxShadow: final ? `inset 0 0 0 2px ${alpha(cor, 0.25)}` : 'none',
        color: cor,
        fontSize: final ? 14 : 12,
        fontWeight: 900,
        letterSpacing: '0.1em',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        transform: `rotate(${final ? -7 : -3}deg)`,
        opacity: final ? 0.9 : 0.8,
        whiteSpace: 'nowrap',
      }}
    >
      {ROTULO_DO_STATUS[s.status]}
    </Box>
  );
}
