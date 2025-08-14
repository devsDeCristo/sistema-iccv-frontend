import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/events/components/list';
import { CardsInsights } from '../../../features/admin/events/components/cardsInsights';

function Events() {
  const navigate = useNavigate();
  return (
    <PageStyle>
      <Header title="Eventos">
        <Box component="div" justifyContent="end" display="flex" mb={2}>
          <Button
            variant="contained"
            onClick={() => navigate('/admin/eventos/cadastro')}
          >
            Cadastrar evento
          </Button>
        </Box>
      </Header>

      <CardsInsights />
      <List />
    </PageStyle>
  );
}

export { Events };
