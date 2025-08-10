
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';

import { PageStyle } from '../../components/pageStyle';
import { Cards } from '../../features/events/components/cards';

function Events() {

  const navigate = useNavigate();
  return (
    <PageStyle>
      <Header title="Eventos Abertos  " />
      
      <Cards />
    </PageStyle>
  );
}

export { Events };
