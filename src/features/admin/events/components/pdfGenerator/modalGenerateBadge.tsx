import {
  Alert,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PdfBadge from '../../../../../components/pdfBadge';
import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { SelectField } from '../../../../../components/selectField';
import { PdfNameCase } from '../../../../../types/pdf';
import { User } from '../../../../../types/user';
import { EventDetails } from '../../types';

const NAME_CASE_OPTIONS: { value: PdfNameCase; label: string }[] = [
  { value: 'capitalize', label: 'Primeira letra maiúscula' },
  { value: 'upper', label: 'MAIÚSCULO' },
  { value: 'lower', label: 'minúsculo' },
];

/** Nome de arquivo sem acento, espaço nem barra — o sistema de arquivos agradece */
function nomeArquivo(nome?: string) {
  const limpo = (nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return limpo ? `cracha-${limpo}.pdf` : 'cracha.pdf';
}

interface ModalGenerateBadgeProps {
  open: boolean;
  onClose: () => void;
  /** o inscrito da linha; o modal só abre com ele em mãos */
  user: User | null;
  event?: EventDetails;
}

/**
 * Crachá de um inscrito só, com as mesmas opções do PDF em massa que fazem
 * sentido para uma folha: QR e formatação do nome. Antes o item do menu baixava
 * direto, sem perguntar nada.
 */
function ModalGenerateBadge({
  open,
  onClose,
  user,
  event,
}: ModalGenerateBadgeProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  const [withQrCode, setWithQrCode] = useState(true);
  const [nameCase, setNameCase] = useState<PdfNameCase>('capitalize');
  const [isGenerating, setIsGenerating] = useState(false);

  // cada abertura recomeça do padrão, senão sobra a configuração anterior
  useEffect(() => {
    if (!open) return;
    setWithQrCode(true);
    setNameCase('capitalize');
  }, [open]);

  async function onGenerate() {
    if (!user || !event) return;

    if (!user.badgeName) {
      toast.error('Este inscrito não tem nome de crachá cadastrado.');
      return;
    }

    setIsGenerating(true);
    // o react-pdf trava a tela enquanto monta: dá um frame para o loading pintar
    setTimeout(async () => {
      try {
        const blob = await pdf(
          <PdfBadge
            data={[]}
            event={event}
            sections={[{ title: null, users: [user] }]}
            nameCase={nameCase}
            withQrCode={withQrCode}
          />
        ).toBlob();

        FileSaver.saveAs(blob, nomeArquivo(user.badgeName || user.fullName));
        onClose();
      } catch {
        toast.error('Não foi possível gerar o PDF. Tente novamente.');
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  }

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={isGenerating}
      mobileMode="bottomSheet"
      maxWidth="sm"
      title="PDF Crachá"
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isGenerating}
            fullWidth={isMobile}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onGenerate}
            disabled={isGenerating}
            fullWidth={isMobile}
          >
            {isGenerating ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </>
      }
    >
      <Stack gap={3}>
        <Typography variant="body2" color="text.secondary">
          Crachá de <strong>{user?.badgeName || user?.fullName}</strong>.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={withQrCode}
              onChange={(e) => setWithQrCode(e.target.checked)}
            />
          }
          label="QR code"
        />

        <SelectField
          label="Formatação do nome"
          native={isMobile}
          value={nameCase}
          onChange={(value) => setNameCase(value as PdfNameCase)}
          options={NAME_CASE_OPTIONS}
        />

        {!withQrCode && (
          <Alert severity="warning">
            Sem QR code o crachá sai só com o nome, e a entrada não pode ser
            registrada pelo leitor — a conferência tem que ser na lista.
          </Alert>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalGenerateBadge };
