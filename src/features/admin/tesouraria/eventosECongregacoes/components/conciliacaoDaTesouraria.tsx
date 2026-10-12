import { ReactNode, useRef, useState } from 'react';
import {
  alpha,
  Box,
  Card,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  ArrowForward,
  CallSplit,
  CheckCircle,
  CompareArrows,
  Label,
  LinkOff,
  MoneyOff,
  PendingActions,
  ReceiptLong,
  Undo,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { BarraDeSelecao } from '../../../../../components/barraDeSelecao';
import { StatusCards } from '../../../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  cardTabelaSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import {
  CATEGORIAS,
  EstadoDaLinha,
  LinhaDaConciliacao,
  LinhaLivre,
  nomeDosBancos,
  ROTULO_DA_ORIGEM,
  saldoDe,
  SEM_CATEGORIA,
  TipoDaTesouraria,
  TipoDoLancamento,
} from '../modelo';
import {
  useClassificar,
  useConciliacaoDaTesouraria,
  useConciliarNaTesouraria,
  useDesfazerNaTesouraria,
  useDevolver,
  useDistribuir,
  useNaoConsta,
} from '../api';
import { ModalRateio } from './modalRateio';

/** "2026-10-05" → "05/10": o ano é o do período */
const diaEMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** As duas tabelas só se alinham linha a linha com a mesma altura */
const ALTURA = 60;

/** A rolagem é das tabelas: a página fica parada com os cards à vista */
const rolagem = {
  maxHeight: 'max(360px, calc(100vh - 380px))',
  overflowY: 'auto',
} as const;

/** O que muda entre a tesouraria de um evento e a de uma congregação */
const TEXTOS: Record<
  TipoDaTesouraria,
  Record<'lancamentos' | 'so' | 'paraEste' | 'paraO' | 'mais', string>
> = {
  EVENT: {
    lancamentos: 'Lançamentos do evento',
    so: 'Só no evento',
    paraEste: 'para este evento',
    paraO: 'para o evento',
    mais: 'mais de um evento',
  },
  CONGREGATION: {
    lancamentos: 'Lançamentos da congregação',
    so: 'Só na congregação',
    paraEste: 'para esta congregação',
    paraO: 'para a congregação',
    mais: 'mais de uma congregação',
  },
};

interface Props {
  tipo: TipoDaTesouraria;
  churchId: string;
  tesourariaId: string;
  /** Tesouraria fechada: só leitura */
  fechada: boolean;
}

/**
 * A conciliação de uma tesouraria de evento ou de congregação, no desenho da
 * Administrativa: um diff, com o que veio do banco (o Pluggy) à esquerda e os
 * lançamentos da tesouraria à direita, cada par na mesma linha e as duas
 * tabelas rolando juntas. O lado que falta fica hachurado.
 *
 * - Só no banco: o movimento da conta que não foi para tesouraria nenhuma.
 *   Marcado, ele vem **para cá** ("Trazer", inteiro, ou "Ratear e trazer",
 *   só uma parte) — e vira, ele mesmo, um lançamento daqui, na mesma linha.
 * - Só no evento: o pagamento das inscrições e dos produtos, ou o lançamento
 *   manual, que ainda não achou o banco. Marcado junto com um movimento do
 *   banco, concilia.
 * - Sugerido: o movimento e o lançamento de mesmo valor e data próxima, na
 *   mesma linha, com o conciliar na ponta (a regra da Administrativa).
 * - Não consta no banco: o que nunca vai passar por ele (dinheiro em espécie).
 *
 * A congregação não tem pagamentos nem manuais: o lado direito é só o que
 * veio do banco.
 */
function ConciliacaoDaTesouraria({
  tipo,
  churchId,
  tesourariaId,
  fechada,
}: Props) {
  const theme = useTheme();
  const lado2lado = useMediaQuery(theme.breakpoints.up('md'));
  const esquerda = useRef<HTMLDivElement>(null);
  const direita = useRef<HTMLDivElement>(null);
  // a mesma linha acesa dos dois lados, para o olho atravessar
  const [emFoco, setEmFoco] = useState<string | null>(null);
  const [bancoMarcados, setBancoMarcados] = useState<string[]>([]);
  const [daquiMarcados, setDaquiMarcados] = useState<string[]>([]);
  const [rateando, setRateando] = useState<LinhaLivre[]>([]);

  const t = TEXTOS[tipo];
  const comSistema = tipo === 'EVENT';
  const { data: conciliacao } = useConciliacaoDaTesouraria(
    churchId,
    tesourariaId
  );
  const linhas = conciliacao?.linhas ?? [];
  const daTesouraria = { churchId, id: tesourariaId };
  const distribuir = useDistribuir();
  const devolver = useDevolver();
  const classificar = useClassificar();
  const conciliar = useConciliarNaTesouraria();
  const desfazer = useDesfazerNaTesouraria();
  const marcarNaoConsta = useNaoConsta();
  const ocupado = [
    distribuir,
    devolver,
    classificar,
    conciliar,
    desfazer,
    marcarNaoConsta,
  ].some((m) => m.isLoading);
  const doEstado = (estado: EstadoDaLinha) =>
    linhas.filter((l) => l.estado === estado);
  const soBanco = doEstado('so_banco');
  const soDaqui = doEstado('so_evento');
  const semCategoria = linhas.filter(
    (l) => l.tesouraria?.de === 'extrato' && !l.tesouraria.alocacao.categoria
  );

  const cor: Record<EstadoDaLinha, string> = {
    sugerido: theme.palette.chips.info,
    conciliado: theme.palette.chips.success,
    so_banco: theme.palette.chips.alert,
    so_evento: theme.palette.chips.alert,
    nao_consta: theme.palette.chips.pending,
  };

  const limpar = () => {
    setBancoMarcados([]);
    setDaquiMarcados([]);
  };
  const mudou = limpar;
  const alternar = (setter: typeof setBancoMarcados) => (id: string) =>
    setter((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );

  // as duas têm a mesma altura: igualar o scrollTop não volta a disparar
  const sincronizar = (de: typeof esquerda, para: typeof esquerda) => () => {
    if (de.current && para.current) {
      para.current.scrollTop = de.current.scrollTop;
    }
  };

  const trazer = () =>
    distribuir.mutate(
      {
        ...daTesouraria,
        partes: bancoMarcados.map((movimentoId) => ({ movimentoId })),
      },
      {
        onSuccess: () => {
          toast.success(
            bancoMarcados.length === 1
              ? `Movimento trazido ${t.paraO}`
              : `${bancoMarcados.length} movimentos trazidos ${t.paraO}`
          );
          mudou();
        },
      }
    );

  const ratear = (partes: { movimentoId: string; valor: number }[]) =>
    distribuir.mutate(
      { ...daTesouraria, partes },
      {
        onSuccess: () => {
          toast.success(
            `${formatCurrency(
              partes.reduce((s, p) => s + p.valor, 0)
            )} trazidos ${t.paraO}`
          );
          setRateando([]);
          mudou();
        },
      }
    );

  const conciliarCom = (movimentoId: string, lancamentoIds: string[]) =>
    conciliar.mutate(
      { ...daTesouraria, movimentoId, lancamentoIds },
      { onSuccess: mudou }
    );

  const conciliarMarcados = () => {
    if (bancoMarcados.length !== 1) {
      toast.error('Marque um movimento do banco só');
      return;
    }
    conciliarCom(bancoMarcados[0], daquiMarcados);
  };

  /** O id do lançamento do sistema de uma linha (o da sugestão também) */
  const idDaqui = (l: LinhaDaConciliacao) =>
    l.tesouraria?.de === 'sistema' ? l.tesouraria.lancamento.id : l.chave;

  const todosNaoConstam = daquiMarcados.every((id) =>
    linhas.some((l) => idDaqui(l) === id && l.estado === 'nao_consta')
  );
  const naoConsta = () =>
    marcarNaoConsta.mutate(
      {
        ...daTesouraria,
        lancamentoIds: daquiMarcados,
        naoConsta: !todosNaoConstam,
      },
      {
        onSuccess: () => {
          toast.success(
            todosNaoConstam
              ? 'De volta para a conciliação'
              : 'Marcado como não consta no banco'
          );
          mudou();
        },
      }
    );

  // o que a barra oferece depende do que está marcado
  const acoes = (() => {
    if (daquiMarcados.length && bancoMarcados.length) {
      return {
        acao: {
          rotulo: 'Conciliar',
          rotuloCurto: 'Conciliar',
          icone: <CompareArrows />,
          onClick: conciliarMarcados,
        },
      };
    }
    if (daquiMarcados.length) {
      return {
        acao: todosNaoConstam
          ? {
              rotulo: 'Voltar para a conciliação',
              rotuloCurto: 'Voltar',
              icone: <Undo />,
              onClick: naoConsta,
            }
          : {
              rotulo: 'Não consta no banco',
              rotuloCurto: 'Não consta',
              icone: <MoneyOff />,
              onClick: naoConsta,
            },
      };
    }
    if (bancoMarcados.length) {
      return {
        acaoSecundaria: {
          rotulo: 'Ratear e trazer',
          rotuloCurto: 'Ratear',
          icone: <CallSplit />,
          onClick: () =>
            setRateando(
              linhas
                .filter(
                  (l) =>
                    !!l.banco &&
                    (l.estado === 'so_banco' || l.estado === 'sugerido') &&
                    bancoMarcados.includes(l.banco.movimento.id)
                )
                .map((l): LinhaLivre => ({
                  movimento: l.banco!.movimento,
                  restante: l.banco!.valor,
                }))
            ),
        },
        acao: {
          rotulo: `Trazer ${t.paraEste}`,
          rotuloCurto: 'Trazer',
          icone: <ArrowForward />,
          onClick: trazer,
        },
      };
    }
    return {};
  })();

  const valor = (tipo: TipoDoLancamento, quanto: number, nota?: string) => (
    <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
      <Typography
        fontSize={14}
        fontWeight={600}
        noWrap
        sx={{
          color:
            tipo === 'INCOME'
              ? theme.palette.chips.success
              : theme.palette.chips.canceled,
        }}
      >
        {tipo === 'INCOME' ? '+ ' : '− '}
        {formatCurrency(quanto)}
      </Typography>
      {/* o rateio: a parte não é o movimento inteiro */}
      {nota && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {nota}
        </Typography>
      )}
    </Box>
  );

  const texto = (titulo: string, legenda: ReactNode) => (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography fontSize={14} noWrap title={titulo}>
        {titulo}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        component="div"
      >
        {legenda}
      </Typography>
    </Box>
  );

  const data = (dia: string) => (
    <Typography
      fontSize={13}
      color="text.secondary"
      sx={{ width: 40, flexShrink: 0 }}
    >
      {diaEMes(dia)}
    </Typography>
  );

  const tipoDaTesouraria = tipo;
  const seletor = (
    alocacao: { id: string; categoria: string | null },
    tipo: TipoDoLancamento,
    descricao: string
  ) => (
    <TextField
      select
      variant="standard"
      disabled={fechada || ocupado}
      value={alocacao.categoria ?? ''}
      onChange={(e) =>
        classificar.mutate({
          ...daTesouraria,
          alocacaoId: alocacao.id,
          categoria: e.target.value || null,
        })
      }
      inputProps={{ 'aria-label': `Categoria de ${descricao}` }}
      InputProps={{ disableUnderline: true }}
      SelectProps={{
        displayEmpty: true,
        renderValue: () => alocacao.categoria || SEM_CATEGORIA,
      }}
      sx={{
        maxWidth: '100%',
        '& .MuiSelect-select': {
          fontSize: 12,
          py: 0,
          color: alocacao.categoria
            ? 'text.secondary'
            : theme.palette.chips.alert,
          fontWeight: alocacao.categoria ? 400 : 600,
        },
      }}
    >
      {CATEGORIAS[tipoDaTesouraria][tipo].map((c) => (
        <MenuItem key={c} value={c} sx={{ fontSize: 14 }}>
          {c}
        </MenuItem>
      ))}
    </TextField>
  );

  const botao = (titulo: string, icone: ReactNode, onClick: () => void) => (
    <Tooltip title={titulo}>
      <IconButton
        size="small"
        aria-label={titulo}
        disabled={ocupado}
        onClick={onClick}
      >
        {icone}
      </IconButton>
    </Tooltip>
  );

  /** O lado esquerdo: o movimento do banco */
  const conteudoDoBanco = (linha: LinhaDaConciliacao) => {
    const b = linha.banco;
    if (!b) return null;
    const m = b.movimento;
    if (linha.continua) {
      // o mesmo movimento da linha de cima: só a cor liga as duas
      return (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 6 }}>
          ↳ o mesmo movimento
        </Typography>
      );
    }
    return (
      <>
        {data(m.data)}
        {texto(
          m.descricao,
          `${m.banco} · ${
            m.pagador ?? (m.tipo === 'INCOME' ? 'Entrada' : 'Saída')
          }`
        )}
        {valor(
          m.tipo,
          b.valor,
          b.valor < m.valor
            ? `${linha.estado === 'so_banco' ? 'falta' : 'parte'} de ${formatCurrency(m.valor)}`
            : undefined
        )}
      </>
    );
  };

  /** O lado direito: o lançamento da tesouraria */
  const conteudoDaTesouraria = (linha: LinhaDaConciliacao) => {
    const d = linha.tesouraria;
    if (!d) return null;
    if (d.de === 'extrato') {
      const m = linha.banco!.movimento;
      const descricao = m.pagador
        ? `${m.descricao} — ${m.pagador}`
        : m.descricao;
      return (
        <>
          {data(m.data)}
          {texto(
            descricao,
            <Stack direction="row" spacing={0.5} alignItems="center">
              <span>{ROTULO_DA_ORIGEM.BANCO} ·</span>
              {seletor(d.alocacao, m.tipo, m.descricao)}
            </Stack>
          )}
          {valor(m.tipo, d.alocacao.valor)}
          {!fechada &&
            botao(
              `Devolver ${m.descricao} para o banco`,
              <Undo fontSize="small" />,
              () =>
                devolver.mutate(
                  { ...daTesouraria, alocacaoId: d.alocacao.id },
                  { onSuccess: mudou }
                )
            )}
        </>
      );
    }
    const l = d.lancamento;
    const situacao =
      linha.estado === 'sugerido'
        ? 'Sugerido: mesmo valor no banco'
        : d.situacao === 'CONCILIADO'
          ? d.automatica
            ? 'Conciliado pelo código'
            : 'Conciliado'
          : d.situacao === 'NAO_CONSTA'
            ? 'Não consta no banco'
            : l.codigo
              ? 'Aguardando o banco'
              : 'A conciliar';
    return (
      <>
        {data(l.data)}
        {texto(
          l.descricao,
          `${ROTULO_DA_ORIGEM[l.origem]}${l.forma ? ` · ${l.forma}` : ''} · ${situacao}`
        )}
        {valor(l.tipo, l.valor)}
        {/* a sugestão concilia na própria linha */}
        {!fechada &&
          linha.estado === 'sugerido' &&
          linha.banco &&
          botao(
            `Conciliar ${l.descricao} com o banco`,
            <CompareArrows fontSize="small" />,
            () => conciliarCom(linha.banco!.movimento.id, [l.id])
          )}
        {!fechada &&
          d.situacao === 'CONCILIADO' &&
          // a linha de cima já tem o desfazer do movimento
          !linha.continua &&
          botao(
            `Desfazer a conciliação de ${l.descricao}`,
            <LinkOff fontSize="small" />,
            () =>
              linha.banco &&
              desfazer.mutate(
                { ...daTesouraria, movimentoId: linha.banco.movimento.id },
                { onSuccess: mudou }
              )
          )}
      </>
    );
  };

  const celula = (linha: LinhaDaConciliacao, lado: 'banco' | 'tesouraria') => {
    const ehBanco = lado === 'banco';
    const vazio = ehBanco ? !linha.banco : !linha.tesouraria;
    const id = ehBanco ? linha.banco?.movimento.id : idDaqui(linha);
    const marcados = ehBanco ? bancoMarcados : daquiMarcados;
    // marca-se o que ainda não tem par; o clique na linha também marca
    const marcavel =
      !fechada &&
      !vazio &&
      (ehBanco
        ? linha.estado === 'so_banco' || linha.estado === 'sugerido'
        : linha.estado === 'so_evento' ||
          linha.estado === 'nao_consta' ||
          linha.estado === 'sugerido');
    const marcado = !!id && marcados.includes(id);
    const marcar = () =>
      id && alternar(ehBanco ? setBancoMarcados : setDaquiMarcados)(id);

    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onMouseEnter={() => setEmFoco(linha.chave)}
        onClick={marcavel ? marcar : undefined}
        sx={{
          cursor: marcavel ? 'pointer' : undefined,
          height: ALTURA,
          px: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderLeft: `3px solid ${vazio ? 'transparent' : cor[linha.estado]}`,
          // a linha que não existe deste lado, como no diff
          background: vazio
            ? `repeating-linear-gradient(135deg, ${alpha(
                theme.palette.text.primary,
                0.05
              )} 0 6px, transparent 6px 12px)`
            : marcado
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(cor[linha.estado], emFoco === linha.chave ? 0.16 : 0.07),
        }}
      >
        <Box
          sx={{
            width: 28,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {marcavel ? (
            <Checkbox
              size="small"
              checked={marcado}
              onChange={marcar}
              // quem marca no clique é a linha: aqui o clique pararia nela de novo
              onClick={(e) => e.stopPropagation()}
              inputProps={{
                'aria-label': `Marcar ${
                  ehBanco
                    ? linha.banco?.movimento.descricao
                    : linha.tesouraria?.de === 'sistema'
                      ? linha.tesouraria.lancamento.descricao
                      : ''
                }`,
              }}
              sx={{ p: 0.5 }}
            />
          ) : (
            !vazio &&
            !linha.continua &&
            (linha.estado === 'conciliado' ? (
              <CheckCircle sx={{ fontSize: 18, color: cor.conciliado }} />
            ) : linha.estado === 'nao_consta' ? (
              <MoneyOff sx={{ fontSize: 18, color: cor.nao_consta }} />
            ) : null)
          )}
        </Box>
        {ehBanco ? conteudoDoBanco(linha) : conteudoDaTesouraria(linha)}
      </Stack>
    );
  };

  const cabecalho = (icone: ReactNode, titulo: string, quantos: number) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2,
        height: 44,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      {icone}
      <Typography fontSize={14} fontWeight={700} sx={{ flex: 1 }}>
        {titulo}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {quantos}
      </Typography>
    </Stack>
  );

  const iconeBanco = (
    <AccountBalance sx={{ fontSize: 18, color: 'text.secondary' }} />
  );
  const iconeDaqui = (
    <ReceiptLong sx={{ fontSize: 18, color: 'text.secondary' }} />
  );
  const quantosBanco = linhas.filter((l) => l.banco && !l.continua).length;
  const quantosDaqui = linhas.filter((l) => l.tesouraria).length;
  const vazia = (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ p: 3, textAlign: 'center' }}
    >
      Nada na conta nem {t.paraEste} ainda.
    </Typography>
  );

  const quanto = (doEstado: LinhaDaConciliacao[]) =>
    formatCurrency(
      saldoDe(
        doEstado.map((l) =>
          l.banco
            ? { tipo: l.banco.movimento.tipo, valor: l.banco.valor }
            : l.tesouraria?.de === 'sistema'
              ? l.tesouraria.lancamento
              : { tipo: 'INCOME' as const, valor: 0 }
        )
      )
    );

  return (
    <>
      <StatusCards
        cards={[
          {
            title: 'Conciliados',
            value: String(doEstado('conciliado').length),
            subtitle: 'Banco e lançamento ligados',
            icon: <CheckCircle sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.success,
            compact: true,
          },
          {
            title: 'Só no banco',
            value: String(soBanco.length),
            subtitle: `Saldo ${quanto(soBanco)}`,
            icon: <AccountBalance sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.alert,
            compact: true,
          },
          ...(comSistema
            ? [
                {
                  title: t.so,
                  value: String(soDaqui.length),
                  subtitle: `Saldo ${quanto(soDaqui)}`,
                  icon: <PendingActions sx={{ fontSize: 20 }} />,
                  color: soDaqui.length
                    ? theme.palette.chips.alert
                    : theme.palette.chips.info,
                  compact: true,
                },
                {
                  title: 'Não consta no banco',
                  value: String(doEstado('nao_consta').length),
                  subtitle: 'Dinheiro em espécie',
                  icon: <MoneyOff sx={{ fontSize: 20 }} />,
                  color: theme.palette.chips.pending,
                  compact: true,
                },
              ]
            : []),
          {
            title: 'Sem categoria',
            value: String(semCategoria.length),
            subtitle: 'Do banco, falta classificar',
            icon: <Label sx={{ fontSize: 20 }} />,
            color: semCategoria.length
              ? theme.palette.chips.alert
              : theme.palette.chips.info,
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
        <Typography variant="body2" color="text.secondary">
          À esquerda, o que veio de{' '}
          <Box component="b" sx={{ color: 'text.primary' }}>
            {nomeDosBancos(conciliacao?.bancos ?? [])}
          </Box>{' '}
          pelo Pluggy; à direita, os {t.lancamentos.toLowerCase()}. O movimento
          que é daqui e não tem par: marque e traga — inteiro, ou só uma parte
          quando é de {t.mais} (<b>Ratear e trazer</b>).
          {comSistema &&
            ' Pagamento e lançamento com o mesmo valor de um movimento, em data próxima, vêm sugeridos (em azul): confira e concilie na linha. Os outros, marque junto com o movimento do banco que é o mesmo dinheiro. O que nunca passa pelo banco, marque como "não consta no banco".'}
        </Typography>
      </Paper>

      {!lado2lado ? (
        // no celular não cabem duas tabelas: o banco em cima do lançamento
        <Card
          elevation={0}
          sx={cardTabelaSx}
          onMouseLeave={() => setEmFoco(null)}
        >
          {cabecalho(
            <CompareArrows sx={{ fontSize: 18, color: 'text.secondary' }} />,
            `Banco e ${t.lancamentos.toLowerCase()}`,
            linhas.length
          )}
          <Box sx={rolagem}>
            {linhas.length
              ? linhas.map((linha) => (
                  // um vão entre os pares: as duas linhas de cada um juntas
                  <Box
                    key={linha.chave}
                    sx={{
                      borderBottom: `6px solid ${theme.palette.background.default}`,
                    }}
                  >
                    {celula(linha, 'banco')}
                    {celula(linha, 'tesouraria')}
                  </Box>
                ))
              : vazia}
          </Box>
        </Card>
      ) : (
        <Stack
          direction="row"
          spacing={1.5}
          onMouseLeave={() => setEmFoco(null)}
        >
          <Card elevation={0} sx={{ ...cardTabelaSx, flex: 1, minWidth: 0 }}>
            {cabecalho(iconeBanco, 'Extrato do banco', quantosBanco)}
            <Box
              ref={esquerda}
              onScroll={sincronizar(esquerda, direita)}
              sx={rolagem}
            >
              {linhas.length
                ? linhas.map((linha) => (
                    <Box key={linha.chave}>{celula(linha, 'banco')}</Box>
                  ))
                : vazia}
            </Box>
          </Card>
          <Card elevation={0} sx={{ ...cardTabelaSx, flex: 1, minWidth: 0 }}>
            {cabecalho(iconeDaqui, t.lancamentos, quantosDaqui)}
            <Box
              ref={direita}
              onScroll={sincronizar(direita, esquerda)}
              sx={rolagem}
            >
              {linhas.length
                ? linhas.map((linha) => (
                    <Box key={linha.chave}>{celula(linha, 'tesouraria')}</Box>
                  ))
                : vazia}
            </Box>
          </Card>
        </Stack>
      )}

      {/* espaço da barra flutuante, para ela não cobrir as últimas linhas */}
      {!!(bancoMarcados.length + daquiMarcados.length) && (
        <div style={{ height: 80 }} />
      )}
      <BarraDeSelecao
        quantos={bancoMarcados.length + daquiMarcados.length}
        rotuloDaRegiao="Lançamentos marcados"
        onLimpar={limpar}
        {...acoes}
      />

      <ModalRateio
        linhas={rateando}
        paraEste={t.paraEste}
        onClose={() => setRateando([])}
        onTrazer={ratear}
      />
    </>
  );
}

export { ConciliacaoDaTesouraria };
