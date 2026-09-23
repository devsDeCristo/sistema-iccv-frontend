import {
  Alert,
  alpha,
  Box,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { EventLogoFormType } from '../types';
import {
  Close,
  CloudUpload,
  ConfirmationNumber,
  Crop,
  DesktopWindows,
  PhoneAndroid,
  ShoppingBagOutlined,
  SwapHoriz,
} from '@mui/icons-material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CapaLogin from '../../../../assets/capaLogin2.jpg';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../../themes';
import { formatarTamanho, usePreviaArquivo } from './uploadHelpers';
import { LogoCropDialog } from './logoCropDialog';
import { FormEventColors } from './formEventColors';

const LIMITE_ARQUIVO = 5 * 1024 * 1024;

/**
 * Proporções do cartaz da página do evento (src/pages/events/details).
 *
 * Proporção e não altura fixa: a prévia é mais estreita que a página de
 * verdade, e repetir os pixels de lá faria a capa parecer bem mais alta do que
 * vai ficar. O que o admin precisa enxergar é o **recorte** — a capa entra em
 * `cover`, então imagem alta perde topo e base.
 *
 * Se o cartaz mudar de novo, estes números, o filtro, o véu, o apoio do bloco
 * de texto e os controles emulados mudam com ele, ou a prévia passa a mostrar
 * um enquadramento que não existe.
 */
const PROPORCAO_DESKTOP = 5 / 2;
const PROPORCAO_CELULAR = 9 / 10;

/**
 * Altura da prévia na tela, em pixels. É por ela que tudo se resolve: a largura
 * sai da proporção e a escala sai da largura. Em tamanho real o cartaz tomava
 * meia tela do formulário, e o admin rolava a página para ver os campos que
 * alimentam a própria prévia.
 */
const ALTURA_DA_PREVIA_DESKTOP = 200;
const ALTURA_DA_PREVIA_CELULAR = 240;

/** Régua do conteúdo na página do evento: é a largura que a prévia simula. */
const LARGURA_DA_PAGINA = 1200;
/** largura de um celular comum, para a prévia no modo estreito */
const LARGURA_CELULAR = 360;

type CampoArquivo = 'eventLogo' | 'eventCover';

type PreviaCabecalhoProps = {
  capa: string | null;
  logo: string | null;
  nomeEvento?: string;
  /** categoria do evento: é ela que vira o selo sobre a capa */
  tipoEvento?: string | null;
};

/** A prévia do cabeçalho como ele aparece na página do evento. */
function PreviaCabecalho({
  capa,
  logo,
  nomeEvento,
  tipoEvento,
}: PreviaCabecalhoProps) {
  const theme = useTheme();
  const [largura, setLargura] = useState<'desktop' | 'celular'>('desktop');
  const semCapa = !capa;
  const pequeno = largura === 'celular';
  /**
   * A prévia é a página reduzida, e não uma versão menor dela: o que encolhe é
   * a escala, então a logo mantém a proporção exata com o nome e os botões.
   *
   * A conta parte da altura desejada: a largura na tela vem da proporção do
   * cartaz, e a escala é o quanto a página de verdade precisa encolher para
   * caber nessa largura.
   */
  const proporcao = pequeno ? PROPORCAO_CELULAR : PROPORCAO_DESKTOP;
  const alturaNaTela = pequeno
    ? ALTURA_DA_PREVIA_CELULAR
    : ALTURA_DA_PREVIA_DESKTOP;
  const larguraNaTela = alturaNaTela * proporcao;
  const larguraReal = pequeno ? LARGURA_CELULAR : LARGURA_DA_PAGINA;
  const escala = larguraNaTela / larguraReal;
  const fundo = theme.palette.background.default;

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
      gap: 2,
    },
    palco: {
      display: 'flex',
      justifyContent: 'center',
      p: { xs: 1, sm: 1.5 },
      borderRadius: 2,
      bgcolor: alpha(theme.palette.text.primary, 0.04),
      // o quadriculado deixa à vista o fundo transparente da logo
      backgroundImage: `linear-gradient(45deg, ${alpha(
        theme.palette.text.primary,
        0.05
      )} 25%, transparent 25%, transparent 75%, ${alpha(
        theme.palette.text.primary,
        0.05
      )} 75%), linear-gradient(45deg, ${alpha(
        theme.palette.text.primary,
        0.05
      )} 25%, transparent 25%, transparent 75%, ${alpha(
        theme.palette.text.primary,
        0.05
      )} 75%)`,
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 8px 8px',
    },
    // a moldura repete a proporção do cartaz para reservar a altura certa:
    // `transform` desenha menor, mas continua ocupando o espaço do tamanho
    // original no fluxo
    moldura: {
      width: larguraNaTela,
      height: alturaNaTela,
      maxWidth: '100%',
      overflow: 'hidden',
      transition: theme.transitions.create(['width', 'height']),
    },
    pagina: {
      width: larguraReal,
      transform: `scale(${escala})`,
      transformOrigin: 'top left',
    },
    banner: {
      position: 'relative',
      aspectRatio: proporcao,
      borderRadius: 3,
      overflow: 'hidden',
      display: 'flex',
      // como na página: sem logo o bloco encolhe e vai para o meio da capa, em
      // vez de ficar no rodapé deixando um vazio sobre o nome
      alignItems: logo ? 'flex-end' : 'center',
      bgcolor: theme.palette.background.default,
    },
    // as duas camadas da página, na ordem de lá: um filtro que assenta a foto
    // e o véu que dissolve a capa no fundo da página. É por eles que o admin vê
    // se a logo clara vai sumir no topo ou o nome no rodapé
    filtro: {
      position: 'absolute',
      inset: 0,
      backgroundColor: alpha('#000', 0.2),
    },
    veu: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(180deg, transparent 42%, ${alpha(
        fundo,
        0.18
      )} 68%, ${fundo} 100%)`,
    },
    // a capa é camada de fundo, como na página: solta no `flex` do banner ela
    // virava item da linha e dividia a largura com o nome do evento — metade
    // do cartaz com foto, metade sem
    capa: {
      position: 'absolute',
      inset: 0,
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    /**
     * Daqui para baixo são os números da página, e não versões reduzidas deles:
     * o admin está escolhendo a arte contra o que vai ficar por cima dela — o
     * bloco de texto e os botões ocupam o rodapé, e é no que sobra que a foto
     * pode ter detalhe. Com texto menor a prévia diria que sobra espaço onde
     * não sobra.
     *
     * `pequeno` é o `xs` da página, e a prévia larga é o `md` — o que manda é a
     * largura simulada, não a da janela do admin.
     */
    logo: {
      maxHeight: pequeno ? 72 : 96,
      maxWidth: '60%',
      objectFit: 'contain',
      mb: 0.5,
      filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))',
    },
    // o conteúdo do cartaz mora sobre a capa, e não num cartão abaixo dela
    textoDoCartaz: {
      position: 'relative',
      width: 'calc(100% - 64px)',
      mx: 'auto',
      // centrado, o bloco pede o mesmo respiro dos dois lados; no rodapé ele
      // ganha mais folga por baixo, onde a capa vira página
      ...(logo ? { pt: 6, pb: pequeno ? 6 : 8 } : { py: pequeno ? 5 : 6 }),
    },
    selo: {
      display: 'inline-block',
      px: 1.25,
      py: 0.4,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#fff',
      backgroundColor: alpha('#fff', 0.18),
      border: `1px solid ${alpha('#fff', 0.35)}`,
      backdropFilter: 'blur(6px)',
    },
    nomeNoCartaz: {
      color: '#fff',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
      fontSize: pequeno ? '2rem' : '3.4rem',
      textShadow: '0 2px 18px rgba(0,0,0,0.45)',
      maxWidth: 760,
      // duas linhas no máximo: nome comprido empurrava os botões para fora do
      // recorte e a prévia mentia sobre o espaço que sobra
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    botoes: {
      display: 'flex',
      flexDirection: pequeno ? 'column' : 'row',
      alignItems: pequeno ? 'flex-start' : 'center',
      gap: 1.5,
      mt: 1.5,
    },
    botaoPrincipal: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      height: 50,
      px: 3.5,
      borderRadius: 1.5,
      fontSize: '1rem',
      fontWeight: 700,
      color: '#fff',
      backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
      boxShadow: `0 10px 26px -8px ${alpha(AZUL_VIVO, 0.8)}`,
    },
    botaoVidro: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      height: 50,
      px: 3,
      borderRadius: 999,
      fontSize: '1rem',
      fontWeight: 600,
      color: '#fff',
      border: `1px solid ${alpha('#fff', 0.5)}`,
      backgroundColor: alpha('#000', 0.2),
      backdropFilter: 'blur(6px)',
    },
  };

  return (
    <Paper sx={styles.paper}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Typography variant="h6" fontSize={18}>
            Prévia do cabeçalho
          </Typography>
          <Typography variant="body2" color="text.secondary">
            É assim que a capa e a logo aparecem na página do evento.
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={largura}
          onChange={(_, valor) => valor && setLargura(valor)}
          aria-label="Largura da prévia"
        >
          <ToggleButton value="desktop" aria-label="Computador">
            <DesktopWindows fontSize="small" sx={{ mr: 0.5 }} />
            Computador
          </ToggleButton>
          <ToggleButton value="celular" aria-label="Celular">
            <PhoneAndroid fontSize="small" sx={{ mr: 0.5 }} />
            Celular
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box sx={styles.palco}>
        <Box sx={styles.moldura}>
          <Box sx={styles.pagina}>
            <Box sx={styles.banner}>
              <Box
                component="img"
                src={capa || CapaLogin}
                alt="Prévia da capa do evento"
                sx={styles.capa}
              />
              <Box sx={styles.filtro} />
              <Box sx={styles.veu} />

              {/* a página inteira sobre a capa — selo, nome e os dois botões — e
                não só a logo: é essa sobreposição que decide onde a foto pode
                ter detalhe e onde ela precisa ser fundo */}
              <Box sx={styles.textoDoCartaz} aria-hidden>
                {logo && (
                  <Box
                    component="img"
                    src={logo}
                    alt="Prévia da logo do evento"
                    sx={styles.logo}
                  />
                )}

                {tipoEvento && (
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={styles.selo}>{tipoEvento}</Box>
                  </Box>
                )}

                <Typography component="p" sx={styles.nomeNoCartaz}>
                  {nomeEvento || 'Nome do evento'}
                </Typography>

                <Box sx={styles.botoes}>
                  <Box sx={styles.botaoPrincipal}>
                    <ConfirmationNumber sx={{ fontSize: 20 }} />
                    Inscreva-se
                  </Box>
                  <Box sx={styles.botaoVidro}>
                    <ShoppingBagOutlined sx={{ fontSize: 20 }} />
                    Produtos do evento
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {semCapa && (
        <Chip
          size="small"
          variant="outlined"
          label="Sem capa: a página usa a imagem padrão do sistema"
          sx={{ alignSelf: 'flex-start' }}
        />
      )}
    </Paper>
  );
}

type CampoImagemProps = {
  titulo: string;
  descricao: string;
  recomendacao: string;
  imagem: string | null;
  /** arquivo novo escolhido agora, e não a imagem já salva no evento */
  nomeArquivo: string | null;
  tamanhoArquivo: string | null;
  erro?: string;
  onEscolher: () => void;
  onRemover: () => void;
  onSoltar: (arquivo: File | null) => void;
  /** sem isto o campo não oferece recorte: só a logo tem */
  onRecortar?: () => void;
};

/**
 * Um campo de imagem: a área de soltar quando está vazio, e o arquivo com as
 * ações de trocar e remover quando já tem imagem. Arrastar funciona nos dois
 * estados — antes, com imagem escolhida, a área de soltar desaparecia e só
 * sobrava remover para depois subir outra.
 */
function CampoImagem({
  titulo,
  descricao,
  recomendacao,
  imagem,
  nomeArquivo,
  tamanhoArquivo,
  erro,
  onEscolher,
  onRemover,
  onSoltar,
  onRecortar,
}: CampoImagemProps) {
  const theme = useTheme();
  const [arrastando, setArrastando] = useState(false);
  const [dimensoes, setDimensoes] = useState<string | null>(null);

  useEffect(() => {
    if (!imagem) setDimensoes(null);
  }, [imagem]);

  const areaProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setArrastando(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setArrastando(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setArrastando(false);
      onSoltar(e.dataTransfer.files?.[0] ?? null);
    },
  };

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
      borderColor: arrastando
        ? theme.palette.primary.main
        : theme.palette.divider,
    },
    vazio: {
      flexGrow: 1,
      minHeight: 168,
      border: 2,
      borderStyle: 'dashed',
      borderRadius: 2,
      borderColor: arrastando
        ? theme.palette.primary.main
        : theme.palette.divider,
      bgcolor: arrastando ? theme.palette.action.hover : 'transparent',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
      textAlign: 'center',
      cursor: 'pointer',
      transition: theme.transitions.create([
        'border-color',
        'background-color',
      ]),
      '&:hover, &:focus-visible': {
        borderColor: theme.palette.primary.main,
        bgcolor: theme.palette.action.hover,
      },
    },
    arquivo: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 1.5,
      border: `1px solid ${
        arrastando ? theme.palette.primary.main : theme.palette.divider
      }`,
      borderRadius: 2,
    },
    miniatura: {
      width: 96,
      height: 72,
      flexShrink: 0,
      objectFit: 'contain',
      borderRadius: 1.5,
      p: 0.5,
      bgcolor: theme.palette.background.default,
    },
  };

  return (
    <Paper sx={styles.paper} {...areaProps}>
      <Box>
        <Typography variant="h6" fontSize={18}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descricao}
        </Typography>
      </Box>

      {imagem ? (
        <Box sx={styles.arquivo}>
          <Box
            component="img"
            src={imagem}
            alt={`Imagem de ${titulo.toLowerCase()}`}
            sx={styles.miniatura}
            onLoad={(e: React.SyntheticEvent<HTMLImageElement>) =>
              setDimensoes(
                `${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight} px`
              )
            }
          />

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography fontWeight={500} noWrap>
              {nomeArquivo || `${titulo} atual`}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {[dimensoes, tamanhoArquivo].filter(Boolean).join(' · ') ||
                'Imagem salva no evento'}
            </Typography>
          </Box>

          <Stack direction="row" flexShrink={0}>
            {onRecortar && (
              <Tooltip title="Recortar imagem">
                <IconButton onClick={onRecortar} aria-label="Recortar imagem">
                  <Crop />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Trocar imagem">
              <IconButton onClick={onEscolher} aria-label="Trocar imagem">
                <SwapHoriz />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover imagem">
              <IconButton onClick={onRemover} aria-label="Remover imagem">
                <Close />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      ) : (
        <Box
          role="button"
          tabIndex={0}
          onClick={onEscolher}
          // sem isso a área só respondia a clique e mouse: quem navega pelo
          // teclado não conseguia subir imagem nenhuma
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEscolher();
            }
          }}
          sx={styles.vazio}
        >
          <CloudUpload
            sx={{
              fontSize: 34,
              color: arrastando ? 'primary.main' : 'text.secondary',
            }}
          />
          <Typography fontSize="0.875rem" fontWeight={500}>
            Clique ou arraste a imagem
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SVG, PNG ou JPG · até 5MB
          </Typography>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        {recomendacao}
      </Typography>

      {erro && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
        >
          {erro}
        </Alert>
      )}
    </Paper>
  );
}

type FormLogoAndCoverProps = {
  /** nome vindo do passo de informações gerais, só para dar contexto à prévia */
  eventName?: string;
  /** categoria escolhida no primeiro passo: vira o selo sobre a capa */
  eventType?: string | null;
};

function FormLogoAndCover({ eventName, eventType }: FormLogoAndCoverProps) {
  const {
    control,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<EventLogoFormType>();

  const fileInputRefLogo = useRef<HTMLInputElement>(null);
  const fileInputRefCover = useRef<HTMLInputElement>(null);
  const [recortandoLogo, setRecortandoLogo] = useState(false);

  const logoFile = useWatch({ control, name: 'eventLogo' });
  const coverFile = useWatch({ control, name: 'eventCover' });
  const logoUrl = useWatch({ control, name: 'logoUrl' });
  const coverUrl = useWatch({ control, name: 'coverUrl' });

  const logoPreview = usePreviaArquivo(logoFile);
  const coverPreview = usePreviaArquivo(coverFile);

  // o arquivo recém-escolhido vem primeiro: com `url || preview` a tela
  // continuava mostrando a imagem antiga depois de escolher uma nova
  const logoImagem = logoPreview || logoUrl || null;
  const coverImagem = coverPreview || coverUrl || null;

  const abrirSeletor = (ref: React.RefObject<HTMLInputElement>) => {
    if (!ref.current) return;

    ref.current.value = ''; // zera antes de abrir, para reescolher o mesmo arquivo
    ref.current.click();
  };

  /**
   * Tipo e tamanho conferidos num só lugar: a checagem de tamanho vivia dentro
   * do `onChange` do input, então arquivo grande arrastado para a área entrava
   * sem passar por ela.
   */
  const aplicarArquivo = useCallback(
    (arquivo: File | null, campo: CampoArquivo) => {
      if (!arquivo) return;

      if (!arquivo.type.startsWith('image/')) {
        setError(campo, {
          type: 'manual',
          message: 'Arquivo de imagem inválido.',
        });
        toast.error('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      if (arquivo.size > LIMITE_ARQUIVO) {
        setError(campo, {
          type: 'manual',
          message: 'O tamanho do arquivo excede o limite de 5MB.',
        });
        toast.error('O tamanho do arquivo não deve exceder o limite de 5MB.');
        return;
      }

      clearErrors(campo);
      setValue(campo, [arquivo]);
    },
    [clearErrors, setError, setValue]
  );

  const mensagemErro = (campo: CampoArquivo) =>
    typeof errors[campo]?.message === 'string'
      ? (errors[campo]?.message as string)
      : undefined;

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={12}>
        <PreviaCabecalho
          capa={coverImagem}
          logo={logoImagem}
          nomeEvento={eventName}
          tipoEvento={eventType}
        />
      </Grid>

      <Controller
        name="eventLogo"
        control={control}
        render={() => (
          <input
            ref={fileInputRefLogo}
            hidden
            type="file"
            accept="image/*"
            onChange={(e) =>
              aplicarArquivo(e.target.files?.[0] ?? null, 'eventLogo')
            }
          />
        )}
      />

      <Controller
        name="eventCover"
        control={control}
        render={() => (
          <input
            ref={fileInputRefCover}
            hidden
            type="file"
            accept="image/*"
            onChange={(e) =>
              aplicarArquivo(e.target.files?.[0] ?? null, 'eventCover')
            }
          />
        )}
      />

      <Grid item xs={12} md={6}>
        <CampoImagem
          titulo="Logo"
          descricao="Fica centralizada sobre a capa."
          recomendacao="PNG ou SVG com fundo transparente, na altura de 130px ou mais."
          imagem={logoImagem}
          nomeArquivo={logoFile?.[0]?.name ?? null}
          tamanhoArquivo={formatarTamanho(logoFile?.[0]?.size)}
          erro={mensagemErro('eventLogo')}
          onEscolher={() => abrirSeletor(fileInputRefLogo)}
          onRemover={() => {
            setValue('logoUrl', null);
            setValue('eventLogo', null);
            clearErrors('eventLogo');
          }}
          onSoltar={(arquivo) => aplicarArquivo(arquivo, 'eventLogo')}
          onRecortar={logoImagem ? () => setRecortandoLogo(true) : undefined}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <CampoImagem
          titulo="Capa"
          descricao="Preenche a faixa atrás da logo."
          recomendacao="Imagem larga (1600 × 600 ou mais): a faixa é baixa e o recorte sai do centro."
          imagem={coverImagem}
          nomeArquivo={coverFile?.[0]?.name ?? null}
          tamanhoArquivo={formatarTamanho(coverFile?.[0]?.size)}
          erro={mensagemErro('eventCover')}
          onEscolher={() => abrirSeletor(fileInputRefCover)}
          onRemover={() => {
            setValue('coverUrl', null);
            setValue('eventCover', null);
            clearErrors('eventCover');
          }}
          onSoltar={(arquivo) => aplicarArquivo(arquivo, 'eventCover')}
        />
      </Grid>

      <Grid item xs={12}>
        <FormEventColors logoImagem={logoImagem} coverImagem={coverImagem} />
      </Grid>

      {/* o recorte volta pelo mesmo caminho de um arquivo escolhido à mão, e
          assim passa pelas mesmas conferências de tipo e tamanho */}
      <LogoCropDialog
        aberto={recortandoLogo}
        imagem={logoImagem}
        arquivo={logoFile?.[0] ?? null}
        onFechar={() => setRecortandoLogo(false)}
        onConfirmar={(arquivo) => {
          aplicarArquivo(arquivo, 'eventLogo');
          setRecortandoLogo(false);
        }}
        onEscolherArquivo={() => {
          setRecortandoLogo(false);
          abrirSeletor(fileInputRefLogo);
        }}
      />
    </Grid>
  );
}

export { FormLogoAndCover };
