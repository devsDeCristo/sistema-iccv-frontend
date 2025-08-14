import { Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/users/components/list';
import { useRole } from '../../../hooks/useRole';
import { useState } from 'react';
import { CardsInsights } from '../../../features/admin/users/components/cardsInsights';

function Users() {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');

  const isAdmin = useRole();
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
    },
    button: {
      width: { xs: '100%', sm: 'fit-content' },
    },
    textField: {
      width: { xs: '100%', sm: '300px' },
    },
  };
  return (
    <PageStyle>
      <Header title="Usuários" />
      <Box
        component="div"
        justifyContent="space-between"
        display="flex"
        mb={2}
        sx={styles.boxFilterAndButton}
      >
        <TextField
          label="Pesquisar usuário por nome ou CPF"
          variant="outlined"
          size="small"
          value={searchUser}
          sx={styles.textField}
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
        >
          Cadastrar usuario
        </Button>
      </Box>
      <CardsInsights />

      <List search={searchUser} />
    </PageStyle>
  );
}

export { Users };
