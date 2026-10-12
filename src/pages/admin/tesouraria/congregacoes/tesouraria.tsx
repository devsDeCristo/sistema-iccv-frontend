import { useReducer } from 'react';
import { Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { AbasDaTesouraria } from '../../../../features/admin/tesouraria/components/abasDaTesouraria';
import {
  buscarTesourariaDeCongregacao,
  fechamentoDa,
} from '../../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { BarraDoFechamento } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/barraDoFechamento';
import { DistribuicaoDaConta } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/distribuicaoDaConta';
import { LancamentosDaCongregacao } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/lancamentosDaCongregacao';

const LISTA = '/admin/tesouraria/congregacoes';

/**
 * A tesouraria de uma congregação: só entradas e saídas, em duas abas com
 * endereço próprio — `/admin/tesouraria/congregacoes/:id/conciliacao` e
 * `.../lancamentos`. Quem vê é a tesouraria da igreja (e o admin, que fecha).
 */
function TesourariaDaCongregacao() {
  const { id, aba } = useParams();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);
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
          Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tela de demonstração: os números são de exemplo, e o que for
            distribuído ou fechado aqui some ao recarregar a página.
          </Alert>
          <BarraDoFechamento
            tesourariaId={tesouraria.id}
            churchId={escopo.churchId}
            onMudou={redesenhar}
          />
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
            <LancamentosDaCongregacao tesourariaId={tesouraria.id} />
          ) : (
            <DistribuicaoDaConta
              conta="CONGREGACOES"
              tesourariaId={tesouraria.id}
              fechada={!!fechamentoDa(tesouraria.id)}
            />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDaCongregacao };
