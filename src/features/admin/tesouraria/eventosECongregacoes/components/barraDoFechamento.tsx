import { ReactNode, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { ConfirmModal } from '../../../../../components/ConfirmModal';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../../components/listPageStyles';
import { getStoredUser } from '../../../../../auth/session';
import { Role } from '../../../../../constants/roles';
import { useRole } from '../../../../../hooks/useRole';
import { formatCurrency } from '../../../../../utils';
import {
  aConciliarDa,
  fechamentoDa,
  fecharTesouraria,
  reabrirTesouraria,
  saldoDe,
} from '../dados';

/** "2026-09-15" → "15/09/2026", sem passar por fuso */
const dataCurta = (dia: string) => dia.split('-').reverse().join('/');

interface Props {
  tesourariaId: string;
  /** A igreja da tela: o admin e a tesouraria dela fecham e reabrem */
  churchId: string | null;
  onMudou: () => void;
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
  tesourariaId,
  churchId,
  onMudou,
  deEvento = false,
  acoes,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const { isSuperAdmin, perfilNaIgreja } = useRole();
  const perfil = churchId ? perfilNaIgreja(churchId) : null;
  const podeFechar =
    isSuperAdmin || perfil === Role.ADMIN || perfil === Role.TESOURARIA;
  const fechamento = fechamentoDa(tesourariaId);
  const pendentes = deEvento ? aConciliarDa(tesourariaId) : [];

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
                onClick={() => {
                  reabrirTesouraria(tesourariaId);
                  toast.success('Tesouraria reaberta');
                  onMudou();
                }}
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
          pendentes.length > 0 &&
          `${
            pendentes.length === 1
              ? '1 lançamento do evento não foi conciliado'
              : `${pendentes.length} lançamentos do evento não foram conciliados`
          } com o banco (${formatCurrency(
            saldoDe(pendentes.map(({ lancamento }) => lancamento))
          )}): não apareceu no extrato um movimento para ${
            pendentes.length === 1 ? 'ele' : 'eles'
          }. Se for dinheiro que não passa pelo banco, marque como "não consta no banco" antes.`
        }
        message="Depois de fechada, nada mais entra, sai ou muda de categoria nela. Só o admin ou a tesouraria da igreja pode reabrir."
        confirmLabel={pendentes.length ? 'Fechar mesmo assim' : 'Fechar'}
        onConfirm={() => {
          fecharTesouraria(
            tesourariaId,
            getStoredUser()?.fullName ?? 'Admin da igreja'
          );
          setConfirmando(false);
          toast.success('Tesouraria fechada');
          onMudou();
        }}
      />
    </Paper>
  );
}

export { BarraDoFechamento };
