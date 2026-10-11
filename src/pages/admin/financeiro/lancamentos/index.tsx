import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Search,
  Sync,
  TrendingDown,
  TrendingUp,
  VolunteerActivism,
} from '@mui/icons-material';
import { format, startOfMonth } from 'date-fns';
import { toast } from 'react-toastify';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { StatusCards } from '../../../../components/statusCards';
import {
  Intervalo,
  SeletorDeIntervalo,
} from '../../../../components/seletorDeIntervalo';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useGetPluggy } from '../../../../features/settings/integrations/api';
import {
  useGetDizimistas,
  useGetLancamentos,
  useImportarDoBanco,
  useRemoverLancamento,
} from '../../../../features/admin/financeiro/api';
import {
  CATEGORIAS_POR_TIPO,
  ROTULO_DA_CATEGORIA,
  ROTULO_DA_ORIGEM,
} from '../../../../features/admin/financeiro/constants';
import { ListaDeLancamentos } from '../../../../features/admin/financeiro/components/listaDeLancamentos';
import { ModalLancamento } from '../../../../features/admin/financeiro/components/modalLancamento';
import {
  Categoria,
  Lancamento,
  OrigemDoLancamento,
  TipoDeLancamento,
} from '../../../../features/admin/financeiro/types';

const dia = (data: Date) => format(data, 'yyyy-MM-dd');

/**
 * O livro-caixa da igreja: entradas e saídas do período, manuais e as que
 * vieram do extrato do banco pela Pluggy.
 *
 * Os cards dizem o período inteiro; os filtros recortam só a tabela.
 */
function Lancamentos() {
  const theme = useTheme();
  // o financeiro também usa: é a tela dele
  const escopo = useIgrejaSelecionada(true);
  const churchId = escopo.churchId;

  // abre no mês corrente, até hoje
  const [intervalo, setIntervalo] = useState<Intervalo>(() => ({
    de: startOfMonth(new Date()),
    ate: new Date(),
  }));
  const [tipo, setTipo] = useState<TipoDeLancamento | ''>('');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [origem, setOrigem] = useState<OrigemDoLancamento | ''>('');
  const [busca, setBusca] = useState('');
  // a busca vai para o servidor: espera a pessoa parar de digitar
  const [buscaEnviada, setBuscaEnviada] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setBuscaEnviada(busca.trim()), 350);
    return () => clearTimeout(id);
  }, [busca]);

  const [editando, setEditando] = useState<Lancamento | null>(null);
  const [criando, setCriando] = useState(false);
  const [apagando, setApagando] = useState<Lancamento | null>(null);

  const filtros = useMemo(
    () => ({
      de: dia(intervalo.de ?? startOfMonth(new Date())),
      ate: dia(intervalo.ate ?? new Date()),
      ...(tipo ? { type: tipo } : {}),
      ...(categoria ? { category: categoria } : {}),
      ...(origem ? { source: origem } : {}),
      ...(buscaEnviada ? { busca: buscaEnviada } : {}),
    }),
    [intervalo, tipo, categoria, origem, buscaEnviada]
  );

  const { data, isFetching } = useGetLancamentos(churchId, filtros);
  const { data: dizimistas } = useGetDizimistas(
    churchId,
    new Date().getFullYear()
  );
  const { data: pluggy } = useGetPluggy(churchId);
  const importar = useImportarDoBanco();
  const remover = useRemoverLancamento();

  const temBanco = !!pluggy?.integracao?.enabled;
  const resumo = data?.resumo;
  const verde = theme.palette.chips.success;
  const vermelho = theme.palette.chips.canceled;

  const categoriasDoFiltro = tipo
    ? CATEGORIAS_POR_TIPO[tipo]
    : [...CATEGORIAS_POR_TIPO.INCOME, ...CATEGORIAS_POR_TIPO.EXPENSE];

  const trazerDoBanco = () =>
    churchId &&
    importar.mutate(churchId, {
      onSuccess: (r) => {
        if (!r.importadas) {
          toast.info('Nada novo no extrato desde a última importação');
          return;
        }
        toast.success(
          `${r.importadas} ${
            r.importadas === 1
              ? 'lançamento importado'
              : 'lançamentos importados'
          } do banco`
        );
      },
    });

  return (
    <PageStyle>
      <Header
        title="Lançamentos"
        description="Entradas e saídas da igreja"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="o livro-caixa" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é o livro-caixa: cada igreja
          tem o seu.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem financeiro de nenhuma igreja. O financeiro é por
          igreja.
        </Alert>
      ) : (
        <>
          <StatusCards
            isLoading={!data}
            cards={[
              {
                title: 'Entradas',
                value: formatCurrency(resumo?.entradas),
                subtitle: 'No período',
                icon: <TrendingUp sx={{ fontSize: 20 }} />,
                color: verde,
                compact: true,
              },
              {
                title: 'Saídas',
                value: formatCurrency(resumo?.saidas),
                subtitle: 'No período',
                icon: <TrendingDown sx={{ fontSize: 20 }} />,
                color: vermelho,
                compact: true,
              },
              {
                title: 'Saldo',
                value: formatCurrency(resumo?.saldo),
                subtitle: 'Entradas menos saídas',
                icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
                color:
                  (resumo?.saldo ?? 0) < 0
                    ? vermelho
                    : theme.palette.chips.info,
                compact: true,
              },
              {
                title: 'Dízimos',
                value: formatCurrency(resumo?.dizimos),
                subtitle: 'No período',
                icon: <VolunteerActivism sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.alert,
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
                onChange={setIntervalo}
                semHora
                // só datas: "01/10/2026 – 11/10/2026" cabe em menos
                sx={{ width: 250 }}
              />
              <TextField
                select
                size="small"
                label="Tipo"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as TipoDeLancamento | '');
                  setCategoria('');
                }}
                sx={{ width: 120 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="INCOME">Entradas</MenuItem>
                <MenuItem value="EXPENSE">Saídas</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria | '')}
                sx={{ width: 160 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {categoriasDoFiltro.map((c) => (
                  <MenuItem key={c} value={c}>
                    {ROTULO_DA_CATEGORIA[c]}
                    {!tipo && (c === 'EVENT_INCOME' || c === 'EVENT_EXPENSE')
                      ? c === 'EVENT_INCOME'
                        ? ' (entrada)'
                        : ' (saída)'
                      : ''}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Origem"
                value={origem}
                onChange={(e) =>
                  setOrigem(e.target.value as OrigemDoLancamento | '')
                }
                sx={{ width: 130 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {(Object.keys(ROTULO_DA_ORIGEM) as OrigemDoLancamento[]).map(
                  (o) => (
                    <MenuItem key={o} value={o}>
                      {ROTULO_DA_ORIGEM[o]}
                    </MenuItem>
                  )
                )}
              </TextField>
              <TextField
                size="small"
                placeholder="Descrição, pagador ou dizimista"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                // a busca fica com o que sobrar: os botões cabem na mesma linha
                sx={{ flex: 1, minWidth: 160 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

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
                startIcon={<Add />}
                onClick={() => setCriando(true)}
                sx={{
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Novo lançamento
              </Button>
            </Stack>
          </Paper>

          {data?.cortado && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              O período tem lançamentos demais para mostrar de uma vez: a tabela
              traz os 5.000 mais recentes. Encurte o período para ver todos.
            </Alert>
          )}

          <ListaDeLancamentos
            lancamentos={data?.lancamentos ?? []}
            carregando={isFetching}
            onEditar={setEditando}
            onApagar={setApagando}
          />

          {churchId && (
            <ModalLancamento
              open={criando || !!editando}
              churchId={churchId}
              lancamento={editando}
              dizimistas={dizimistas?.dizimistas ?? []}
              onClose={() => {
                setCriando(false);
                setEditando(null);
              }}
            />
          )}

          <ConfirmModal
            open={!!apagando}
            onClose={() => setApagando(null)}
            title="Apagar lançamento?"
            message={`"${apagando?.description}", de ${formatCurrency(
              apagando?.amount
            )}, sai do livro-caixa. Não dá para desfazer.`}
            confirmLabel="Apagar"
            onConfirm={() => {
              if (churchId && apagando) {
                remover.mutate({ churchId, id: apagando.id });
              }
              setApagando(null);
            }}
          />
        </>
      )}
    </PageStyle>
  );
}

export { Lancamentos };
