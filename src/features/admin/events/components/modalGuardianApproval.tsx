import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
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
import { AttachFile, InsertDriveFile } from '@mui/icons-material';
import { User } from '../../../../types/user';
import { usePutGuardianApproval } from '../api/putGuardianApproval';
import { usePostGuardianTerm } from '../api/postGuardianTerm';
import { extensionFromDataUri, triggerDownload } from '../../../../utils';

interface ModalGuardianApprovalProps {
  open: boolean;
  user: User | null;
  eventId: string;
  onClose: () => void;
}

/**
 * O admin só aprova depois de abrir o termo assinado — por isso o link fica
 * em destaque e "Aprovar" some sem termo, em vez de só desabilitar.
 *
 * O termo nem sempre chega pelo sistema: o responsável entrega o papel na
 * secretaria, manda foto no WhatsApp, deixa na mão de quem organiza. Antes
 * disso a inscrição ficava travada esperando um envio que já tinha acontecido
 * fora da tela — daí o anexo aqui, que grava o arquivo na inscrição do
 * participante como se ele mesmo tivesse enviado.
 */
function ModalGuardianApproval({
  open,
  user,
  eventId,
  onClose,
}: ModalGuardianApprovalProps) {
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviado, setEnviado] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setShowReasonField(false);
      setArquivo(null);
      setEnviado(false);
    }
  }, [open, user?.id]);

  const { mutate, isLoading } = usePutGuardianApproval({
    onSuccess: onClose,
  });

  /**
   * O `user` desta modal é a linha que a lista tinha quando ela abriu: ele não
   * se atualiza com o refetch. Por isso o envio guarda o próprio resultado em
   * `enviado`, e é ele que libera "Aprovar" logo em seguida — sem fechar e
   * reabrir para o termo aparecer.
   */
  const { mutate: enviarTermo, isLoading: enviandoTermo } = usePostGuardianTerm(
    {
      onSuccess: () => {
        setArquivo(null);
        setEnviado(true);
      },
    }
  );

  if (!user) return null;

  const ocupado = isLoading || enviandoTermo;
  const temTermo = enviado || !!user.signedTermUrl;

  const escolherArquivo = () => {
    if (arquivoRef.current) arquivoRef.current.value = ''; // deixa reescolher o mesmo
    arquivoRef.current?.click();
  };

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

  const styles = {
    anexo: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1,
      borderRadius: 1.5,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    },
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

          {enviado ? (
            <Alert severity="success" variant="outlined">
              Termo anexado. A liberação já pode ser aprovada.
            </Alert>
          ) : user.signedTermUrl ? (
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
              O responsável ainda não anexou o termo assinado. Se ele entregou o
              documento direto para você, anexe abaixo.
            </Alert>
          )}

          <Box>
            <input
              ref={arquivoRef}
              hidden
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            />

            {arquivo ? (
              <>
                {/* o nome em linha própria: dentro do botão, um nome comprido
                  estica o bloco e some em reticências */}
                <Box sx={styles.anexo}>
                  <InsertDriveFile fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    {arquivo.name}
                  </Typography>
                  <Button
                    size="small"
                    color="inherit"
                    disabled={ocupado}
                    onClick={escolherArquivo}
                  >
                    Trocar
                  </Button>
                </Box>
                <Button
                  size="small"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 1 }}
                  disabled={ocupado}
                  onClick={() =>
                    enviarTermo({ eventId, userId: user.id, termFile: arquivo })
                  }
                >
                  {enviandoTermo ? 'Enviando…' : 'Enviar termo'}
                </Button>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AttachFile />}
                disabled={ocupado}
                onClick={escolherArquivo}
              >
                {temTermo ? 'Substituir termo' : 'Anexar termo recebido'}
              </Button>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75 }}
            >
              O arquivo é gravado na inscrição do participante (PDF ou imagem) e
              substitui o anterior.
            </Typography>
          </Box>

          {/* o envio acima limpa a recusa no servidor: manter o motivo na tela
            depois disso seria contar uma pendência que não existe mais */}
          {!enviado &&
            user.minorApprovalStatus === 'REJECTED' &&
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
        <Button onClick={onClose} disabled={ocupado}>
          Fechar
        </Button>
        <Button
          color="error"
          variant={showReasonField ? 'contained' : 'text'}
          onClick={handleReject}
          disabled={ocupado}
        >
          Recusar
        </Button>
        {temTermo && (
          <Button
            color="success"
            variant="contained"
            onClick={handleApprove}
            disabled={ocupado}
          >
            Aprovar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export { ModalGuardianApproval };
