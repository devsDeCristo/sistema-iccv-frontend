import { useState } from 'react';
import { MenuItem, Paper, TextField } from '@mui/material';
import { VolunteerActivism } from '@mui/icons-material';

import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { DIZIMOS, lancamentosDa } from '../dados';
import { LancamentosDaTesouraria } from './lancamentosDaTesouraria';

const ANO = 'ANO';

/** "2026-10" → "Outubro de 2026" */
const nomeDoMes = (mes: string) => {
  const nome = new Date(`${mes}-01T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
};

/**
 * Os lançamentos da congregação, que é tesouraria do dia a dia (como a
 * administrativa): por mês ou pelo ano inteiro.
 */
function LancamentosDaCongregacao({ tesourariaId }: { tesourariaId: string }) {
  const ano = String(new Date().getFullYear());
  const [periodo, setPeriodo] = useState(ANO);

  const doAno = lancamentosDa(tesourariaId).filter((l) =>
    l.data.startsWith(ano)
  );
  const meses = [...new Set(doAno.map((l) => l.data.slice(0, 7)))]
    .sort()
    .reverse();
  const visiveis =
    periodo === ANO ? doAno : doAno.filter((l) => l.data.startsWith(periodo));

  return (
    <>
      <Paper
        sx={{ ...superficieSx, ...barraLarguraCheiaNoCelularSx, p: 2, mb: 2 }}
      >
        <TextField
          select
          size="small"
          label="Período"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
        >
          <MenuItem value={ANO}>Ano de {ano}</MenuItem>
          {meses.map((m) => (
            <MenuItem key={m} value={m}>
              {nomeDoMes(m)}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      <LancamentosDaTesouraria
        lancamentos={visiveis}
        periodo={
          periodo === ANO
            ? `Em ${ano}`
            : `Em ${nomeDoMes(periodo).toLowerCase()}`
        }
        destaque={{
          categoria: DIZIMOS,
          legenda: 'Dos membros',
          icone: <VolunteerActivism sx={{ fontSize: 20 }} />,
        }}
      />
    </>
  );
}

export { LancamentosDaCongregacao };
