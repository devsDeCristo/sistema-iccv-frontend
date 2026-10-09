import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AddPhotoAlternateOutlined,
  Close,
  CampaignOutlined,
  DeleteOutline,
  ImageOutlined,
  WhatsApp,
} from '@mui/icons-material';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { useWhatsappConectado } from '../../settings/whatsapp/useWhatsappConectado';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { useGetNewsWhatsappGroups } from '../api/getWhatsappGroups';
import { useSaveNews } from '../api/saveNews';
import { useSaveNewsSchedules } from '../api/saveNewsSchedules';
import { News, NewsSchedule, WhatsappTargetGroup } from '../types';
import { ehLinkDeGrupo, problemaDoAgendamento } from '../utils';
import { AgendamentosDaNoticia } from './agendamentosDaNoticia';

/**
 * Os passos do formulário. Era uma página só, longa, e o que mais pesa — os
 * grupos e os agendamentos do WhatsApp — ficava no fim, depois do editor.
 */
const PASSOS = ['Conteúdo', 'Disparadores', 'Agendamento', 'Publicação'];

/** Limite do arquivo, o mesmo da capa do evento. */
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

interface NewsFormModalProps {
  open: boolean;
  /** Notícia em edição; ausente é criação */
  news?: News | null;
  onClose: () => void;
}

/**
 * Bloco do formulário.
 *
 * O rótulo segue a régua das tabelas — 11px, caixa alta, espaçado — porque é o
 * que separa as partes sem precisar de mais uma linha de moldura: o formulário
 * é longo, e sem esses cortes ele vira uma pilha de campos soltos.
 */
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1.5,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {titulo}
      </Typography>

      {children}
    </Box>
  );
}

interface CartaoDeDisparadorProps {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  /** sem `onLigar`, o disparador é fixo (o mural vale sempre) */
  ligado?: boolean;
  onLigar?: (ligado: boolean) => void;
  children?: ReactNode;
}

/** Um disparador — por onde a notícia sai —, com a chave de ligar quando há */
function CartaoDeDisparador({
  icone,
  titulo,
  descricao,
  ligado = true,
  onLigar,
  children,
}: CartaoDeDisparadorProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        sx={{ mb: children && ligado ? 2 : 0 }}
      >
        <Box
          sx={{
            display: 'flex',
            p: 1,
            borderRadius: 2,
            color: ligado ? 'primary.main' : 'text.disabled',
            backgroundColor: 'background.hover',
          }}
        >
          {icone}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descricao}
          </Typography>
        </Box>
        {onLigar && (
          <Switch
            checked={ligado}
            onChange={(evento) => onLigar(evento.target.checked)}
            inputProps={{ 'aria-label': `Usar ${titulo}` }}
          />
        )}
      </Stack>

      {children}
    </Box>
  );
}

function NewsFormModal({ open, news, onClose }: NewsFormModalProps) {
  const theme = useTheme();
  const inputArquivo = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [chamada, setChamada] = useState('');
  const [texto, setTexto] = useState('');
  const [publicada, setPublicada] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [removerImagem, setRemoverImagem] = useState(false);
  const [destinos, setDestinos] = useState<WhatsappTargetGroup[]>([]);
  /** vazio = aviso para todos; com evento, só quem está nele vê */
  const [eventoDoAnuncio, setEventoDoAnuncio] = useState('');
  const [arrastando, setArrastando] = useState(false);
  const [agendamentos, setAgendamentos] = useState<NewsSchedule[]>([]);
  /** links de convite de grupos que não são de inscrição de evento */
  const [links, setLinks] = useState<string[]>([]);
  const [linkInvalido, setLinkInvalido] = useState<string | null>(null);
  /** o WhatsApp é um disparador opcional; o mural (sistema) sempre vale */
  const [usaWhatsapp, setUsaWhatsapp] = useState(false);
  /** publicar ao salvar ou no primeiro horário agendado */
  const [modo, setModo] = useState<'agora' | 'agendar'>('agora');
  const [passo, setPasso] = useState(0);
  const [erros, setErros] = useState<{
    titulo?: boolean;
    texto?: boolean;
    agendamentos?: boolean;
  }>({});

  // a lista só é buscada com o modal aberto: é tela de admin, não vale manter
  // consulta viva atrás dela
  const { data: grupos } = useGetNewsWhatsappGroups({ enabled: open });

  // eventos da igreja de quem está logado — é o backend que faz esse recorte
  const { data: eventos } = useGetEvents(
    { painel: true },
    { enabled: open }
  );

  const { semNumero } = useWhatsappConectado();
  const navigate = useNavigate();

  const listaGrupos = useMemo(() => grupos ?? [], [grupos]);
  const listaEventos = useMemo(
    () => (Array.isArray(eventos) ? eventos : []),
    [eventos]
  );

  // reabrir o modal precisa recarregar o formulário: sem isto a segunda edição
  // abriria com os dados da primeira
  useEffect(() => {
    if (!open) return;

    setTitulo(news?.title || '');
    setChamada(news?.summary || '');
    setTexto(news?.content || '');
    setPublicada(!!news?.isPublished);
    setImagemAtual(news?.imageUrl || null);
    setArquivo(null);
    setRemoverImagem(false);
    setEventoDoAnuncio(news?.event?.id || '');
    setAgendamentos(news?.schedules ?? []);
    setLinks(news?.groupLinks?.map((destino) => destino.link) ?? []);
    setLinkInvalido(null);
    setUsaWhatsapp(!!(news?.groups?.length || news?.groupLinks?.length));
    setModo(news?.schedules?.length ? 'agendar' : 'agora');
    setErros({});
    setPasso(0);
  }, [open, news]);

  // os destinos só podem ser marcados depois que a lista de grupos chega
  useEffect(() => {
    if (!open) return;

    const marcados = news?.groups?.map((destino) => destino.groupRoleId) ?? [];

    setDestinos(listaGrupos.filter((grupo) => marcados.includes(grupo.id)));
  }, [open, news, listaGrupos]);

  // a prévia do arquivo escolhido é um endereço temporário do navegador, e
  // precisa ser devolvido: criar um por render vazava um a cada tecla digitada
  const [previaLocal, setPreviaLocal] = useState<string | null>(null);
  useEffect(() => {
    if (!arquivo) {
      setPreviaLocal(null);
      return undefined;
    }

    const endereco = URL.createObjectURL(arquivo);
    setPreviaLocal(endereco);

    return () => URL.revokeObjectURL(endereco);
  }, [arquivo]);

  const { mutateAsync: salvar, isLoading } = useSaveNews();
  const { mutateAsync: salvarAgendamentos, isLoading: agendando } =
    useSaveNewsSchedules();

  const previa = previaLocal ?? imagemAtual;

  // o texto do editor vem como HTML: vazio ainda é "<p><br></p>"
  const textoVazio = !texto.replace(/<(.|\n)*?>/g, '').trim();

  const escolherArquivo = (escolhido?: File | null) => {
    if (!escolhido) return;

    if (!escolhido.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem.');
      return;
    }

    if (escolhido.size > TAMANHO_MAXIMO) {
      toast.error('A imagem não deve passar de 2MB.');
      return;
    }

    setArquivo(escolhido);
    setRemoverImagem(false);
  };

  /**
   * O que acontece com o WhatsApp ao salvar. Fica no rodapé porque é
   * consequência de duas escolhas distantes uma da outra no formulário — os
   * grupos e a chave de publicação —, e a regra de quando o envio sai não é
   * óbvia: notícia já publicada não reenvia sozinha.
   */
  // grupos de inscrição e links avulsos: os dois recebem a notícia
  // com o WhatsApp desligado, os grupos marcados não valem
  const totalDeDestinos = usaWhatsapp ? destinos.length + links.length : 0;

  /**
   * O que acontece ao salvar. Fica no rodapé porque junta escolhas de passos
   * diferentes — disparadores, quando e rascunho.
   */
  const resumoDoEnvio = () => {
    if (!publicada) return 'Rascunho: nada é publicado nem enviado.';

    const whatsapp =
      !totalDeDestinos || semNumero
        ? ''
        : ` e envia para ${totalDeDestinos} grupo(s)`;

    if (modo === 'agendar') {
      return `Publica no mural${whatsapp} no primeiro horário agendado.`;
    }

    // já no ar: publicada e com data (a agendada fica sem data até sair)
    if (news?.isPublished && news.publishedAt) {
      return 'Já publicada: salvar não reenvia. Use o Reenviar na lista.';
    }

    return `Ao salvar, publica no mural${whatsapp}.`;
  };

  /** O que falta em cada passo; vazio quando o passo está pronto */
  const problemasDoPasso = (indice: number) => {
    if (indice === 0) {
      return { titulo: !titulo.trim(), texto: textoVazio };
    }
    if (indice === 2 && modo === 'agendar') {
      // conferido antes de salvar a notícia: se só os agendamentos falhassem,
      // a notícia nova ficaria gravada e salvar de novo criaria outra
      return {
        agendamentos:
          !agendamentos.length || agendamentos.some(problemaDoAgendamento),
      };
    }
    return {};
  };

  const passoComProblema = (indice: number) =>
    Object.values(problemasDoPasso(indice)).some(Boolean);

  /** Só avança com o passo atual pronto; o que falta fica marcado nele */
  const avancar = () => {
    if (passoComProblema(passo)) {
      setErros((atual) => ({ ...atual, ...problemasDoPasso(passo) }));
      return;
    }
    setPasso((atual) => atual + 1);
  };

  const enviar = async () => {
    // na edição dá para pular de passo, então o salvar confere todos e volta
    // para o primeiro que tem problema
    const comProblema = PASSOS.findIndex((_, indice) =>
      passoComProblema(indice)
    );
    if (comProblema >= 0) {
      setErros((atual) => ({ ...atual, ...problemasDoPasso(comProblema) }));
      setPasso(comProblema);
      return;
    }

    const salva = await salvar({
      id: news?.id,
      data: {
        title: titulo.trim(),
        summary: chamada.trim() || undefined,
        content: texto,
        isPublished: publicada,
        imageFile: arquivo,
        removeImage: removerImagem,
        eventId: eventoDoAnuncio || null,
        groupRoleIds: usaWhatsapp ? destinos.map((grupo) => grupo.id) : [],
        groupLinks: usaWhatsapp ? links : [],
        scheduled: modo === 'agendar',
      },
    });

    // só quando há o que gravar: notícia sem agendamento, antes e depois, não
    // precisa de mais uma chamada
    // "Imediatamente" apaga os horários que a notícia tinha
    const horarios = modo === 'agendar' ? agendamentos : [];
    if (salva?.id && (horarios.length || news?.schedules?.length)) {
      await salvarAgendamentos({ newsId: salva.id, schedules: horarios });
    }

    onClose();
  };

  const styles = {
    solta: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      p: 4,
      borderRadius: 3,
      border: '1px dashed',
      borderColor: arrastando ? 'primary.main' : 'divider',
      backgroundColor: arrastando
        ? alpha(theme.palette.primary.main, 0.06)
        : 'transparent',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'background-color .15s, border-color .15s',
      '&:hover': { backgroundColor: theme.palette.background.hover },
    },
    botaoSobreImagem: {
      borderRadius: 2,
      textTransform: 'none',
      color: '#FFFFFF',
      backgroundColor: alpha('#000000', 0.55),
      backdropFilter: 'blur(4px)',
      '&:hover': { backgroundColor: alpha('#000000', 0.72) },
    },
    publicacao: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 2,
      borderRadius: 3,
      border: '1px solid',
      borderColor: publicada
        ? alpha(theme.palette.chips.success, 0.4)
        : theme.palette.divider,
      backgroundColor: publicada
        ? alpha(theme.palette.chips.success, 0.07)
        : 'transparent',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* `component="div"`: o padrão do MUI é um h2, e o subtítulo abaixo do
          título é um parágrafo — parágrafo dentro de h2 é aninhamento inválido */}
      <DialogTitle component="div" sx={{ py: 2 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {news ? 'Editar notícia' : 'Nova notícia'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aparece no mural de todos os usuários — ou só de um evento, se
              você escolher — e, se marcar grupos, também no WhatsApp.
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose} aria-label="Fechar">
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* altura mínima: sem ela o modal muda de tamanho a cada passo e
          "pula" na tela */}
      <DialogContent sx={{ pt: 3, minHeight: { md: 520 } }}>
        <Stepper
          activeStep={passo}
          nonLinear={!!news}
          alternativeLabel
          sx={{ mb: 3 }}
        >
          {PASSOS.map((rotulo, indice) => (
            <Step key={rotulo} completed={!news && indice < passo}>
              {/* na edição tudo já está preenchido e dá para ir direto ao
                  passo; na criação, só voltar aos que já passaram */}
              <StepButton
                disabled={!news && indice > passo}
                onClick={() => setPasso(indice)}
              >
                <StepLabel
                  error={
                    (indice === 0 && !!(erros.titulo || erros.texto)) ||
                    (indice === 2 && !!erros.agendamentos)
                  }
                >
                  {rotulo}
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Stack gap={3}>
          {passo === 0 && (
            <>
              <Secao titulo="Conteúdo">
                <Stack gap={2.5}>
                  <TextField
                    label="Título"
                    size="small"
                    value={titulo}
                    onChange={(evento) => {
                      setTitulo(evento.target.value);
                      if (erros.titulo)
                        setErros((atual) => ({ ...atual, titulo: false }));
                    }}
                    error={erros.titulo}
                    helperText={
                      erros.titulo
                        ? 'Dê um título para a notícia.'
                        : `${titulo.length}/140`
                    }
                    inputProps={{ maxLength: 140 }}
                  />

                  <TextField
                    label="Chamada"
                    size="small"
                    multiline
                    minRows={2}
                    value={chamada}
                    onChange={(evento) => setChamada(evento.target.value)}
                    inputProps={{ maxLength: 280 }}
                    helperText={`Resumo de uma linha, mostrado no mural · ${chamada.length}/280`}
                  />

                  <Box>
                    <ReactQuillEditor
                      error={erros.texto}
                      value={texto}
                      onChange={(valor) => {
                        setTexto(valor);
                        if (erros.texto)
                          setErros((atual) => ({ ...atual, texto: false }));
                      }}
                    />

                    {erros.texto && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        Escreva o texto da notícia.
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Secao>

              <Divider />

              <Secao titulo="Imagem">
                <input
                  ref={inputArquivo}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(evento) => {
                    escolherArquivo(evento.target.files?.[0]);
                    // permite escolher o mesmo arquivo de novo depois de remover
                    evento.target.value = '';
                  }}
                />

                {previa ? (
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component="img"
                      src={previa}
                      alt="Prévia da imagem"
                      sx={{
                        display: 'block',
                        width: '100%',
                        maxHeight: 260,
                        objectFit: 'cover',
                      }}
                    />

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ position: 'absolute', right: 12, bottom: 12 }}
                    >
                      <Button
                        size="small"
                        startIcon={<ImageOutlined />}
                        sx={styles.botaoSobreImagem}
                        onClick={() => inputArquivo.current?.click()}
                      >
                        Trocar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteOutline />}
                        sx={styles.botaoSobreImagem}
                        onClick={() => {
                          setArquivo(null);
                          setImagemAtual(null);
                          setRemoverImagem(true);
                        }}
                      >
                        Remover
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={styles.solta}
                    onClick={() => inputArquivo.current?.click()}
                    onDragOver={(evento) => {
                      evento.preventDefault();
                      setArrastando(true);
                    }}
                    onDragLeave={() => setArrastando(false)}
                    onDrop={(evento) => {
                      evento.preventDefault();
                      setArrastando(false);
                      escolherArquivo(evento.dataTransfer.files?.[0]);
                    }}
                  >
                    <AddPhotoAlternateOutlined
                      sx={{ fontSize: 40, color: 'text.disabled' }}
                    />
                    <Typography variant="body2">
                      Arraste uma imagem aqui ou clique para escolher
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Até 2MB. Vai junto da mensagem no WhatsApp, como foto com
                      legenda.
                    </Typography>
                  </Box>
                )}
              </Secao>
            </>
          )}

          {passo === 1 && (
            <>
              <CartaoDeDisparador
                icone={<CampaignOutlined />}
                titulo="Sistema"
                descricao="O mural de notícias dos inscritos. Toda notícia publicada aparece nele."
              >
                <TextField
                  label="Quem vê no mural"
                  // sem isto o "Todos os usuários" (valor vazio) não aparece
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  select
                  size="small"
                  fullWidth
                  value={eventoDoAnuncio}
                  onChange={(evento) => setEventoDoAnuncio(evento.target.value)}
                  helperText={
                    eventoDoAnuncio
                      ? 'Só quem está neste evento vê o anúncio — inscritos e lista de espera.'
                      : 'O anúncio aparece para todos os usuários.'
                  }
                >
                  <MenuItem value="">Todos os usuários</MenuItem>
                  {listaEventos.map((evento) => (
                    <MenuItem key={evento.id} value={evento.id}>
                      {evento.name}
                    </MenuItem>
                  ))}
                </TextField>
              </CartaoDeDisparador>

              <CartaoDeDisparador
                icone={<WhatsApp />}
                titulo="WhatsApp"
                descricao="Envia a notícia nos grupos, pelo número da igreja."
                ligado={usaWhatsapp}
                onLigar={setUsaWhatsapp}
              >
                {usaWhatsapp && (
                  <Stack>
                    {semNumero && (
                      <Alert
                        severity="warning"
                        sx={{ borderRadius: 2, mb: 2 }}
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                            onClick={() => {
                              onClose();
                              navigate('/configuracoes/disparadores/whatsapp');
                            }}
                          >
                            Configurar
                          </Button>
                        }
                      >
                        <strong>
                          Nenhum disparador de WhatsApp conectado.
                        </strong>{' '}
                        Sem ele, a notícia não sai em grupo nenhum — nem agora,
                        nem nos agendamentos. Ela pode ser salva do mesmo jeito.
                      </Alert>
                    )}

                    <Autocomplete
                      multiple
                      size="small"
                      // sem número conectado a escolha não leva a nada: o disparo só
                      // gravaria falha em cada grupo. Os já marcados continuam à vista,
                      // porque a notícia em edição pode ter sido montada antes da queda
                      disabled={semNumero}
                      options={listaGrupos}
                      value={destinos}
                      onChange={(_, valor) => setDestinos(valor)}
                      isOptionEqualToValue={(opcao, valor) =>
                        opcao.id === valor.id
                      }
                      getOptionLabel={(grupo) => grupo.name}
                      // agrupa por evento: o mesmo nome de grupo aparece em vários
                      // cursilhos, e sem o cabeçalho não dá para saber qual é qual
                      groupBy={(grupo) =>
                        grupo.event.status === 'TEST'
                          ? `${grupo.event.name} (em teste)`
                          : grupo.event.name
                      }
                      renderTags={(valor, getTagProps) =>
                        valor.map((grupo, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={grupo.id}
                            size="small"
                            label={`${grupo.event.name} / ${grupo.name}`}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={
                            destinos.length
                              ? ''
                              : semNumero
                                ? 'Sem número conectado'
                                : 'Nenhum grupo escolhido'
                          }
                        />
                      )}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      A lista traz os grupos com link preenchido, de eventos
                      ativos ou em teste. As mensagens saem uma de cada vez, com
                      intervalo entre elas.
                    </Typography>

                    {!semNumero && !listaGrupos.length && (
                      <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
                        Nenhum grupo de evento disponível. Preencha o link do
                        grupo de WhatsApp no cadastro do evento, na aba de
                        inscrições — ou cole o link de um grupo abaixo.
                      </Alert>
                    )}

                    <Autocomplete
                      multiple
                      freeSolo
                      // ao sair do campo, o link colado vira chip sem precisar do Enter
                      autoSelect
                      size="small"
                      disabled={semNumero}
                      options={[] as string[]}
                      value={links}
                      sx={{ mt: 2 }}
                      onChange={(_, valor) => {
                        // colar vários de uma vez (um por linha) também vale
                        const novos = valor
                          .flatMap((item) => String(item).split(/\s+/))
                          .filter(Boolean)
                          // `?mode=...` do "copiar link" do WhatsApp: o mesmo grupo
                          .map((link) => link.replace(/[?#].*$/, ''));
                        const invalido = novos.find(
                          (link) => !ehLinkDeGrupo(link)
                        );

                        if (invalido) {
                          setLinkInvalido(invalido);
                          return;
                        }

                        setLinkInvalido(null);
                        setLinks([...new Set(novos)]);
                      }}
                      renderTags={(valor, getTagProps) =>
                        valor.map((link, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={link}
                            size="small"
                            label={link.replace(/^https?:\/\//, '')}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Outros grupos (link)"
                          placeholder={
                            links.length
                              ? ''
                              : 'Cole o link do grupo e tecle Enter'
                          }
                          error={!!linkInvalido}
                          helperText={
                            linkInvalido
                              ? `"${linkInvalido}" não é link de grupo do WhatsApp (https://chat.whatsapp.com/...).`
                              : 'Grupos que não são de inscrição de evento: o geral da igreja, de um ministério. O número da igreja precisa estar no grupo.'
                          }
                        />
                      )}
                    />
                  </Stack>
                )}
              </CartaoDeDisparador>
            </>
          )}

          {passo === 2 && (
            <Secao titulo="Quando publicar">
              <RadioGroup
                value={modo}
                onChange={(evento) => {
                  setModo(evento.target.value as 'agora' | 'agendar');
                  setErros((atual) => ({ ...atual, agendamentos: false }));
                }}
              >
                <FormControlLabel
                  value="agora"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        Imediatamente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Publica e envia ao salvar.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    mb: 1.5,
                    '& .MuiRadio-root': { mt: -0.5 },
                  }}
                />
                <FormControlLabel
                  value="agendar"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>Agendar</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Entra no mural no primeiro horário marcado e, em cada
                        horário, sai de novo nos grupos do WhatsApp. Pode ser
                        uma vez ou toda semana (ex.: toda terça às 12:00), no
                        horário de Brasília.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    '& .MuiRadio-root': { mt: -0.5 },
                  }}
                />
              </RadioGroup>

              {modo === 'agendar' && (
                <Box sx={{ mt: 2 }}>
                  <AgendamentosDaNoticia
                    value={agendamentos}
                    mostrarProblemas={erros.agendamentos}
                    onChange={(lista) => {
                      setAgendamentos(lista);
                      if (
                        erros.agendamentos &&
                        !lista.some(problemaDoAgendamento)
                      )
                        setErros((atual) => ({
                          ...atual,
                          agendamentos: false,
                        }));
                    }}
                  />

                  {erros.agendamentos && !agendamentos.length && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Adicione ao menos um horário.
                    </Typography>
                  )}
                </Box>
              )}
            </Secao>
          )}

          {passo === 3 && (
            <>
              <Secao titulo="Resumo">
                <Stack
                  divider={<Divider flexItem />}
                  sx={{
                    px: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {[
                    ['Título', titulo.trim()],
                    ['Imagem', previa ? 'Com imagem' : 'Sem imagem'],
                    [
                      'Mural',
                      eventoDoAnuncio
                        ? `Só quem está em ${
                            listaEventos.find((e) => e.id === eventoDoAnuncio)
                              ?.name ?? 'um evento'
                          }`
                        : 'Todos os usuários',
                    ],
                    [
                      'WhatsApp',
                      !usaWhatsapp
                        ? 'Desligado'
                        : totalDeDestinos
                          ? `${totalDeDestinos} grupo(s)`
                          : 'Nenhum grupo',
                    ],
                    [
                      'Quando',
                      modo === 'agendar'
                        ? `${agendamentos.length} horário(s) agendado(s)`
                        : 'Imediatamente',
                    ],
                  ].map(([rotulo, valor]) => (
                    <Stack
                      key={rotulo}
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                      sx={{ py: 1.25 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {rotulo}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, textAlign: 'right' }}
                      >
                        {valor}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Secao>

              <Secao titulo="Rascunho">
                <Box sx={styles.publicacao}>
                  <Switch
                    checked={publicada}
                    onChange={(evento) => setPublicada(evento.target.checked)}
                  />

                  <Box>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {publicada ? 'Pronta para publicar' : 'Rascunho'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {!publicada
                        ? 'Só o admin vê. Nada é publicado nem enviado — nem nos horários agendados.'
                        : modo === 'agendar'
                          ? 'Entra no mural no primeiro horário agendado.'
                          : 'Aparece no mural assim que você salvar.'}
                    </Typography>
                  </Box>
                </Box>
              </Secao>
            </>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1, mr: 1 }}
        >
          {resumoDoEnvio()}
        </Typography>

        <Button
          onClick={passo === 0 ? onClose : () => setPasso(passo - 1)}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {passo === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {/* na edição o salvar fica sempre à mão: mudar só o título não
            obriga a percorrer os quatro passos */}
        {passo < PASSOS.length - 1 && (
          <Button
            variant={news ? 'outlined' : 'contained'}
            onClick={avancar}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Próximo
          </Button>
        )}
        {(news || passo === PASSOS.length - 1) && (
          <Button
            variant="contained"
            disabled={isLoading || agendando}
            onClick={() => {
              // o erro já virou aviso na tela (`handleResponseThrowError`); o
              // modal fica aberto para corrigir
              enviar().catch(() => undefined);
            }}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {news ? 'Salvar' : 'Criar notícia'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export { NewsFormModal };
