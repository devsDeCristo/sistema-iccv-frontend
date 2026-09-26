import {
  ImageCarousel,
  ImageViewer,
} from '../../../../components/imageCarousel';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  AddPhotoAlternateOutlined,
  DeleteOutline,
  ExpandMore,
  ShoppingBagOutlined,
  Close,
  StarOutline,
} from '@mui/icons-material';
import { useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Input } from '../../../../components/input';
import {
  formatCurrency,
  sanitizeInteger,
  sanitizePrice,
} from '../../../../utils';
import { reduzirFotoParaDataUrl } from '../../../../utils/image';
import { EventProduct, ProductsFormType } from '../types';
import {
  TAMANHO_MAXIMO_DA_FOTO,
  produtoVazio,
  MAXIMO_DE_FOTOS,
  capaDoProduto,
} from '../products';

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

const vendidosDoProduto = (produto: EventProduct) =>
  produto.variants.reduce((total, variante) => total + (variante.sold ?? 0), 0);

type CartaoProdutoProps = {
  index: number;
  produto: EventProduct;
  expandido: boolean;
  onAlternar: () => void;
  onRemover: () => void;
  onAdicionarVariante: () => void;
  onRemoverVariante: (indexVariante: number) => void;
};

/**
 * Um produto por acordeão, no mesmo desenho dos grupos de inscrição: o
 * cabeçalho resume (foto, nome, preço, variantes, vendidos) e o corpo abre o
 * cadastro.
 */
function CartaoProduto({
  index,
  produto,
  expandido,
  onAlternar,
  onRemover,
  onAdicionarVariante,
  onRemoverVariante,
}: CartaoProdutoProps) {
  const theme = useTheme();
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductsFormType>();
  const entradaDaFoto = useRef<HTMLInputElement>(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);

  const variantes = produto.variants ?? [];
  const vendidos = vendidosDoProduto(produto);
  const foiVendido = vendidos > 0;
  const errosDoProduto = errors.products?.[index];

  const fotos = produto.images ?? [];
  const cabemMais = fotos.length < MAXIMO_DE_FOTOS;
  /** a foto aberta em tamanho grande, ou `null` com a visualização fechada */
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const trocarFotos = (novas: string[]) =>
    setValue(`products.${index}.images`, novas, { shouldDirty: true });

  /** Várias de uma vez, até completar as 5; a primeira da lista é a capa */
  async function aoEscolherFotos(arquivos?: FileList | null) {
    const escolhidos = Array.from(arquivos ?? []);
    if (!escolhidos.length) return;

    const atuais = getValues(`products.${index}.images`) ?? [];
    const vagas = MAXIMO_DE_FOTOS - atuais.length;
    if (escolhidos.length > vagas) {
      toast.info(
        `Cada produto tem até ${MAXIMO_DE_FOTOS} fotos: entraram só ${Math.max(vagas, 0)}.`
      );
    }

    setProcessandoFoto(true);
    try {
      const reduzidas: string[] = [];
      for (const arquivo of escolhidos.slice(0, Math.max(vagas, 0))) {
        const foto = await reduzirFotoParaDataUrl(arquivo);
        if (foto.length > TAMANHO_MAXIMO_DA_FOTO) {
          toast.error(
            `"${arquivo.name}" continua grande demais. Tente outra imagem.`
          );
          continue;
        }
        reduzidas.push(foto);
      }
      if (reduzidas.length) trocarFotos([...atuais, ...reduzidas]);
    } catch {
      toast.error(
        'Não foi possível ler uma das imagens. Use PNG, JPG ou WebP.'
      );
    } finally {
      setProcessandoFoto(false);
      // limpa o input: escolher a mesma foto de novo precisa disparar o change
      if (entradaDaFoto.current) entradaDaFoto.current.value = '';
    }
  }

  const styles = {
    cartao: {
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
      borderRadius: 2,
      '&:first-of-type, &:last-of-type': { borderRadius: 2 },
      '&:before': { display: 'none' },
    },
    resumo: {
      '& .MuiAccordionSummary-content': {
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        minWidth: 0,
        my: 1,
        mr: 1,
      },
      '& .MuiAccordionSummary-expandIconWrapper': {
        flexShrink: 0,
      },
    },
    miniatura: {
      width: 36,
      height: 36,
      borderRadius: 1.5,
      flexShrink: 0,
      objectFit: 'cover' as const,
      display: 'grid',
      placeItems: 'center',
      bgcolor: alpha(theme.palette.text.primary, 0.06),
      color: 'text.secondary',
    },
    foto: {
      position: 'relative',
      width: { xs: '100%', sm: 148 },
      aspectRatio: '1 / 1',
      borderRadius: 2,
      overflow: 'hidden',
      border: `1px dashed ${theme.palette.divider}`,
      bgcolor: alpha(theme.palette.text.primary, 0.03),
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      // a área inteira é o botão de escolher; o foco precisa aparecer
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
    },
    miniaturas: {
      mt: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 0.5,
    },
    miniaturaDaFoto: {
      position: 'relative',
      cursor: 'zoom-in',
      aspectRatio: '1 / 1',
      borderRadius: 1,
      overflow: 'hidden',
      border: `1px solid ${theme.palette.divider}`,
      // as ações aparecem por cima quando o mouse entra; no toque, sempre
      '&:hover .acoes-da-foto, &:focus-within .acoes-da-foto': { opacity: 1 },
    },
    acoesDaFoto: {
      position: 'absolute',
      inset: 0,
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      opacity: { xs: 1, md: 0 },
      transition: 'opacity .15s ease',
      bgcolor: alpha('#000', 0.28),
      '& .MuiIconButton-root': {
        p: 0.25,
        m: 0.25,
        color: '#fff',
        bgcolor: alpha('#000', 0.45),
        '&:hover': { bgcolor: alpha('#000', 0.65) },
      },
    },
    miniaturaCapa: {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    adicionarFoto: {
      aspectRatio: '1 / 1',
      p: 0,
      borderRadius: 1,
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center',
      color: 'primary.main',
      border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
      bgcolor: alpha(theme.palette.primary.main, 0.04),
      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
      '&:disabled': { opacity: 0.5, cursor: 'default' },
    },
    linhaVariante: {
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
      bgcolor: alpha(theme.palette.text.primary, 0.02),
    },
    semVariantes: {
      p: 2,
      borderRadius: 2,
      border: `1px dashed ${theme.palette.divider}`,
      textAlign: 'center',
    },
  };

  return (
    <Accordion
      expanded={expandido}
      onChange={onAlternar}
      disableGutters
      sx={styles.cartao}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={styles.resumo}>
        {capaDoProduto(produto) ? (
          <Box
            component="img"
            src={capaDoProduto(produto)!}
            alt=""
            sx={styles.miniatura}
          />
        ) : (
          <Box sx={styles.miniatura}>
            <ShoppingBagOutlined fontSize="small" />
          </Box>
        )}

        <Typography
          fontWeight={600}
          sx={{
            minWidth: 0,
            flex: '1 1 160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {produto.name?.trim() || `Produto ${index + 1}`}
        </Typography>

        {typeof produto.price === 'number' && (
          <Chip
            size="small"
            variant="outlined"
            label={formatCurrency(produto.price)}
          />
        )}
        <Chip
          size="small"
          variant="outlined"
          label={plural(variantes.length, 'variante', 'variantes')}
          color={variantes.length ? 'default' : 'warning'}
        />
        {foiVendido && (
          <Chip
            size="small"
            variant="outlined"
            color="warning"
            label={plural(vendidos, 'vendido', 'vendidos')}
          />
        )}

        <Tooltip
          title={
            foiVendido
              ? 'Produto já vendido não pode ser removido'
              : 'Remover produto'
          }
        >
          <span>
            <IconButton
              size="small"
              disabled={foiVendido}
              aria-label="Remover produto"
              onClick={(event) => {
                event.stopPropagation();
                onRemover();
              }}
              sx={{ '&:hover': { color: theme.palette.error.main } }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, mt: 1, minWidth: 0, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 148 } }}>
            {fotos.length && !processandoFoto ? (
              // as fotos passam uma a uma, como na loja; ampliar abre todas em
              // tamanho grande e inteiras, sem o corte da moldura
              <Box
                sx={{ ...styles.foto, cursor: 'default', borderStyle: 'solid' }}
              >
                <ImageCarousel
                  images={fotos}
                  alt={produto.name || 'Foto do produto'}
                  ampliavel
                  sx={{ position: 'absolute', inset: 0 }}
                />
              </Box>
            ) : (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Adicionar fotos"
                sx={styles.foto}
                onClick={() => entradaDaFoto.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    entradaDaFoto.current?.click();
                  }
                }}
              >
                {processandoFoto ? (
                  <CircularProgress size={24} />
                ) : (
                  <Stack alignItems="center" gap={0.5} sx={{ p: 1 }}>
                    <AddPhotoAlternateOutlined color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Adicionar fotos
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      até {MAXIMO_DE_FOTOS}
                    </Typography>
                  </Stack>
                )}
              </Box>
            )}
            <input
              ref={entradaDaFoto}
              type="file"
              hidden
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => aoEscolherFotos(event.target.files)}
            />

            {fotos.length > 0 && (
              <>
                <Box sx={styles.miniaturas}>
                  {fotos.map((foto, indiceDaFoto) => (
                    <Box
                      key={indiceDaFoto}
                      sx={{
                        ...styles.miniaturaDaFoto,
                        ...(indiceDaFoto === 0 && styles.miniaturaCapa),
                      }}
                      onClick={() => setAmpliada(indiceDaFoto)}
                    >
                      <Box
                        component="img"
                        src={foto}
                        alt=""
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Stack
                        direction="row"
                        className="acoes-da-foto"
                        sx={styles.acoesDaFoto}
                      >
                        {indiceDaFoto > 0 && (
                          <Tooltip title="Tornar capa">
                            <IconButton
                              size="small"
                              aria-label="Tornar capa"
                              onClick={(event) => {
                                // o clique é do botão, não da miniatura
                                event.stopPropagation();
                                trocarFotos([
                                  foto,
                                  ...fotos.filter((_, i) => i !== indiceDaFoto),
                                ]);
                              }}
                            >
                              <StarOutline sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remover foto">
                          <IconButton
                            size="small"
                            aria-label="Remover foto"
                            onClick={(event) => {
                              event.stopPropagation();
                              trocarFotos(
                                fotos.filter((_, i) => i !== indiceDaFoto)
                              );
                            }}
                          >
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  ))}
                  {/* o lugar de pôr mais fotos, à vista: clicar na capa também
                      abre a escolha, mas ninguém adivinha isso */}
                  {cabemMais && (
                    <Tooltip title="Adicionar fotos">
                      <Box
                        component="button"
                        type="button"
                        aria-label="Adicionar fotos"
                        disabled={processandoFoto}
                        onClick={() => entradaDaFoto.current?.click()}
                        sx={styles.adicionarFoto}
                      >
                        <Add sx={{ fontSize: 18 }} />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {fotos.length} de {MAXIMO_DE_FOTOS} fotos · a primeira é a
                  capa
                </Typography>
              </>
            )}

            {/* as miniaturas abrem a mesma janela, já na foto clicada */}
            <ImageViewer
              images={fotos}
              alt={produto.name || 'Foto do produto'}
              aberta={ampliada}
              onClose={() => setAmpliada(null)}
            />
          </Box>

          <Grid
            container
            spacing={2}
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: '100%', sm: 'auto' },
              m: { xs: 0, sm: undefined },
              alignContent: 'flex-start',
            }}
          >
            <Grid item xs={12} sm={8}>
              <Controller
                control={control}
                name={`products.${index}.name`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    size="small"
                    required
                    label="Nome do produto"
                    placeholder="Ex: Camisa do evento"
                    value={value ?? ''}
                    onChange={onChange}
                    error={Boolean(errosDoProduto?.name)}
                    errorMessage={errosDoProduto?.name?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                control={control}
                name={`products.${index}.price`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    size="small"
                    required
                    type="number"
                    label="Preço"
                    placeholder="0,00"
                    value={value ?? ''}
                    onChange={(e) => {
                      const digitado = e.target.value;
                      onChange(digitado ? sanitizePrice(digitado) : null);
                    }}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    error={Boolean(errosDoProduto?.price)}
                    errorMessage={errosDoProduto?.price?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name={`products.${index}.description`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    size="small"
                    multiline
                    minRows={2}
                    label="Descrição (opcional)"
                    placeholder="Ex: Malha 100% algodão, estampa frente e costas"
                    value={value ?? ''}
                    onChange={onChange}
                    inputProps={{ maxLength: 300 }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Stack>

        {foiVendido && (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{ mt: 2, bgcolor: alpha(theme.palette.warning.main, 0.08) }}
          >
            Este produto já foi vendido: ele e as variantes vendidas não podem
            ser removidos. Mudar o preço não altera o que já foi comprado.
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          gap={1}
          sx={{ mt: 3, mb: 1.5 }}
        >
          <Box>
            <Typography variant="subtitle2">Variantes</Typography>
            <Typography variant="caption" color="text.secondary">
              Tamanhos, cores ou modelos. O preço é o mesmo para todas.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={onAdicionarVariante}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            Adicionar variante
          </Button>
        </Stack>

        {errosDoProduto?.variants?.message && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mb: 1 }}
          >
            {errosDoProduto.variants.message}
          </Typography>
        )}

        {variantes.length === 0 ? (
          <Box sx={styles.semVariantes}>
            <Typography variant="body2" color="text.secondary">
              Sem variante o produto não pode ser comprado. Se não há escolha a
              fazer, crie uma só — por exemplo, “Único”.
            </Typography>
          </Box>
        ) : (
          <Stack gap={1.5}>
            {variantes.map((variante, indexVariante) => {
              const errosDaVariante = errosDoProduto?.variants?.[indexVariante];
              const vendidosDaVariante = variante.sold ?? 0;
              const abaixoDoVendido =
                variante.stock !== null &&
                variante.stock !== undefined &&
                variante.stock < vendidosDaVariante;

              return (
                <Box
                  key={variante.id ?? `variante-${indexVariante}`}
                  sx={styles.linhaVariante}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'flex-start' }}
                    gap={2}
                  >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Controller
                        control={control}
                        name={`products.${index}.variants.${indexVariante}.name`}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            size="small"
                            required
                            label="Variante"
                            placeholder="Ex: P, M, G ou Único"
                            value={value ?? ''}
                            onChange={onChange}
                            error={Boolean(errosDaVariante?.name)}
                            errorMessage={errosDaVariante?.name?.message}
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ width: { xs: '100%', sm: 170 }, flexShrink: 0 }}>
                      <Controller
                        control={control}
                        name={`products.${index}.variants.${indexVariante}.stock`}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            size="small"
                            label="Estoque"
                            placeholder="Sem limite"
                            value={value ?? ''}
                            onChange={(e) => {
                              const limpo = sanitizeInteger(e.target.value);
                              // vazio é sem limite, e não zero: zero esgotaria
                              onChange(limpo === '' ? null : Number(limpo));
                            }}
                            error={Boolean(errosDaVariante?.stock)}
                            errorMessage={
                              errosDaVariante?.stock?.message ??
                              (abaixoDoVendido
                                ? `Abaixo do já vendido (${vendidosDaVariante}): a venda para`
                                : undefined)
                            }
                            FormHelperTextProps={{
                              sx: abaixoDoVendido
                                ? { color: 'warning.main' }
                                : undefined,
                            }}
                            inputProps={{ inputMode: 'numeric' }}
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      />
                    </Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={0.5}
                      sx={{ flexShrink: 0, pt: { sm: 0.5 } }}
                    >
                      {vendidosDaVariante > 0 && (
                        <Tooltip title="Unidades vendidas">
                          <Chip
                            size="small"
                            variant="outlined"
                            color="warning"
                            label={vendidosDaVariante}
                          />
                        </Tooltip>
                      )}
                      <Tooltip
                        title={
                          vendidosDaVariante > 0
                            ? 'Variante vendida não pode ser removida'
                            : 'Remover variante'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Remover variante"
                            disabled={vendidosDaVariante > 0}
                            onClick={() => onRemoverVariante(indexVariante)}
                            sx={{
                              '&:hover': { color: theme.palette.error.main },
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

function FormProducts() {
  const { control, setValue } = useFormContext<ProductsFormType>();
  const theme = useTheme();

  const produtos = (useWatch({ control, name: 'products' }) ??
    []) as EventProduct[];

  // mesmo controle de expansão dos grupos: um booleano por posição
  const [expandidos, setExpandidos] = useState<boolean[]>(() =>
    produtos.map(() => false)
  );
  const estaExpandido = (index: number) => expandidos[index] ?? true;

  const alternar = (index: number) =>
    setExpandidos((atual) => {
      const proximos = produtos.map((_, i) => atual[i] ?? true);
      proximos[index] = !estaExpandido(index);
      return proximos;
    });

  const atualizar = (proximos: EventProduct[]) =>
    setValue('products', proximos as ProductsFormType['products'], {
      shouldValidate: false,
      shouldDirty: true,
    });

  const adicionarProduto = () => {
    atualizar([...produtos, produtoVazio()]);
    setExpandidos((atual) => [
      ...produtos.map((_, i) => atual[i] ?? true),
      true,
    ]);
  };

  const removerProduto = (index: number) => {
    Swal.fire({
      title: 'Remover produto?',
      text: 'O produto e as variantes dele saem do evento.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      if (!resultado.isConfirmed) return;

      atualizar(produtos.filter((_, i) => i !== index));
      setExpandidos((atual) =>
        produtos.map((_, i) => atual[i] ?? true).filter((_, i) => i !== index)
      );
    });
  };

  const adicionarVariante = (index: number) =>
    atualizar(
      produtos.map((produto, i) =>
        i === index
          ? {
              ...produto,
              variants: [...produto.variants, { name: '', stock: null }],
            }
          : produto
      )
    );

  const removerVariante = (index: number, indexVariante: number) =>
    atualizar(
      produtos.map((produto, i) =>
        i === index
          ? {
              ...produto,
              variants: produto.variants.filter((_, v) => v !== indexVariante),
            }
          : produto
      )
    );

  return (
    <Stack gap={2} sx={{ width: '100%', minWidth: 0, mb: 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontSize={18}>
            Produtos do evento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Oferecidos depois da inscrição confirmada e pagos junto com o
            ingresso.
          </Typography>
        </Box>

        {produtos.length > 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={adicionarProduto}
            sx={{ flexShrink: 0 }}
          >
            Adicionar produto
          </Button>
        )}
      </Stack>

      {produtos.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography fontWeight={600}>Quem pode comprar na loja</Typography>
          <Typography variant="body2" color="text.secondary">
            A loja aparece para todos na página do evento. Aqui você define quem
            consegue finalizar a compra.
          </Typography>
          <Controller
            control={control}
            name="publicStore"
            render={({ field }) => (
              <RadioGroup
                value={field.value ? 'publica' : 'restrita'}
                onChange={(_, valor) => field.onChange(valor === 'publica')}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="restrita"
                  control={<Radio />}
                  label="Restrita: só quem tem inscrição confirmada"
                />
                <FormControlLabel
                  value="publica"
                  control={<Radio />}
                  label="Pública: qualquer pessoa com cadastro no sistema"
                />
              </RadioGroup>
            )}
          />
        </Box>
      )}

      {produtos.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <ShoppingBagOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography fontWeight={500} sx={{ mt: 1 }}>
            Nenhum produto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Opcional. Sem produtos, a inscrição segue direto para o pagamento.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={adicionarProduto}
          >
            Adicionar produto
          </Button>
        </Box>
      ) : (
        <Stack gap={1.5}>
          {produtos.map((produto, index) => (
            <CartaoProduto
              key={produto.id ?? `produto-${index}`}
              index={index}
              produto={produto}
              expandido={estaExpandido(index)}
              onAlternar={() => alternar(index)}
              onRemover={() => removerProduto(index)}
              onAdicionarVariante={() => adicionarVariante(index)}
              onRemoverVariante={(indexVariante) =>
                removerVariante(index, indexVariante)
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export { FormProducts };
