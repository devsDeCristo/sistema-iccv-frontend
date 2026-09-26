import { ReactNode, useEffect, useState } from 'react';
import {
  alpha,
  Box,
  CircularProgress,
  Fade,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';

interface ProgressoDoPdfProps {
  ativo: boolean;
  /** "Gerando 130 crachás" */
  titulo: string;
  children: ReactNode;
}

/** a partir daqui vale dizer que lote grande demora mesmo */
const DEMORA_S = 15;

/**
 * Os dois anéis, um sobre o outro. O canto é explícito: sem ele o anel herdava
 * o `text-align: center` do aviso e saía meio anel para a direita do ícone.
 */
const anel = { position: 'absolute', top: 0, left: 0 } as const;

/**
 * O modal enquanto o PDF é gerado: o formulário fica por baixo, esmaecido, e
 * por cima o aviso de que está andando.
 *
 * Antes só o botão ficava desabilitado, e não dava para saber se estava
 * processando ou se tinha travado. O servidor não conta o progresso, então não
 * há porcentagem para mostrar — inventar uma seria mentir. O que prova que
 * está vivo é o relógio andando.
 */
function ProgressoDoPdf({ ativo, titulo, children }: ProgressoDoPdfProps) {
  const theme = useTheme();
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    setSegundos(0);
    const inicio = Date.now();
    const relogio = setInterval(
      () => setSegundos(Math.floor((Date.now() - inicio) / 1000)),
      1000
    );
    return () => clearInterval(relogio);
  }, [ativo]);

  return (
    // com o aviso por cima, o conteúdo curto (o crachá da linha) ganha altura
    // para ele caber
    <Box sx={{ position: 'relative', minHeight: ativo ? 300 : undefined }}>
      {children}

      <Fade in={ativo} unmountOnExit>
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: 'absolute',
            inset: -8,
            zIndex: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.88),
            backdropFilter: 'blur(3px)',
          }}
        >
          {/* preso ao topo do que está visível: com o formulário rolado, o
              aviso não fica lá em cima, fora da tela */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 3,
            }}
          >
            <Box sx={{ position: 'relative', width: 76, height: 76 }}>
              {/* trilho fixo por baixo do anel que gira */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={76}
                thickness={2.4}
                sx={{
                  ...anel,
                  color: alpha(theme.palette.primary.main, 0.14),
                }}
              />
              <CircularProgress
                size={76}
                thickness={2.4}
                sx={{
                  ...anel,
                  '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                }}
              >
                <PictureAsPdfOutlined sx={{ fontSize: 30 }} />
              </Box>
            </Box>

            <Typography fontWeight={700} sx={{ mt: 2.5 }}>
              {titulo}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 320 }}
            >
              O download começa sozinho quando o PDF ficar pronto. Não feche
              esta janela.
            </Typography>

            <LinearProgress
              sx={{
                mt: 2.5,
                width: 220,
                height: 4,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                '& .MuiLinearProgress-bar': { borderRadius: 999 },
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}
            >
              {segundos}s
              {segundos >= DEMORA_S && ' · lotes grandes levam um pouco mais'}
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

export { ProgressoDoPdf };
