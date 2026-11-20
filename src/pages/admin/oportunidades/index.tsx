import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Stack } from '@mui/material';
import { Add, LockOutlined, Work } from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { NavTabs } from '../../../components/navTabs';
import { Header } from '../../../components/header';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  useExcluirOportunidade,
  useOportunidadesDaIgreja,
  useSalvarOportunidade,
} from '../../../features/oportunidades/api';
import { ListaDaIgreja } from '../../../features/oportunidades/components/listaDaIgreja';
import { ModalInteressados } from '../../../features/oportunidades/components/modalInteressados';
import { OportunidadeDaIgreja } from '../../../features/oportunidades/types';

/**
 * As vagas de emprego que a igreja publica aos membros (módulo
 * Oportunidades). O admin publica, encerra, vê quem se candidatou e exporta a
 * lista para quem ofereceu a vaga. Publicar e editar abrem a página da vaga
 * (`editar.tsx`), com o formulário de candidatura.
 */
function OportunidadesAdmin() {
  const escopo = useIgrejaSelecionada();
  const churchId = escopo.churchId;
  const [aba, setAba] = useState<'abertas' | 'encerradas'>('abertas');
  const navigate = useNavigate();
  const [interessados, setInteressados] = useState<OportunidadeDaIgreja | null>(
    null
  );
  const [excluindo, setExcluindo] = useState<OportunidadeDaIgreja | null>(null);

  const { data, isFetching } = useOportunidadesDaIgreja(churchId);
  const salvar = useSalvarOportunidade();
  const excluir = useExcluirOportunidade();

  const todas = useMemo(() => data ?? [], [data]);
  // vencida conta como encerrada
  const abertas = todas.filter((o) => !o.encerrada);
  const encerradas = todas.filter((o) => o.encerrada);

  return (
    <PageStyle>
      <Header
        title="Oportunidades"
        modulo="oportunidades"
        description="Vagas de emprego para os membros da igreja"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="as oportunidades" />
      </Header>

      {!churchId ? (
        <Alert severity="info">
          {escopo.semIgreja
            ? 'Você não administra nenhuma igreja. As oportunidades são por igreja.'
            : 'Escolha no topo da página de qual igreja são as oportunidades.'}
        </Alert>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={2}
            sx={{ mb: 2 }}
          >
            <NavTabs
              value={aba}
              onChange={setAba}
              options={[
                {
                  value: 'abertas',
                  label: 'Abertas',
                  icon: <Work fontSize="small" />,
                  contagem: abertas.length,
                },
                {
                  value: 'encerradas',
                  label: 'Encerradas',
                  icon: <LockOutlined fontSize="small" />,
                  contagem: encerradas.length,
                },
              ]}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/oportunidades/nova')}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Nova oportunidade
            </Button>
          </Stack>

          <ListaDaIgreja
            oportunidades={aba === 'abertas' ? abertas : encerradas}
            carregando={isFetching && !data}
            onInteressados={setInteressados}
            onEditar={(o) => navigate(`/admin/oportunidades/${o.id}`)}
            onAbrirOuEncerrar={(o) => {
              // reabrir a vencida tira a data final, senão continuaria fechada
              const vencida =
                !!o.closesAt && new Date(o.closesAt) <= new Date();
              salvar.mutate({
                churchId,
                id: o.id,
                dados: o.encerrada
                  ? { aberta: true, ...(vencida && { encerraEm: null }) }
                  : { aberta: false },
                aviso: !o.encerrada
                  ? 'Oportunidade encerrada'
                  : vencida
                    ? 'Oportunidade reaberta, sem data final'
                    : 'Oportunidade reaberta',
              });
            }}
            onExcluir={setExcluindo}
          />

          <ModalInteressados
            churchId={churchId}
            oportunidade={interessados}
            onClose={() => setInteressados(null)}
          />
          <ConfirmModal
            open={!!excluindo}
            onClose={() => setExcluindo(null)}
            title="Excluir oportunidade?"
            message={`“${excluindo?.title ?? ''}” sai do sistema, com as candidaturas e os currículos. Para só tirar dos membros, encerre.`}
            alerta={
              excluindo?.interests.length
                ? `${excluindo.interests.length} ${excluindo.interests.length === 1 ? 'pessoa demonstrou' : 'pessoas demonstraram'} interesse. Exporte a lista antes, se ainda precisar dela.`
                : undefined
            }
            confirmLabel="Excluir"
            onConfirm={() =>
              excluindo &&
              excluir.mutate(
                { churchId, id: excluindo.id },
                { onSuccess: () => setExcluindo(null) }
              )
            }
          />
        </>
      )}
    </PageStyle>
  );
}

export { OportunidadesAdmin };
