import {
  Alert,
  alpha,
  Box,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Close,
  CloudUpload,
  Description,
  SwapHoriz,
} from '@mui/icons-material';
import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-quill/dist/quill.snow.css';
import ReactQuillEditor from '../../../../components/reactQuillEditor';
import { TermsFormType } from '../types';
import { formatarTamanho, usePreviaArquivo } from './uploadHelpers';
import { extensionFromDataUri, triggerDownload } from '../../../../utils';

const LIMITE_ARQUIVO_TERMO = 5 * 1024 * 1024;

type CampoDocumentoProps = {
  titulo: string;
  descricao: string;
  /** URL já salva no evento (ou do arquivo recém-escolhido) */
  url: string | null;
  nomeArquivo: string | null;
  tamanhoArquivo: string | null;
  erro?: string;
  onEscolher: () => void;
  onRemover: () => void;
};

/**
 * Campo de um único documento (PDF ou imagem) — o termo de autorização.
 * Sem miniatura de propósito: PDF não tem preview simples, e a informação que
 * importa aqui é só "tem um termo anexado ou não".
 */
function CampoDocumento({
  titulo,
  descricao,
  url,
  nomeArquivo,
  tamanhoArquivo,
  erro,
  onEscolher,
  onRemover,
}: CampoDocumentoProps) {
  const theme = useTheme();

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
    },
    vazio: {
      minHeight: 88,
      border: 2,
      borderStyle: 'dashed',
      borderRadius: 2,
      borderColor: theme.palette.divider,
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
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
    },
  };

  return (
    <Paper sx={styles.paper}>
      <Box>
        <Typography variant="h6" fontSize={18}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descricao}
        </Typography>
      </Box>

      {url ? (
        <Box sx={styles.arquivo}>
          <Description sx={{ fontSize: 36, color: 'text.secondary' }} />

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography fontWeight={500} noWrap>
              {nomeArquivo || 'Termo atual'}
            </Typography>
            <Link
              component="button"
              type="button"
              variant="body2"
              sx={{ display: 'block' }}
              onClick={() =>
                triggerDownload(
                  url,
                  `termo-de-autorizacao.${extensionFromDataUri(url)}`
                )
              }
            >
              {tamanhoArquivo || 'Baixar termo atual'}
            </Link>
          </Box>

          <Stack direction="row" flexShrink={0}>
            <Tooltip title="Trocar termo">
              <IconButton onClick={onEscolher} aria-label="Trocar termo">
                <SwapHoriz />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover termo">
              <IconButton onClick={onRemover} aria-label="Remover termo">
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
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEscolher();
            }
          }}
          sx={styles.vazio}
        >
          <CloudUpload sx={{ fontSize: 30, color: 'text.secondary' }} />
          <Typography fontSize="0.875rem" fontWeight={500}>
            Clique para anexar o termo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF, PNG ou JPG · até 5MB
          </Typography>
        </Box>
      )}

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

/**
 * A etapa dos termos do evento.
 *
 * Os dois que existem ficam lado a lado porque quem cadastra o evento decide
 * os dois na mesma hora, mas eles não se parecem em nada: o de menores é um
 * arquivo em branco que o responsável baixa e devolve assinado; o do evento é
 * texto escrito aqui, que aparece na tela de inscrição e precisa ser aceito
 * antes de a inscrição sair. Deixar o texto em branco é o jeito de dizer que
 * o evento não tem termo.
 */
function FormTerms() {
  const theme = useTheme();
  const {
    control,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<TermsFormType>();

  const fileInputRefTerm = useRef<HTMLInputElement>(null);

  const termFile = useWatch({ control, name: 'eventTerm' });
  const minorTermUrl = useWatch({ control, name: 'minorTermUrl' });

  const termPreview = usePreviaArquivo(termFile);

  // o arquivo recém-escolhido vem primeiro: com `url || preview` a tela
  // continuava mostrando o termo antigo depois de escolher um novo
  const termUrl = termPreview || minorTermUrl || null;

  const abrirSeletor = () => {
    if (!fileInputRefTerm.current) return;

    fileInputRefTerm.current.value = ''; // zera antes de abrir, para reescolher o mesmo arquivo
    fileInputRefTerm.current.click();
  };

  /** Tipo e tamanho conferidos aqui, e não no `onChange`: o arquivo também
      pode chegar arrastado para a área. O termo aceita PDF além de imagem. */
  const aplicarArquivoTermo = useCallback(
    (arquivo: File | null) => {
      if (!arquivo) return;

      const tipoValido =
        arquivo.type.startsWith('image/') || arquivo.type === 'application/pdf';

      if (!tipoValido) {
        setError('eventTerm', {
          type: 'manual',
          message: 'Envie um PDF ou uma imagem.',
        });
        toast.error('Por favor, selecione um PDF ou uma imagem.');
        return;
      }

      if (arquivo.size > LIMITE_ARQUIVO_TERMO) {
        setError('eventTerm', {
          type: 'manual',
          message: 'O tamanho do arquivo excede o limite de 5MB.',
        });
        toast.error('O tamanho do arquivo não deve exceder o limite de 5MB.');
        return;
      }

      clearErrors('eventTerm');
      setValue('eventTerm', [arquivo]);
    },
    [clearErrors, setError, setValue]
  );

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
    },
  };

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Controller
        name="eventTerm"
        control={control}
        render={() => (
          <input
            ref={fileInputRefTerm}
            hidden
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => aplicarArquivoTermo(e.target.files?.[0] ?? null)}
          />
        )}
      />

      <Grid item xs={12}>
        <Paper sx={styles.paper}>
          <Box>
            <Typography variant="h6" fontSize={18}>
              Termo do evento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aparece na hora da inscrição, e ninguém se inscreve sem marcar que
              leu e aceitou. É aqui que entram direitos de imagem, regras de
              convivência, cancelamento — o que valer para este evento. Deixe em
              branco se o evento não tem termo.
            </Typography>
          </Box>

          <Controller
            control={control}
            name="registrationTerm"
            render={({ field: { onChange, value } }) => (
              <ReactQuillEditor
                key={'quill-termo'}
                value={value ?? ''}
                onChange={onChange}
              />
            )}
          />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <CampoDocumento
          titulo="Termo de autorização (menores de 16 anos)"
          descricao="Modelo em branco que os pais/responsáveis baixam, assinam e reenviam na inscrição."
          url={termUrl}
          nomeArquivo={termFile?.[0]?.name ?? null}
          tamanhoArquivo={formatarTamanho(termFile?.[0]?.size)}
          erro={
            typeof errors.eventTerm?.message === 'string'
              ? (errors.eventTerm?.message as string)
              : undefined
          }
          onEscolher={abrirSeletor}
          onRemover={() => {
            setValue('minorTermUrl', null);
            setValue('eventTerm', null);
            clearErrors('eventTerm');
          }}
        />
      </Grid>
    </Grid>
  );
}

export { FormTerms };
