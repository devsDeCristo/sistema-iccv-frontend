import { Alert, Button } from '@mui/material';
import { ArrowBack, ConfirmationNumber } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { AbasDaTesouraria } from '../../../../features/admin/financeiro/components/abasDaTesouraria';
import {
  buscarTesouraria,
  lancamentosDa,
} from '../../../../features/admin/financeiro/tesouraria/dados';
import { DistribuicaoDaConta } from '../../../../features/admin/financeiro/tesouraria/components/distribuicaoDaConta';
import { LancamentosDaTesouraria } from '../../../../features/admin/financeiro/tesouraria/components/lancamentosDaTesouraria';

const LISTA = '/admin/tesouraria/eventos';

/**
 * A tesouraria de um evento, em duas abas com endereço próprio:
 * `/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`.
 */
function TesourariaDoEvento() {
  const { id, aba } = useParams();
  const escopo = useIgrejaSelecionada(true);
  const tesouraria = buscarTesouraria(id);

  const voltar = (
    <Button
      component={Link}
      to={LISTA}
      size="small"
      startIcon={<ArrowBack />}
      sx={{ textTransform: 'none', mb: 1 }}
    >
      Tesourarias de eventos
    </Button>
  );

  if (!tesouraria) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="warning">
          Tesouraria não encontrada. As criadas nesta demonstração somem ao
          recarregar a página.
        </Alert>
      </PageStyle>
    );
  }

  const base = `${LISTA}/${tesouraria.id}`;

  return (
    <PageStyle>
      {voltar}
      <Header
        title={tesouraria.nome}
        description={`Tesouraria de evento · ${tesouraria.periodo}${
          tesouraria.eventoId ? '' : ' · fora do sistema'
        }`}
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a tesouraria: cada igreja
          tem a sua.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem financeiro de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tela de demonstração: os números são de exemplo, e o que for
            distribuído aqui some ao recarregar a página.
          </Alert>
          <AbasDaTesouraria
            atual={aba === 'lancamentos' ? 'lancamentos' : 'conciliacao'}
            abas={[
              {
                valor: 'conciliacao',
                rotulo: 'Conciliação',
                link: `${base}/conciliacao`,
              },
              {
                valor: 'lancamentos',
                rotulo: 'Lançamentos',
                link: `${base}/lancamentos`,
              },
            ]}
          />
          {aba === 'lancamentos' ? (
            <LancamentosDaTesouraria
              lancamentos={lancamentosDa(tesouraria.id)}
              periodo="No evento"
              destaque={{
                categoria: 'Ingressos',
                legenda: 'Das inscrições do evento',
                icone: <ConfirmationNumber sx={{ fontSize: 20 }} />,
              }}
            />
          ) : (
            <DistribuicaoDaConta conta="EVENTOS" tesourariaId={tesouraria.id} />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDoEvento };
