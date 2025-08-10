import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { List } from '../../features/admin/events/components/list';
import { PageStyle } from '../../components/pageStyle';

function Events() {
  const navigate = useNavigate();
  return (
    <PageStyle>
      <Header title="Eventos" />
      
      <List />
    </PageStyle>
  );
}

export { Events };
