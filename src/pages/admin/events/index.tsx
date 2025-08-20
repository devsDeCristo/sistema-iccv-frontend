import { Box, Button, Paper, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/events/components/list';
import { CardsInsights } from '../../../features/admin/events/components/cardsInsights';
import { useState } from 'react';

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
        </Paper>
        <List search={search} />
      </Stack>
    </PageStyle>
  );
}

export { Events };
