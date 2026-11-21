import { useMemo, useState } from 'react';
import { Alert } from '@mui/material';
import { AllInbox, HowToReg } from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { NavTabs } from '../../../components/navTabs';
import { Header } from '../../../components/header';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  usePapelNasSolicitacoes,
  useSolicitacoesDaIgreja,
} from '../../../features/solicitacoes/api';
import { aguardaVoce, ETAPAS } from '../../../features/solicitacoes/constants';
import { ListaDaIgreja } from '../../../features/solicitacoes/components/listaDaIgreja';
import { ModalDaSolicitacao } from '../../../features/solicitacoes/components/modalDaSolicitacao';

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
  // só o id: a solicitação aberta sai da lista, e o refetch traz para a
  // janela a decisão que alguém deu enquanto ela estava aberta
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const { data, isFetching } = useSolicitacoesDaIgreja(churchId);
  // o papel é da igreja, não da solicitação: busca uma vez aqui, e a janela
  // já abre sabendo se a pessoa decide
  const { data: papel } = usePapelNasSolicitacoes(churchId);
  const todas = useMemo(() => data ?? [], [data]);
  const aberta = todas.find((s) => s.id === abertaId) ?? null;
  const daEtapa = (valor: string) =>
    todas.filter((s) =>
      ETAPAS.find((etapa) => etapa.valor === valor)?.situacoes.includes(
        s.status
      )
    );
  // a vez de quem está logado (pastor ou tesouraria): o que ele precisa decidir
  const lado = papel?.lado ?? null;
  const suaVez = todas.filter((s) => aguardaVoce(s, lado));
  // trocou para uma igreja em que não decide: a aba "Sua vez" some
  const abaAtual = aba === 'sua-vez' && !lado ? 'todas' : aba;
  const visiveis =
    abaAtual === 'todas'
      ? todas
      : abaAtual === 'sua-vez'
        ? suaVez
        : daEtapa(abaAtual);

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
          Você não é admin nem tesouraria de nenhuma igreja. As solicitações são
          por igreja, e quem decide é o pastor e a tesouraria dela.
        </Alert>
      ) : (
        <>
          <NavTabs
            fullWidth
            value={abaAtual}
            onChange={setAba}
            sx={{ mb: 2 }}
            options={[
              {
                value: 'todas',
                label: 'Todas',
                icon: <AllInbox fontSize="small" />,
                contagem: todas.length,
              },
              // só para quem decide: o admin que acompanha não tem vez
              ...(lado
                ? [
                    {
                      value: 'sua-vez',
                      label: 'Sua vez',
                      icon: <HowToReg fontSize="small" />,
                      contagem: suaVez.length,
                    },
                  ]
                : []),
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
            onAbrir={(s) => setAbertaId(s.id)}
          />
          {churchId && (
            <ModalDaSolicitacao
              churchId={churchId}
              solicitacao={aberta}
              papel={papel}
              onClose={() => setAbertaId(null)}
            />
          )}
        </>
      )}
    </PageStyle>
  );
}

export { SolicitacoesAdmin };
