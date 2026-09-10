import { Box, Stack } from '@mui/material';
import { PageStyle } from '../../../components/pageStyle';
import { useGetDashboard } from './api/getDashboard';
import { ChurchBreakdown } from './components/churchBreakdown';
import { ChurchKpis } from './components/churchKpis';
import { ChurchRankings } from './components/churchRankings';
import { EventEarnings } from './components/eventEarnings';
import { EventsList } from './components/eventsList';
import { FinanceSummary } from './components/financeSummary';
import { Hero } from './components/hero';
import { NewsBoard } from './components/newsBoard';
import { PendingActions } from './components/pendingActions';
import { RecentRegistrations } from './components/recentRegistrations';
import { SecaoDaHome } from './components/secao';
import { SystemInsights } from './components/systemInsights';
import { SystemKpis } from './components/systemKpis';
import { TreasuryKpis } from './components/treasuryKpis';
import { UserOverview } from './components/userOverview';

/**
 * Tela de abertura do painel.
 *
 * A página se lê de cima para baixo como uma resposta, e a resposta muda com
 * quem pergunta:
 *
 * - admin e financeiro abrem na igreja deles — eventos, inscritos e caixa;
 * - o super admin, em "como estão as igrejas e as pessoas do sistema";
 * - o dev, nos indicadores de funcionamento.
 *
 * Números de evento para quem toca evento; totais do sistema para quem
 * responde pelo sistema. O mesmo total na tela errada não significa nada — foi
 * o que os primeiros cortes desta tela ensinaram.
 *
 * Nenhum bloco é decidido por `role`: a tela desenha o que a API mandou
 * preenchido. O recorte mora num lugar só, no serviço, e é o mesmo que barra a
 * consulta — assim não existe seção que apareça sem dado por trás nem dado que
 * chegue sem seção.
 */
export function Home() {
  const { data } = useGetDashboard();

  // quem vê várias igrejas precisa saber de qual é cada tarefa
  const varias = data?.scope === 'system';

  /**
   * Sem nenhum evento ativo, a API manda o último encerrado no lugar para a
   * igreja não abrir o painel vazia — e aí o bloco não pode se chamar
   * "Eventos ativos".
   */
  const soEncerrado =
    !!data?.events?.length &&
    data.events.every((event) => event.status === 'INACTIVE');

  return (
    <PageStyle>
      <Stack gap={3}>
        <Hero churches={data?.churches} role={data?.role} />

        {/* a igreja em números: só os eventos em jogo */}
        {data?.events && !data.treasury && <ChurchKpis events={data.events} />}

        {/* a do financeiro é só dinheiro — vaga e ritmo não são decisão dele */}
        {data?.events && data.treasury && (
          <TreasuryKpis events={data.events} treasury={data.treasury} />
        )}

        {/* o tamanho do sistema, para quem responde por ele */}
        {data?.panorama && data.byChurch && (
          <SystemKpis churches={data.byChurch} panorama={data.panorama} />
        )}

        {/*
          Os indicadores de funcionamento abrem a home do dev: é o panorama que
          ele veio ver, e embaixo das listas ficaria atrás de uma rolagem.
        */}
        {data?.insights && <SystemInsights insights={data.insights} />}

        {data && <PendingActions pending={data.pending} showChurch={varias} />}

        {data?.events && data.events.length > 0 && !data.treasury && (
          <FinanceSummary events={data.events} />
        )}

        {/*
          A lista de eventos e o bloco de finanças são de quem administra a
          igreja. Para o financeiro os dois seriam repetição: a régua acima já
          traz os três estados do dinheiro, e "ganhos por evento" abaixo já
          abre o caixa evento a evento.
        */}
        {data?.events && !data.treasury && (
          <SecaoDaHome
            titulo={soEncerrado ? 'Último evento encerrado' : 'Eventos ativos'}
          >
            <EventsList events={data.events} />
          </SecaoDaHome>
        )}

        {data?.treasury && data.events && (
          <EventEarnings events={data.events} />
        )}

        {/*
          Movimento e mural lado a lado: são as duas listas curtas da página, e
          empilhadas deixariam uma coluna estreita com muito branco à direita.
        */}
        {data?.recentRegistrations && (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                md: data.news ? 'repeat(2, 1fr)' : '1fr',
              },
              alignItems: 'start',
            }}
          >
            <RecentRegistrations registrations={data.recentRegistrations} />
            {data.news && <NewsBoard news={data.news} />}
          </Box>
        )}

        {data?.byChurch && <ChurchBreakdown churches={data.byChurch} />}

        {data?.panorama && data.byChurch && (
          <ChurchRankings churches={data.byChurch} panorama={data.panorama} />
        )}

        {data?.panorama && <UserOverview panorama={data.panorama} />}
      </Stack>
    </PageStyle>
  );
}
