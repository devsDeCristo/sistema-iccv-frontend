import { Box, Card, Typography } from '@mui/material';
import { DashboardPanorama } from '../types';
import { ColunasNoTempo, PontoNoTempo } from './charts';
import { SecaoDaHome } from './secao';

interface UserOverviewProps {
  panorama: DashboardPanorama;
}

const MESES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const MESES_LONGOS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "2026-09" -> eixo "set/26", tooltip "setembro de 2026" */
function doMes(key: string, total: number): PontoNoTempo {
  const [ano, mes] = key.split('-');
  const indice = Number(mes) - 1;
  return {
    key,
    label: `${MESES[indice]}/${ano.slice(2)}`,
    titulo: `${MESES_LONGOS[indice]} de ${ano}`,
    total,
  };
}

function Painel({
  titulo,
  legenda,
  children,
}: {
  titulo: string;
  legenda: string;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{titulo}</Typography>
      <Typography sx={{ mb: 2, fontSize: 12, color: 'text.secondary' }}>
        {legenda}
      </Typography>
      {children}
    </Card>
  );
}

/**
 * A base de pessoas vista de cima: ela está crescendo?
 *
 * A composição por perfil saiu daqui — quem opera o painel é uma leitura de
 * igreja, e foi para o comparativo entre elas.
 */
export function UserOverview({ panorama }: UserOverviewProps) {
  const { users } = panorama;

  const meses = users.byMonth.map((ponto) => doMes(ponto.key, ponto.total));
  const noAno = meses.reduce((soma, mes) => soma + mes.total, 0);

  return (
    <SecaoDaHome titulo="Usuários">
      <Box>
        <Painel
          titulo="Novos cadastros por mês"
          legenda={`${noAno} pessoa(s) entraram no sistema nos últimos 12 meses`}
        >
          <ColunasNoTempo pontos={meses} unidade="cadastros" />
        </Painel>
      </Box>
    </SecaoDaHome>
  );
}
