import { useMemo, useState } from 'react';
import { Alert } from '@mui/material';
import { AllInbox } from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { NavTabs } from '../../../components/navTabs';
import { Header } from '../../../components/header';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import { useSolicitacoesDaIgreja } from '../../../features/solicitacoes/api';
import { ETAPAS } from '../../../features/solicitacoes/constants';
import { ListaDaIgreja } from '../../../features/solicitacoes/components/listaDaIgreja';
import { ModalDaSolicitacao } from '../../../features/solicitacoes/components/modalDaSolicitacao';
import { SolicitacaoDaIgreja } from '../../../features/solicitacoes/types';

/**
 * O que os membros pedem à igreja (módulo Solicitações). O painel dela vê
 * tudo, filtra pela etapa do trâmite (`ETAPAS`) e abre cada uma para ler
 * inteira, decidir (pastor e tesouraria) e responder.
 */
function SolicitacoesAdmin() {
  // a tesouraria da igreja também responde as solicitações
  const escopo = useIgrejaSelecionada(true);
  const churchId = escopo.churchId;
  const [aba, setAba] = useState('todas');
  const [aberta, setAberta] = useState<SolicitacaoDaIgreja | null>(null);

  const { data, isFetching } = useSolicitacoesDaIgreja(churchId);
  const todas = useMemo(() => data ?? [], [data]);
  const daEtapa = (valor: string) =>
    todas.filter((s) =>
      ETAPAS.find((etapa) => etapa.valor === valor)?.situacoes.includes(
        s.status
      )
    );
  const visiveis = aba === 'todas' ? todas : daEtapa(aba);

  return (
    <PageStyle>
      <Header
        title="Solicitações"
        modulo="solicitacoes"
        description="O que os ministérios pedem à igreja"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="as solicitações" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja são as solicitações: cada
          igreja recebe as dos seus membros.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não administra nenhuma igreja. As solicitações são por igreja, e
          quem responde é quem a administra.
        </Alert>
      ) : (
        <>
          <NavTabs
            fullWidth
            value={aba}
            onChange={setAba}
            sx={{ mb: 2 }}
            options={[
              {
                value: 'todas',
                label: 'Todas',
                icon: <AllInbox fontSize="small" />,
                contagem: todas.length,
              },
              ...ETAPAS.map(({ valor, rotulo, Icone }) => ({
                value: valor,
                label: rotulo,
                icon: <Icone fontSize="small" />,
                contagem: daEtapa(valor).length,
              })),
            ]}
          />
          <ListaDaIgreja
            solicitacoes={visiveis}
            carregando={isFetching && !data}
            onAbrir={setAberta}
          />
          {churchId && (
            <ModalDaSolicitacao
              churchId={churchId}
              solicitacao={aberta}
              onClose={() => setAberta(null)}
            />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { SolicitacoesAdmin };
