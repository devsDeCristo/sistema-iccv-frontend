import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { List } from '../../features/users/components/list';

function Users() {
  const navigate = useNavigate();
  return (
    <PageStyle>
      <Header title="Usuários" />
      <Box
        component="div"
        justifyContent="end"
        display="flex"
        mb={2}
        sx={{ gap: '5px' }}
      >
        <Button
          variant="contained"
          onClick={() => navigate('/cadastro-cursilho')}
        >
          Cadastrar usuario
        </Button>
      </Box>
      <List />
    </PageStyle>
  );
}

export { Users };
