import { Box, Stack } from '@mui/material';
import { PageStyle } from '../../components/pageStyle';
import { Cards } from '../../features/events/components/cards';
import { WelcomeHero } from '../../features/events/components/welcomeHero';
import { NewsFeed } from '../../features/news/components/newsFeed';
import { MinhaAgenda } from '../../features/events/components/minhaAgenda';

function Events() {
  return (
    <PageStyle>
      <WelcomeHero />

      {/* eventos e mural lado a lado no desktop; no celular o mural desce para
          baixo dos eventos, que é o que a pessoa vem procurar. Flexbox, e não
          Grid: a coluna da direita tem largura fixa (a do calendário), e é a
          da esquerda que precisa esticar para preencher o que sobrar — o
          fracionamento de 12 colunas do Grid não representa essa relação. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mt: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, mt: 2 }}>
          <Cards />
        </Box>
        {/* largura do calendário (340) + o padding do card (16 de cada
            lado): a coluna acompanha o calendário, e não o contrário. Sem
            margem: encosta na borda direita da página. */}
        <Box sx={{ width: { xs: '100%', md: "30%" }, maxWidth: { md: 350 }, flexShrink: 0, mt: 2 }}>
          <Stack gap={3}>
            <MinhaAgenda />
            <NewsFeed />
          </Stack>
        </Box>
      </Box>
    </PageStyle>
  );
}

export { Events };
