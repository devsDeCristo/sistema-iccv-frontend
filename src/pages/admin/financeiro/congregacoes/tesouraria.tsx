import { Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { AbasDaTesouraria } from '../../../../features/admin/financeiro/components/abasDaTesouraria';
import {
  buscarTesourariaDeCongregacao,
  reconhecerNaCongregacao,
} from '../../../../features/admin/financeiro/tesouraria/dados';
import { DistribuicaoDaConta } from '../../../../features/admin/financeiro/tesouraria/components/distribuicaoDaConta';
import { DizimosDaCongregacao } from '../../../../features/admin/financeiro/tesouraria/components/dizimosDaCongregacao';
import { LancamentosDaCongregacao } from '../../../../features/admin/financeiro/tesouraria/components/lancamentosDaCongregacao';

const LISTA = '/admin/tesouraria/congregacoes';
const ABAS = ['conciliacao', 'dizimos', 'lancamentos'];

/**
 * A tesouraria de uma congregação, com as mesmas abas da administrativa, cada
 * uma com endereço próprio: `/admin/tesouraria/congregacoes/:id/conciliacao`,
 * `.../dizimos` e `.../lancamentos`.
 */
function TesourariaDaCongregacao() {
  const { id, aba } = useParams();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const tesouraria = buscarTesourariaDeCongregacao(id);

  const voltar = (
    <Button
      component={Link}
      to={LISTA}
      size="small"
      startIcon={<ArrowBack />}
      sx={{ textTransform: 'none', mb: 1 }}
    >
      Tesourarias das congregações
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
  const atual = aba && ABAS.includes(aba) ? aba : 'conciliacao';
  const { congregacao } = tesouraria;

  return (
    <PageStyle>
      {voltar}
      <Header
        title={congregacao.nome}
        description={`Tesouraria da congregação${
          congregacao.local ? ` · ${congregacao.local}` : ''
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
            atual={atual}
            abas={[
              {
                valor: 'conciliacao',
                rotulo: 'Conciliação',
                link: `${base}/conciliacao`,
              },
              { valor: 'dizimos', rotulo: 'Dízimos', link: `${base}/dizimos` },
              {
                valor: 'lancamentos',
                rotulo: 'Lançamentos',
                link: `${base}/lancamentos`,
              },
            ]}
          />
          {atual === 'dizimos' ? (
            <DizimosDaCongregacao tesourariaId={tesouraria.id} />
          ) : atual === 'lancamentos' ? (
            <LancamentosDaCongregacao tesourariaId={tesouraria.id} />
          ) : (
            <DistribuicaoDaConta
              conta="CONGREGACOES"
              tesourariaId={tesouraria.id}
              reconhecer={(m) => reconhecerNaCongregacao(tesouraria.id, m)}
            />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDaCongregacao };
