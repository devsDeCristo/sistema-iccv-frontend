import {
  alpha,
  darken,
  Box,
  ButtonBase,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { ArrowForward, Storefront } from '@mui/icons-material';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';
import { formatCurrency } from '../../../utils';
import { EventProduct } from '../../admin/events/types';
import { capaDoProduto } from '../../admin/events/products';

interface StoreCardProps {
  /** só os que ainda têm o que vender */
  produtos: EventProduct[];
  onClick: () => void;
  sx?: SxProps<Theme>;
}

/** quantas fotos entram no leque: mais que isso vira um monte, não vitrine */
const FOTOS_NO_LEQUE = 3;

/**
 * A loja na fileira das fichas da página do evento.
 *
 * Não é uma ficha: as fichas informam, e este card vende. Por isso tem outro
 * corpo — degradê cheio, as fotos dos produtos em leque e o menor preço à
 * vista —, e não a superfície de vidro das outras. A ficha com a seta, e antes
 * dela o botão de vidro no cartaz, lia-se como mais um dado da página.
 *
 * O degradê é o azul-violeta do sistema, e não a cor do evento: um amarelo
 * cadastrado ali apagaria o texto branco.
 */
function StoreCard({ produtos, onClick, sx }: StoreCardProps) {
  const fotos = produtos
    .map(capaDoProduto)
    .filter((imagem): imagem is string => !!imagem)
    .slice(0, FOTOS_NO_LEQUE);

  const menorPreco = Math.min(...produtos.map((produto) => produto.price));
  const titulo =
    produtos.length === 1
      ? produtos[0].name
      : `${produtos.length} produtos à venda`;

  const styles = {
    card: {
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: { xs: 1.75, sm: 2 },
      pr: { xs: 1.5, sm: 2 },
      borderRadius: 2,
      textAlign: 'left',
      color: '#fff',
      // o par do sistema, escurecido: cru, ele gritava mais que a página
      backgroundImage: `linear-gradient(120deg, ${darken(AZUL_VIVO, 0.3)} 0%, ${darken(
        VIOLETA_VIVO,
        0.35
      )} 100%)`,
      boxShadow: `0 16px 34px -18px ${alpha(VIOLETA_VIVO, 0.5)}`,
      transition: 'transform 220ms ease, box-shadow 220ms ease',
      '&:hover, &:focus-visible': {
        transform: 'translateY(-3px)',
        boxShadow: `0 22px 40px -18px ${alpha(VIOLETA_VIVO, 0.65)}`,
      },
      // no hover o leque abre e a seta anda: o card inteiro responde, e não
      // só o botão dentro dele
      '&:hover .foto-0, &:focus-visible .foto-0': {
        transform: 'translateX(-14px) rotate(-14deg)',
      },
      '&:hover .foto-2, &:focus-visible .foto-2': {
        transform: 'translateX(14px) rotate(14deg)',
      },
      '&:hover .ver-loja, &:focus-visible .ver-loja': {
        '& svg': { transform: 'translateX(3px)' },
      },
    },
    /** duas luzes nos cantos: dão volume sem imagem de fundo */
    brilho: {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    selo: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1,
      py: 0.25,
      borderRadius: 999,
      fontSize: 10.5,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      backgroundColor: alpha('#fff', 0.18),
      border: `1px solid ${alpha('#fff', 0.3)}`,
    },
    verLoja: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      flexShrink: 0,
      px: 1.5,
      py: 0.5,
      borderRadius: 999,
      fontSize: '0.8125rem',
      fontWeight: 800,
      color: VIOLETA_VIVO,
      backgroundColor: '#fff',
      '& svg': { fontSize: 16, transition: 'transform 220ms ease' },
    },
    leque: {
      position: 'relative',
      flexShrink: 0,
      width: 104,
      height: 88,
      display: 'grid',
      placeItems: 'center',
    },
    foto: {
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: 1.5,
      objectFit: 'cover',
      backgroundColor: '#fff',
      border: '2px solid #fff',
      boxShadow: `0 8px 18px -6px ${alpha('#000', 0.45)}`,
      transition: 'transform 260ms ease',
    },
  };

  /** posição de cada foto no leque, da de trás para a da frente */
  const inclinacao = (indice: number) => {
    if (fotos.length === 1) return 'rotate(-4deg)';
    if (fotos.length === 2) {
      return indice === 0
        ? 'translateX(-10px) rotate(-9deg)'
        : 'translateX(10px) rotate(6deg)';
    }
    return [
      'translateX(-10px) rotate(-10deg)',
      'rotate(0deg)',
      'translateX(10px) rotate(10deg)',
    ][indice];
  };

  return (
    <ButtonBase
      onClick={onClick}
      sx={{ ...styles.card, ...sx } as SxProps<Theme>}
    >
      <Box
        sx={{
          ...styles.brilho,
          top: -70,
          right: -40,
          width: 180,
          height: 180,
          backgroundImage: `radial-gradient(circle, ${alpha('#fff', 0.16)}, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          ...styles.brilho,
          bottom: -90,
          left: -50,
          width: 160,
          height: 160,
          backgroundImage: `radial-gradient(circle, ${alpha('#fff', 0.08)}, transparent 70%)`,
        }}
      />

      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <Box sx={styles.selo}>
          <Storefront sx={{ fontSize: 13 }} />
          Loja do evento
        </Box>

        <Typography
          sx={{
            mt: 0.75,
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.25,
            // nome de produto costuma ser comprido: duas linhas, não mais
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {titulo}
        </Typography>

        <Box
          sx={{
            mt: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{ fontSize: '0.8125rem', color: alpha('#fff', 0.85) }}
          >
            a partir de{' '}
            <Box component="span" sx={{ fontWeight: 800, color: '#fff' }}>
              {formatCurrency(menorPreco)}
            </Box>
          </Typography>
          <Box className="ver-loja" sx={styles.verLoja}>
            Ver loja
            <ArrowForward />
          </Box>
        </Box>
      </Box>

      {/* sem foto cadastrada, o ícone faz as vezes da vitrine */}
      <Box sx={styles.leque}>
        {fotos.length ? (
          fotos.map((foto, indice) => (
            <Box
              key={indice}
              component="img"
              src={foto}
              alt=""
              className={`foto-${indice}`}
              sx={{ ...styles.foto, transform: inclinacao(indice) }}
            />
          ))
        ) : (
          <Storefront sx={{ fontSize: 44, color: alpha('#fff', 0.9) }} />
        )}
      </Box>
    </ButtonBase>
  );
}

export { StoreCard };
