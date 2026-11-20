import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DeleteOutline, ImageOutlined } from '@mui/icons-material';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { toast } from 'react-toastify';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { superficieSx } from '../../../components/listPageStyles';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  useImagemDaOportunidade,
  useOportunidadesDaIgreja,
  useSalvarOportunidade,
} from '../../../features/oportunidades/api';
import {
  campoPadrao,
  descricaoEmHtml,
  descricaoEmTexto,
  diaDe,
  problemasDoFormulario,
} from '../../../features/oportunidades/formulario';
import {
  EditorDoFormulario,
  PreviaDoFormulario,
} from '../../../features/oportunidades/components/editorDoFormulario';
import { ImagemDaVaga } from '../../../features/oportunidades/components/cardDaVaga';
import { DadosDaOportunidade } from '../../../features/oportunidades/types';

const IMAGEM_MAXIMA_BYTES = 5 * 1024 * 1024;

const nova = (): DadosDaOportunidade => ({
  titulo: '',
  empresa: '',
  descricao: '',
  local: '',
  encerraEm: null,
  salario: null,
  formulario: {
    campos: [
      campoPadrao('CURRICULO'),
      campoPadrao('PRETENSAO_SALARIAL'),
      campoPadrao('MENSAGEM'),
      campoPadrao('REDE_SOCIAL', 'linkedin'),
      campoPadrao('REDE_SOCIAL', 'instagram'),
    ],
  },
});

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <Paper sx={{ ...superficieSx, p: { xs: 2, sm: 2.5 } }}>
      <Typography fontWeight={800} sx={{ mb: 2 }}>
        {titulo}
      </Typography>
      {children}
    </Paper>
  );
}

/**
 * Publicar ou editar uma vaga: a vaga em si (logo, quem oferece, salário,
 * data final, descrição) e o formulário de candidatura. Página, e não modal:
 * com o editor do formulário, não cabia.
 */
function EditarOportunidade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { churchId } = useIgrejaSelecionada();
  const { data: vagas, isLoading } = useOportunidadesDaIgreja(churchId);
  const salvar = useSalvarOportunidade();
  const imagemApi = useImagemDaOportunidade();
  const existente = useMemo(() => vagas?.find((v) => v.id === id), [vagas, id]);

  const [dados, setDados] = useState<DadosDaOportunidade>(nova);
  // `undefined`: sem mudança; `File`: trocar; `null`: remover
  const [imagem, setImagem] = useState<File | null | undefined>(undefined);
  const previa = useMemo(
    () => (imagem ? URL.createObjectURL(imagem) : null),
    [imagem]
  );
  useEffect(() => () => void (previa && URL.revokeObjectURL(previa)), [previa]);

  useEffect(() => {
    if (!existente) return;
    setDados({
      titulo: existente.title,
      empresa: existente.company,
      descricao: descricaoEmHtml(existente.description),
      local: existente.location ?? '',
      encerraEm: diaDe(existente.closesAt) || null,
      salario: existente.salario,
      formulario: existente.formulario,
    });
  }, [existente]);

  if (id && isLoading) {
    return (
      <PageStyle>
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageStyle>
    );
  }
  if (id && !existente) {
    return (
      <PageStyle>
        <Header
          title="Editar oportunidade"
          modulo="oportunidades"
          pageBack="/admin/oportunidades"
          buttonBack
        />
        <Alert severity="info">
          Oportunidade não encontrada na igreja escolhida.
        </Alert>
      </PageStyle>
    );
  }

  const mudar = (parte: Partial<DadosDaOportunidade>) =>
    setDados((atual) => ({ ...atual, ...parte }));
  const salario = dados.salario ?? {};
  const imagemAtual =
    imagem === null ? null : (previa ?? existente?.imagemUrl ?? null);

  const problemas = [
    !dados.titulo.trim() && 'dê um título à vaga',
    !dados.empresa.trim() && 'diga quem oferece',
    !descricaoEmTexto(dados.descricao).trim() && 'descreva a vaga',
    ...problemasDoFormulario(dados.formulario.campos),
  ].filter(Boolean) as string[];

  const enviar = () =>
    churchId &&
    salvar.mutate(
      {
        churchId,
        id,
        dados: {
          ...dados,
          // linhas vazias das opções ficam para trás
          formulario: {
            campos: dados.formulario.campos.map((c) =>
              c.opcoes ? { ...c, opcoes: c.opcoes.filter((o) => o.trim()) } : c
            ),
          },
          salario:
            salario.min === undefined || salario.min === ''
              ? null
              : {
                  min: Number(salario.min),
                  ...(salario.max !== undefined &&
                    salario.max !== '' && { max: Number(salario.max) }),
                },
        },
        aviso: id ? 'Oportunidade salva' : 'Oportunidade publicada',
      },
      {
        onSuccess: async (vaga) => {
          if (imagem !== undefined) {
            await imagemApi
              .mutateAsync({ churchId, id: vaga.id, imagem })
              .catch(() =>
                toast.error(
                  'A vaga foi salva, mas a imagem não subiu. Tente de novo.'
                )
              );
          }
          navigate('/admin/oportunidades');
        },
      }
    );

  const ocupado = salvar.isLoading || imagemApi.isLoading;

  return (
    <PageStyle>
      <Header
        title={id ? 'Editar oportunidade' : 'Nova oportunidade'}
        modulo="oportunidades"
        description={
          id ? existente?.title : 'Publique uma vaga para os membros da igreja'
        }
        pageBack="/admin/oportunidades"
        buttonBack
      />

      {!churchId ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a vaga.
        </Alert>
      ) : (
        <Stack spacing={2}>
          <Secao titulo="A vaga">
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={2}
                alignItems={{ sm: 'center' }}
              >
                <Box
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <ImagemDaVaga
                    vaga={{ imagemUrl: imagemAtual, company: dados.empresa }}
                    altura={112}
                  />
                </Box>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Imagem da vaga, geralmente a logo da empresa. PNG, JPG ou
                    WEBP, até 5 MB.
                  </Typography>
                  <Stack direction="row" gap={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<ImageOutlined />}
                      sx={{ textTransform: 'none' }}
                    >
                      {imagemAtual ? 'Trocar' : 'Escolher imagem'}
                      <input
                        hidden
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const arquivo = e.target.files?.[0];
                          e.target.value = '';
                          if (!arquivo) return;
                          if (arquivo.size > IMAGEM_MAXIMA_BYTES) {
                            toast.error('A imagem vai até 5 MB');
                          } else setImagem(arquivo);
                        }}
                      />
                    </Button>
                    {imagemAtual && (
                      <Button
                        color="error"
                        startIcon={<DeleteOutline />}
                        onClick={() =>
                          setImagem(existente?.imagemUrl ? null : undefined)
                        }
                        sx={{ textTransform: 'none' }}
                      >
                        Remover
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>

              <TextField
                label="Vaga"
                placeholder="Ex.: Auxiliar administrativo"
                value={dados.titulo}
                onChange={(e) => mudar({ titulo: e.target.value })}
                InputLabelProps={{ required: true }}
                inputProps={{ maxLength: 120 }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  label="Quem oferece"
                  placeholder="A própria igreja ou a empresa de um membro"
                  value={dados.empresa}
                  onChange={(e) => mudar({ empresa: e.target.value })}
                  InputLabelProps={{ required: true }}
                  inputProps={{ maxLength: 120 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Local"
                  placeholder="Cidade, bairro ou “Remoto”"
                  value={dados.local}
                  onChange={(e) => mudar({ local: e.target.value })}
                  inputProps={{ maxLength: 120 }}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  label="Salário (ou mínimo)"
                  type="number"
                  value={salario.min ?? ''}
                  onChange={(e) =>
                    mudar({ salario: { ...salario, min: e.target.value } })
                  }
                  inputProps={{ min: 0, step: 50 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                  helperText="Opcional. Vazio: não aparece"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Salário máximo"
                  type="number"
                  value={salario.max ?? ''}
                  onChange={(e) =>
                    mudar({ salario: { ...salario, max: e.target.value } })
                  }
                  inputProps={{ min: 0, step: 50 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">R$</InputAdornment>
                    ),
                  }}
                  helperText="Para uma faixa"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Candidaturas até"
                  type="date"
                  value={dados.encerraEm ?? ''}
                  onChange={(e) => mudar({ encerraEm: e.target.value || null })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Opcional. Depois do dia, encerra sozinha"
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.75 }}
                >
                  Descrição * — atividades, requisitos, horário, benefícios…
                </Typography>
                {/* o editor do sistema: fundo, borda e ícones iguais aos dos campos */}
                <ReactQuillEditor
                  value={dados.descricao}
                  onChange={(html: string) => mudar({ descricao: html })}
                />
              </Box>
            </Stack>
          </Secao>

          <Secao titulo="Formulário de candidatura">
            {/* o editor e, ao lado, a prévia do que o candidato vê; no celular a prévia desce */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(0, 1fr) minmax(0, 1fr)',
                },
                gap: 2.5,
                alignItems: 'start',
              }}
            >
              <EditorDoFormulario
                campos={dados.formulario.campos}
                onChange={(campos) => mudar({ formulario: { campos } })}
              />
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
                <PreviaDoFormulario campos={dados.formulario.campos} />
              </Box>
            </Box>
          </Secao>

          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            gap={1.5}
            flexWrap="wrap"
          >
            {problemas.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Falta: {problemas.join('; ')}
              </Typography>
            )}
            <Button
              color="inherit"
              onClick={() => navigate('/admin/oportunidades')}
              disabled={ocupado}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={problemas.length > 0 || ocupado}
              onClick={enviar}
            >
              {ocupado ? 'Salvando…' : id ? 'Salvar' : 'Publicar'}
            </Button>
          </Stack>
        </Stack>
      )}
    </PageStyle>
  );
}

export { EditarOportunidade };
