import { Box, Stack, Typography } from '@mui/material';
import { FamilyRestroom } from '@mui/icons-material';

import { UserAvatar } from '../../../../components/userAvatar';
import { formatCPF } from '../../../../utils';
import { FaixaDaFamilia } from '../../membros/components/faixaDaFamilia';
import { EmFamilia, abreAFamilia } from '../../membros/familias';
import { Dizimista } from '../types';

/**
 * As células de família e de membro das tabelas de Dizimistas. As duas
 * visões (por ano e por mês) usam as mesmas, para a pessoa e a família se
 * desenharem igual nas duas.
 */

/** A faixa da família e, na primeira linha dela, o nome com o ícone */
function CelulaDaFamilia({ row }: { row: EmFamilia<Dizimista> }) {
  if (!row.family || !row.posicao || !row.cor) {
    return (
      <Typography fontSize={13} color="text.disabled">
        —
      </Typography>
    );
  }
  return (
    <>
      <FaixaDaFamilia posicao={row.posicao} cor={row.cor} />
      {abreAFamilia(row.posicao) && (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ ml: 2, color: row.cor, minWidth: 0 }}
        >
          <FamilyRestroom sx={{ fontSize: 16 }} />
          <Typography
            fontSize={13}
            fontWeight={700}
            color="inherit"
            noWrap
            title={row.family.name}
          >
            {row.family.name}
          </Typography>
        </Stack>
      )}
    </>
  );
}

/** Foto, nome e CPF do membro */
function CelulaDoMembro({ row }: { row: Dizimista }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{ py: 1, minWidth: 0 }}
    >
      <UserAvatar
        name={row.fullName}
        photoUrl={row.profilePhotoUrl}
        sx={{ width: 32, height: 32, fontSize: 13 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography fontSize={14} fontWeight={600} noWrap title={row.fullName}>
          {row.fullName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {formatCPF(row.cpf)}
        </Typography>
      </Box>
    </Stack>
  );
}

export { CelulaDaFamilia, CelulaDoMembro };
