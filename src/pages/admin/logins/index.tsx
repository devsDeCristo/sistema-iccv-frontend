import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { ListLoginAttempts } from '../../../features/admin/logs/components/listLoginAttempts';

function LoginAttempts() {
  return (
    <PageStyle>
      <Header
        title="Registro de Login"
        description="Tentativas de entrada no sistema, bem-sucedidas ou recusadas"
      />
      <ListLoginAttempts />
    </PageStyle>
  );
}

export { LoginAttempts };