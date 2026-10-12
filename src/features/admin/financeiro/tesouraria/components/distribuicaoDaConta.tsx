import { ReactNode, useReducer, useState } from 'react';
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
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  ArrowForward,
  CheckCircle,
  Event as EventIcon,
  HolidayVillage,
  Label,
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
  aDistribuir,
  CATEGORIAS,
  classificar,
  ContaDaTesouraria,
  devolver,
  distribuir,
  MovimentoDaConta,
  movimentosDa,
  NOME_DA_CONTA,
  saldoDe,
  SEM_CATEGORIA,
} from '../dados';

/** "2026-10-05" → "05/10": o ano é o do período */
const diaEMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

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
  },
};

interface Props {
  conta: ContaDaTesouraria;
  tesourariaId: string;
  /**
   * O que se sabe de um movimento a distribuir nesta tesouraria (o pagador é
   * membro dela, por exemplo): a dica vai na linha, e a categoria, se houver,
   * já entra ao trazer.
   */
  reconhecer?: (
    m: MovimentoDaConta
  ) => { dica: string; categoria: string | null } | null;
}

/**
 * A conciliação de uma tesouraria de evento ou de congregação: distribuir o
 * extrato da conta. A conta é uma só para todos os eventos (e outra para
 * todas as congregações); o movimento que ainda não foi para nenhum fica "a
 * distribuir", e aqui a pessoa marca o que é desta tesouraria e traz para cá
 * — depois dá a categoria. Não há lançamento manual para parear: o que veio
 * do banco já é o lançamento.
 */
function DistribuicaoDaConta({ conta, tesourariaId, reconhecer }: Props) {
  const theme = useTheme();
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);
  const [marcados, setMarcados] = useState<string[]>([]);

  const t = TEXTOS[conta];
  const Icone = t.icone;
  const livres = aDistribuir(conta);
  const daqui = movimentosDa(tesourariaId);
  const semCategoria = daqui.filter((m) => !m.categoria).length;

  const alternar = (id: string) =>
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );

  const trazer = () => {
    distribuir(
      marcados,
      tesourariaId,
      (m) => reconhecer?.(m)?.categoria ?? null
    );
    toast.success(
      marcados.length === 1
        ? `Movimento trazido ${t.paraO}`
        : `${marcados.length} movimentos trazidos ${t.paraO}`
    );
    setMarcados([]);
    redesenhar();
  };

  const valor = (m: MovimentoDaConta) => (
    <Typography
      fontSize={14}
      fontWeight={600}
      noWrap
      sx={{
        flexShrink: 0,
        color:
          m.tipo === 'INCOME'
            ? theme.palette.chips.success
            : theme.palette.chips.canceled,
      }}
    >
      {m.tipo === 'INCOME' ? '+ ' : '− '}
      {formatCurrency(m.valor)}
    </Typography>
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
    movimentos: MovimentoDaConta[],
    vazio: string,
    linha: (m: MovimentoDaConta) => ReactNode
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
          {movimentos.length}
        </Typography>
      </Stack>
      <Box sx={rolagem}>
        {movimentos.length ? (
          movimentos.map(linha)
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
  const linhaLivre = (m: MovimentoDaConta) => {
    const marcado = marcados.includes(m.id);
    const dica = reconhecer?.(m)?.dica;
    return (
      <Stack
        key={m.id}
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={() => alternar(m.id)}
        sx={{
          ...linhaSx,
          cursor: 'pointer',
          bgcolor: marcado ? alpha(theme.palette.primary.main, 0.08) : null,
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
        }}
      >
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
            {dica && (
              <Box
                component="span"
                sx={{ color: theme.palette.chips.info, fontWeight: 600 }}
              >
                {' · '}
                {dica}
              </Box>
            )}
          </Typography>
        </Box>
        {valor(m)}
      </Stack>
    );
  };

  const linhaDaqui = (m: MovimentoDaConta) => (
    <Stack
      key={m.id}
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
        <TextField
          select
          variant="standard"
          value={m.categoria ?? ''}
          onChange={(e) => {
            classificar(m.id, e.target.value);
            redesenhar();
          }}
          inputProps={{ 'aria-label': `Categoria de ${m.descricao}` }}
          InputProps={{ disableUnderline: true }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) => (v as string) || SEM_CATEGORIA,
          }}
          sx={{
            '& .MuiSelect-select': {
              fontSize: 12,
              py: 0,
              color: m.categoria ? 'text.secondary' : theme.palette.chips.alert,
              fontWeight: m.categoria ? 400 : 600,
            },
          }}
        >
          {CATEGORIAS[conta][m.tipo].map((c) => (
            <MenuItem key={c} value={c} sx={{ fontSize: 14 }}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {valor(m)}
      <Tooltip title="Devolver para a distribuir">
        <IconButton
          size="small"
          onClick={() => {
            devolver(m.id);
            redesenhar();
          }}
        >
          <Undo fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <>
      <StatusCards
        cards={[
          {
            title: t.neste,
            value: String(daqui.length),
            subtitle: `Saldo ${formatCurrency(saldoDe(daqui))}`,
            icon: <CheckCircle sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.success,
            compact: true,
          },
          {
            title: 'A distribuir',
            value: String(livres.length),
            subtitle: `Na conta, ${t.sem} · ${formatCurrency(saldoDe(livres))}`,
            icon: <AccountBalance sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.alert,
            compact: true,
          },
          {
            title: 'Sem categoria',
            value: String(semCategoria),
            subtitle: `${t.neste}, falta classificar`,
            icon: <Label sx={{ fontSize: 20 }} />,
            color: semCategoria
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
          fica a distribuir: marque o que é {t.deste} e traga para cá.
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        {lista(
          <AccountBalance sx={{ fontSize: 18, color: 'text.secondary' }} />,
          'A distribuir',
          livres,
          `Nada a distribuir: todo o extrato já está em ${t.algum}.`,
          linhaLivre
        )}
        {lista(
          <Icone sx={{ fontSize: 18, color: 'text.secondary' }} />,
          t.neste,
          daqui,
          `Nenhum movimento da conta ${t.neste.toLowerCase()} ainda.`,
          linhaDaqui
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
    </>
  );
}

export { DistribuicaoDaConta };
