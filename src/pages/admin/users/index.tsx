import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { List } from '../../../features/admin/users/components/list';
import { useRole } from '../../../hooks/useRole';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../components/listPageStyles';
import { useState } from 'react';
import { Add, Close, Search } from '@mui/icons-material';
import { CardsStatus } from '../../../features/admin/users/components/cardsStatus';
import { SeletorDeIgreja } from '../../../components/seletorDeIgreja';
import { useIgrejaEscolhida } from '../../../hooks/useIgrejaEscolhida';

function Users() {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');
  // a lente da igreja: traz quem está nos eventos dela mais os
  // administradores dela. Escolhida no seletor padrão, no canto superior
  // direito; a lista de usuários é das igrejas que a pessoa administra
  const [churchId, setChurchId] = useIgrejaEscolhida();

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
      // mesmo raio dos cards e da tabela; a sombra vem do tema
      ...superficieSx,
      // no celular, busca, selects e botões ocupam a linha inteira
      ...barraLarguraCheiaNoCelularSx,
    },
    button: {
      width: { xs: '100%', sm: 'fit-content' },
      // casa com o campo de busca ao lado; o raio padrão do tema é 4px e
      // destoava dos 8px do campo na mesma linha
      borderRadius: 2,
    },
    textField: {
      width: { xs: '100%', sm: '380px' },
    },
    filtros: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2,
    },
  };
  return (
    <PageStyle>
      <Header title="Usuários" acaoAoLado>
        <SeletorDeIgreja value={churchId} onChange={setChurchId} />
      </Header>
      <CardsStatus churchId={churchId} />
      <Paper sx={styles.boxFilterAndButton}>
        <Box sx={styles.filtros}>
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
        </Box>
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

      <List search={searchUser} churchId={churchId} />
    </PageStyle>
  );
}

export { Users };
