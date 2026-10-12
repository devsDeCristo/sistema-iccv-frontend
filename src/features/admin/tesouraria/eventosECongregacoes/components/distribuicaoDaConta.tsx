import { ReactNode, useReducer, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  IconButton,
  ListSubheader,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  ArrowForward,
  CallSplit,
  CheckCircle,
  Event as EventIcon,
  HolidayVillage,
  Label,
  Undo,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { BarraDeSelecao } from '../../../../../components/barraDeSelecao';
import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { StatusCards } from '../../../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  cardTabelaSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import {
  aDistribuir,
  alocacoesDa,
  CATEGORIAS,
  classificar,
  conferirComPagamento,
  ContaDaTesouraria,
  devolver,
  distribuir,
  distribuirParte,
  LinhaDaqui,
  LinhaLivre,
  MovimentoDaConta,
  NOME_DA_CONTA,
  pagamentosDa,
  saldoDe,
  SEM_CATEGORIA,
} from '../dados';

/** "2026-10-05" → "05/10": o ano é o do período */
const diaEMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** No select, o pagamento das inscrições se distingue da categoria assim */
const PAGAMENTO = 'pagamento:';

/** As duas listas rolam por dentro: a página fica parada com os cards à vista */
const rolagem = {
  maxHeight: 'max(360px, calc(100vh - 380px))',
  overflowY: 'auto',
} as const;

/** O que muda entre a tesouraria de um evento e a de uma congregação */
const TEXTOS = {
  EVENTOS: {
    conta: 'Eventos',
    icone: EventIcon,
    neste: 'Neste evento',
    deste: 'deste evento',
    paraEste: 'para este evento',
    paraO: 'para o evento',
    sem: 'sem evento',
    nenhum: 'nenhum evento',
    algum: 'algum evento',
    mais: 'mais de um evento',
  },
  CONGREGACOES: {
    conta: 'Congregações',
    icone: HolidayVillage,
    neste: 'Nesta congregação',
    deste: 'desta congregação',
    paraEste: 'para esta congregação',
    paraO: 'para a congregação',
    sem: 'sem congregação',
    nenhum: 'nenhuma congregação',
    algum: 'alguma congregação',
    mais: 'mais de uma congregação',
  },
};

interface Props {
  conta: ContaDaTesouraria;
  tesourariaId: string;
  /** Tesouraria fechada: só leitura */
  fechada: boolean;
}

/**
 * A conciliação de uma tesouraria de evento ou de congregação: alocar o
 * extrato da conta. A conta é uma só para todos os eventos (e outra para
 * todas as congregações); o movimento que ainda não foi para nenhuma
 * tesouraria fica "a distribuir", e aqui a pessoa marca o que é desta e traz
 * para cá — inteiro, ou só uma parte quando o movimento é de mais de uma
 * (rateio). Depois dá a categoria. No evento, uma entrada pode ser conferida
 * com um pagamento das inscrições: o repasse do PagBank é o mesmo dinheiro, e
 * conferido não conta duas vezes. Não há lançamento manual para parear: o que
 * veio do banco já é o lançamento.
 */
function DistribuicaoDaConta({ conta, tesourariaId, fechada }: Props) {
  const theme = useTheme();
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [dividindo, setDividindo] = useState<LinhaLivre | null>(null);
  const [centavosDaParte, setCentavosDaParte] = useState(0);

  const t = TEXTOS[conta];
  const Icone = t.icone;
  const livres = aDistribuir(conta);
  const daqui = alocacoesDa(tesourariaId);
  const semCategoria = daqui.filter(({ alocacao }) => !alocacao.categoria);
  const pagamentos = conta === 'EVENTOS' ? pagamentosDa(tesourariaId) : [];

  const alternar = (id: string) =>
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );

  const trazer = () => {
    distribuir(marcados, tesourariaId);
    toast.success(
      marcados.length === 1
        ? `Movimento trazido ${t.paraO}`
        : `${marcados.length} movimentos trazidos ${t.paraO}`
    );
    setMarcados([]);
    redesenhar();
  };

  const abrirParte = (linha: LinhaLivre) => {
    setDividindo(linha);
    setCentavosDaParte(0);
  };

  const trazerParte = () => {
    if (!dividindo) return;
    distribuirParte(
      dividindo.movimento.id,
      tesourariaId,
      centavosDaParte / 100
    );
    toast.success(
      `${formatCurrency(centavosDaParte / 100)} trazidos ${t.paraO}`
    );
    setMarcados((atual) => atual.filter((id) => id !== dividindo.movimento.id));
    setDividindo(null);
    redesenhar();
  };

  const valor = (m: MovimentoDaConta, quanto: number, deQuanto?: string) => (
    <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
      <Typography
        fontSize={14}
        fontWeight={600}
        noWrap
        sx={{
          color:
            m.tipo === 'INCOME'
              ? theme.palette.chips.success
              : theme.palette.chips.canceled,
        }}
      >
        {m.tipo === 'INCOME' ? '+ ' : '− '}
        {formatCurrency(quanto)}
      </Typography>
      {/* o rateio: a parte não é o movimento inteiro */}
      {deQuanto && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {deQuanto}
        </Typography>
      )}
    </Box>
  );

  const data = (m: MovimentoDaConta) => (
    <Typography
      fontSize={13}
      color="text.secondary"
      sx={{ width: 40, flexShrink: 0 }}
    >
      {diaEMes(m.data)}
    </Typography>
  );

  const linhaSx = {
    minHeight: 60,
    px: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  const lista = (
    icone: ReactNode,
    titulo: string,
    quantos: number,
    vazio: string,
    linhas: ReactNode[]
  ) => (
    <Card elevation={0} sx={{ ...cardTabelaSx, flex: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          height: 44,
          borderBottom: `1px solid ${theme.palette.divider}`,
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
      <Box sx={rolagem}>
        {linhas.length ? (
          linhas
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 3, textAlign: 'center' }}
          >
            {vazio}
          </Typography>
        )}
      </Box>
    </Card>
  );

  // a linha inteira marca, não só a caixinha
  const linhaLivre = ({ movimento: m, restante }: LinhaLivre) => {
    const marcado = marcados.includes(m.id);
    return (
      <Stack
        key={m.id}
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={fechada ? undefined : () => alternar(m.id)}
        sx={{
          ...linhaSx,
          pl: fechada ? 1.5 : 1,
          cursor: fechada ? undefined : 'pointer',
          bgcolor: marcado ? alpha(theme.palette.primary.main, 0.08) : null,
          '&:hover': fechada
            ? undefined
            : { bgcolor: alpha(theme.palette.primary.main, 0.05) },
        }}
      >
        {!fechada && (
          <Checkbox
            size="small"
            checked={marcado}
            onChange={() => alternar(m.id)}
            // quem marca no clique é a linha: aqui o clique pararia nela de novo
            onClick={(e) => e.stopPropagation()}
            inputProps={{
              'aria-label': `Marcar ${m.descricao}${
                m.pagador ? ` — ${m.pagador}` : ''
              }`,
            }}
            sx={{ p: 0.5 }}
          />
        )}
        {data(m)}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontSize={14} noWrap title={m.descricao}>
            {m.descricao}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            component="div"
          >
            {m.pagador ?? (m.tipo === 'INCOME' ? 'Entrada' : 'Saída')}
          </Typography>
        </Box>
        {valor(
          m,
          restante,
          restante < m.valor ? `falta de ${formatCurrency(m.valor)}` : undefined
        )}
        {!fechada && (
          <Tooltip title="Trazer só uma parte (rateio)">
            <IconButton
              size="small"
              aria-label={`Trazer só uma parte de ${m.descricao}`}
              onClick={(e) => {
                e.stopPropagation();
                abrirParte({ movimento: m, restante });
              }}
            >
              <CallSplit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

  const seletor = ({ alocacao: a, movimento: m }: LinhaDaqui) => {
    const pagamento = pagamentos.find((p) => p.id === a.pagamentoId);
    // os pagamentos que ainda não foram conferidos, mais o desta linha
    const conferiveis =
      m.tipo === 'INCOME'
        ? pagamentos.filter((p) => !p.conferido || p.id === a.pagamentoId)
        : [];
    return (
      <TextField
        select
        variant="standard"
        disabled={fechada}
        value={
          a.pagamentoId ? `${PAGAMENTO}${a.pagamentoId}` : (a.categoria ?? '')
        }
        onChange={(e) => {
          const escolhido = e.target.value;
          if (escolhido.startsWith(PAGAMENTO)) {
            conferirComPagamento(a.id, escolhido.slice(PAGAMENTO.length));
          } else {
            classificar(a.id, escolhido);
          }
          redesenhar();
        }}
        inputProps={{ 'aria-label': `Categoria de ${m.descricao}` }}
        InputProps={{ disableUnderline: true }}
        SelectProps={{
          displayEmpty: true,
          renderValue: () =>
            pagamento
              ? `Conferido: ${pagamento.descricao}`
              : a.categoria || SEM_CATEGORIA,
        }}
        sx={{
          maxWidth: '100%',
          '& .MuiSelect-select': {
            fontSize: 12,
            py: 0,
            color: pagamento
              ? theme.palette.chips.info
              : a.categoria
                ? 'text.secondary'
                : theme.palette.chips.alert,
            fontWeight: a.categoria ? 400 : 600,
          },
        }}
      >
        {CATEGORIAS[conta][m.tipo].map((c) => (
          <MenuItem key={c} value={c} sx={{ fontSize: 14 }}>
            {c}
          </MenuItem>
        ))}
        {conferiveis.length > 0 && (
          <ListSubheader sx={{ lineHeight: '32px' }}>
            Conferir com pagamento das inscrições
          </ListSubheader>
        )}
        {conferiveis.map((p) => (
          <MenuItem
            key={p.id}
            value={`${PAGAMENTO}${p.id}`}
            sx={{ fontSize: 14 }}
          >
            {p.descricao} · {formatCurrency(p.valor)}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const linhaDaqui = (linha: LinhaDaqui) => {
    const { alocacao: a, movimento: m } = linha;
    return (
      <Stack
        key={a.id}
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ ...linhaSx, pl: 1.5 }}
      >
        {data(m)}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontSize={14} noWrap title={m.descricao}>
            {m.descricao}
            {m.pagador ? ` — ${m.pagador}` : ''}
          </Typography>
          {seletor(linha)}
        </Box>
        {valor(
          m,
          a.valor,
          a.valor < m.valor ? `parte de ${formatCurrency(m.valor)}` : undefined
        )}
        {!fechada && (
          <Tooltip title="Devolver para a distribuir">
            <IconButton
              size="small"
              aria-label={`Devolver ${m.descricao} para a distribuir`}
              onClick={() => {
                devolver(a.id);
                redesenhar();
              }}
            >
              <Undo fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

  const restanteDaParte = dividindo?.restante ?? 0;
  const parteValida =
    centavosDaParte > 0 && centavosDaParte / 100 < restanteDaParte;

  return (
    <>
      <StatusCards
        cards={[
          {
            title: t.neste,
            value: String(daqui.length),
            subtitle: `Saldo ${formatCurrency(
              saldoDe(
                daqui.map(({ alocacao, movimento }) => ({
                  tipo: movimento.tipo,
                  valor: alocacao.valor,
                }))
              )
            )}`,
            icon: <CheckCircle sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.success,
            compact: true,
          },
          {
            title: 'A distribuir',
            value: String(livres.length),
            subtitle: `Na conta, ${t.sem} · ${formatCurrency(
              saldoDe(
                livres.map(({ movimento, restante }) => ({
                  tipo: movimento.tipo,
                  valor: restante,
                }))
              )
            )}`,
            icon: <AccountBalance sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.alert,
            compact: true,
          },
          {
            title: 'Sem categoria',
            value: String(semCategoria.length),
            subtitle: `${t.neste}, falta classificar`,
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
          Conta da tesouraria de {t.conta}:{' '}
          <Box component="b" sx={{ color: 'text.primary' }}>
            {NOME_DA_CONTA[conta]}
          </Box>
          . O extrato chega pelo Pluggy, e o que ainda não foi para {t.nenhum}{' '}
          fica a distribuir: marque o que é {t.deste} e traga para cá. Movimento
          de {t.mais}? Traga só a parte {t.deste} (
          <CallSplit sx={{ fontSize: 14, verticalAlign: 'middle' }} />
          ); o resto continua a distribuir.
          {conta === 'EVENTOS' &&
            ' O repasse das inscrições (PagBank) se confere com o pagamento já registrado, no lugar da categoria: assim não conta duas vezes.'}
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        {lista(
          <AccountBalance sx={{ fontSize: 18, color: 'text.secondary' }} />,
          'A distribuir',
          livres.length,
          `Nada a distribuir: todo o extrato já está em ${t.algum}.`,
          livres.map(linhaLivre)
        )}
        {lista(
          <Icone sx={{ fontSize: 18, color: 'text.secondary' }} />,
          t.neste,
          daqui.length,
          `Nenhum movimento da conta ${t.neste.toLowerCase()} ainda.`,
          daqui.map(linhaDaqui)
        )}
      </Stack>

      {/* espaço da barra flutuante, para ela não cobrir as últimas linhas */}
      {!!marcados.length && <div style={{ height: 80 }} />}
      <BarraDeSelecao
        quantos={marcados.length}
        rotuloDaRegiao="Movimentos para trazer"
        onLimpar={() => setMarcados([])}
        acao={{
          rotulo: `Trazer ${t.paraEste}`,
          rotuloCurto: 'Trazer',
          icone: <ArrowForward />,
          onClick: trazer,
        }}
      />

      <ResponsiveModal
        open={!!dividindo}
        onClose={() => setDividindo(null)}
        maxWidth="xs"
        fullWidth
        title="Trazer só uma parte"
        actions={
          <>
            <Button onClick={() => setDividindo(null)} color="inherit">
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={trazerParte}
              disabled={!parteValida}
            >
              Trazer
            </Button>
          </>
        }
      >
        {dividindo && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              <b>{dividindo.movimento.descricao}</b> ·{' '}
              {diaEMes(dividindo.movimento.data)}. Falta distribuir{' '}
              {formatCurrency(restanteDaParte)}: traga a parte {t.deste}, e o
              resto continua a distribuir.
            </Typography>
            <TextField
              label="Valor desta parte"
              size="small"
              autoFocus
              value={formatCurrency(centavosDaParte / 100)}
              onChange={(e) =>
                setCentavosDaParte(
                  Number(e.target.value.replace(/\D/g, '').slice(0, 13)) || 0
                )
              }
              inputProps={{ inputMode: 'numeric' }}
              error={centavosDaParte / 100 >= restanteDaParte}
              helperText={
                centavosDaParte / 100 >= restanteDaParte
                  ? 'Para trazer tudo, marque a linha e use "Trazer"'
                  : `Menos que ${formatCurrency(restanteDaParte)}`
              }
            />
          </Stack>
        )}
      </ResponsiveModal>
    </>
  );
}

export { DistribuicaoDaConta };
