import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  alpha,
  Box,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { HighlightOff, VerifiedOutlined } from '@mui/icons-material';
import Logo from '../../assets/logo-ic.svg?react';
import { apiClient } from '../../config/lib/axios/api-client';

type CertificadoVerificado = {
  codigo: string;
  nome: string;
  evento: string;
  igreja: string;
  periodo: string;
  cargaHoraria: string | null;
};

/**
 * Verificação pública de um certificado de participação.
 *
 * É o que o QR do certificado abre: sem login, porque quem confere costuma ser
 * outra pessoa (uma escola, um empregador). Mostra só o que o certificado já
 * diz — nome, evento, igreja, período e carga horária —, nunca CPF ou contato.
 * Código que não existe, check-in desfeito ou certificado desligado no evento
 * aparecem igual: "não encontrado".
 */
function VerificarCertificado() {
  const theme = useTheme();
  const { codigo = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['VERIFICAR_CERTIFICADO', codigo],
    queryFn: () =>
      apiClient
        .get<CertificadoVerificado>(
          `/certificates/${encodeURIComponent(codigo)}`
        )
        .then((resposta) => resposta.data),
    retry: false,
  });

  const cor = isError ? theme.palette.error.main : theme.palette.success.main;

  const linha = (rotulo: string, valor?: string | null) =>
    valor ? (
      <Box>
        <Typography variant="caption" color="text.secondary">
          {rotulo}
        </Typography>
        <Typography fontWeight={600}>{valor}</Typography>
      </Box>
    ) : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Stack gap={3} alignItems="center" sx={{ width: '100%', maxWidth: 440 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Logo
            style={{
              height: 34,
              width: 'auto',
              fill: theme.palette.text.primary,
            }}
          />
          <Typography fontWeight={700} fontSize="1.05rem">
            ICCV{' '}
            <Box component="span" sx={{ fontWeight: 400 }}>
              Eventos
            </Box>
          </Typography>
        </Stack>

        <Paper sx={{ p: 3, width: '100%' }}>
          {isLoading ? (
            <Stack gap={1.5}>
              <Skeleton width="60%" height={32} />
              <Skeleton />
              <Skeleton />
              <Skeleton width="40%" />
            </Stack>
          ) : (
            <Stack gap={2.5}>
              <Stack direction="row" gap={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    color: cor,
                    bgcolor: alpha(cor, 0.12),
                  }}
                >
                  {isError ? <HighlightOff /> : <VerifiedOutlined />}
                </Box>
                <Box>
                  <Typography variant="h6" fontSize={18}>
                    {isError
                      ? 'Certificado não encontrado'
                      : 'Certificado verificado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Código {codigo.toUpperCase()}
                  </Typography>
                </Box>
              </Stack>

              {isError ? (
                <Typography variant="body2" color="text.secondary">
                  Este código não corresponde a nenhum certificado válido.
                  Confira se ele foi digitado como está no certificado. Se
                  estiver certo, fale com a organização do evento.
                </Typography>
              ) : (
                <Stack gap={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    Este certificado foi emitido pelo ICCV Eventos e é
                    verdadeiro.
                  </Typography>
                  {linha('Participante', data?.nome)}
                  {linha('Evento', data?.evento)}
                  {linha('Promovido por', data?.igreja)}
                  {linha('Realizado', data?.periodo)}
                  {linha('Carga horária', data?.cargaHoraria)}
                </Stack>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}

export { VerificarCertificado };
