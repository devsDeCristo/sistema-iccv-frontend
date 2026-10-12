import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  CompareArrows,
  Link as LinkIcon,
  Sync,
  AccountBalance,
  EditNote,
  MoneyOff,
} from '@mui/icons-material';
import { format, startOfMonth } from 'date-fns';
import { toast } from 'react-toastify';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { StatusCards } from '../../../../components/statusCards';
import { BarraDeSelecao } from '../../../../components/barraDeSelecao';
import {
  Intervalo,
  SeletorDeIntervalo,
} from '../../../../components/seletorDeIntervalo';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ABAS_DA_ADMINISTRATIVA } from '../../../../features/admin/tesouraria/constants';
import { AbasDaTesouraria } from '../../../../features/admin/tesouraria/components/abasDaTesouraria';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useGetPluggy } from '../../../../features/settings/integrations/api';
import {
  useConciliar,
  useConciliarSugeridos,
  useDesfazerConciliacao,
  useGetConciliacao,
  useImportarDoBanco,
  useNaoConstaNoBanco,
} from '../../../../features/admin/tesouraria/api';
import {
  DiffDaConciliacao,
  ParMarcado,
} from '../../../../features/admin/tesouraria/components/diffDaConciliacao';

const dia = (data: Date) => format(data, 'yyyy-MM-dd');
const NENHUM: ParMarcado = { banco: null, manual: null };

/**
 * Conciliação: o extrato do banco (Pluggy) contra o que foi lançado à mão.
 * O banco é a fonte, e o lançamento manual fica para o que o banco não vê
 * (o dinheiro em espécie). O mesmo dinheiro nos dois lados se concilia: o
 * par conta uma vez nos totais. O sistema sugere os pares (mesmo valor, datas
 * próximas); o resto a pessoa casa marcando um de cada lado. O manual que
 * nunca vai aparecer no extrato fica "não consta no banco".
 */
function Conciliacao() {
  const theme = useTheme();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const churchId = escopo.churchId;

  const [intervalo, setIntervalo] = useState<Intervalo>(() => ({
    de: startOfMonth(new Date()),
    ate: new Date(),
  }));
  const periodo = useMemo(
    () => ({
      de: dia(intervalo.de ?? startOfMonth(new Date())),
      ate: dia(intervalo.ate ?? new Date()),
    }),
    [intervalo]
  );
  const [marcado, setMarcado] = useState<ParMarcado>(NENHUM);
  const { banco: bancoMarcado, manual: manualMarcado } = marcado;

  const { data, isFetching } = useGetConciliacao(churchId, periodo);
  const { data: pluggy } = useGetPluggy(churchId);
  const importar = useImportarDoBanco();
  const conciliar = useConciliar();
  const conciliarSugeridos = useConciliarSugeridos();
  const desfazer = useDesfazerConciliacao();
  const naoConsta = useNaoConstaNoBanco();

  const ocupado =
    conciliar.isLoading ||
    conciliarSugeridos.isLoading ||
    desfazer.isLoading ||
    naoConsta.isLoading;
  const temBanco = !!pluggy?.integracao?.enabled;
  const resumo = data?.resumo;

  const parear = (bancoId: string, manualId: string) =>
    churchId &&
    conciliar.mutate(
      { churchId, bancoId, manualId },
      { onSuccess: () => setMarcado(NENHUM) }
    );

  const trazerDoBanco = () =>
    churchId &&
    importar.mutate(churchId, {
      onSuccess: (r) => {
        if (r.importadas) {
          toast.success(`${r.importadas} importados do banco`);
        } else {
          toast.info('Nada novo no extrato desde a última importação');
        }
      },
    });

  const conciliarTudo = () =>
    churchId &&
    conciliarSugeridos.mutate(
      { churchId, ...periodo },
      {
        onSuccess: (r) => {
          toast.success(
            `${r.conciliados} ${
              r.conciliados === 1 ? 'par conciliado' : 'pares conciliados'
            }`
          );
        },
      }
    );

  return (
    <PageStyle>
      <Header
        title="Tesouraria administrativa"
        description="Dízimos, ofertas e as contas do dia a dia da igreja"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="a conciliação" />
      </Header>
      <AbasDaTesouraria abas={ABAS_DA_ADMINISTRATIVA} atual="conciliacao" />

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a conciliação: cada igreja
          tem o seu livro-caixa.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        <>
          <StatusCards
            isLoading={!data}
            cards={[
              {
                title: 'Conciliados',
                value: String(resumo?.conciliados ?? 0),
                subtitle: 'Pares no período',
                icon: <CheckCircle sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.success,
                compact: true,
              },
              {
                title: 'Sugeridos',
                value: String(resumo?.sugeridos ?? 0),
                subtitle: 'Mesmo valor, datas próximas',
                icon: <LinkIcon sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.info,
                compact: true,
              },
              {
                title: 'Só no banco',
                value: String(resumo?.soBanco ?? 0),
                subtitle: `Saldo ${formatCurrency(resumo?.valorSoBanco)}`,
                icon: <AccountBalance sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.alert,
                compact: true,
              },
              {
                title: 'Só manual',
                value: String(resumo?.soManual ?? 0),
                subtitle: `Saldo ${formatCurrency(resumo?.valorSoManual)}`,
                icon: <EditNote sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.alert,
                compact: true,
              },
              {
                title: 'Não consta no banco',
                value: String(resumo?.naoConsta ?? 0),
                subtitle: 'Manuais em espécie',
                icon: <MoneyOff sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.pending,
                compact: true,
              },
            ]}
          />

          <Paper
            sx={{
              ...superficieSx,
              ...barraLarguraCheiaNoCelularSx,
              p: 2,
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <SeletorDeIntervalo
                value={intervalo}
                onChange={(novo) => {
                  setIntervalo(novo);
                  setMarcado(NENHUM);
                }}
                semHora
                sx={{ width: 250 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flex: 1, minWidth: 160 }}
              >
                Marque um de cada lado para conciliar à mão.
              </Typography>
              {temBanco && (
                <Button
                  variant="outlined"
                  startIcon={<Sync />}
                  disabled={importar.isLoading}
                  onClick={trazerDoBanco}
                  sx={{
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {importar.isLoading ? 'Importando…' : 'Importar do banco'}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<CompareArrows />}
                disabled={!resumo?.sugeridos || ocupado}
                onClick={conciliarTudo}
                sx={{
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Conciliar sugestões
                {resumo?.sugeridos ? ` (${resumo.sugeridos})` : ''}
              </Button>
            </Stack>
          </Paper>

          {!temBanco && pluggy && (
            <Alert severity="info" sx={{ mb: 2 }}>
              A igreja não tem banco conectado: o extrato chega pela Pluggy, em
              Configurações › Integrações.
            </Alert>
          )}

          {data && !data.linhas.length ? (
            <Alert severity="success" icon={<CheckCircle />}>
              Nenhum lançamento no período.
            </Alert>
          ) : (
            <DiffDaConciliacao
              linhas={data?.linhas ?? []}
              marcado={marcado}
              ocupado={ocupado || isFetching}
              onMarcar={(lado, l) =>
                setMarcado((atual) => ({
                  ...atual,
                  [lado]: atual[lado]?.id === l.id ? null : l,
                }))
              }
              onConciliar={(banco, manual) => parear(banco.id, manual.id)}
              onDesfazer={(manual) =>
                churchId && desfazer.mutate({ churchId, manualId: manual.id })
              }
              onNaoConsta={(manual, marcar) =>
                churchId &&
                naoConsta.mutate({
                  churchId,
                  manualId: manual.id,
                  naoConsta: marcar,
                })
              }
            />
          )}

          {/* espaço da barra flutuante, para ela não cobrir as últimas linhas */}
          {(bancoMarcado || manualMarcado) && <div style={{ height: 80 }} />}
          <BarraDeSelecao
            quantos={Number(!!bancoMarcado) + Number(!!manualMarcado)}
            rotuloDaRegiao="Par para conciliar"
            onLimpar={() => setMarcado(NENHUM)}
            acao={
              bancoMarcado && manualMarcado
                ? {
                    rotulo: 'Conciliar o par',
                    rotuloCurto: 'Conciliar',
                    icone: <CompareArrows />,
                    onClick: () => parear(bancoMarcado.id, manualMarcado.id),
                  }
                : undefined
            }
          />
        </>
      )}
    </PageStyle>
  );
}

export { Conciliacao };
