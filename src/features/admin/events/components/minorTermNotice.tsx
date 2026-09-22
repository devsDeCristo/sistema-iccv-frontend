import { useRef } from 'react';
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AttachFile,
  CheckCircle,
  Download,
  FamilyRestroomOutlined,
  SwapHoriz,
} from '@mui/icons-material';

import { extensionFromDataUri, triggerDownload } from '../../../../utils';

interface MinorTermNoticeProps {
  /** Termo em branco anexado ao evento, para download */
  minorTermUrl?: string | null;
  /** Termo assinado escolhido aqui — pode ser enviado depois em Minhas Inscrições */
  signedTermFile?: File | null;
  onSignedTermFileChange?: (file: File | null) => void;
  /** O aviso foi lido; sem isso a inscrição não segue */
  lido: boolean;
  onLidoChange: (lido: boolean) => void;
}

/** Um passo do que precisa ser feito, com o número à esquerda */
function Passo({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Stack direction="row" gap={1.5} alignItems="flex-start">
      <Box
        sx={{
          flexShrink: 0,
          width: 22,
          height: 22,
          mt: 0.25,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.16),
        }}
      >
        {numero}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {titulo}
        </Typography>
        {children}
      </Box>
    </Stack>
  );
}

/**
 * O aviso do termo de autorização, na tela de inscrição.
 *
 * Só aparece para quem terá menos de 16 anos na data do evento — ou seja, a
 * pessoa que está lendo é exatamente a de quem o aviso fala. Por isso ele
 * conversa com ela ("você precisa"), e não anuncia uma regra em terceira
 * pessoa: o texto anterior abria com "ATENÇÃO — PARTICIPANTES MENORES DE 16
 * ANOS" em caixa alta, que é como se fala com uma plateia, não com alguém.
 *
 * O que fazer virou dois passos numerados, porque são duas ações em momentos
 * diferentes: baixar o termo agora e devolver assinado — hoje ou depois. Antes
 * as duas dividiam uma linha só, e o "anexar" parecia alternativa ao "baixar".
 *
 * O aceite no fim não substitui o termo, e não promete nada: ele só garante
 * que ninguém passe por esta tela sem ter lido que o termo existe. A inscrição
 * fica pendente de aprovação até o termo assinado chegar, com ou sem este
 * clique.
 */
function MinorTermNotice({
  minorTermUrl,
  signedTermFile,
  onSignedTermFileChange,
  lido,
  onLidoChange,
}: MinorTermNoticeProps) {
  const theme = useTheme();
  const arquivoRef = useRef<HTMLInputElement>(null);

  const escolherArquivo = () => {
    if (arquivoRef.current) arquivoRef.current.value = ''; // deixa reescolher o mesmo
    arquivoRef.current?.click();
  };

  const tinta = alpha(theme.palette.warning.main, 0.06);
  const papel = theme.palette.background.paper;
  const listra = alpha(theme.palette.warning.main, 0.55);

  const styles = {
    /**
     * A borda zebrada é feita de camadas de fundo, e não de `border-image`.
     *
     * `border-image` desenharia as listras, mas o navegador ignora o
     * `border-radius` quando ela existe — o cartão perderia os cantos
     * arredondados de todo o resto do sistema.
     *
     * Então a borda fica transparente, só reservando a faixa, e o desenho vem
     * do fundo em três camadas: as listras recortadas na borda inteira, e
     * sobre elas o papel opaco e a tinta de aviso recortados só na área
     * interna. O papel precisa ser opaco no meio — sem ele as listras
     * apareceriam por baixo do texto, que é justamente o que não se quer.
     */
    caixa: {
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2,
      border: '3px solid transparent',
      backgroundColor: papel,
      backgroundImage: [
        `linear-gradient(${tinta}, ${tinta})`,
        `linear-gradient(${papel}, ${papel})`,
        `repeating-linear-gradient(45deg, ${listra} 0 5px, transparent 5px 10px)`,
      ].join(', '),
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, padding-box, border-box',
    },
    selo: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.16),
    },
    anexo: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mt: 0.75,
      p: 1,
      borderRadius: 1.5,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },
  };

  return (
    <Paper variant="outlined" sx={styles.caixa}>
      <Stack direction="row" gap={1.5} alignItems="flex-start">
        <Box sx={styles.selo}>
          <FamilyRestroomOutlined />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
            Você precisa de uma autorização assinada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Na data do evento você terá menos de 16 anos, então seus pais ou
            responsáveis precisam autorizar sua participação e dizer quem vai
            acompanhar você.
          </Typography>
        </Box>
      </Stack>

      <Stack gap={1.5} sx={{ mt: 2 }}>
        <Passo numero={1} titulo="Baixe o termo e leve para assinar">
          {minorTermUrl ? (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Download />}
              sx={{ mt: 0.75 }}
              onClick={() =>
                triggerDownload(
                  minorTermUrl,
                  `termo-de-autorizacao.${extensionFromDataUri(minorTermUrl)}`
                )
              }
            >
              Baixar termo
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Este evento ainda não anexou o modelo. Peça o termo à organização.
            </Typography>
          )}
        </Passo>

        <Passo numero={2} titulo="Envie o termo assinado">
          <input
            ref={arquivoRef}
            hidden
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) =>
              onSignedTermFileChange?.(e.target.files?.[0] ?? null)
            }
          />

          {signedTermFile ? (
            // o nome do arquivo em linha própria: dentro do botão, um nome
            // comprido esticava o bloco inteiro e sumia com reticências
            <Box sx={styles.anexo}>
              <CheckCircle
                fontSize="small"
                sx={{ color: theme.palette.success.main }}
              />
              <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                {signedTermFile.name}
              </Typography>
              <Button
                size="small"
                color="inherit"
                startIcon={<SwapHoriz />}
                onClick={escolherArquivo}
              >
                Trocar
              </Button>
            </Box>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<AttachFile />}
                sx={{ mt: 0.75 }}
                onClick={escolherArquivo}
              >
                Anexar agora
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                Se ainda não tem em mãos, pode enviar depois em <b>Minhas
                Inscrições</b> ou enviar a organização — sua vaga fica guardada.
              </Typography>
            </>
          )}
        </Passo>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <FormControlLabel
        sx={{ mr: 0 }}
        control={
          <Checkbox
            color="warning"
            checked={lido}
            onChange={(evento) => onLidoChange(evento.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            Li o aviso e vou entregar o termo assinado
          </Typography>
        }
      />
    </Paper>
  );
}

export { MinorTermNotice };
