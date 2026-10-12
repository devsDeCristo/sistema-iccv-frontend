import { ReactNode } from 'react';
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  /** Rótulos para quando "Confirmar" e "Cancelar" não dizem o que acontece */
  confirmLabel?: string;
  cancelLabel?: string;
  /** O que a pessoa precisa saber antes de confirmar, em destaque */
  alerta?: ReactNode;
};

function ConfirmModal({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  alerta,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {alerta && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {alerta}
          </Alert>
        )}
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { ConfirmModal };
