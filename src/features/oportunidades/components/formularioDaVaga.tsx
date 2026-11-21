import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { DeleteOutline, ImageOutlined } from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { superficieSx } from '../../../components/listPageStyles';
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
    <Paper sx={{ ...superficieSx, p: { xs: 2, sm: 2.5 } }}>
      <Typography fontWeight={800} sx={{ mb: 2 }}>
        {titulo}
      </Typography>
      {children}
    </Paper>
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

  const problemas = [
    !dados.titulo.trim() && 'dê um título à vaga',
    !dados.empresa.trim() && 'diga quem oferece',
    !descricaoEmTexto(dados.descricao).trim() && 'descreva a vaga',
    faixaInvertida && 'o salário máximo é menor que o inicial',
    ...problemasDoFormulario(dados.formulario.campos),
  ].filter(Boolean) as string[];

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
                Imagem da vaga, geralmente a logo da empresa. PNG, JPG ou WEBP,
                até 5 MB.
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
          {/* o salário: valor fixo ou faixa; os dois são opcionais */}
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
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
                if (valor === 'fixo') mudar({ salario: { min: salario.min } });
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
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField
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
              sx={{ flex: 1 }}
            />
            {faixa && (
              <TextField
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
                helperText={faixaInvertida ? 'Menor que o valor inicial' : ' '}
                sx={{ flex: 1 }}
              />
            )}
            {/* o seletor de data do sistema (o mesmo do cadastro de usuário) */}
            <Box sx={{ flex: 1 }}>
              <InputDatePicker
                label="Candidaturas até"
                value={dataDoDia(dados.encerraEm)}
                onChange={(dia) =>
                  mudar({
                    encerraEm:
                      dia && isValid(dia) ? format(dia, 'yyyy-MM-dd') : null,
                  })
                }
                disablePast
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    helperText: 'Opcional. Depois do dia, encerra sozinha',
                  },
                }}
              />
            </Box>
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

      {/* o editor e, ao lado, a prévia num Paper só dela; no celular a prévia desce */}
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
        <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
          <PreviaDoFormulario campos={dados.formulario.campos} />
        </Box>
      </Box>

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
        <Button color="inherit" onClick={onCancelar} disabled={ocupado}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={problemas.length > 0 || ocupado}
          onClick={enviar}
        >
          {ocupado ? 'Salvando…' : textoDoBotao}
        </Button>
      </Stack>
    </Stack>
  );
}
