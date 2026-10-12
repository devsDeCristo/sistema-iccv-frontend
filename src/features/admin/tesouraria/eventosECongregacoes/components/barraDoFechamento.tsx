import { ReactNode, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';

import { ConfirmModal } from '../../../../../components/ConfirmModal';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import { DetalheDaTesouraria } from '../modelo';
import { useFecharTesouraria } from '../api';

/** "2026-09-15" → "15/09/2026", sem passar por fuso */
const dataCurta = (dia: string) => dia.split('-').reverse().join('/');

interface Props {
  tesouraria: DetalheDaTesouraria;
  churchId: string;
  /** Os lançamentos do sistema ainda sem banco: a confirmação avisa deles */
  aConciliar?: { quantos: number; saldo: number };
  /** No evento, lembra que fechar não é o evento acabar */
  deEvento?: boolean;
  /** Outros botões da tesouraria, ao lado do fechar (os tesoureiros) */
  acoes?: ReactNode;
}

/**
 * Fechar a tesouraria (de evento ou de congregação) é dar as contas por
 * encerradas: nada mais entra, sai ou muda de categoria. Não é o fim do
 * evento — o fechamento vem bem depois, com o dinheiro todo assentado.
 * Fecham e reabrem o admin e a tesouraria da igreja (e o super admin); o
 * tesoureiro(a) do evento não.
 *
 * No evento, a confirmação avisa dos lançamentos do sistema que ainda não
 * apareceram no banco: fechar com eles pendentes é fechar sem saber se o
 * dinheiro entrou.
 */
function BarraDoFechamento({
  tesouraria,
  churchId,
  aConciliar,
  deEvento = false,
  acoes,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const fechar = useFecharTesouraria();
  // quem fecha (admin e tesouraria da igreja) a API diz
  const { podeFechar, fechamento } = tesouraria;
  const pendentes = deEvento ? (aConciliar?.quantos ?? 0) : 0;

  if (fechamento) {
    return (
      <Alert
        severity="info"
        icon={<LockOutlined />}
        sx={{ mb: 2, alignItems: 'center' }}
        action={
          <Stack direction="row" spacing={1}>
            {acoes}
            {podeFechar && (
              <Button
                color="inherit"
                size="small"
                startIcon={<LockOpenOutlined />}
                disabled={fechar.isLoading}
                onClick={() =>
                  fechar.mutate({ churchId, id: tesouraria.id, fechar: false })
                }
                sx={{ textTransform: 'none' }}
              >
                Reabrir
              </Button>
            )}
          </Stack>
        }
      >
        Tesouraria fechada em {dataCurta(fechamento.em)} por {fechamento.por}.
        Nada mais entra, sai ou muda de categoria
        {podeFechar ? '.' : '; só o admin ou a tesouraria da igreja reabre.'}
      </Alert>
    );
  }

  if (!podeFechar && !acoes) return null;

  return (
    <Paper
      sx={{ ...superficieSx, ...barraLarguraCheiaNoCelularSx, p: 2, mb: 2 }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flex: 1, minWidth: 220 }}
        >
          {podeFechar
            ? `Com o dinheiro todo assentado, feche a tesouraria: nada mais entra, sai ou muda de categoria.${
                deEvento ? ' Fechar não é o fim do evento — vem depois.' : ''
              }`
            : 'Fechar a tesouraria é do admin e da tesouraria da igreja.'}
        </Typography>
        {acoes}
        {podeFechar && (
          <Button
            variant="outlined"
            startIcon={<LockOutlined />}
            onClick={() => setConfirmando(true)}
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          >
            Fechar tesouraria
          </Button>
        )}
      </Stack>
      <ConfirmModal
        open={confirmando}
        onClose={() => setConfirmando(false)}
        title="Fechar a tesouraria?"
        alerta={
          pendentes > 0 &&
          `${
            pendentes === 1
              ? '1 lançamento do evento não foi conciliado'
              : `${pendentes} lançamentos do evento não foram conciliados`
          } com o banco (${formatCurrency(
            aConciliar?.saldo ?? 0
          )}): não apareceu no extrato um movimento para ${
            pendentes === 1 ? 'ele' : 'eles'
          }. Se for dinheiro que não passa pelo banco, marque como "não consta no banco" antes.`
        }
        message="Depois de fechada, nada mais entra, sai ou muda de categoria nela. Só o admin ou a tesouraria da igreja pode reabrir."
        confirmLabel={pendentes ? 'Fechar mesmo assim' : 'Fechar'}
        onConfirm={() => {
          fechar.mutate({ churchId, id: tesouraria.id, fechar: true });
          setConfirmando(false);
        }}
      />
    </Paper>
  );
}

export { BarraDoFechamento };
