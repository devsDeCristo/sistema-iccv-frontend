import { Box, Stack } from '@mui/material';
import { PageStyle } from '../../../components/pageStyle';
import { useGetDashboard } from './api/getDashboard';
import { ChurchBreakdown } from './components/churchBreakdown';
import { Hero } from './components/hero';
import { NewsBoard } from './components/newsBoard';
import { OtherEvents } from './components/otherEvents';
import { PendingActions } from './components/pendingActions';
import { RecentRegistrations } from './components/recentRegistrations';
import { SpotlightEvent } from './components/spotlightEvent';
import { SystemInsights } from './components/systemInsights';

/**
 * Tela de abertura do painel.
 *
 * A página se lê de cima para baixo como uma resposta, e a resposta muda com
 * quem pergunta. Quem administra uma igreja abre em "como vai o evento que
 * está na minha mão"; quem cuida do sistema abre nos indicadores dele.
 *
 * O eixo é o evento, e não o sistema. Somar inscritos, vagas ou dinheiro de
 * todos os eventos de todos os anos dá um número grande que não decide nada;
 * cada número aqui mora dentro do evento a que pertence.
 *
 * Nenhum bloco é decidido por `role`: a tela desenha o que a API mandou
 * preenchido. O recorte mora num lugar só, no serviço, e é o mesmo que barra a
 * consulta — assim não existe seção que apareça sem dado por trás nem dado que
 * chegue sem seção.
 */
export function Home() {
  const { data } = useGetDashboard();

  // quem vê várias igrejas precisa saber de qual é cada evento e cada tarefa
  const varias = data?.scope === 'system';

  return (
    <PageStyle>
      <Stack gap={3}>
        <Hero churches={data?.churches} />

        {/*
          Os indicadores abrem a home de quem cuida do sistema: é o panorama
          que ele veio ver, e deixá-lo abaixo das listas o esconderia atrás de
          uma rolagem.
        */}
        {data?.insights && <SystemInsights insights={data.insights} />}

        {/*
          O cartão em close é de quem tem um evento na mão. Super admin e dev
          não têm: o evento que por acaso começa primeiro é de uma igreja que
          não é deles, e dar a tela inteira a ele diz a coisa errada.
        */}
        {!varias && <SpotlightEvent event={data?.spotlight} />}

        {data && <PendingActions pending={data.pending} showChurch={varias} />}

        {data?.otherEvents && (
          <OtherEvents
            events={data.otherEvents}
            showChurch={varias}
            titulo={varias ? 'Eventos abertos' : 'Outros eventos abertos'}
            vazio={
              varias
                ? 'Nenhum evento aberto em nenhuma igreja no momento.'
                : undefined
            }
          />
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
      </Stack>
    </PageStyle>
  );
}
