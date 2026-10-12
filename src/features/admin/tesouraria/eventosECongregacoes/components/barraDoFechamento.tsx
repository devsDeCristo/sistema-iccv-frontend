import { useState } from 'react';
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
import { fechamentoDa, fecharTesouraria, reabrirTesouraria } from '../dados';

/** "2026-09-15" → "15/09/2026", sem passar por fuso */
const dataCurta = (dia: string) => dia.split('-').reverse().join('/');

interface Props {
  tesourariaId: string;
  /** A igreja da tela: só o admin dela (ou o super admin) fecha e reabre */
  churchId: string | null;
  onMudou: () => void;
  /** No evento, lembra que fechar não é o evento acabar */
  deEvento?: boolean;
}

/**
 * Fechar a tesouraria (de evento ou de congregação) é dar as contas por
 * encerradas: nada mais entra, sai ou muda de categoria. Não é o fim do
 * evento — o fechamento vem bem depois, com o dinheiro todo assentado. Só o
 * admin da igreja fecha, e só ele reabre.
 */
function BarraDoFechamento({
  tesourariaId,
  churchId,
  onMudou,
  deEvento = false,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const { isSuperAdmin, perfilNaIgreja } = useRole();
  const podeFechar =
    isSuperAdmin || (!!churchId && perfilNaIgreja(churchId) === Role.ADMIN);
  const fechamento = fechamentoDa(tesourariaId);

  if (fechamento) {
    return (
      <Alert
        severity="info"
        icon={<LockOutlined />}
        sx={{ mb: 2 }}
        action={
          podeFechar && (
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
          )
        }
      >
        Tesouraria fechada em {dataCurta(fechamento.em)} por {fechamento.por}.
        Nada mais entra, sai ou muda de categoria
        {podeFechar ? '.' : '; só o admin da igreja reabre.'}
      </Alert>
    );
  }

  if (!podeFechar) return null;

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
          Com o dinheiro todo assentado, feche a tesouraria: nada mais entra,
          sai ou muda de categoria.
          {deEvento && ' Fechar não é o fim do evento — vem depois.'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LockOutlined />}
          onClick={() => setConfirmando(true)}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Fechar tesouraria
        </Button>
      </Stack>
      <ConfirmModal
        open={confirmando}
        onClose={() => setConfirmando(false)}
        title="Fechar a tesouraria?"
        message="Depois de fechada, nada mais entra, sai ou muda de categoria nela. Só o admin da igreja pode reabrir."
        confirmLabel="Fechar"
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
