import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { ListLogs } from '../../../features/admin/logs/components/list';

/**
 * Registro de atividades do sistema. Fica atrás do perfil Dev: a coluna de
 * conteúdo mostra o antes e o depois de qualquer tabela, incluindo dado pessoal
 * de inscrito.
 */
function Logs() {
  return (
    <PageStyle>
      <Header
        title="Registro de Atividades"
        description="Tudo que foi criado, alterado ou removido no sistema"
      />

      <ListLogs />
    </PageStyle>
  );
}

export { Logs };
