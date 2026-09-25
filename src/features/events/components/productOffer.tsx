import { ImageCarousel } from '../../../components/imageCarousel';
import {
  alpha,
  Badge,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  EditOutlined,
  LocalMallOutlined,
  ShoppingBagOutlined,
  StorefrontOutlined,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../../utils';
import { AZUL_VIVO, degradeVivo } from '../../../themes';
import { EventProduct } from '../../admin/events/types';
import { temDisponivel } from '../../admin/events/products';
import { VariantPickerDialog } from './variantPickerDialog';

type ItemEscolhido = { variantId: string; quantity: number };

/** Uma linha da sacola, para quem mostra o resumo fora desta tela. */
type LinhaEscolhida = {
  variantId: string;
  produto: string;
  variante: string;
  quantidade: number;
  /** preço unitário */
  preco: number;
};

interface ProductOfferProps {
  products: EventProduct[];
  /** o evento cobra online: muda só o texto do botão de seguir */
  modulePayment: boolean;
  loading: boolean;
  onConfirm: (items: ItemEscolhido[]) => void;
  onSkip: () => void;
  /**
   * Avisa a cada mudança na sacola. Existe para o resumo da inscrição, que
   * fica fora desta tela e precisa somar os produtos ao total dos ingressos;
   * a loja avulsa não passa nada e nada muda para ela.
   */
  onSelecaoChange?: (linhas: LinhaEscolhida[]) => void;
  /** linha em destaque acima do título ("Inscrição confirmada") */
  eyebrow?: string;
  /** capa do evento: com ela a loja abre com a arte do evento, em cartaz */
  coverUrl?: string | null;
  /** logo do evento, na placa sobre a capa */
  logoUrl?: string | null;
  /** nome do evento, o título do cartaz */
  eventName?: string;
  title?: string;
  subtitle?: string;
  skipLabel?: string;
}

/**
 * Vitrine dos produtos do evento: logo depois da inscrição confirmada, ou
 * depois, pela página do evento.
 *
 * É loja, não caixa. A foto é quem ocupa o cartão, o preço vai na etiqueta
 * sobre ela e a conta só aparece na sacola, embaixo — antes a tela abria pelo
 * total e comprar uma camisa parecia quitar boleto.
 *
 * A quantidade é por variante, e não um "escolha o tamanho": a pessoa leva uma
 * camisa P para ela e uma G para o marido na mesma compra.
 */
function ProductOffer({
  products,
  modulePayment,
  loading,
  onConfirm,
  onSkip,
  onSelecaoChange,
  eyebrow,
  coverUrl,
  logoUrl,
  eventName,
  title = 'Produtos do evento',
  subtitle = 'Leve uma lembrança do evento. O valor entra no mesmo pagamento da inscrição.',
  skipLabel = 'Não, obrigado',
}: ProductOfferProps) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const corDoTom = escuro ? theme.palette.primary.main : AZUL_VIVO;
  /**
   * O cartaz segue o tema: no escuro o véu escurece a capa e a letra é branca;
   * no claro ele é um cinza-ardósia e a letra é a do tema. Os dois andam juntos
   * — véu claro com letra branca não se lê em cima de foto nenhuma.
   *
   * O cinza do claro não é quase-branco de propósito: contra a folha branca da
   * página o cartaz precisa de peso próprio, senão a capa some. Ele ainda é
   * claro o bastante para a letra quase-preta do tema passar longe do limite de
   * contraste.
   */
  const fundoDoCartaz = escuro ? '#0B1220' : '#CBD5E1';
  const tintaDoCartaz = escuro ? '#FFFFFF' : theme.palette.text.primary;
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  /** produto com o diálogo de opções aberto */
  const [produtoAberto, setProdutoAberto] = useState<string | null>(null);

  const precoPorVariante = useMemo(() => {
    const mapa = new Map<string, number>();
    products.forEach((produto) =>
      produto.variants.forEach((variante) =>
        mapa.set(variante.id!, produto.price)
      )
    );
    return mapa;
  }, [products]);

  const itens = Object.entries(quantidades)
    .filter(([, quantidade]) => quantidade > 0)
    .map(([variantId, quantity]) => ({ variantId, quantity }));

  const total = itens.reduce(
    (soma, item) =>
      soma + (precoPorVariante.get(item.variantId) ?? 0) * item.quantity,
    0
  );
  const unidades = itens.reduce((soma, item) => soma + item.quantity, 0);

  /**
   * A sacola, escrita por extenso para quem mostra o resumo lá fora. Sai num
   * efeito, e não no clique: o valor muda em três lugares (mais, menos e o
   * diálogo de opções), e avisar em cada um deles é como se perde um.
   */
  useEffect(() => {
    if (!onSelecaoChange) return;

    const linhas: LinhaEscolhida[] = [];
    products.forEach((produto) =>
      produto.variants.forEach((variante) => {
        const quantidade = quantidades[variante.id!] ?? 0;
        if (quantidade <= 0) return;

        linhas.push({
          variantId: variante.id!,
          produto: produto.name,
          variante: variante.name,
          quantidade,
          preco: produto.price,
        });
      })
    );

    onSelecaoChange(linhas);
    // `onSelecaoChange` fora da lista de propósito: a página monta a função a
    // cada render, e incluí-la faria o efeito rodar em laço
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidades, products]);

  const alterar = (variantId: string, delta: number, maximo: number) =>
    setQuantidades((atual) => {
      const proxima = Math.min(
        maximo,
        Math.max(0, (atual[variantId] ?? 0) + delta)
      );
      return { ...atual, [variantId]: proxima };
    });

  /** o que já foi escolhido do produto, para o cartão fechar com o subtotal */
  const escolhidasDoProduto = (produto: EventProduct) =>
    produto.variants.reduce(
      (soma, variante) => soma + (quantidades[variante.id!] ?? 0),
      0
    );

  const styles = {
    faixa: {
      p: { xs: 2, sm: 2.5 },
      mb: { xs: 2, sm: 3 },
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      backgroundImage: degradeVivo(escuro, 120, 0.9),
    },
    cartaz: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 3,
      mb: { xs: 2, sm: 3 },
      minHeight: { xs: 170, sm: 150 },
      display: 'flex',
      alignItems: 'flex-end',
      p: { xs: 2, sm: 3 },
      backgroundImage: `url(${coverUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    /**
     * Dois véus sobre a capa, e não uma cor chapada: um na diagonal, que cobre
     * o lado do texto, e outro subindo do rodapé, onde o texto se apoia. A capa
     * é foto de qualquer coisa — sem isso, o nome do evento some em cima de um
     * céu claro.
     *
     * No claro o véu é mais fechado: letra escura sobre foto exige mais cobertura
     * que letra branca para o contraste se manter.
     */
    veu: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(105deg, ${alpha(
        fundoDoCartaz,
        escuro ? 0.88 : 0.93
      )}, ${alpha(
        fundoDoCartaz,
        escuro ? 0.3 : 0.45
      )} 68%), linear-gradient(to top, ${alpha(
        fundoDoCartaz,
        escuro ? 0.9 : 0.94
      )}, transparent 62%)`,
    },
    // placa de vidro para a logo: o fundo leitoso vale para logo escura e para
    // logo clara, que é o que a capa sozinha não garante. No claro ela é quase
    // branca, que é o fundo para o qual a maioria das logos foi desenhada
    placa: {
      width: { xs: 66, sm: 88 },
      height: { xs: 66, sm: 88 },
      flexShrink: 0,
      p: 1,
      borderRadius: 2.5,
      display: 'grid',
      placeItems: 'center',
      color: tintaDoCartaz,
      bgcolor: alpha('#FFFFFF', escuro ? 0.16 : 0.72),
      backdropFilter: 'blur(8px)',
      boxShadow: `inset 0 0 0 1px ${alpha(
        escuro ? '#FFFFFF' : tintaDoCartaz,
        escuro ? 0.3 : 0.12
      )}`,
    },
    logo: {
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
      filter: escuro ? 'drop-shadow(0 2px 6px rgba(0,0,0,.45))' : 'none',
    },
    sobrenome: {
      display: 'block',
      color: alpha(tintaDoCartaz, escuro ? 0.82 : 0.68),
      fontWeight: 700,
      fontSize: '.6875rem',
      letterSpacing: '.18em',
      lineHeight: 1.6,
    },
    nomeDoEvento: {
      color: tintaDoCartaz,
      fontWeight: 700,
      lineHeight: 1.15,
      overflowWrap: 'anywhere' as const,
      fontSize: { xs: '1.5rem', sm: '2rem' },
      // a sombra é o que descola a letra branca da foto; com letra escura sobre
      // véu claro ela só sujaria o texto
      textShadow: escuro ? '0 2px 14px rgba(0,0,0,.45)' : 'none',
    },
    pilula: {
      px: 1.25,
      py: 0.375,
      borderRadius: 999,
      fontSize: '.75rem',
      fontWeight: 600,
      color: alpha(tintaDoCartaz, escuro ? 0.92 : 0.8),
      bgcolor: alpha('#FFFFFF', escuro ? 0.16 : 0.66),
      backdropFilter: 'blur(6px)',
      boxShadow: `inset 0 0 0 1px ${alpha(
        escuro ? '#FFFFFF' : tintaDoCartaz,
        escuro ? 0.2 : 0.1
      )}`,
    },
    selo: {
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: corDoTom,
      bgcolor: alpha(corDoTom, escuro ? 0.24 : 0.14),
    },
    /**
     * `min(100%, 240px)` no lugar de `240px`: em tela estreita a coluna mínima
     * passava da largura disponível e a grade vazava para o lado.
     */
    grade: {
      display: 'grid',
      gap: { xs: 2, sm: 2.5 },
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
      // `1fr` nas linhas iguala a altura de todos os cartões da grade, e não só
      // dos que estão lado a lado: a fileira de baixo sai do mesmo tamanho da
      // de cima. Quem tem menos tamanhos sobra espaço em vez de encolher
      gridAutoRows: '1fr',
      alignItems: 'stretch',
    },
    cartao: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: 0,
      overflow: 'hidden',
      borderRadius: 3,
      bgcolor: 'background.paperSecondary',
      transition: 'transform .18s ease',
      // levantar o cartão e aproximar a foto são gestos de mouse; no toque só
      // atrapalhariam, por isso ficam do `md` para cima
      '&:hover': { transform: { md: 'translateY(-3px)' } },
      '&:hover .foto-do-produto': { transform: { md: 'scale(1.06)' } },
    },
    /**
     * Altura fixa, e não proporção: a moldura é a mesma em todo cartão, venha a
     * foto quadrada, deitada ou em pé. `flexShrink: 0` porque o cartão é uma
     * coluna flex — sem isso a foto cede altura para o texto do vizinho mais
     * alto e a fileira ficava com molduras de tamanhos diferentes.
     */
    vitrine: {
      position: 'relative',
      height: { xs: 170, sm: 180 },
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      color: 'text.disabled',
      bgcolor: alpha(theme.palette.text.primary, 0.05),
    },
    // etiqueta sobre a foto, como em prateleira: o preço é do produto, não da
    // variante, então ele pertence à imagem e não à lista de tamanhos
    etiqueta: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      px: 1.25,
      py: 0.25,
      borderRadius: 2,
      color: '#FFFFFF',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      bgcolor: alpha('#0B1220', 0.72),
      backdropFilter: 'blur(4px)',
    },
    corpo: { flex: 1, gap: 0.5, p: { xs: 1.5, sm: 2 } },
    // nome comprido para em duas linhas: solto, ele empurrava o cartão inteiro
    // para baixo e a fileira desalinhava
    nomeDoProduto: {
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      overflowWrap: 'anywhere' as const,
    },
    descricao: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      overflowWrap: 'anywhere',
    },
    tamanhos: { display: 'flex', flexWrap: 'wrap', gap: 0.75 },
    // etiqueta do que já foi escolhido — só leitura; quem muda é o diálogo
    chipEscolhido: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1,
      py: 0.625,
      borderRadius: 2,
      fontSize: '.8125rem',
      fontWeight: 600,
      lineHeight: 1,
      color: corDoTom,
      bgcolor: alpha(corDoTom, escuro ? 0.22 : 0.12),
    },
    multiplicador: { fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
    botaoOpcoes: {
      borderRadius: 2,
      textTransform: 'none',
      justifyContent: 'center',
    },
    subtotal: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 1,
      px: { xs: 1.5, sm: 2 },
      py: 1,
      bgcolor: alpha(corDoTom, escuro ? 0.18 : 0.08),
    },
    // a sacola acompanha a rolagem: com vários produtos o botão sumia lá
    // embaixo e a pessoa não sabia quanto já tinha somado
    sacola: {
      position: 'sticky' as const,
      bottom: { xs: 8, sm: 16 },
      zIndex: 2,
      mt: { xs: 2, sm: 3 },
      p: { xs: 1.5, sm: 2 },
      borderRadius: 3,
      backgroundImage: degradeVivo(escuro, 120, 0.5),
    },
  };

  return (
    <Box>
      {/* Com capa, o topo é um cartaz: a arte do evento inteira, o nome grande
          sobre ela e o recado em pílulas. Um bloco só, no lugar da faixa com
          ícone mais a capa — que eram duas apresentações empilhadas. */}
      {coverUrl ? (
        <Paper sx={styles.cartaz}>
          <Box sx={styles.veu} />

          {/* no celular a placa vai por cima do texto: lado a lado, sobrava
              pouco mais de meia tela para o nome do evento */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={{ xs: 1.5, sm: 2.5 }}
            sx={{ position: 'relative', minWidth: 0 }}
          >
            <Box sx={styles.placa}>
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt="Logo do evento"
                  sx={styles.logo}
                />
              ) : (
                <StorefrontOutlined sx={{ fontSize: { xs: 28, sm: 36 } }} />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography component="span" sx={styles.sobrenome}>
                {eyebrow ?? 'LOJA OFICIAL'}
              </Typography>
              <Typography sx={styles.nomeDoEvento}>
                {eventName || title}
              </Typography>

              <Stack
                direction="row"
                gap={0.75}
                sx={{ mt: 1.25, flexWrap: 'wrap' }}
              >
                <Box sx={styles.pilula}>
                  {products.length}{' '}
                  {products.length === 1 ? 'produto' : 'produtos'}
                </Box>
                {subtitle && <Box sx={styles.pilula}>{subtitle}</Box>}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ) : (
        <Paper sx={styles.faixa}>
          <Box sx={styles.selo}>
            <StorefrontOutlined />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            {eyebrow && (
              <Typography
                variant="overline"
                color="success.main"
                sx={{ display: 'block', fontWeight: 600, lineHeight: 1.6 }}
              >
                {eyebrow}
              </Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Paper>
      )}

      <Box sx={styles.grade}>
        {products.map((produto) => {
          const escolhidas = escolhidasDoProduto(produto);
          const noCartao = produto.variants.filter(
            (variante) => (quantidades[variante.id!] ?? 0) > 0
          );
          const semEstoque = !produto.variants.some((variante) =>
            temDisponivel(variante.available)
          );

          return (
            <Paper key={produto.id} sx={styles.cartao}>
              <Box sx={styles.vitrine}>
                {/* até 5 fotos: com mais de uma, o carrossel; o zoom do
                    hover continua valendo para a que está na frente */}
                {produto.images?.length ? (
                  <ImageCarousel
                    images={produto.images}
                    alt={produto.name}
                    imageClassName="foto-do-produto"
                    // preso às bordas da vitrine: ela é um grid que centraliza,
                    // e ali o `height: 100%` não se resolve — o carrossel crescia
                    // até a altura natural da foto e as bolinhas saíam de vista
                    sx={{ position: 'absolute', inset: 0 }}
                  />
                ) : (
                  <ShoppingBagOutlined sx={{ fontSize: 44 }} />
                )}
                <Box sx={styles.etiqueta}>{formatCurrency(produto.price)}</Box>
              </Box>

              <Stack sx={styles.corpo}>
                <Typography
                  fontWeight={600}
                  title={produto.name}
                  sx={styles.nomeDoProduto}
                >
                  {produto.name}
                </Typography>

                {produto.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    title={produto.description}
                    sx={styles.descricao}
                  >
                    {produto.description}
                  </Typography>
                )}

                {/* As opções saíram do cartão e foram para o diálogo: o
                    cartão fica só com o que foi escolhido, e produto de oito
                    tamanhos deixa de esticar a grade inteira.

                    Vale para qualquer quantidade de variantes, inclusive uma.
                    O atalho que existia aqui — produto de opção única com o
                    contador direto no cartão — fazia dois cartões vizinhos se
                    comportarem de formas diferentes ao mesmo clique, e o da
                    esquerda ensinava errado o da direita. */}
                <Stack sx={{ mt: 'auto', pt: 1, gap: 1 }}>
                  {noCartao.length > 0 && (
                    <Box sx={styles.tamanhos}>
                      {noCartao.map((variante) => (
                        <Box key={variante.id} sx={styles.chipEscolhido}>
                          {variante.name}
                          <Box
                            component="span"
                            sx={styles.multiplicador}
                          >{`×${quantidades[variante.id!]}`}</Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Button
                    fullWidth
                    size="small"
                    variant={escolhidas > 0 ? 'text' : 'outlined'}
                    disabled={loading || semEstoque}
                    startIcon={
                      escolhidas > 0 ? (
                        <EditOutlined fontSize="small" />
                      ) : (
                        <LocalMallOutlined fontSize="small" />
                      )
                    }
                    onClick={() => setProdutoAberto(produto.id!)}
                    sx={styles.botaoOpcoes}
                  >
                    {semEstoque
                      ? 'Esgotado'
                      : escolhidas > 0
                        ? 'Alterar escolha'
                        : 'Adicionar à sacola'}
                  </Button>
                </Stack>
              </Stack>

              {escolhidas > 0 && (
                <Box sx={styles.subtotal}>
                  <Typography variant="body2" color="text.secondary">
                    {escolhidas} {escolhidas === 1 ? 'unidade' : 'unidades'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(produto.price * escolhidas)}
                  </Typography>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      <Paper sx={styles.sacola}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{ minWidth: 0 }}
          >
            <Badge badgeContent={unidades} color="primary" overlap="circular">
              <Box sx={styles.selo}>
                <LocalMallOutlined />
              </Box>
            </Badge>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {unidades === 0
                  ? 'Sua sacola está vazia'
                  : `${unidades} ${
                      unidades === 1 ? 'item' : 'itens'
                    } na sacola`}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(total)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} gap={1}>
            <Button
              variant="text"
              color="inherit"
              onClick={onSkip}
              disabled={loading}
              sx={{ color: 'text.secondary' }}
            >
              {skipLabel}
            </Button>
            <Button
              variant="contained"
              disabled={unidades === 0 || loading}
              onClick={() => onConfirm(itens)}
              sx={{ minWidth: { sm: 220 } }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : modulePayment ? (
                'Finalizar compra'
              ) : (
                'Confirmar compra'
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <VariantPickerDialog
        produto={products.find((p) => p.id === produtoAberto) ?? null}
        quantidades={quantidades}
        loading={loading}
        onAlterar={alterar}
        onClose={() => setProdutoAberto(null)}
      />
    </Box>
  );
}

export { ProductOffer };
