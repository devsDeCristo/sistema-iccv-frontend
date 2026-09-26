import { useLayoutEffect, useRef, useState } from 'react';
import {
  alpha,
  Box,
  Dialog,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  ZoomOutMap,
} from '@mui/icons-material';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** classe de cada `<img>` — o cartão da loja a usa no zoom do hover */
  imageClassName?: string;
  /**
   * `cover` preenche a moldura cortando o que sobra (cartão da loja);
   * `contain` mostra a foto inteira (visualização ampliada)
   */
  ajuste?: 'cover' | 'contain';
  /** a foto que aparece primeiro — a miniatura clicada, por exemplo */
  inicial?: number;
  /** botão no canto que abre as fotos em tamanho grande, na que está na frente */
  ampliavel?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Fotos lado a lado, uma por vez.
 *
 * Quem troca de foto é a rolagem nativa com encaixe (`scroll-snap`): no celular
 * o dedo arrasta de graça, sem biblioteca, e o navegador faz a inércia. As
 * setas e as bolinhas só conversam com essa rolagem — a foto atual é a posição
 * dela, e não um estado paralelo que pudesse desencontrar.
 *
 * Com uma foto só não há o que navegar: nem seta, nem bolinha.
 */
function ImageCarousel({
  images,
  alt,
  imageClassName,
  ajuste = 'cover',
  inicial = 0,
  ampliavel = false,
  sx,
}: ImageCarouselProps) {
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(inicial);

  // já abre na foto pedida, sem a animação de rolar até ela
  useLayoutEffect(() => {
    const alvo = trilho.current;
    if (alvo && inicial) alvo.scrollLeft = inicial * alvo.clientWidth;
  }, []);
  const varias = images.length > 1;

  const irPara = (indice: number) => {
    const alvo = trilho.current;
    if (!alvo) return;
    alvo.scrollTo({ left: indice * alvo.clientWidth, behavior: 'smooth' });
  };

  const seta = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    color: '#fff',
    bgcolor: alpha('#000', 0.38),
    backdropFilter: 'blur(4px)',
    opacity: { xs: 1, md: 0 },
    transition: 'opacity .2s ease',
    '&:hover': { bgcolor: alpha('#000', 0.55) },
    '&.Mui-disabled': { display: 'none' },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        // as setas aparecem quando o mouse entra; no celular ficam sempre
        '&:hover .seta-do-carrossel, &:focus-within .seta-do-carrossel': {
          opacity: 1,
        },
        ...sx,
      }}
    >
      <Box
        ref={trilho}
        onScroll={(evento) => {
          const alvo = evento.currentTarget;
          setAtual(Math.round(alvo.scrollLeft / alvo.clientWidth));
        }}
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {images.map((imagem, indice) => (
          <Box
            key={indice}
            component="img"
            src={imagem}
            alt={
              varias ? `${alt} — foto ${indice + 1} de ${images.length}` : alt
            }
            loading="lazy"
            draggable={false}
            className={imageClassName}
            sx={{
              flex: '0 0 100%',
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: ajuste,
              objectPosition: 'center',
              scrollSnapAlign: 'center',
              // `cover` é o corte: preenche a moldura pelo centro, sem deformar
              // nem deixar tarja; a transição é a do zoom de quem o usa
              transition: 'transform .45s ease',
            }}
          />
        ))}
      </Box>

      {ampliavel && (
        <>
          <Tooltip title="Ver em tamanho grande">
            <IconButton
              size="small"
              aria-label="Ver em tamanho grande"
              onClick={(evento) => {
                evento.stopPropagation();
                setAmpliada(atual);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                p: 0.6,
                color: '#fff',
                bgcolor: alpha('#000', 0.45),
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: alpha('#000', 0.65) },
              }}
            >
              <ZoomOutMap sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <ImageViewer
            images={images}
            alt={alt}
            aberta={ampliada}
            onClose={() => setAmpliada(null)}
          />
        </>
      )}

      {varias && (
        <>
          <IconButton
            size="small"
            aria-label="Foto anterior"
            className="seta-do-carrossel"
            disabled={atual === 0}
            onClick={(evento) => {
              // o cartão inteiro pode ser clicável: a seta não é um clique nele
              evento.stopPropagation();
              irPara(atual - 1);
            }}
            sx={{ ...seta, left: 8 }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Próxima foto"
            className="seta-do-carrossel"
            disabled={atual === images.length - 1}
            onClick={(evento) => {
              evento.stopPropagation();
              irPara(atual + 1);
            }}
            sx={{ ...seta, right: 8 }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>

          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              display: 'flex',
              gap: 0.6,
              px: 0.9,
              py: 0.6,
              borderRadius: 999,
              bgcolor: alpha('#000', 0.35),
              backdropFilter: 'blur(4px)',
            }}
          >
            {images.map((_, indice) => (
              <Box
                key={indice}
                component="button"
                type="button"
                aria-label={`Ver foto ${indice + 1}`}
                aria-current={indice === atual}
                onClick={(evento) => {
                  evento.stopPropagation();
                  irPara(indice);
                }}
                sx={{
                  p: 0,
                  border: 'none',
                  cursor: 'pointer',
                  width: indice === atual ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: indice === atual ? '#fff' : alpha('#fff', 0.55),
                  transition: 'width .2s ease, background-color .2s ease',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

interface ImageViewerProps {
  images: string[];
  alt: string;
  /** a foto aberta, ou `null` com a janela fechada */
  aberta: number | null;
  onClose: () => void;
}

/**
 * As fotos em tamanho grande e inteiras (`contain`), sem o corte da moldura do
 * cartão. Fundo escuro: a foto inteira sobra nas bordas, e o escuro some em
 * volta dela em vez de enquadrá-la de branco.
 */
function ImageViewer({ images, alt, aberta, onClose }: ImageViewerProps) {
  return (
    <Dialog
      open={aberta !== null}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      // o clique na janela não pode subir para o cartão que a abriu
      onClick={(evento) => evento.stopPropagation()}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#0b0b12',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', height: { xs: '60vh', md: '72vh' } }}>
        {aberta !== null && (
          <ImageCarousel
            key={aberta}
            images={images}
            alt={alt}
            ajuste="contain"
            inicial={aberta}
            sx={{ position: 'absolute', inset: 0 }}
          />
        )}
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#fff',
            bgcolor: alpha('#000', 0.45),
            '&:hover': { bgcolor: alpha('#000', 0.65) },
          }}
        >
          <Close />
        </IconButton>
      </Box>
    </Dialog>
  );
}

export { ImageCarousel, ImageViewer };
