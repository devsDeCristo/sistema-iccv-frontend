import { Alert } from '@mui/material';
import { PageStyle } from '../pageStyle';
import { Header } from '../header';
import { ModuloDaIgreja, ROTULO_DO_MODULO } from '../../constants/modulos';

/**
 * A tela de um módulo que nenhuma igreja da pessoa tem no plano. Só quem
 * trabalha na igreja (admin, financeiro) chega aqui: dev e super admin veem
 * todos os módulos.
 */
function ForaDoPlano({ modulo }: { modulo: ModuloDaIgreja }) {
  const nome = ROTULO_DO_MODULO[modulo];

  return (
    <PageStyle>
      <Header title={nome} />
      <Alert severity="info">
        O plano da sua igreja não inclui o módulo {nome}. Para usá-lo, fale com
        quem administra o sistema.
      </Alert>
    </PageStyle>
  );
}

export { ForaDoPlano };
