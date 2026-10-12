import { useReducer } from 'react';
import { Alert, Button } from '@mui/material';
import { ArrowBack, ConfirmationNumber } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useRole } from '../../../../hooks/useRole';
import { AbasDaTesouraria } from '../../../../features/admin/tesouraria/components/abasDaTesouraria';
import {
  buscarTesouraria,
  fechamentoDa,
  lancamentosDa,
} from '../../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { BarraDoFechamento } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/barraDoFechamento';
import { DistribuicaoDaConta } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/distribuicaoDaConta';
import { LancamentosDaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/lancamentosDaTesouraria';

const LISTA = '/admin/tesouraria/eventos';

/**
 * A tesouraria de um evento, em duas abas com endereço próprio:
 * `/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`.
 *
 * Além do admin e da tesouraria da igreja, entra o tesoureiro(a) completo —
 * só na tesouraria de um evento de que ele é tesoureiro. Fechar e reabrir é
 * do admin da igreja.
 */
function TesourariaDoEvento() {
  const { id, aba } = useParams();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const { soTesoureiroDeEvento, eventTreasurers } = useRole();
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);

  const encontrada = buscarTesouraria(id);
  const tesouraria =
    soTesoureiroDeEvento &&
    !eventTreasurers.some(
      (t) => t.kind === 'COMPLETO' && t.eventId === encontrada?.eventoId
    )
      ? null
      : encontrada;

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
  const conteudo = (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Tela de demonstração: os números são de exemplo, e o que for distribuído
        ou fechado aqui some ao recarregar a página.
      </Alert>
      <BarraDoFechamento
        tesourariaId={tesouraria.id}
        churchId={escopo.churchId}
        onMudou={redesenhar}
        deEvento
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
        <DistribuicaoDaConta
          conta="EVENTOS"
          tesourariaId={tesouraria.id}
          fechada={!!fechamentoDa(tesouraria.id)}
        />
      )}
    </>
  );

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
        {/* o tesoureiro(a) do evento não escolhe igreja: o evento é dele */}
        {!soTesoureiroDeEvento && (
          <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
        )}
      </Header>

      {soTesoureiroDeEvento ? (
        conteudo
      ) : escopo.precisaEscolher ? (
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
        conteudo
      )}
    </PageStyle>
  );
}

export { TesourariaDoEvento };
