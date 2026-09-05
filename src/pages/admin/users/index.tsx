import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
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
import { campoBuscaSx, superficieSx } from '../../../components/listPageStyles';
import { useState } from 'react';
import { Add, Close, Search } from '@mui/icons-material';
import { CardsStatus } from '../../../features/admin/users/components/cardsStatus';
import { useGetChurches } from '../../../features/admin/churches/api/getChurches';

function Users() {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState('');
  // 'all' e não vazio: com valor vazio o campo fica em branco e o rótulo não
  // sobe. Só o super admin escolhe — a lista do admin já vem recortada
  const [churchId, setChurchId] = useState('all');

  const { isAdmin, isSuperAdmin, churchRoles } = useRole();
  const { data: todasAsIgrejas = [] } = useGetChurches({
    enabled: isSuperAdmin,
  });

  // o super admin escolhe entre todas; quem administra mais de uma, entre as
  // dela. Com uma igreja só não há o que filtrar
  const igrejasDoFiltro = isSuperAdmin
    ? todasAsIgrejas.map((igreja) => ({ id: igreja.id, name: igreja.name }))
    : churchRoles.map((vinculo) => vinculo.church);
  const mostraFiltroDeIgreja = isSuperAdmin || igrejasDoFiltro.length > 1;
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
    selectIgreja: {
      width: { xs: '100%', sm: '220px' },
      ...campoBuscaSx(theme),
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
      <Header title="Usuários" />
      <CardsStatus />
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

          {/* a lente da igreja: traz quem está nos eventos dela mais os
            administradores dela. Só aparece para quem tem mais de uma igreja
            para olhar — com uma só, a lista já é dela */}
          {mostraFiltroDeIgreja && (
            <TextField
              select
              label="Igreja"
              variant="outlined"
              size="small"
              value={churchId}
              sx={styles.selectIgreja}
              onChange={(e) => setChurchId(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              {igrejasDoFiltro.map((igreja) => (
                <MenuItem key={igreja.id} value={igreja.id}>
                  {igreja.name}
                </MenuItem>
              ))}
            </TextField>
          )}
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
