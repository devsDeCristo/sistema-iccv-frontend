import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Check,
  DeleteOutline,
  ImageOutlined,
  ListAltOutlined,
  WorkOutline,
} from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { superficieSx } from '../../../components/listPageStyles';
import { StepProgress } from '../../../components/step';
import {
  campoPadrao,
  descricaoEmHtml,
  descricaoEmTexto,
  diaDe,
  problemasDoFormulario,
} from '../formulario';
import { EditorDoFormulario, PreviaDoFormulario } from './editorDoFormulario';
import { ImagemDaVaga } from './cardDaVaga';
import { DadosDaOportunidade, OportunidadeDaIgreja } from '../types';

/** "2026-12-31" como data local (sem o fuso empurrar para o dia anterior) */
const dataDoDia = (dia: string | null) => {
  if (!dia) return null;
  const [ano, mes, d] = dia.split('-').map(Number);
  return new Date(ano, mes - 1, d);
};

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
    <Box>
      {/* o título de passo do cadastro de evento */}
      <Typography variant="h6" fontSize={18} sx={{ mb: 2 }}>
        {titulo}
      </Typography>
      {children}
    </Box>
  );
}

/** O que a tela precisa de uma vaga que já existe para preencher o formulário */
export type VagaEditavel = Pick<
  OportunidadeDaIgreja,
  | 'title'
  | 'company'
  | 'description'
  | 'location'
  | 'closesAt'
  | 'salario'
  | 'formulario'
  | 'imagemUrl'
>;

interface Props {
  /** a vaga em edição; sem ela, o formulário começa vazio (com os campos padrão) */
  inicial?: VagaEditavel;
  /**
   * Recebe os dados prontos para a API (opções vazias fora, salário em número)
   * e a imagem: `undefined` sem mudança, `File` para trocar, `null` para tirar
   */
  onEnviar: (
    dados: DadosDaOportunidade,
    imagem: File | null | undefined
  ) => void;
  onCancelar: () => void;
  ocupado: boolean;
  textoDoBotao: string;
}

/**
 * O formulário de uma vaga — a vaga em si (logo, quem oferece, salário, data
 * final, descrição) e o formulário de candidatura, com a prévia. O mesmo para
 * o admin publicar e editar e para o membro propor e editar a proposta: quem
 * usa só decide para onde vão os dados.
 */
export function FormularioDaVaga({
  inicial,
  onEnviar,
  onCancelar,
  ocupado,
  textoDoBotao,
}: Props) {
  const [dados, setDados] = useState<DadosDaOportunidade>(nova);
  // 1: a vaga; 2: o formulário de inscrição
  const [passo, setPasso] = useState(1);
  // o botão do passo fica no fim da página: o próximo passo começa do topo
  useEffect(() => {
    document.getElementById('layout-scroll')?.scrollTo({ top: 0 });
  }, [passo]);
  // valor fixo ou faixa: a vaga com máximo abre em faixa
  const [faixa, setFaixa] = useState(false);
  // `undefined`: sem mudança; `File`: trocar; `null`: remover
  const [imagem, setImagem] = useState<File | null | undefined>(undefined);
  const previa = useMemo(
    () => (imagem ? URL.createObjectURL(imagem) : null),
    [imagem]
  );
  useEffect(() => () => void (previa && URL.revokeObjectURL(previa)), [previa]);

  useEffect(() => {
    if (!inicial) return;
    setDados({
      titulo: inicial.title,
      empresa: inicial.company,
      descricao: descricaoEmHtml(inicial.description),
      local: inicial.location ?? '',
      encerraEm: diaDe(inicial.closesAt) || null,
      salario: inicial.salario,
      formulario: inicial.formulario,
    });
    setFaixa(inicial.salario?.max !== undefined);
  }, [inicial]);

  const mudar = (parte: Partial<DadosDaOportunidade>) =>
    setDados((atual) => ({ ...atual, ...parte }));
  const salario = dados.salario ?? {};
  const faixaInvertida =
    faixa &&
    salario.min !== undefined &&
    salario.min !== '' &&
    salario.max !== undefined &&
    salario.max !== '' &&
    Number(salario.max) < Number(salario.min);
  const imagemAtual =
    imagem === null ? null : (previa ?? inicial?.imagemUrl ?? null);

  const problemasDaVaga = [
    !dados.titulo.trim() && 'dê um título à vaga',
    !dados.empresa.trim() && 'diga quem oferece',
    !descricaoEmTexto(dados.descricao).trim() && 'descreva a vaga',
    faixaInvertida && 'o salário máximo é menor que o inicial',
  ].filter(Boolean) as string[];
  // no último passo vale tudo, a vaga e o formulário
  const problemas =
    passo === 1
      ? problemasDaVaga
      : [...problemasDaVaga, ...problemasDoFormulario(dados.formulario.campos)];

  const enviar = () =>
    onEnviar(
      {
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
                ...(faixa &&
                  salario.max !== undefined &&
                  salario.max !== '' && { max: Number(salario.max) }),
              },
      },
      imagem
    );

  return (
    // o layout do cadastro de evento: régua, passo e botões num Paper só
    <Paper
      sx={{
        ...superficieSx,
        // os espaços do cadastro de evento: 24px de borda e da régua ao passo,
        // 16px do passo aos botões
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <StepProgress
          steps={[
            { id: 1, label: 'Vaga', icon: WorkOutline },
            { id: 2, label: 'Formulário de inscrição', icon: ListAltOutlined },
          ]}
          currentStep={passo}
          // no celular a régua deixa pular de passo: o formulário só com a vaga completa
          setCurrentStep={(novo) =>
            setPasso(novo === 2 && problemasDaVaga.length > 0 ? 1 : novo)
          }
        />
      </Box>

      {passo === 1 && (
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
                        setImagem(inicial?.imagemUrl ? null : undefined)
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      Remover
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>

            {/* os campos do cadastro de evento: Input pequeno numa grade de 16px.
                A Box segura a margem negativa da Grid, que a Stack zeraria */}
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Input
                    size="small"
                    label="Vaga"
                    placeholder="Ex.: Auxiliar administrativo"
                    value={dados.titulo}
                    onChange={(e) => mudar({ titulo: e.target.value })}
                    required
                    inputProps={{ maxLength: 120 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Input
                    size="small"
                    label="Quem oferece"
                    placeholder="A própria igreja ou a empresa de um membro"
                    value={dados.empresa}
                    onChange={(e) => mudar({ empresa: e.target.value })}
                    required
                    inputProps={{ maxLength: 120 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Input
                    size="small"
                    label="Local"
                    placeholder="Cidade, bairro ou “Remoto”"
                    value={dados.local}
                    onChange={(e) => mudar({ local: e.target.value })}
                    inputProps={{ maxLength: 120 }}
                  />
                </Grid>
                {/* o salário: valor fixo ou faixa; os dois são opcionais */}
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    flexWrap="wrap"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Salário (opcional)
                    </Typography>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={faixa ? 'faixa' : 'fixo'}
                      onChange={(_, valor) => {
                        if (!valor) return;
                        setFaixa(valor === 'faixa');
                        // o fixo não tem máximo: ele não vai junto
                        if (valor === 'fixo')
                          mudar({ salario: { min: salario.min } });
                      }}
                      aria-label="Tipo de salário"
                    >
                      <ToggleButton
                        value="fixo"
                        sx={{ textTransform: 'none', px: 1.5 }}
                      >
                        Valor fixo
                      </ToggleButton>
                      <ToggleButton
                        value="faixa"
                        sx={{ textTransform: 'none', px: 1.5 }}
                      >
                        Faixa
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={faixa ? 4 : 6}>
                  <Input
                    size="small"
                    label={faixa ? 'De' : 'Salário'}
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
                    helperText="Vazio: não aparece"
                  />
                </Grid>
                {faixa && (
                  <Grid item xs={12} md={4}>
                    <Input
                      size="small"
                      label="Até"
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
                      error={faixaInvertida}
                      helperText={
                        faixaInvertida ? 'Menor que o valor inicial' : ' '
                      }
                    />
                  </Grid>
                )}
                {/* o seletor de data do sistema (o mesmo do cadastro de usuário) */}
                <Grid item xs={12} md={faixa ? 4 : 6}>
                  <InputDatePicker
                    label="Candidaturas até"
                    value={dataDoDia(dados.encerraEm)}
                    onChange={(dia) =>
                      mudar({
                        encerraEm:
                          dia && isValid(dia)
                            ? format(dia, 'yyyy-MM-dd')
                            : null,
                      })
                    }
                    disablePast
                    slotProps={{
                      field: { clearable: true },
                      textField: {
                        size: 'small',
                        helperText: 'Opcional. Depois do dia, encerra sozinha',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  {/* o rótulo do "Descrição detalhada" do evento */}
                  <Typography variant="subtitle1" fontSize={16} mb={1}>
                    Descrição * — atividades, requisitos, horário, benefícios…
                  </Typography>
                  {/* o editor do sistema: fundo, borda e ícones iguais aos dos campos */}
                  <ReactQuillEditor
                    value={dados.descricao}
                    onChange={(html: string) => mudar({ descricao: html })}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Secao>
      )}

      {/* o editor e, ao lado, a prévia num Paper só dela; no celular a prévia desce */}
      {passo === 2 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1fr) minmax(0, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Secao titulo="Formulário de candidatura">
            <EditorDoFormulario
              campos={dados.formulario.campos}
              onChange={(campos) => mudar({ formulario: { campos } })}
            />
          </Secao>
          {/* top conta a partir do #layout-scroll, que já fica abaixo da appbar */}
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>
            <PreviaDoFormulario campos={dados.formulario.campos} />
          </Box>
        </Box>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1.5}
      >
        <Button
          variant="outlined"
          startIcon={passo === 2 ? <ArrowBack /> : undefined}
          sx={{ minWidth: 120 }}
          onClick={passo === 1 ? onCancelar : () => setPasso(1)}
          disabled={ocupado}
        >
          {passo === 1 ? 'Cancelar' : 'Voltar'}
        </Button>
        {problemas.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flex: 1, textAlign: 'right' }}
          >
            Falta: {problemas.join('; ')}
          </Typography>
        )}
        <Button
          variant="contained"
          sx={{ minWidth: 120 }}
          disabled={problemas.length > 0 || ocupado}
          onClick={passo === 1 ? () => setPasso(2) : enviar}
          endIcon={passo === 1 ? <ArrowForward /> : <Check />}
        >
          {passo === 1 ? 'Próximo' : ocupado ? 'Salvando…' : textoDoBotao}
        </Button>
      </Stack>
    </Paper>
  );
}
