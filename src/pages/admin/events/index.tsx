import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/events/components/list';
import { CardsStatus } from '../../../features/admin/events/components/cardsStatus';
import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { EventStatusFilter } from '../../../features/admin/events/types';
import { useRole } from '../../../hooks/useRole';

const STATUS_OPTIONS: { value: EventStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'all', label: 'Todos' },
];

function Events() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatusFilter>('active');
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
    selectStatus: {
      width: { xs: '100%', sm: '200px' },
    },
    filters: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2,
    },
  };
  return (
    <PageStyle>
      <Header title="Eventos"></Header>
      <CardsStatus />
      <Stack gap={2}>
        <Paper component="div" sx={styles.boxFilterAndPdf}>
          <Stack sx={styles.filters}>
            <TextField
              label="Pesquisar evento por nome"
              variant="outlined"
              size="small"
              value={search}
              sx={styles.textField}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={status}
              sx={styles.selectStatus}
              onChange={(e) => setStatus(e.target.value as EventStatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {isAdmin && (
            <Button
              variant="contained"
              onClick={() => navigate('/admin/eventos/cadastro')}
              startIcon={<Add />}
            >
              Novo Evento
            </Button>
          )}
        </Paper>
        <List search={search} status={status} />
      </Stack>
    </PageStyle>
  );
}

export { Events };
