import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  PictureAsPdfOutlined,
  PeopleOutline,
} from '@mui/icons-material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { UserAvatar } from '../../../components/userAvatar';
import { buildFileName } from '../../admin/events/components/exportUsers/exportFile';
import { baixarCurriculo } from '../api';
import { respostaEmTexto } from '../formulario';
import { Interessado, OportunidadeDaIgreja } from '../types';
import { PdfCandidaturas } from './pdfCandidaturas';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** As respostas de um candidato; o currículo baixa pela API */
function Respostas({
  churchId,
  vagaId,
  candidato,
}: {
  churchId: string;
  vagaId: string;
  candidato: Interessado;
}) {
  const [baixando, setBaixando] = useState(false);
  const respostas = Object.values(candidato.respostas);
  if (!respostas.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem respostas além do contato.
      </Typography>
    );
  }
  return (
    <Stack spacing={1}>
      {respostas.map((r) => (
        <Box key={r.rotulo}>
          <Typography variant="caption" color="text.secondary">
            {r.rotulo}
          </Typography>
          {r.tipo === 'CURRICULO' ? (
            <Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PictureAsPdfOutlined />}
                disabled={baixando}
                sx={{ textTransform: 'none' }}
                onClick={async () => {
                  setBaixando(true);
                  try {
                    await baixarCurriculo(
                      churchId,
                      vagaId,
                      candidato.user.id,
                      respostaEmTexto(r)
                    );
                  } catch {
                    toast.error('Não foi possível baixar o currículo');
                  } finally {
                    setBaixando(false);
                  }
                }}
              >
                {baixando ? 'Baixando…' : 'Baixar currículo'}
              </Button>
            </Box>
          ) : r.tipo === 'REDE_SOCIAL' ? (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              <Link
                href={String(r.valor)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {String(r.valor)}
              </Link>
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
            >
              {respostaEmTexto(r)}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

interface Props {
  churchId: string;
  oportunidade: OportunidadeDaIgreja | null;
  onClose: () => void;
}

/** Quem se candidatou à vaga, com o contato, as respostas e a exportação */
function ModalInteressados({ churchId, oportunidade, onClose }: Props) {
  const theme = useTheme();
  const pequena = useMediaQuery(theme.breakpoints.down('sm'));
  const interessados = oportunidade?.interests ?? [];
  const [gerando, setGerando] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);

  const baixar = async () => {
    if (!oportunidade) return;
    setGerando(true);
    try {
      const blob = await pdf(<PdfCandidaturas vaga={oportunidade} />).toBlob();
      FileSaver.saveAs(
        blob,
        buildFileName(oportunidade.title, 'pdf', 'candidaturas')
      );
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
      fullHeight
      title={`Candidaturas em ${oportunidade?.title ?? ''}`}
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
            Ninguém se candidatou ainda.
          </Typography>
        </Stack>
      ) : (
        <Stack divider={<Divider flexItem />} sx={{ pt: 1 }}>
          {interessados.map((candidato) => {
            const { user, createdAt } = candidato;
            const expandido = aberto === user.id;
            return (
              <Box key={user.id} sx={{ py: 1.25 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  onClick={() => setAberto(expandido ? null : user.id)}
                  sx={{ cursor: 'pointer' }}
                  role="button"
                  aria-expanded={expandido}
                  aria-label={`Respostas de ${user.fullName}`}
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
                  {expandido ? <ExpandLess /> : <ExpandMore />}
                </Stack>
                <Collapse in={expandido} unmountOnExit>
                  <Box sx={{ pl: { xs: 0, sm: 6 }, pt: 1.5 }}>
                    <Respostas
                      churchId={churchId}
                      vagaId={oportunidade!.id}
                      candidato={candidato}
                    />
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalInteressados };
