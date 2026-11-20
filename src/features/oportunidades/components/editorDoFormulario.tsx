import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CheckBoxOutlineBlank,
  Close,
  DeleteOutline,
  RadioButtonUnchecked,
  VisibilityOutlined,
} from '@mui/icons-material';
import {
  DE_ESCOLHA,
  LIMITES,
  NOME_DO_TIPO,
  TIPOS_PROPRIOS,
  padraoQueFaltam,
} from '../formulario';
import { Campo, TipoDeCampo } from '../types';
import { CampoDoFormulario } from './campoDoFormulario';

const novoId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}`;

/**
 * As opções de uma pergunta de escolha, uma por campo, como no Google Forms:
 * o marcador do tipo (círculo, quadrado ou número), o texto e o X. Enter na
 * última cria a próxima; "Adicionar opção" também.
 */
function EditorDeOpcoes({
  tipo,
  opcoes,
  onChange,
}: {
  tipo: TipoDeCampo;
  opcoes: string[];
  onChange: (opcoes: string[]) => void;
}) {
  const campos = useRef<(HTMLInputElement | null)[]>([]);
  const [focar, setFocar] = useState<number | null>(null);
  const cheio = opcoes.length >= LIMITES.opcoes;

  // foca a opção recém-criada depois que ela existe na tela
  useEffect(() => {
    if (focar === null) return;
    campos.current[focar]?.focus();
    setFocar(null);
  }, [focar]);

  const adicionar = () => {
    if (cheio) return;
    onChange([...opcoes, '']);
    setFocar(opcoes.length);
  };

  const marcador = (i: number) =>
    tipo === 'OPCAO_UNICA' ? (
      <RadioButtonUnchecked fontSize="small" />
    ) : tipo === 'CAIXAS' ? (
      <CheckBoxOutlineBlank fontSize="small" />
    ) : (
      <Typography
        sx={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'right' }}
      >
        {i + 1}.
      </Typography>
    );

  return (
    <Stack spacing={1}>
      {opcoes.map((opcao, i) => (
        <Stack
          key={i}
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ color: 'text.secondary' }}
        >
          {marcador(i)}
          <TextField
            size="small"
            fullWidth
            placeholder={`Opção ${i + 1}`}
            value={opcao}
            inputRef={(el) => (campos.current[i] = el)}
            onChange={(e) =>
              onChange(opcoes.map((o, j) => (j === i ? e.target.value : o)))
            }
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (i === opcoes.length - 1) adicionar();
              else campos.current[i + 1]?.focus();
            }}
            inputProps={{ maxLength: 100, 'aria-label': `Opção ${i + 1}` }}
          />
          <Tooltip title="Remover opção">
            <IconButton
              size="small"
              onClick={() => onChange(opcoes.filter((_, j) => j !== i))}
              aria-label={`Remover opção ${i + 1}`}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}
      {!cheio && (
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ color: 'text.disabled' }}
        >
          {marcador(opcoes.length)}
          <Button
            size="small"
            onClick={adicionar}
            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
          >
            Adicionar opção
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

/**
 * O formulário de candidatura da vaga. Já vem com os campos prontos
 * (currículo, pretensão salarial, mensagem e um por rede social), que o admin
 * pode tirar ou exigir; e ele acrescenta perguntas próprias. A ordem daqui é
 * a da página de candidatura.
 */
export function EditorDoFormulario({
  campos,
  onChange,
}: {
  campos: Campo[];
  onChange: (campos: Campo[]) => void;
}) {
  const theme = useTheme();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const faltam = padraoQueFaltam(campos);
  const cheio = campos.length >= LIMITES.campos;

  const mudar = (i: number, parte: Partial<Campo>) =>
    onChange(campos.map((c, j) => (j === i ? { ...c, ...parte } : c)));
  const mover = (i: number, para: number) => {
    const nova = [...campos];
    [nova[i], nova[para]] = [nova[para], nova[i]];
    onChange(nova);
  };
  const adicionar = (campo: Campo) => {
    onChange([...campos, campo]);
    setMenu(null);
  };

  return (
    <Stack spacing={1.5}>
      {campos.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Sem campos: a candidatura é só um clique, com nome, celular e e-mail
          do perfil.
        </Typography>
      )}

      {campos.map((campo, i) => {
        const proprio = TIPOS_PROPRIOS.includes(campo.tipo);
        return (
          <Paper
            key={campo.id}
            elevation={0}
            sx={{
              p: 1.5,
              pl: 2,
              borderRadius: 2,
              // um tom abaixo do Paper da seção, e a faixa da cor do módulo
              // no campo em edição, como o Google Forms marca a pergunta ativa
              backgroundColor: 'background.default',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'inset 4px 0 0 transparent',
              transition: theme.transitions.create('box-shadow'),
              '&:focus-within': {
                boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
              },
            }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" alignItems="center" gap={1}>
                {proprio ? (
                  <TextField
                    size="small"
                    label={`Pergunta ${i + 1}`}
                    value={campo.rotulo}
                    onChange={(e) => mudar(i, { rotulo: e.target.value })}
                    inputProps={{ maxLength: LIMITES.rotulo }}
                    sx={{ flex: 1 }}
                  />
                ) : (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>
                      {campo.rotulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {NOME_DO_TIPO[campo.tipo]}
                    </Typography>
                  </Box>
                )}
                <Tooltip title="Subir">
                  <span>
                    <IconButton
                      size="small"
                      disabled={i === 0}
                      onClick={() => mover(i, i - 1)}
                      aria-label={`Subir ${campo.rotulo}`}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Descer">
                  <span>
                    <IconButton
                      size="small"
                      disabled={i === campos.length - 1}
                      onClick={() => mover(i, i + 1)}
                      aria-label={`Descer ${campo.rotulo}`}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onChange(campos.filter((_, j) => j !== i))}
                    aria-label={`Remover ${campo.rotulo || 'pergunta'}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {proprio && (
                <TextField
                  select
                  size="small"
                  label="Tipo de resposta"
                  value={campo.tipo}
                  onChange={(e) => {
                    const tipo = e.target.value as TipoDeCampo;
                    mudar(i, {
                      tipo,
                      // trocar para escolha começa com uma opção para digitar
                      ...(DE_ESCOLHA.includes(tipo) &&
                        !campo.opcoes?.length && { opcoes: [''] }),
                    });
                  }}
                  sx={{ maxWidth: 260 }}
                >
                  {TIPOS_PROPRIOS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {NOME_DO_TIPO[t]}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {DE_ESCOLHA.includes(campo.tipo) && (
                <EditorDeOpcoes
                  tipo={campo.tipo}
                  opcoes={campo.opcoes ?? []}
                  onChange={(opcoes) => mudar(i, { opcoes })}
                />
              )}

              <Divider />
              <FormControlLabel
                sx={{ alignSelf: 'flex-end', mr: 0 }}
                labelPlacement="start"
                control={
                  <Switch
                    size="small"
                    checked={campo.obrigatorio}
                    onChange={(e) =>
                      mudar(i, { obrigatorio: e.target.checked })
                    }
                  />
                }
                label={
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Obrigatório
                  </Typography>
                }
              />
            </Stack>
          </Paper>
        );
      })}

      <Box>
        <Button
          startIcon={<Add />}
          disabled={cheio}
          onClick={(e) => setMenu(e.currentTarget)}
          sx={{ textTransform: 'none' }}
        >
          Adicionar campo
        </Button>
        {cheio && (
          <Chip
            size="small"
            label={`Até ${LIMITES.campos} campos`}
            sx={{ ml: 1 }}
          />
        )}
        <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
          <ListSubheader>Pergunta própria</ListSubheader>
          {TIPOS_PROPRIOS.map((tipo) => (
            <MenuItem
              key={tipo}
              onClick={() =>
                adicionar({
                  id: novoId(),
                  tipo,
                  rotulo: '',
                  obrigatorio: false,
                  ...(DE_ESCOLHA.includes(tipo) && { opcoes: [''] }),
                })
              }
            >
              {NOME_DO_TIPO[tipo]}
            </MenuItem>
          ))}
          {faltam.length > 0 && <Divider />}
          {faltam.length > 0 && <ListSubheader>Campos prontos</ListSubheader>}
          {faltam.map((campo) => (
            <MenuItem key={campo.id} onClick={() => adicionar(campo)}>
              {campo.rotulo}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Stack>
  );
}

/**
 * O formulário como o candidato vai ver, ao vivo enquanto o admin edita, num
 * Paper só dele. É só para olhar: os campos não respondem a clique, teclado
 * nem leitor de tela (`inert`), para quem monta o formulário não confundir a
 * prévia com o editor.
 */
export function PreviaDoFormulario({ campos }: { campos: Campo[] }) {
  return (
    <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <VisibilityOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography fontWeight={800}>Prévia</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Como o candidato vê o formulário. Só para conferir: edite ao lado.
      </Typography>

      <Box
        // `inert` tira cliques, foco e leitor de tela de tudo aqui dentro
        {...{ inert: '' }}
        aria-hidden
        sx={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>
              Seus dados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nome, e-mail e celular vêm do perfil do candidato.
            </Typography>
          </Box>
          {campos.map((campo) => (
            <CampoDoFormulario
              key={campo.id}
              campo={{
                ...campo,
                rotulo: campo.rotulo.trim() || 'Pergunta sem título',
                opcoes: campo.opcoes?.filter((o) => o.trim()),
              }}
              valor={undefined}
              onChange={() => undefined}
              curriculo={null}
              onCurriculo={() => undefined}
            />
          ))}
          <Button variant="contained" disabled sx={{ alignSelf: 'flex-end' }}>
            Enviar candidatura
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
