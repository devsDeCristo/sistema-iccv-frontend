import { ReactNode, useRef, useState } from 'react';
import {
  Box,
  Card,
  Checkbox,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  CompareArrows,
  EditNote,
  Link as LinkIcon,
  MoneyOff,
  Undo,
} from '@mui/icons-material';

import { cardTabelaSx } from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ROTULO_DA_CATEGORIA } from '../constants';
import { EstadoDaLinha, Lancamento, LinhaDaConciliacao } from '../types';

/** As duas tabelas só se alinham linha a linha com a mesma altura */
const ALTURA = 60;

/** O par que a pessoa está montando à mão: um de cada lado */
export interface ParMarcado {
  banco: Lancamento | null;
  manual: Lancamento | null;
}

interface Props {
  linhas: LinhaDaConciliacao[];
  marcado: ParMarcado;
  onMarcar: (lado: 'banco' | 'manual', lancamento: Lancamento) => void;
  onConciliar: (banco: Lancamento, manual: Lancamento) => void;
  onDesfazer: (manual: Lancamento) => void;
  /** Marca o manual como "não consta no banco", ou o devolve */
  onNaoConsta: (manual: Lancamento, naoConsta: boolean) => void;
  ocupado: boolean;
}

/** "2026-10-05" → "05/10": o ano é o do período */
const diaEMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/**
 * A conciliação como um diff do git: o extrato do banco à esquerda, os
 * lançamentos manuais à direita, cada par na mesma linha e as duas tabelas
 * rolando juntas. O lado que falta fica hachurado, como a linha que não
 * existe num diff.
 *
 * - conciliado: verde, com o desfazer na linha;
 * - sugerido: azul, com o conciliar na linha;
 * - só de um lado: laranja, com a caixinha para montar o par à mão (o
 *   clique na linha também marca); o manual sem par pode ser marcado como
 *   "não consta no banco" (dinheiro em espécie);
 * - não consta no banco: azul-claro, com o voltar para a conciliação.
 *
 * No celular não cabem duas tabelas: vira o diff unificado, o banco em cima
 * do manual em cada linha.
 */
function DiffDaConciliacao({
  linhas,
  marcado,
  onMarcar,
  onConciliar,
  onDesfazer,
  onNaoConsta,
  ocupado,
}: Props) {
  const theme = useTheme();
  const lado2lado = useMediaQuery(theme.breakpoints.up('md'));
  const esquerda = useRef<HTMLDivElement>(null);
  const direita = useRef<HTMLDivElement>(null);
  // a mesma linha acesa dos dois lados, para o olho atravessar
  const [emFoco, setEmFoco] = useState<number | null>(null);

  const cor: Record<EstadoDaLinha, string> = {
    conciliado: theme.palette.chips.success,
    sugerido: theme.palette.chips.info,
    so_banco: theme.palette.chips.alert,
    so_manual: theme.palette.chips.alert,
    nao_consta: theme.palette.chips.pending,
  };

  // as duas têm a mesma altura: igualar o scrollTop não volta a disparar
  const sincronizar = (de: typeof esquerda, para: typeof esquerda) => () => {
    if (de.current && para.current) {
      para.current.scrollTop = de.current.scrollTop;
    }
  };

  // só marca o lado que ainda não tem par, e do mesmo tipo do outro marcado
  const podeMarcar = (lado: 'banco' | 'manual', l: Lancamento) => {
    const outro = lado === 'banco' ? marcado.manual : marcado.banco;
    return !ocupado && (!outro || outro.type === l.type);
  };

  const caixinha = (lado: 'banco' | 'manual', l: Lancamento) => (
    <Checkbox
      size="small"
      checked={marcado[lado]?.id === l.id}
      disabled={!podeMarcar(lado, l)}
      onChange={() => onMarcar(lado, l)}
      // quem marca no clique é a linha: aqui o clique pararia nela de novo
      onClick={(e) => e.stopPropagation()}
      inputProps={{ 'aria-label': `Marcar ${l.description}` }}
      sx={{ p: 0.5 }}
    />
  );

  const marcador = (linha: LinhaDaConciliacao, lado: 'banco' | 'manual') => {
    const l = linha[lado];
    if (linha.estado === 'conciliado') {
      return <CheckCircle sx={{ fontSize: 18, color: cor.conciliado }} />;
    }
    if (linha.estado === 'sugerido') {
      return <LinkIcon sx={{ fontSize: 18, color: cor.sugerido }} />;
    }
    if (linha.estado === 'nao_consta' && l) {
      return <MoneyOff sx={{ fontSize: 18, color: cor.nao_consta }} />;
    }
    return l ? caixinha(lado, l) : null;
  };

  const acao = (linha: LinhaDaConciliacao): ReactNode => {
    const { banco, manual } = linha;
    if (linha.estado === 'sugerido' && banco && manual) {
      return (
        <Tooltip title="Conciliar este par">
          <span>
            <IconButton
              size="small"
              disabled={ocupado}
              onClick={() => onConciliar(banco, manual)}
              sx={{ color: cor.sugerido }}
            >
              <CompareArrows fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      );
    }
    if (
      (linha.estado === 'so_manual' || linha.estado === 'nao_consta') &&
      manual
    ) {
      const marcar = linha.estado === 'so_manual';
      return (
        <Tooltip
          title={
            marcar
              ? 'Não consta no banco (dinheiro em espécie)'
              : 'Voltar para a conciliação'
          }
        >
          <span>
            <IconButton
              size="small"
              disabled={ocupado}
              onClick={(e) => {
                // a linha sem par marca no clique: aqui o clique é do botão
                e.stopPropagation();
                onNaoConsta(manual, marcar);
              }}
            >
              {marcar ? (
                <MoneyOff fontSize="small" />
              ) : (
                <Undo fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      );
    }
    if (linha.estado === 'conciliado' && manual) {
      return (
        <Tooltip title="Desfazer a conciliação">
          <span>
            <IconButton
              size="small"
              disabled={ocupado}
              onClick={() => onDesfazer(manual)}
            >
              <Undo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      );
    }
    return null;
  };

  const celula = (
    linha: LinhaDaConciliacao,
    lado: 'banco' | 'manual',
    indice: number
  ) => {
    const l = linha[lado];
    const vazio = !l;
    // a linha sem par marca no clique em qualquer ponto, não só na caixinha
    const marcavel =
      !!l &&
      (linha.estado === 'so_banco' || linha.estado === 'so_manual') &&
      podeMarcar(lado, l);
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onMouseEnter={() => setEmFoco(indice)}
        onClick={marcavel && l ? () => onMarcar(lado, l) : undefined}
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
            : alpha(cor[linha.estado], emFoco === indice ? 0.16 : 0.07),
        }}
      >
        <Box sx={{ width: 28, display: 'grid', placeItems: 'center' }}>
          {marcador(linha, lado)}
        </Box>
        {l && (
          <>
            <Typography
              fontSize={13}
              color="text.secondary"
              sx={{ width: 40, flexShrink: 0 }}
            >
              {diaEMes(l.date)}
            </Typography>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontSize={14} noWrap title={l.description}>
                {l.description}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                component="div"
              >
                {[
                  linha.estado === 'nao_consta' && 'Não consta no banco',
                  ROTULO_DA_CATEGORIA[l.category],
                  l.user?.fullName ?? l.payerName,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Box>
            <Typography
              fontSize={14}
              fontWeight={600}
              noWrap
              sx={{
                flexShrink: 0,
                color:
                  l.type === 'INCOME'
                    ? theme.palette.chips.success
                    : theme.palette.chips.canceled,
              }}
            >
              {l.type === 'INCOME' ? '+ ' : '− '}
              {formatCurrency(l.amount)}
            </Typography>
          </>
        )}
        {/* a ação do par fica na linha, na ponta da direita */}
        {lado === 'manual' && (
          <Box
            sx={{
              width: 34,
              flexShrink: 0,
              ml: 'auto !important',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {acao(linha)}
          </Box>
        )}
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

  const quantosBanco = linhas.filter((l) => l.banco).length;
  const quantosManual = linhas.filter((l) => l.manual).length;
  const iconeBanco = (
    <AccountBalance sx={{ fontSize: 18, color: 'text.secondary' }} />
  );
  const iconeManual = (
    <EditNote sx={{ fontSize: 20, color: 'text.secondary' }} />
  );
  // a rolagem é das tabelas: a página fica parada com os filtros à vista
  const rolagem = {
    maxHeight: 'max(360px, calc(100vh - 380px))',
    overflowY: 'auto',
  } as const;

  if (!lado2lado) {
    return (
      <Card
        elevation={0}
        sx={cardTabelaSx}
        onMouseLeave={() => setEmFoco(null)}
      >
        {cabecalho(
          <CompareArrows sx={{ fontSize: 18, color: 'text.secondary' }} />,
          'Banco e manuais',
          linhas.length
        )}
        <Box sx={rolagem}>
          {linhas.map((linha, i) => (
            // um vão entre os pares: as duas linhas de cada um ficam juntas
            <Box
              key={`${linha.banco?.id}-${linha.manual?.id}`}
              sx={{
                borderBottom: `6px solid ${theme.palette.background.default}`,
              }}
            >
              {celula(linha, 'banco', i)}
              {celula(linha, 'manual', i)}
            </Box>
          ))}
        </Box>
      </Card>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} onMouseLeave={() => setEmFoco(null)}>
      <Card elevation={0} sx={{ ...cardTabelaSx, flex: 1, minWidth: 0 }}>
        {cabecalho(iconeBanco, 'Extrato do banco', quantosBanco)}
        <Box
          ref={esquerda}
          onScroll={sincronizar(esquerda, direita)}
          sx={rolagem}
        >
          {linhas.map((linha, i) => (
            <Box key={`${linha.banco?.id}-${linha.manual?.id}`}>
              {celula(linha, 'banco', i)}
            </Box>
          ))}
        </Box>
      </Card>
      <Card elevation={0} sx={{ ...cardTabelaSx, flex: 1, minWidth: 0 }}>
        {cabecalho(iconeManual, 'Lançamentos manuais', quantosManual)}
        <Box
          ref={direita}
          onScroll={sincronizar(direita, esquerda)}
          sx={rolagem}
        >
          {linhas.map((linha, i) => (
            <Box key={`${linha.banco?.id}-${linha.manual?.id}`}>
              {celula(linha, 'manual', i)}
            </Box>
          ))}
        </Box>
      </Card>
    </Stack>
  );
}

export { DiffDaConciliacao };
