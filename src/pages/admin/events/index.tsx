import { Button, Paper, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/events/components/list';
import { CardsInsights } from '../../../features/admin/events/components/cardsInsights';
import { useState } from 'react';
import { Add } from '@mui/icons-material';

function Events() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const styles = {
    boxFilterAndPdf: {
      display: 'flex',
      // flexDirection: { xs: 'column', sm: 'row' },
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      // mt: 2,
      p: 2,
    },
    textField: {
      width: { xs: '100%', sm: '300px' },
    },
  };
  return (
    <PageStyle>
      <Header title="Eventos">
       
      </Header>
      <CardsInsights />
      <Stack gap={2}>
        <Paper component="div" sx={styles.boxFilterAndPdf}>
          <TextField
            label="Pesquisar evento por nome"
            variant="outlined"
            size="small"
            value={search}
            sx={styles.textField}
            onChange={(e) => setSearch(e.target.value)}
          />
           
          <Button
            variant="contained"
            onClick={() => navigate('/admin/eventos/cadastro')}
            startIcon={<Add/>}
          >
            Novo Evento
          </Button>
      
        </Paper>
        <List search={search} />
      </Stack>
    </PageStyle>
  );
}

export { Events };
