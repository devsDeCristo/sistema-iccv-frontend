import { ReactNode, useContext } from 'react';
import {
  alpha,
  Box,
  darken,
  decomposeColor,
  lighten,
  Card,
  CardContent,
  Skeleton,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { sombraSuperficie } from '../../themes';
import { CORES_DO_MODULO } from '../../constants/identidadeDosModulos';
import { ModuloAtual } from '../temaDoModulo/moduloAtual';

/**
 * A cor do módulo levada para outro matiz, com a saturação e a luz dela — o
 * vermelho e o laranja dos cards de problema, mas da família do módulo. A luz
 * fica numa faixa (e a saturação num mínimo) para o resultado ainda se ler como
 * vermelho ou laranja: a primária escura do Eventos daria um vinho quase preto,
 * e a terciária clara do Membros, um salmão sem força.
 */
function noMatiz(cor: string, matiz: number, escuro: boolean) {
  const [r, g, b] = decomposeColor(cor).values.map((v) => v / 255);
  const maior = Math.max(r, g, b);
  const menor = Math.min(r, g, b);
  const luz = (maior + menor) / 2;
  const delta = maior - menor;
  const saturacao = delta === 0 ? 0 : delta / (1 - Math.abs(2 * luz - 1));
  const [minimo, maximo] = escuro ? [0.62, 0.72] : [0.36, 0.48];
  const l = Math.min(Math.max(luz, minimo), maximo);
  const s = Math.max(saturacao, 0.65);
  return `hsl(${matiz}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Matizes dos cards de problema: cancelado/falha e atenção */
const VERMELHO = 356;
const LARANJA = 28;

export interface StatusCard {
  title: string;
  /** Número ou valor já formatado (dinheiro, por exemplo) */
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  /**
   * Cor de destaque do card — sempre um token do tema. Dentro de um módulo ela
   * não vale: o card leva uma variação das cores do módulo (ver `StatusCards`).
   */
  color: string;
  /** Pinta o ponto de status como sinal vivo, pulsando */
  live?: boolean;
  /** Valor menor, para texto longo como dinheiro não estourar a largura */
  compact?: boolean;
}

interface StatusCardsProps {
  cards: StatusCard[];
  isLoading?: boolean;
  /**
   * Espaçamento da régua. O padrão deixa um vão embaixo, que é o que as telas
   * de listagem querem; quem tem outro elemento colado embaixo passa `mb: 0`.
   */
  sx?: SxProps<Theme>;
}

/**
 * Régua de cards de estado, usada no topo das telas de listagem.
 *
 * Compartilhada de propósito: Eventos e Usuários mostram contagens diferentes,
 * mas o cartão é o mesmo objeto visual. Duplicar o estilo faria os dois
 * divergirem no primeiro ajuste.
 *
 * **O cartão é deliberadamente baixo.** Ele é o que fica entre o cabeçalho e a
 * tabela em toda listagem do sistema, e altura aqui sai da lista — que é o que
 * a pessoa veio ver. O número já foi 39px e o conteúdo carregava o padding
 * padrão do MUI (16px em volta, 24px embaixo): o conjunto empurrava a primeira
 * linha da tabela para fora da dobra em tela de notebook. A hierarquia que
 * importa é rótulo pequeno, número grande, legenda pequena — e ela se mantém
 * com o número em 30px.
 */
export function StatusCards({
  cards: recebidos,
  isLoading,
  sx,
}: StatusCardsProps) {
  const theme = useTheme();
  const modulo = useContext(ModuloAtual);

  /**
   * Dentro de um módulo, os cards são variações das cores dele, pela ordem:
   * primária, secundária, terciária e, do quarto em diante, a primária e a
   * terciária mais claras (mais fechadas no escuro, onde as cores do módulo já
   * são claras). Antes cada tela pintava com as cores dos chips de status
   * (sucesso, alerta, pendente...), e a régua saía com cores sem relação com o
   * módulo nem entre si. Fora dos módulos (Início, Usuários, Logs), vale a cor
   * que a tela passou.
   *
   * O card de problema não perde o aviso: quem veio com a cor de cancelado
   * (`chips.canceled`) fica num vermelho, e quem veio com a de atenção
   * (`chips.alert`), num laranja — os dois tirados das cores do módulo
   * (`noMatiz`), e não o vermelho e o laranja puros dos chips.
   */
  const escuro = theme.palette.mode === 'dark';
  const doModulo =
    modulo && CORES_DO_MODULO[modulo][escuro ? 'escuro' : 'claro'];
  const variar = (cor: string) =>
    escuro ? darken(cor, 0.3) : lighten(cor, 0.3);
  const paleta = doModulo && [
    doModulo.primaria,
    doModulo.secundaria,
    doModulo.terciaria,
    variar(doModulo.primaria),
    variar(doModulo.terciaria),
  ];
  const corNoModulo = (cor: string, indice: number) => {
    if (!doModulo || !paleta) return cor;
    if (cor === theme.palette.chips.canceled)
      return noMatiz(doModulo.primaria, VERMELHO, escuro);
    if (cor === theme.palette.chips.alert)
      return noMatiz(doModulo.secundaria, LARANJA, escuro);
    return paleta[indice % paleta.length];
  };
  const cards = recebidos.map((card, indice) => ({
    ...card,
    color: corNoModulo(card.color, indice),
  }));

  /**
   * A régua divide a linha pelo número de cards, até cinco lado a lado.
   *
   * Grid do CSS e não o `Grid` do MUI: o do MUI reparte doze colunas, e cinco
   * cards não cabem em doze sem fração. Com `repeat(n, 1fr)` a conta é direta e
   * a régua atende qualquer quantidade.
   *
   * Com cinco cards o passo do meio fica em três colunas: em tela média, cinco
   * na mesma linha espremem o número e o rótulo até virar reticências.
   */
  const colunas = Math.min(cards.length, 5);
  const colunasMd = colunas === 5 ? 3 : colunas;

  return (
    <Box
      sx={[
        {
          display: 'grid',
          gap: { xs: 1, sm: 1.5 },
          // `minmax(0, 1fr)` e não `1fr`: o `1fr` não encolhe abaixo do texto
          // mais longo do card, e no celular uma legenda comprida ("Menores
          // aguardando autorização") empurrava a coluna para fora da tela.
          // Com o mínimo em 0 a coluna cabe e o texto corta com reticências.
          gridTemplateColumns: {
            // dois por linha já no celular: um por linha empilhava quatro
            // cards e empurrava a lista para três telas abaixo
            xs: colunas > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            sm: `repeat(${Math.min(colunas, 2)}, minmax(0, 1fr))`,
            md: `repeat(${colunasMd}, minmax(0, 1fr))`,
            lg: `repeat(${colunas}, minmax(0, 1fr))`,
          },
          mb: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {cards.map((card) => (
        <Box
          key={card.title}
          sx={{
            // número ímpar de cards em duas colunas: o último ocupa a linha
            // toda, em vez de sobrar meio card solto
            '&:last-of-type:nth-of-type(odd)': {
              gridColumn: { xs: 'span 2', md: 'auto' },
            },
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: '100%',
              // 12px: o raio padrão do Paper no tema é 8px e deixava o card
              // duro perto do número em 44px
              borderRadius: 3,
              /**
               * Aro na cor do card em vez de `border`: mesma leitura, mas feito
               * com box-shadow, então empilha com a sombra da superfície e não
               * volta a ser borda.
               */
              boxShadow: `0 0 0 1px ${alpha(card.color, 0.28)}, ${sombraSuperficie(
                theme.palette.mode === 'dark'
              )}`,
              /**
               * A tinta da cor entra como gradiente sobre o paper do tema, em
               * vez de cor cheia: o card ganha identidade sem virar um bloco
               * chapado, e continua sendo o `paper` do sistema por baixo.
               */
              backgroundImage: `linear-gradient(160deg, ${alpha(
                card.color,
                0.13
              )}, transparent 72%)`,
              transition: theme.transitions.create(
                ['transform', 'box-shadow'],
                { duration: theme.transitions.duration.shorter }
              ),
              '&:hover': {
                transform: 'translateY(-3px)',
                // o aro se mantém no hover; só a sombra cresce na cor do card
                boxShadow: `0 0 0 1px ${alpha(
                  card.color,
                  0.4
                )}, 0 10px 26px -6px ${alpha(card.color, 0.3)}`,
              },
            }}
          >
            <CardContent
              /**
               * Padding próprio, e não o do MUI: o padrão é 16px em volta e
               * 24px embaixo no último filho, o que sozinho respondia por um
               * quinto da altura do cartão. A régua fica acima de toda
               * listagem do sistema — cada pixel aqui é pixel que a tabela
               * perde.
               */
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                '&:last-child': { pb: { xs: 1.25, sm: 1.5 } },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: card.color,
                    boxShadow: `0 0 0 4px ${alpha(card.color, 0.22)}`,
                    // o pulso é reservado para o que muda sozinho na tela
                    ...(card.live && {
                      '@keyframes pulsarStatus': {
                        '0%': { boxShadow: `0 0 0 0 ${alpha(card.color, 0.5)}` },
                        '70%': {
                          boxShadow: `0 0 0 9px ${alpha(card.color, 0)}`,
                        },
                        '100%': {
                          boxShadow: `0 0 0 0 ${alpha(card.color, 0)}`,
                        },
                      },
                      animation: 'pulsarStatus 2s ease-out infinite',
                      // quem pediu menos movimento no sistema não leva pulso
                      '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                      },
                    }),
                  }}
                />
                <Typography
                  noWrap
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}
                  color="text.secondary"
                >
                  {card.title}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                mt={0.75}
              >
                {isLoading ? (
                  <Skeleton variant="rounded" width={56} height={32} />
                ) : (
                  <Typography
                    noWrap
                    sx={{
                      fontSize: card.compact
                        ? { xs: '16px', sm: '22px' }
                        : { xs: '22px', sm: '30px' },
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      // sem isto o número dança de largura entre 1 e 4 dígitos
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {card.value}
                  </Typography>
                )}

                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 24, sm: 30 },
                    height: { xs: 24, sm: 30 },
                    borderRadius: { xs: '7px', sm: '9px' },
                    '& svg': { fontSize: { xs: 16, sm: 20 } },
                    bgcolor: card.color,
                    // branco, ou escuro onde a cor é clara (as do módulo no
                    // tema escuro): o ícone não some no quadrado
                    color: theme.palette.getContrastText(card.color),
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>

              <Typography
                noWrap
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
