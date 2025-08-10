import { Header } from '../../components/header';

import { PageStyle } from '../../components/pageStyle';
import { Cards } from '../../features/events/components/cards';

function Events() {
  return (
    <PageStyle>
      <Header title="Eventos Abertos  " />

      <Cards />
    </PageStyle>
  );
}

export { Events };
