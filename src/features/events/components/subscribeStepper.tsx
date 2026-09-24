import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { CheckRounded } from '@mui/icons-material';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';

/**
 * Onde a pessoa está dentro da inscrição.
 *
 * A tela tinha dois passos e não mostrava nenhum: dava para clicar em "Próximo"
 * sem saber quantos ainda viriam, e o botão "Finalizar" aparecia de surpresa.
 * A régua aqui responde as três perguntas de uma vez — o que já passou, onde
 * estou, o que falta.
 *
 * O passo atual é o único preenchido com o degradê do sistema; o que já passou
 * vira um certo na cor primária, e o que falta fica só de contorno. É a mesma
 * leitura de qualquer lista numerada: cheio é feito, vazio é futuro.
 */
function SubscribeStepper({
  passos,
  atual,
}: {
  passos: string[];
  /** 1-based, como os passos são contados no resto da tela */
  atual: number;
}) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ mb: 2.5, px: { xs: 0, sm: 0.5 } }}
    >
      {passos.map((passo, indice) => {
        const numero = indice + 1;
        const feito = numero < atual;
        const agora = numero === atual;
        const ultimo = numero === passos.length;

        return (
          <Stack
            key={passo}
            direction="row"
            alignItems="center"
            sx={{ flexGrow: ultimo ? 0 : 1, minWidth: 0 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ minWidth: 0, flexShrink: 0 }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: agora || feito ? '#fff' : 'text.secondary',
                  border: agora || feito ? 'none' : '1px solid',
                  borderColor: alpha(theme.palette.text.primary, 0.25),
                  backgroundColor: feito
                    ? theme.palette.primary.main
                    : 'transparent',
                  backgroundImage: agora
                    ? `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`
                    : 'none',
                  boxShadow: agora
                    ? `0 6px 16px -8px ${alpha(AZUL_VIVO, 0.9)}`
                    : 'none',
                }}
              >
                {feito ? <CheckRounded sx={{ fontSize: 16 }} /> : numero}
              </Box>

              {/* no celular só o passo atual se apresenta por extenso: três
                rótulos lado a lado não cabem sem virar reticências */}
              <Typography
                noWrap
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: agora ? 700 : 500,
                  color: agora ? 'text.primary' : 'text.secondary',
                  display: {
                    xs: agora ? 'block' : 'none',
                    sm: 'block',
                  },
                }}
              >
                {passo}
              </Typography>
            </Stack>

            {!ultimo && (
              <Box
                sx={{
                  flexGrow: 1,
                  height: 2,
                  mx: 1.25,
                  borderRadius: 999,
                  backgroundColor: feito
                    ? theme.palette.primary.main
                    : alpha(theme.palette.text.primary, 0.14),
                }}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

export { SubscribeStepper };
