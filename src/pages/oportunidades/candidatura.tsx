import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { ConfirmModal } from '../../components/ConfirmModal';
import { superficieSx } from '../../components/listPageStyles';
import { useGetMe } from '../../features/profile/api';
import { getStoredUser } from '../../auth/session';
import {
  useCandidatar,
  useOportunidade,
  useRetirarCandidatura,
} from '../../features/oportunidades/api';
import {
  formatarSalario,
  preenchido,
  respostaEmTexto,
} from '../../features/oportunidades/formulario';
import { CampoDoFormulario } from '../../features/oportunidades/components/campoDoFormulario';
import { ImagemDaVaga } from '../../features/oportunidades/components/cardDaVaga';

/**
 * A candidatura a uma vaga: os dados do perfil (que vão junto), o formulário
 * que o admin montou e o envio. Quem já se candidatou vê o que mandou e pode
 * retirar — para mudar, retira e manda de novo.
 */
function Candidatura() {
  const { id } = useParams();
  const navigate = useNavigate();
  // a mesma regra da vitrine: só membro de igreja com o módulo no plano; fora
  // disso nem consulta a API, e diz o motivo certo
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos?.includes('OPPORTUNITIES');
  const {
    data: vaga,
    isLoading,
    isError,
  } = useOportunidade(podeVer ? id : undefined);
  const { data: eu } = useGetMe();
  const candidatar = useCandidatar();
  const retirar = useRetirarCandidatura();
  const [valores, setValores] = useState<Record<string, unknown>>({});
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [retirando, setRetirando] = useState(false);

  const voltar = () => navigate(`/oportunidades?vaga=${id}`);

  if (podeVer && isLoading) {
    return (
      <PageStyle>
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageStyle>
    );
  }
  if (isError || !vaga) {
    return (
      <PageStyle>
        <Header
          title="Candidatura"
          modulo="oportunidades"
          pageBack="/oportunidades"
          buttonBack
        />
        <Alert severity="info">
          {!igreja
            ? 'As oportunidades são só para os membros da igreja.'
            : !podeVer
              ? `A ${igreja.name} ainda não divulga oportunidades por aqui.`
              : 'Esta vaga não está mais recebendo candidaturas.'}
        </Alert>
      </PageStyle>
    );
  }

  const campos = vaga.formulario.campos;
  const faltando = campos.filter(
    (c) => c.obrigatorio && !preenchido(c, valores[c.id], curriculo)
  );
  const semCelular = !!eu && !eu.cellphone;

  const enviar = () =>
    candidatar.mutate(
      { id: vaga.id, respostas: valores, curriculo },
      { onSuccess: () => navigate('/oportunidades') }
    );

  return (
    <PageStyle>
      <Header
        title={vaga.title}
        modulo="oportunidades"
        description={vaga.company}
        pageBack={`/oportunidades?vaga=${vaga.id}`}
        buttonBack
      />

      <Stack spacing={2}>
        <Paper sx={{ ...superficieSx, overflow: 'hidden' }}>
          <Stack direction="row" alignItems="stretch">
            <Box sx={{ width: 120, flexShrink: 0 }}>
              <ImagemDaVaga vaga={vaga} altura={96} />
            </Box>
            <Stack justifyContent="center" sx={{ p: 2, minWidth: 0 }}>
              <Typography fontWeight={800} noWrap>
                {vaga.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {[vaga.company, vaga.location, formatarSalario(vaga.salario)]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {vaga.minhaCandidatura ? (
          <Paper sx={{ ...superficieSx, p: 2.5 }}>
            <Stack spacing={2}>
              <Alert severity="success">
                Candidatura enviada em{' '}
                {new Date(vaga.minhaCandidatura.createdAt).toLocaleDateString(
                  'pt-BR'
                )}
                .{vaga.encerrada && ' A vaga já foi encerrada.'}
              </Alert>
              {Object.values(vaga.minhaCandidatura.respostas).map((r) => (
                <Box key={r.rotulo}>
                  <Typography variant="caption" color="text.secondary">
                    {r.rotulo}
                  </Typography>
                  <Typography
                    sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
                  >
                    {respostaEmTexto(r)}
                  </Typography>
                </Box>
              ))}
              <Typography variant="body2" color="text.secondary">
                Para mudar alguma resposta, retire a candidatura e envie de novo
                {vaga.encerrada ? ' (só enquanto a vaga estiver aberta)' : ''}.
              </Typography>
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button color="inherit" onClick={voltar}>
                  Voltar
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setRetirando(true)}
                >
                  Retirar candidatura
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper sx={{ ...superficieSx, p: 2.5 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Seus dados
              </Typography>
              <Typography variant="body2">{eu?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {[eu?.email, eu?.cellphone].filter(Boolean).join(' · ')}
              </Typography>
              {semCelular ? (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  Cadastre seu celular no{' '}
                  <Link component={RouterLink} to="/perfil">
                    perfil
                  </Link>{' '}
                  antes de se candidatar: é por ele que quem oferece a vaga
                  costuma entrar em contato.
                </Alert>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Vêm do seu perfil.{' '}
                  <Link component={RouterLink} to="/perfil">
                    Editar
                  </Link>
                </Typography>
              )}
            </Paper>

            {campos.length > 0 && (
              <Paper sx={{ ...superficieSx, p: 2.5 }}>
                <Stack spacing={2.5}>
                  {campos.map((campo) => (
                    <CampoDoFormulario
                      key={campo.id}
                      campo={campo}
                      valor={valores[campo.id]}
                      onChange={(v) =>
                        setValores((a) => ({ ...a, [campo.id]: v }))
                      }
                      curriculo={curriculo}
                      onCurriculo={setCurriculo}
                    />
                  ))}
                </Stack>
              </Paper>
            )}

            <Alert severity="info">
              Ao se candidatar, seu nome, celular, e-mail e o que você preencher
              aqui (inclusive o currículo) ficam com a igreja e com quem oferece
              a vaga, para o processo dela.
            </Alert>

            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              gap={1.5}
              flexWrap="wrap"
            >
              {faltando.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Falta: {faltando.map((c) => c.rotulo).join(', ')}
                </Typography>
              )}
              <Button color="inherit" onClick={voltar}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                disabled={
                  faltando.length > 0 || semCelular || candidatar.isLoading
                }
                onClick={enviar}
              >
                {candidatar.isLoading ? 'Enviando…' : 'Enviar candidatura'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <ConfirmModal
        open={retirando}
        onClose={() => setRetirando(false)}
        title="Retirar candidatura?"
        message="Suas respostas e o currículo saem da lista da igreja e de quem oferece a vaga. O que já tiver sido baixado ou repassado não tem como voltar."
        confirmLabel="Retirar"
        onConfirm={() =>
          retirar.mutate(vaga.id, {
            onSuccess: () => navigate('/oportunidades'),
          })
        }
      />
    </PageStyle>
  );
}

export { Candidatura };
