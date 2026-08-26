import { Button, InputAdornment, Paper, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/users/components/list';
import { useRole } from '../../../hooks/useRole';
import { useState } from 'react';
import { Add, Search } from '@mui/icons-material';
import { CardsStatus } from '../../../features/admin/users/components/cardsStatus';

function Users() {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');

  const { isAdmin } = useRole();
  const styles = {
    boxFilterAndButton: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      marginY: 2,
      padding: 2,
    },
    button: {
      width: { xs: '100%', sm: 'fit-content' },
    },
    textField: {
      width: { xs: '100%', sm: '350px' },
    },
  };
  return (
    <PageStyle>
      <Header title="Usuários" />
      <CardsStatus />
      <Paper sx={styles.boxFilterAndButton}>
        <TextField
          placeholder="Pesquisar usuário por nome ou CPF"
          variant="outlined"
          size="small"
          value={searchUser}
          sx={styles.textField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <Button
          variant="contained"
          sx={styles.button}
          onClick={() =>
            isAdmin
              ? navigate('/admin/usuario/cadastrar')
              : navigate('/cadastro-cursilho-work')
          }
          startIcon={<Add />}
        >
          Novo usuario
        </Button>
      </Paper>

      <List search={searchUser} />
    </PageStyle>
  );
}

export { Users };
