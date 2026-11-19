import { useState } from 'react';
import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { PictureAsPdfOutlined, PeopleOutline } from '@mui/icons-material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { UserAvatar } from '../../../components/userAvatar';
import { buildFileName } from '../../admin/events/components/exportUsers/exportFile';
import { PdfUsersExport } from '../../admin/events/components/exportUsers/pdfUsersExport';
import {
  ExportColumn,
  ExportUser,
} from '../../admin/events/components/exportUsers/types';
import { OportunidadeDaIgreja } from '../types';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** O que vai para quem ofereceu a vaga: nome e contato, nada além */
const COLUNAS: ExportColumn[] = [
  { field: 'fullName', label: 'Nome', getValue: (u) => u.fullName },
  { field: 'cellphone', label: 'Celular', getValue: (u) => u.cellphone ?? '' },
  { field: 'email', label: 'E-mail', getValue: (u) => u.email },
];

/**
 * O PDF que o admin manda para quem ofereceu a vaga, no mesmo modelo da
 * exportação de inscritos (`PdfUsersExport`): a vaga no topo e um interessado
 * por linha, na ordem em que chegaram.
 */
const exportar = async (vaga: OportunidadeDaIgreja) => {
  const blob = await pdf(
    <PdfUsersExport
      eventName={vaga.title}
      subtitle={`Interessados na vaga · ${vaga.company}`}
      groups={[
        {
          title: null,
          // o PDF só lê nome, celular e e-mail, pelas colunas acima
          users: vaga.interests.map(
            ({ user }) => user as unknown as ExportUser
          ),
        },
      ]}
      columns={COLUNAS}
      markLeaders={false}
      orientation="portrait"
    />
  ).toBlob();
  FileSaver.saveAs(blob, buildFileName(vaga.title, 'pdf', 'interessados'));
};

interface Props {
  oportunidade: OportunidadeDaIgreja | null;
  onClose: () => void;
}

/** Quem demonstrou interesse na vaga, com o contato e a exportação */
function ModalInteressados({ oportunidade, onClose }: Props) {
  const theme = useTheme();
  const pequena = useMediaQuery(theme.breakpoints.down('sm'));
  const interessados = oportunidade?.interests ?? [];
  const [gerando, setGerando] = useState(false);

  const baixar = async () => {
    if (!oportunidade) return;
    setGerando(true);
    try {
      await exportar(oportunidade);
    } finally {
      setGerando(false);
    }
  };

  return (
    <ResponsiveModal
      open={!!oportunidade}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title={`Interessados em ${oportunidade?.title ?? ''}`}
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfOutlined />}
            disabled={!interessados.length || gerando}
            onClick={baixar}
          >
            {gerando ? 'Gerando…' : 'Exportar PDF'}
          </Button>
        </>
      }
    >
      {!interessados.length ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
          <PeopleOutline sx={{ fontSize: 36, color: 'text.disabled' }} />
          <Typography color="text.secondary" textAlign="center">
            Ninguém demonstrou interesse ainda.
          </Typography>
        </Stack>
      ) : (
        <Stack divider={<Divider flexItem />} sx={{ pt: 1 }}>
          {interessados.map(({ user, createdAt }) => (
            <Stack
              key={user.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ py: 1.25 }}
            >
              <UserAvatar
                name={user.fullName}
                photoUrl={user.profilePhotoUrl ?? undefined}
                sx={{ width: 36, height: 36, fontSize: 14 }}
              />
              <Stack sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontSize={14} fontWeight={600} noWrap>
                  {user.fullName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {[user.cellphone, user.email].filter(Boolean).join(' · ')}
                </Typography>
              </Stack>
              {!pequena && (
                <Typography variant="caption" color="text.secondary">
                  {data(createdAt)}
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalInteressados };
