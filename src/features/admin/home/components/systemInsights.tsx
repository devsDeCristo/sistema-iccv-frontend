import { Box, Card, Typography } from '@mui/material';
import { UserAvatar } from '../../../../components/userAvatar';
import { ROLE_LABELS } from '../../../../constants/roles';
import { DashboardInsights } from '../types';
import {
  BarrasRanking,
  ColunasEmpilhadas,
  ColunasNoTempo,
  PontoNoTempo,
} from './charts';
import { SecaoDaHome } from './secao';

interface SystemInsightsProps {
  insights: DashboardInsights;
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

/**
 * "2026-09" -> eixo "set/26", tooltip "setembro de 2026".
 *
 * O ano vai no eixo porque a série tem doze meses e sempre atravessa a virada:
 * sem ele, "out" e "set" nas duas pontas parecem do mesmo ano.
 */
function doMes(key: string): PontoNoTempo {
  const [ano, mes] = key.split('-');
  const indice = Number(mes) - 1;
  return {
    key,
    label: `${MESES[indice]}/${ano.slice(2)}`,
    titulo: `${MESES_LONGOS[indice]} de ${ano}`,
    total: 0,
  };
}

/** "2026-09-03" -> eixo "03/09", tooltip "03/09/2026" */
function doDia(key: string): PontoNoTempo {
  const [ano, mes, dia] = key.split('-');
  return {
    key,
    label: `${dia}/${mes}`,
    titulo: `${dia}/${mes}/${ano}`,
    total: 0,
  };
}

/** Um gráfico com título e uma frase que diz o que ele responde. */
function Painel({
  titulo,
  legenda,
  children,
  larguraTotal,
}: {
  titulo: string;
  legenda: string;
  children: React.ReactNode;
  /** Ocupa as duas colunas da grade em vez de dividir a linha */
  larguraTotal?: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        // no celular a grade já é de uma coluna só, então isto só vale na larga
        ...(larguraTotal && { gridColumn: { lg: '1 / -1' } }),
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{titulo}</Typography>
      <Typography sx={{ mb: 2, fontSize: 12, color: 'text.secondary' }}>
        {legenda}
      </Typography>
      {children}
    </Card>
  );
}

/**
 * Os indicadores do sistema — a home do dev.
 *
 * As perguntas aqui não são de um evento: são de operação. Se o movimento
 * cresce ou cai, em que dia o sistema apanhou, qual igreja carrega o peso,
 * quem está de fato mexendo no painel.
 */
export function SystemInsights({ insights }: SystemInsightsProps) {
  const meses = insights.registrationsByMonth.map((ponto) => ({
    ...doMes(ponto.key),
    total: ponto.total,
  }));

  const dias = insights.activityByDay.map((ponto) => ({
    ...doDia(ponto.key),
    total: ponto.total,
  }));

  const entradas = insights.loginsByDay.map((ponto) => ({
    ...doDia(ponto.key),
    success: ponto.success,
    failure: ponto.failure,
  }));

  const totalNoAno = meses.reduce((soma, mes) => soma + mes.total, 0);
  const totalNoPeriodo = dias.reduce((soma, dia) => soma + dia.total, 0);
  const tentativas = entradas.reduce(
    (soma, dia) => soma + dia.success + dia.failure,
    0
  );
  const falhas = entradas.reduce((soma, dia) => soma + dia.failure, 0);

  return (
    <SecaoDaHome titulo="Indicadores do sistema">
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          /*
            Cada painel com a própria altura. Esticados para igualar o vizinho,
            um ranking de duas linhas ao lado de um de seis vira um cartão com
            um palmo de vazio embaixo.
          */
          alignItems: 'start',
        }}
      >
        <Painel
          titulo="Inscrições por mês"
          legenda={`${totalNoAno} inscrições nos últimos 12 meses`}
        >
          <ColunasNoTempo pontos={meses} unidade="inscrições" />
        </Painel>

        <Painel
          titulo="Movimento do sistema"
          legenda={`${totalNoPeriodo} escritas registradas em 14 dias`}
        >
          <ColunasNoTempo pontos={dias} unidade="ações" />
        </Painel>

        <Painel
          titulo="Tentativas de entrada"
          legenda={
            tentativas === 0
              ? 'Nada registrado ainda — a contagem começa no primeiro login'
              : `${tentativas} tentativa(s) em 14 dias · ${falhas} falha(s)`
          }
        >
          <ColunasEmpilhadas
            pontos={entradas}
            vazio="Nenhuma tentativa registrada. O sistema passou a guardar login agora; o gráfico enche a partir da próxima entrada."
          />
        </Painel>

        <Painel
          titulo="Igrejas com mais eventos"
          legenda="Eventos cadastrados, de todos os tempos"
        >
          <BarrasRanking
            unidade="eventos"
            vazio="Nenhuma igreja cadastrada."
            linhas={insights.topChurches.map((igreja) => ({
              key: igreja.id,
              label: igreja.name,
              value: igreja.events,
              detalhe: `${igreja.registrations} inscrições no total`,
            }))}
          />
        </Painel>

        <Painel
          larguraTotal
          titulo="Quem mais movimenta o painel"
          /*
            "Movimenta" e não "acessa", de propósito: o sistema não registra
            login nem último acesso em lugar nenhum. O que dá para contar são
            as escritas do log — criar, alterar, remover.
          */
          legenda={`Ações registradas nos últimos ${insights.windowDays} dias — o sistema não registra acessos, só escritas`}
        >
          <BarrasRanking
            unidade="ações"
            vazio="Nenhuma ação registrada no período."
            linhas={insights.topActors.map((pessoa) => ({
              key: pessoa.id,
              label: pessoa.name,
              value: pessoa.actions,
              detalhe:
                pessoa.role !== null ? ROLE_LABELS[pessoa.role] : undefined,
              avatar: (
                <UserAvatar
                  name={pessoa.name}
                  photoUrl={pessoa.photoUrl}
                  sx={{ width: 32, height: 32, flexShrink: 0 }}
                />
              ),
            }))}
          />
        </Painel>
      </Box>
    </SecaoDaHome>
  );
}
