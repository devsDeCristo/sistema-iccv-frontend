import { Header } from '../../components/header';

import { PageStyle } from '../../components/pageStyle';
import { Cards } from '../../features/myRegisters/components/cards';


function MyRegisters() {
  return (
    <PageStyle>
      <Header title="Minhas Inscrições" />

      <Cards />
    </PageStyle>
  );
}

export { MyRegisters };
