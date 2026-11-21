import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Stack, TextField, useTheme } from '@mui/material';
import {
  Add,
  BlockOutlined,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  HourglassEmptyOutlined,
  LockOpenOutlined,
  LockOutlined,
  Badge,
} from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { NavTabs } from '../../../components/navTabs';
import { Header } from '../../../components/header';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  useDecidirProposta,
  useExcluirOportunidade,
  useOportunidadesDaIgreja,
  useSalvarOportunidade,
} from '../../../features/oportunidades/api';
import {
  AcaoDaLinha,
  ListaDaIgreja,
} from '../../../features/oportunidades/components/listaDaIgreja';
import { OportunidadeDaIgreja } from '../../../features/oportunidades/types';

type Aba = 'pendentes' | 'abertas' | 'encerradas' | 'recusadas';
const ABAS: Aba[] = ['pendentes', 'abertas', 'encerradas', 'recusadas'];

/**
 * As vagas de emprego da igreja (módulo Oportunidades). O admin publica,
 * encerra, vê quem se candidatou e exporta a lista; e decide as propostas dos
 * membros — aprovada vai ao ar, recusada fica arquivada em Recusadas.
 * Publicar, editar e revisar abrem a página da vaga (`editar.tsx`).
 *
 * A aba fica no endereço (`?aba=pendentes`): o aviso de proposta nova cai nela.
 */
function OportunidadesAdmin() {
  const theme = useTheme();
  const escopo = useIgrejaSelecionada();
  const churchId = escopo.churchId;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const pedida = params.get('aba') as Aba | null;
  const [excluindo, setExcluindo] = useState<OportunidadeDaIgreja | null>(null);
  const [aprovando, setAprovando] = useState<OportunidadeDaIgreja | null>(null);
  const [recusando, setRecusando] = useState<OportunidadeDaIgreja | null>(null);
  const [motivo, setMotivo] = useState('');

  const { data, isFetching } = useOportunidadesDaIgreja(churchId);
  const salvar = useSalvarOportunidade();
  const excluir = useExcluirOportunidade();
  const decidir = useDecidirProposta();

  const todas = useMemo(() => data ?? [], [data]);
  const porAba: Record<Aba, OportunidadeDaIgreja[]> = {
    pendentes: todas.filter((o) => o.status === 'PENDING'),
    // vencida conta como encerrada
    abertas: todas.filter((o) => o.status === 'APPROVED' && !o.encerrada),
    encerradas: todas.filter((o) => o.status === 'APPROVED' && o.encerrada),
    recusadas: todas.filter((o) => o.status === 'REJECTED'),
  };
  // sem aba no endereço: as pendentes, se houver; senão, as abertas
  const aba: Aba =
    pedida && ABAS.includes(pedida)
      ? pedida
      : porAba.pendentes.length
        ? 'pendentes'
        : 'abertas';

  const abrirOuEncerrar = (o: OportunidadeDaIgreja) => {
    // reabrir a vencida tira a data final, senão continuaria fechada
    const vencida = !!o.closesAt && new Date(o.closesAt) <= new Date();
    salvar.mutate({
      churchId: churchId!,
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
  };

  const acoesDaLinha = (o: OportunidadeDaIgreja): AcaoDaLinha[] => {
    const excluirAcao = {
      titulo: 'Excluir',
      icone: <DeleteOutline fontSize="small" />,
      onClick: () => setExcluindo(o),
      cor: theme.palette.error.main,
    };
    if (o.status === 'PENDING') {
      return [
        {
          titulo: 'Revisar e editar',
          icone: <EditOutlined fontSize="small" />,
          onClick: () => navigate(`/admin/oportunidades/${o.id}`),
        },
        {
          titulo: 'Aprovar',
          icone: <CheckCircleOutline fontSize="small" />,
          onClick: () => setAprovando(o),
          cor: theme.palette.success.main,
        },
        {
          titulo: 'Recusar',
          icone: <BlockOutlined fontSize="small" />,
          onClick: () => {
            setMotivo('');
            setRecusando(o);
          },
          cor: theme.palette.error.main,
        },
      ];
    }
    if (o.status === 'REJECTED') return [excluirAcao];
    return [
      {
        titulo: 'Editar',
        icone: <EditOutlined fontSize="small" />,
        onClick: () => navigate(`/admin/oportunidades/${o.id}`),
      },
      {
        titulo: o.encerrada ? 'Reabrir' : 'Encerrar',
        icone: o.encerrada ? (
          <LockOpenOutlined fontSize="small" />
        ) : (
          <LockOutlined fontSize="small" />
        ),
        onClick: () => abrirOuEncerrar(o),
      },
      excluirAcao,
    ];
  };

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
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            gap={2}
            sx={{ mb: 2 }}
          >
            <NavTabs
              value={aba}
              onChange={(nova) => setParams({ aba: nova }, { replace: true })}
              options={[
                {
                  value: 'pendentes',
                  label: 'Pendentes',
                  icon: <HourglassEmptyOutlined fontSize="small" />,
                  contagem: porAba.pendentes.length,
                },
                {
                  value: 'abertas',
                  label: 'Abertas',
                  icon: <Badge fontSize="small" />,
                  contagem: porAba.abertas.length,
                },
                {
                  value: 'encerradas',
                  label: 'Encerradas',
                  icon: <LockOutlined fontSize="small" />,
                  contagem: porAba.encerradas.length,
                },
                {
                  value: 'recusadas',
                  label: 'Recusadas',
                  icon: <BlockOutlined fontSize="small" />,
                  contagem: porAba.recusadas.length,
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

          {aba === 'pendentes' && porAba.pendentes.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Propostas dos membros, ainda fora do ar. Revise (dá para editar
              antes) e aprove para publicar, ou recuse — a recusada fica em
              Recusadas, e quem propôs vê o motivo.
            </Alert>
          )}

          <ListaDaIgreja
            oportunidades={porAba[aba]}
            carregando={isFetching && !data}
            onInteressados={(o) =>
              navigate(`/admin/oportunidades/${o.id}/candidaturas`)
            }
            acoesDaLinha={acoesDaLinha}
          />

          <ConfirmModal
            open={!!aprovando}
            onClose={() => setAprovando(null)}
            title="Aprovar a proposta?"
            message={`“${aprovando?.title ?? ''}” vai ao ar para os membros, que são avisados, e ${aprovando?.proposedBy?.fullName ?? 'quem propôs'} passa a ver os candidatos.`}
            confirmLabel="Aprovar"
            onConfirm={() =>
              aprovando &&
              decidir.mutate(
                { churchId, id: aprovando.id, decisao: 'aprovar' },
                {
                  onSuccess: () => setAprovando(null),
                  onError: () => setAprovando(null),
                }
              )
            }
          />

          <ResponsiveModal
            open={!!recusando}
            onClose={() => setRecusando(null)}
            disableClose={decidir.isLoading}
            maxWidth="sm"
            title="Recusar a proposta?"
            actions={
              <>
                <Button
                  color="inherit"
                  onClick={() => setRecusando(null)}
                  disabled={decidir.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disabled={decidir.isLoading}
                  onClick={() =>
                    recusando &&
                    decidir.mutate(
                      {
                        churchId,
                        id: recusando.id,
                        decisao: 'recusar',
                        motivo,
                      },
                      {
                        onSuccess: () => setRecusando(null),
                        onError: () => setRecusando(null),
                      }
                    )
                  }
                >
                  Recusar
                </Button>
              </>
            }
          >
            <Stack spacing={2}>
              <Alert severity="warning">
                “{recusando?.title}” fica arquivada em Recusadas e não vai ao
                ar. {recusando?.proposedBy?.fullName ?? 'Quem propôs'} é
                avisado(a).
              </Alert>
              <TextField
                label="Motivo (opcional)"
                placeholder="Ex.: a vaga já foi preenchida"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                inputProps={{ maxLength: 500 }}
                helperText="Quem propôs vê este motivo"
                multiline
                minRows={2}
              />
            </Stack>
          </ResponsiveModal>

          <ConfirmModal
            open={!!excluindo}
            onClose={() => setExcluindo(null)}
            title="Excluir oportunidade?"
            message={`“${excluindo?.title ?? ''}” sai do sistema, com as candidaturas e os currículos.${excluindo?.status === 'APPROVED' ? ' Para só tirar dos membros, encerre.' : ''}`}
            alerta={
              excluindo?.interests.length
                ? `${excluindo.interests.length} ${excluindo.interests.length === 1 ? 'pessoa se candidatou' : 'pessoas se candidataram'}. Exporte a lista antes, se ainda precisar dela.`
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
