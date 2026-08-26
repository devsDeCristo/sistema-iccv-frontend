import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/users/components/list';
import { useRole } from '../../../hooks/useRole';
import {
  campoBuscaSx,
  superficieSx,
} from '../../../components/listPageStyles';
import { useState } from 'react';
import { Add, Close, Search } from '@mui/icons-material';
import { CardsStatus } from '../../../features/admin/users/components/cardsStatus';

function Users() {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');

  const { isAdmin } = useRole();
  const theme = useTheme();
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
      // mesmo raio dos cards e da tabela; a sombra vem do tema
      ...superficieSx,
    },
    button: {
      width: { xs: '100%', sm: 'fit-content' },
      // casa com o campo de busca ao lado; o raio padrão do tema é 4px e
      // destoava dos 8px do campo na mesma linha
      borderRadius: 2,
    },
    textField: {
      width: { xs: '100%', sm: '380px' },
      ...campoBuscaSx(theme),
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
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            // aparece só com texto digitado: em campo vazio seria um botão
            // morto ocupando espaço
            endAdornment: searchUser ? (
              <InputAdornment position="end">
                <Tooltip title="Limpar busca">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setSearchUser('')}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : undefined,
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
          Novo usuário
        </Button>
      </Paper>

      <List search={searchUser} />
    </PageStyle>
  );
}

export { Users };
