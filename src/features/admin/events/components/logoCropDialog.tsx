import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { CloudUpload, CropLandscape, CropSquare } from '@mui/icons-material';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { toast } from 'react-toastify';
import { imageUrlToDataUrl } from '../../../../utils/image';

/**
 * Lado maior do recorte que sai daqui. A logo aparece na página com 72px de
 * altura, então guardar o original de 3000px só engorda o que trafega em toda
 * abertura do evento.
 */
const LADO_MAXIMO = 900;

type Formato = 'retangulo' | 'quadrado';

const FORMATOS: {
  id: Formato;
  rotulo: string;
  proporcao: number;
  icone: ReactNode;
}[] = [
  {
    id: 'retangulo',
    rotulo: 'Retângulo',
    proporcao: 16 / 9,
    icone: <CropLandscape fontSize="small" />,
  },
  {
    id: 'quadrado',
    rotulo: 'Quadrado',
    proporcao: 1,
    icone: <CropSquare fontSize="small" />,
  },
];

function carregarImagem(fonte: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imagem = new Image();
    // só vale para o caso de a conversão em data URL ter falhado: sem isto o
    // canvas fica contaminado e a exportação do recorte é recusada
    if (!fonte.startsWith('data:')) imagem.crossOrigin = 'anonymous';
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error('Não foi possível ler a imagem'));
    imagem.src = fonte;
  });
}

type LogoCropDialogProps = {
  aberto: boolean;
  /** logo escolhida agora ou a que já está salva no evento */
  imagem: string | null;
  /** arquivo recém-escolhido, quando existe: é a fonte mais confiável */
  arquivo?: File | null;
  onFechar: () => void;
  onConfirmar: (imagemRecortada: File) => void;
  /** abre o seletor de arquivo, para quando a logo salva não puder ser lida */
  onEscolherArquivo?: () => void;
};

/**
 * Recorte da logo.
 *
 * A logo chega quase sempre como um print ou um arquivo com margem branca em
 * volta, e é essa margem que a faz aparecer pequena na capa — o espaço vazio
 * conta como parte da imagem. Aqui o admin arrasta e dá zoom até sobrar só a
 * marca.
 *
 * Sai em PNG porque logo com fundo transparente é a regra, e qualquer outro
 * formato trocaria a transparência por um retângulo branco (ou preto) sobre a
 * capa.
 */
function LogoCropDialog({
  aberto,
  imagem,
  arquivo,
  onFechar,
  onConfirmar,
  onEscolherArquivo,
}: LogoCropDialogProps) {
  const theme = useTheme();
  const [fonte, setFonte] = useState<string | null>(null);
  const [formato, setFormato] = useState<Formato>('retangulo');
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [processando, setProcessando] = useState(false);
  /** a logo salva não pôde ser lida pixel a pixel */
  const [bloqueada, setBloqueada] = useState(false);

  const proporcao =
    FORMATOS.find((item) => item.id === formato)?.proporcao ?? 1;

  /**
   * Recortar é ler os pixels da imagem, e o navegador só deixa ler o que é
   * nosso: o arquivo que o admin acabou de escolher, sim; a logo já salva, que
   * vive no Firebase Storage, só se o bucket liberar CORS — e hoje não libera.
   *
   * Por isso a ordem é arquivo primeiro, e a URL salva como tentativa. Falhou,
   * a tela diz o que fazer em vez de estourar um erro na hora de exportar.
   */
  useEffect(() => {
    if (!aberto) return;

    let ativo = true;
    setPosicao({ x: 0, y: 0 });
    setZoom(1);
    setBloqueada(false);

    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = () => ativo && setFonte(String(leitor.result));
      leitor.onerror = () => ativo && setBloqueada(true);
      leitor.readAsDataURL(arquivo);

      return () => {
        ativo = false;
      };
    }

    if (!imagem) return;

    if (imagem.startsWith('data:')) {
      setFonte(imagem);
      return;
    }

    imageUrlToDataUrl(imagem).then((dataUrl) => {
      if (!ativo) return;

      setFonte(dataUrl);
      setBloqueada(!dataUrl);
    });

    return () => {
      ativo = false;
    };
  }, [aberto, arquivo, imagem]);

  const cortar = useCallback(async () => {
    if (!fonte || !area) return;

    setProcessando(true);
    try {
      const original = await carregarImagem(fonte);
      const escala = Math.min(
        1,
        LADO_MAXIMO / Math.max(area.width, area.height)
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(area.width * escala));
      canvas.height = Math.max(1, Math.round(area.height * escala));

      const contexto = canvas.getContext('2d');
      if (!contexto) throw new Error('Não foi possível processar a imagem');

      /**
       * O recorte pode passar da borda da imagem — é assim que se ganha um
       * respiro transparente em volta de uma marca colada no canto. Só que
       * `drawImage` com origem fora da imagem é terreno movediço entre
       * navegadores, então o pedaço que existe de verdade é recortado aqui e
       * desenhado na posição certa do quadro; o resto fica transparente.
       */
      const origemX = Math.max(0, area.x);
      const origemY = Math.max(0, area.y);
      const largura =
        Math.min(original.naturalWidth, area.x + area.width) - origemX;
      const altura =
        Math.min(original.naturalHeight, area.y + area.height) - origemY;

      if (largura <= 0 || altura <= 0) {
        throw new Error('O recorte ficou fora da imagem');
      }

      contexto.drawImage(
        original,
        origemX,
        origemY,
        largura,
        altura,
        (origemX - area.x) * escala,
        (origemY - area.y) * escala,
        largura * escala,
        altura * escala
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Não foi possível gerar a imagem');

      onConfirmar(new File([blob], 'logo.png', { type: 'image/png' }));
    } catch (erro) {
      // o motivo importa: taint de canvas, recorte vazio e leitura da imagem
      // falham igual na tela, e sem isso não dá para saber qual deles foi
      console.error('Falha ao recortar a logo', erro);
      toast.error(
        erro instanceof Error
          ? `Não foi possível recortar a imagem: ${erro.message}`
          : 'Não foi possível recortar a imagem.'
      );
    } finally {
      setProcessando(false);
    }
  }, [area, fonte, onConfirmar]);

  const styles = {
    palco: {
      position: 'relative',
      height: { xs: 260, sm: 320 },
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: theme.palette.mode === 'dark' ? '#0B1220' : '#1E293B',
    },
    formatos: { flexWrap: 'wrap' },
  };

  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      fullWidth
      maxWidth="sm"
      aria-labelledby="titulo-recorte-da-logo"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box>
          <Typography id="titulo-recorte-da-logo" variant="h6" fontSize={18}>
            Recortar logo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arraste e dê zoom até sobrar só a marca, sem as bordas em volta.
          </Typography>
        </Box>

        {bloqueada ? (
          <Alert severity="info" variant="outlined">
            <Typography variant="body2">
              Esta logo já está salva no servidor, e o navegador não libera a
              leitura da imagem de lá para recortar. Envie o arquivo de novo
              para recortá-lo aqui.
            </Typography>
            {onEscolherArquivo && (
              <Button
                size="small"
                sx={{ mt: 1 }}
                startIcon={<CloudUpload />}
                onClick={onEscolherArquivo}
              >
                Escolher arquivo
              </Button>
            )}
          </Alert>
        ) : (
          <>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={formato}
              onChange={(_, valor) => valor && setFormato(valor)}
              aria-label="Formato do recorte"
              sx={styles.formatos}
            >
              {FORMATOS.map((item) => (
                <ToggleButton
                  key={item.id}
                  value={item.id}
                  aria-label={item.rotulo}
                >
                  {item.icone}
                  <Box component="span" sx={{ ml: 0.75 }}>
                    {item.rotulo}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Box sx={styles.palco}>
              {fonte && (
                <Cropper
                  image={fonte}
                  crop={posicao}
                  zoom={zoom}
                  aspect={proporcao}
                  minZoom={0.4}
                  maxZoom={4}
                  // a imagem pode sair do quadro: marca colada no canto do arquivo
                  // só fica centrada se o recorte puder passar da borda
                  restrictPosition={false}
                  objectFit="contain"
                  showGrid={false}
                  onCropChange={setPosicao}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaEmPixels) => setArea(areaEmPixels)}
                />
              )}
            </Box>

            <Stack direction="row" alignItems="center" gap={2}>
              <Typography variant="caption" color="text.secondary">
                Zoom
              </Typography>
              <Slider
                value={zoom}
                min={0.4}
                max={4}
                step={0.05}
                onChange={(_, valor) => setZoom(valor as number)}
                aria-label="Zoom do recorte"
              />
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, pb: 2, gap: 1 }}>
        <Button color="inherit" onClick={onFechar}>
          {bloqueada ? 'Fechar' : 'Cancelar'}
        </Button>
        {!bloqueada && (
          <Button
            variant="contained"
            disabled={!area || !fonte || processando}
            onClick={cortar}
          >
            Usar recorte
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export { LogoCropDialog };
