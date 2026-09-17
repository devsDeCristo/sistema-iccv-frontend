import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';
import { User } from '../../../../types/user';
import { usePutGuardianApproval } from '../api/putGuardianApproval';
import { extensionFromDataUri, triggerDownload } from '../../../../utils';

interface ModalGuardianApprovalProps {
  open: boolean;
  user: User | null;
  eventId: string;
  onClose: () => void;
}

/**
 * O admin só aprova depois de abrir o termo assinado — por isso o link fica
 * em destaque e "Aprovar" some sem `signedTermUrl`, em vez de só desabilitar.
 */
function ModalGuardianApproval({
  open,
  user,
  eventId,
  onClose,
}: ModalGuardianApprovalProps) {
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setShowReasonField(false);
    }
  }, [open, user?.id]);

  const { mutate, isLoading } = usePutGuardianApproval({
    onSuccess: onClose,
  });

  if (!user) return null;

  const handleApprove = () => {
    mutate({ eventId, userId: user.id, status: 'APPROVED' });
  };

  const handleReject = () => {
    if (!showReasonField) {
      setShowReasonField(true);
      return;
    }
    if (!reason.trim()) return;
    mutate({ eventId, userId: user.id, status: 'REJECTED', reason });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Liberação de menor de idade</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {user.fullName} precisa de autorização dos pais/responsáveis para
            participar deste evento.
          </Typography>

          {user.signedTermUrl ? (
            <Link
              component="button"
              type="button"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              onClick={() =>
                triggerDownload(
                  user.signedTermUrl!,
                  `termo-assinado-${user.fullName}.${extensionFromDataUri(
                    user.signedTermUrl!
                  )}`
                )
              }
            >
              <InsertDriveFile fontSize="small" />
              Baixar termo assinado
            </Link>
          ) : (
            <Alert severity="info" variant="outlined">
              O responsável ainda não anexou o termo assinado.
            </Alert>
          )}

          {user.minorApprovalStatus === 'REJECTED' &&
            user.minorApprovalRejectionReason && (
              <Alert severity="warning" variant="outlined">
                Motivo da recusa anterior: {user.minorApprovalRejectionReason}
              </Alert>
            )}

          {showReasonField && (
            <TextField
              label="Motivo da recusa"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={showReasonField && !reason.trim()}
              helperText={
                showReasonField && !reason.trim()
                  ? 'Informe o motivo para recusar'
                  : ' '
              }
              multiline
              minRows={2}
              autoFocus
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Fechar
        </Button>
        <Button
          color="error"
          variant={showReasonField ? 'contained' : 'text'}
          onClick={handleReject}
          disabled={isLoading}
        >
          Recusar
        </Button>
        {user.signedTermUrl && (
          <Button
            color="success"
            variant="contained"
            onClick={handleApprove}
            disabled={isLoading}
          >
            Aprovar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export { ModalGuardianApproval };
