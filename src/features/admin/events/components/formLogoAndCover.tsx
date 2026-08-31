import {
  Alert,
  alpha,
  Box,
  Chip,
  Grid,
  IconButton,
  Paper,
  Skeleton,
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
  DesktopWindows,
  PhoneAndroid,
  SwapHoriz,
} from '@mui/icons-material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CapaLogin from '../../../../assets/capaLogin2.jpg';

const LIMITE_ARQUIVO = 2 * 1024 * 1024;

/**
 * Medidas do banner da página do evento (src/pages/events/details). A prévia
 * copia elas para que o admin veja o recorte real — a faixa é baixa e a capa
 * entra em `cover`, então imagem alta perde topo e base.
 */
const ALTURA_BANNER = 150;
const ALTURA_LOGO = 130;
/** largura de um celular comum, para a prévia no modo estreito */
const LARGURA_CELULAR = 360;

type CampoArquivo = 'eventLogo' | 'eventCover';

/**
 * URL de objeto do arquivo escolhido, revogada quando o arquivo troca ou o
 * componente sai de cena — o `useMemo` de antes criava um blob novo e nunca
 * soltava o anterior.
 */
function usePreviaArquivo(arquivos?: File[] | null) {
  const arquivo = arquivos?.[0];
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!arquivo) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(arquivo);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [arquivo]);

  return url;
}

function formatarTamanho(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PreviaCabecalhoProps = {
  capa: string | null;
  logo: string | null;
  nomeEvento?: string;
};

/** A prévia do cabeçalho como ele aparece na página do evento. */
function PreviaCabecalho({ capa, logo, nomeEvento }: PreviaCabecalhoProps) {
  const theme = useTheme();
  const [largura, setLargura] = useState<'desktop' | 'celular'>('desktop');
  const semCapa = !capa;

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      boxShadow:theme.palette.mode=="dark" ? "" : "0px 0px 5px 2px rgba(0,0,0,0.1)",
      gap: 2,
    },
    palco: {
      display: 'flex',
      justifyContent: 'center',
      p: { xs: 1.5, sm: 3 },
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
    pagina: {
      width: largura === 'celular' ? LARGURA_CELULAR : '100%',
      maxWidth: '100%',
      transition: theme.transitions.create('width'),
    },
    banner: {
      position: 'relative',
      height: ALTURA_BANNER,
      borderRadius: '5px',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default,
    },
    capa: {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      
    },
    logo: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height: ALTURA_LOGO,
      maxHeight: '88%',
      maxWidth: '80%',
      objectFit: 'contain',
    },
    cartaoTitulo: {
      mt: 1.5,
      p: 2,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      bgcolor: theme.palette.background.paper,
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
        <Box sx={styles.pagina}>
          <Box sx={styles.banner}>
            <Box
              component="img"
              src={capa || CapaLogin}
              alt="Prévia da capa do evento"
              sx={styles.capa}
            />
            {logo && (
              <Box
                component="img"
                src={logo}
                alt="Prévia da logo do evento"
                sx={styles.logo}
              />
            )}
          </Box>

          {/* o cartão de título vem logo abaixo do banner na página do evento:
              sem ele a prévia perde a noção de escala */}
          <Box sx={styles.cartaoTitulo}>
            <Typography fontWeight={600} noWrap>
              {nomeEvento || 'Nome do evento'}
            </Typography>
            <Skeleton variant="text" animation={false} width="45%" />
            <Skeleton variant="text" animation={false} width="70%" />
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
      boxShadow:theme.palette.mode=="dark" ? "" : "0px 0px 5px 2px rgba(0,0,0,0.1)",
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
            SVG, PNG ou JPG · até 2MB
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
};

function FormLogoAndCover({ eventName }: FormLogoAndCoverProps) {
  const {
    control,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<EventLogoFormType>();

  const fileInputRefLogo = useRef<HTMLInputElement>(null);
  const fileInputRefCover = useRef<HTMLInputElement>(null);

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
   * Tipo e tamanho conferidos num só lugar: a checagem de 2MB vivia dentro do
   * `onChange` do input, então arquivo grande arrastado para a área entrava sem
   * passar por ela.
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
          message: 'O tamanho do arquivo excede o limite de 2MB.',
        });
        toast.error('O tamanho do arquivo não deve exceder o limite de 2MB.');
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
    </Grid>
  );
}

export { FormLogoAndCover };
