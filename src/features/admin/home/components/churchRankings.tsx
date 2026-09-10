import { Box, Card, Typography } from '@mui/material';
import { DashboardChurchRow, DashboardPanorama } from '../types';
import { BarrasRanking } from './charts';
import { SecaoDaHome } from './secao';

interface ChurchRankingsProps {
  churches: DashboardChurchRow[];
  panorama: DashboardPanorama;
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
 * As igrejas comparadas lado a lado: quem trabalha mais e quem realiza mais.
 *
 * A tabela acima mostra cada igreja em detalhe; estes dois responderam a
 * pergunta que a tabela não responde de relance, que é qual delas puxa o
 * sistema.
 */
export function ChurchRankings({ churches, panorama }: ChurchRankingsProps) {
  const nomePorId = new Map(churches.map((igreja) => [igreja.id, igreja.name]));

  const acoes = [...panorama.churchActivity]
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const porEventos = [...churches]
    .sort((a, b) => b.totalEvents - a.totalEvents)
    .slice(0, 6);

  return (
    <SecaoDaHome titulo="Comparativo entre igrejas">
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          alignItems: 'start',
        }}
      >
        <Painel
          titulo="Igrejas com mais ações"
          /*
            O rótulo diz de quem são as ações porque o número exclui gente de
            propósito: super admin e dev não têm vínculo de igreja, então o que
            eles fazem não é de nenhuma.
          */
          legenda={`Escritas de admin e financeiro nos últimos ${panorama.activityWindowDays} dias — super admin e dev não entram, não pertencem a uma igreja`}
        >
          <BarrasRanking
            unidade="ações"
            vazio="Nenhuma ação de admin ou financeiro no período."
            linhas={acoes.map((linha) => ({
              key: linha.churchId,
              label: nomePorId.get(linha.churchId) ?? 'Igreja removida',
              value: linha.total,
            }))}
          />
        </Painel>

        <Painel
          titulo="Eventos por igreja"
          legenda="Total cadastrado, com os que estão abertos agora"
        >
          <BarrasRanking
            unidade="eventos"
            vazio="Nenhuma igreja cadastrada."
            linhas={porEventos.map((igreja) => ({
              key: igreja.id,
              label: igreja.name,
              value: igreja.totalEvents,
              detalhe:
                igreja.openEvents === 0
                  ? 'nenhum aberto agora'
                  : `${igreja.openEvents} aberto(s) agora · ${igreja.registrations} inscrição(ões)`,
            }))}
          />
        </Painel>
      </Box>
    </SecaoDaHome>
  );
}
