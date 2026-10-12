import { Alert, Button, Skeleton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { AbasDaTesouraria } from '../../../../features/admin/tesouraria/components/abasDaTesouraria';
import { useTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/api';
import { BarraDoFechamento } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/barraDoFechamento';
import { ConciliacaoDaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/conciliacaoDaTesouraria';
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
  const churchId = escopo.churchId;
  const { data: tesouraria, isLoading } = useTesouraria(churchId, id);

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

  if (escopo.precisaEscolher || escopo.semIgreja) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="info">
          {escopo.semIgreja
            ? 'Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por igreja.'
            : 'Escolha no topo da página de qual igreja é a tesouraria: cada igreja tem a sua.'}
        </Alert>
      </PageStyle>
    );
  }

  if (isLoading || escopo.carregando) {
    return (
      <PageStyle>
        {voltar}
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
      </PageStyle>
    );
  }

  if (!tesouraria || !churchId) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="warning">
          Tesouraria não encontrada nesta igreja.
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
        description={`Tesouraria da congregação${
          tesouraria.local ? ` · ${tesouraria.local}` : ''
        }`}
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
      </Header>

      <BarraDoFechamento tesouraria={tesouraria} churchId={churchId} />
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
        <LancamentosDaCongregacao
          churchId={churchId}
          tesourariaId={tesouraria.id}
        />
      ) : (
        <ConciliacaoDaTesouraria
          tipo="CONGREGATION"
          churchId={churchId}
          tesourariaId={tesouraria.id}
          fechada={!!tesouraria.fechamento}
        />
      )}
    </PageStyle>
  );
}

export { TesourariaDaCongregacao };
