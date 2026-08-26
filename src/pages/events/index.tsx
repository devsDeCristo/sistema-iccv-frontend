import { Grid } from '@mui/material';
import { PageStyle } from '../../components/pageStyle';
import { Cards } from '../../features/events/components/cards';
import { WelcomeHero } from '../../features/events/components/welcomeHero';
import { NewsFeed } from '../../features/news/components/newsFeed';

function Events() {
  return (
    <PageStyle>
      <WelcomeHero />

      {/* eventos e mural lado a lado no desktop; no celular o mural desce para
          baixo dos eventos, que é o que a pessoa vem procurar */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Cards />
        </Grid>
        <Grid item xs={12} md={4}>
          <NewsFeed />
        </Grid>
      </Grid>
    </PageStyle>
  );
}

export { Events };
