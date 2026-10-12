import { Alert, Paper, Typography, useTheme } from '@mui/material';
import {
  CalendarMonth,
  People,
  Savings,
  VolunteerActivism,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { StatusCards } from '../../../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import { ListaDizimosPorMes } from '../../components/listaDizimosPorMes';
import { dizimistasDa } from '../dados';

/**
 * Os dizimistas da congregação, na mesma tabela da administrativa: cada
 * membro com o dízimo de cada mês do ano. Os números saem da conciliação —
 * o que foi distribuído para a congregação como Dízimos, pago pelo membro.
 */
function DizimosDaCongregacao({ tesourariaId }: { tesourariaId: string }) {
  const theme = useTheme();
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const { dizimistas, porMes, total } = dizimistasDa(tesourariaId, ano);
  const dizimaramNoAno = dizimistas.filter((d) => d.totalNoAno > 0).length;

  return (
    <>
      <StatusCards
        cards={[
          {
            title: 'Membros',
            value: dizimistas.length,
            subtitle: 'Dizimistas em potencial',
            icon: <People sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.info,
          },
          {
            title: 'Dizimaram no mês',
            value: dizimistas.filter((d) => d.porMes[mes] > 0).length,
            subtitle: `${formatCurrency(porMes[mes])} em dízimos`,
            icon: <CalendarMonth sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.success,
          },
          {
            title: `Total em ${ano}`,
            value: formatCurrency(total),
            subtitle: `${dizimaramNoAno} membros dizimaram`,
            icon: <VolunteerActivism sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.alert,
            compact: true,
          },
          {
            title: 'Média por dizimista',
            value: formatCurrency(
              dizimaramNoAno
                ? dizimistas.reduce((s, d) => s + d.totalNoAno, 0) /
                    dizimaramNoAno
                : 0
            ),
            subtitle: 'Entre quem dizimou no ano',
            icon: <Savings sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.pending,
            compact: true,
          },
        ]}
      />

      <Paper
        sx={{ ...superficieSx, ...barraLarguraCheiaNoCelularSx, p: 2, mb: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          Os dízimos vêm da Conciliação: o Pix de um membro com o valor do
          dízimo dele entra como Dízimos ao ser trazido para a congregação. O
          que não tem membro (um depósito em dinheiro) conta só no total.
        </Typography>
      </Paper>

      {!dizimistas.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Esta congregação ainda não tem membros. Eles virão do cadastro de
          congregações, que ainda não existe.
        </Alert>
      )}

      <ListaDizimosPorMes
        dizimistas={dizimistas}
        ano={ano}
        porMesDaIgreja={porMes}
        totalDaIgreja={total}
        carregando={false}
        rotuloDoTotal="Total da congregação"
        onEditar={() =>
          toast.info(
            'Na demonstração o valor do dízimo não muda: ele vem do cadastro do membro.'
          )
        }
      />
    </>
  );
}

export { DizimosDaCongregacao };
