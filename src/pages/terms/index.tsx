import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Skeleton,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Logo from '../../assets/logo-ic.svg?react';
import { useGetTerms } from '../../features/terms/api';
import { prepararTermos } from '../../features/terms/html';

/**
 * Termos de Uso do ICCV Eventos.
 *
 * Página pública: abre sem login, porque o link sai da tela de entrada e do
 * cadastro, antes de a pessoa ter conta.
 *
 * O texto não mora aqui: é a versão vigente publicada em Configurações > Termos
 * de Uso, lida do banco. A página só dá a forma — o índice e a numeração saem
 * dos títulos do texto, e o HTML passa por `prepararTermos` antes de aparecer.
 */

const dataPorExtenso = (data: string) =>
  new Date(data).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });

/**
 * A tipografia do texto vindo do editor. Os títulos são numerados por contador
 * de CSS, na mesma ordem do índice — quem escreve não numera.
 */
const textoDosTermos: SxProps<Theme> = {
  counterReset: 'secao',
  '& h2': {
    counterIncrement: 'secao',
    fontSize: '1.2rem',
    fontWeight: 800,
    mt: 4,
    mb: 1.25,
    scrollMarginTop: 88,
    '&::before': { content: 'counter(secao) ". "' },
  },
  '& h3': { fontSize: '1rem', fontWeight: 700, mt: 2, mb: 0.75 },
  '& p': { mt: 0, mb: 1.5, lineHeight: 1.75, fontSize: '0.975rem' },
  // o editor deixa parágrafo vazio entre blocos; não vira buraco na página
  '& p:has(> br:only-child)': { display: 'none' },
  '& ul, & ol': { mt: 0, mb: 1.5, pl: 3 },
  '& li': { mb: 0.75, lineHeight: 1.7, fontSize: '0.975rem' },
  '& a': { color: 'primary.main', fontWeight: 600 },
};

function Terms() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: termos, isLoading, isError } = useGetTerms();

  const { html, secoes } = useMemo(
    () => prepararTermos(termos?.content ?? ''),
    [termos?.content]
  );

  const ir = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.9),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 3 }, py: 1.25 }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Logo
              style={{
                height: 30,
                width: 'auto',
                fill: theme.palette.text.primary,
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.05rem',
                whiteSpace: 'nowrap',
              }}
            >
              ICCV{' '}
              <Box component="span" sx={{ fontWeight: 400 }}>
                Eventos
              </Box>
            </Typography>
          </Stack>
          <Button
            startIcon={<ArrowBack />}
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : navigate('/login')
            }
            sx={{ textTransform: 'none' }}
          >
            Voltar
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          maxWidth: 1120,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 5 },
          display: 'grid',
          gap: { md: 6 },
          gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
        }}
      >
        {/* índice: no computador fica parado ao lado do texto */}
        <Box
          component="nav"
          aria-label="Índice"
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'sticky',
            top: 88,
            alignSelf: 'start',
          }}
        >
          {secoes.length > 0 && (
            <>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                NESTA PÁGINA
              </Typography>
              <Stack gap={0.25}>
                {secoes.map((secao, indice) => (
                  <Link
                    key={secao.id}
                    component="button"
                    onClick={() => ir(secao.id)}
                    underline="none"
                    sx={{
                      textAlign: 'left',
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      py: 0.35,
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {indice + 1}. {secao.titulo}
                  </Link>
                ))}
              </Stack>
            </>
          )}
        </Box>

        <Box component="main" sx={{ minWidth: 0, maxWidth: 760 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.9rem', md: '2.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Termos de Uso
          </Typography>

          {isLoading ? (
            <Stack gap={1.5} sx={{ mt: 1 }}>
              <Skeleton width={260} />
              <Skeleton variant="rounded" height={180} />
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} variant="text" height={28} />
              ))}
            </Stack>
          ) : isError || !termos ? (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
              Não foi possível carregar os Termos de Uso agora. Tente de novo em
              instantes.
            </Alert>
          ) : (
            <>
              <Typography sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
                Última atualização: {dataPorExtenso(termos.publishedAt)}
              </Typography>

              {termos.summary.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    mb: 1,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    Em resumo
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      mt: 0,
                      mb: 1.5,
                      pl: 3,
                      '& li': {
                        mb: 0.75,
                        lineHeight: 1.7,
                        fontSize: '0.975rem',
                      },
                    }}
                  >
                    {termos.summary.map((frase) => (
                      <li key={frase}>{frase}</li>
                    ))}
                  </Box>
                  <Typography
                    sx={{ fontSize: '0.84rem', color: 'text.secondary' }}
                  >
                    O resumo ajuda a ler, mas não substitui o texto completo
                    abaixo.
                  </Typography>
                </Paper>
              )}

              <Box
                sx={textoDosTermos}
                // limpo por `prepararTermos`: só as tags de texto passam
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export { Terms };
