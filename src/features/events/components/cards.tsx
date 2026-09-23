import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Divider,
  InputAdornment,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonthOutlined,
  CheckRounded,
  ChurchOutlined,
  EventAvailableOutlined,
  KeyboardArrowDownRounded,
  RoomOutlined,
  Search,
} from '@mui/icons-material';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { useGetGroupsByUser } from '../../admin/events/api/getGroupsByUser';
import { Event } from '../../admin/events/types';
import { degradeVivo } from '../../../themes';
import { useRole } from '../../../hooks/useRole';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import {
  contagemRegressiva,
  eventosAbertos,
  eventosEncerrados,
  filtrarPorIgreja,
  formatarPeriodo,
  igrejasDosEventos,
  lerIgrejaSalva,
  salvarIgreja,
  TODAS_AS_IGREJAS,
} from '../utils';

/** Como o usuário aparece neste evento, se aparecer. */
type MinhaSituacao = 'inscrito' | 'espera' | null;

function Meta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          color: 'text.secondary',
          '& svg': { fontSize: 15 },
        }}
      >
        {icone}
      </Box>
      <Typography
        noWrap
        sx={{ fontSize: '0.8125rem', color: 'text.secondary', minWidth: 0 }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/** Etiqueta pequena, do tamanho do texto ao lado — nada de selo grande. */
function Etiqueta({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        px: 0.85,
        py: 0.15,
        borderRadius: 1,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: cor,
        backgroundColor: alpha(cor, 0.12),
        border: `1px solid ${alpha(cor, 0.28)}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Um evento por linha: miniatura, nome, quando e onde, vagas e o botão.
 *
 * Linha em vez de card grande de propósito. São poucos eventos abertos ao mesmo
 * tempo, e em grade cada card virava um bloco enorme de foto — com uma linha
 * baixa a pessoa vê todos os eventos de uma vez, sem rolar, e a página fica
 * calma.
 */
function LinhaEvento({
  event,
  minhaSituacao,
  proximo,
  encerrado,
}: {
  event: Event;
  minhaSituacao: MinhaSituacao;
  proximo?: boolean;
  /** Evento que já acabou: a linha entra apagada e não abre */
  encerrado?: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const escuro = theme.palette.mode === 'dark';
  const abrir = () => navigate(`/eventos/${event.id}`);

  const contagem = contagemRegressiva(event.startDate, event.endDate);

  return (
    <Paper
      onClick={encerrado ? undefined : abrir}
      sx={{
        // moldura enxuta: com a capa maior, 1.5 de respiro em volta virava uma
        // borda larga de papel em torno da imagem
        p: 1,
        borderRadius: 3,
        cursor: encerrado ? 'default' : 'pointer',
        // o próximo evento ganha o mesmo tingimento da faixa de boas-vindas, e
        // não um banner à parte: destaca sem quebrar o ritmo da lista. Mais
        // fraco que a faixa para não competir com ela
        backgroundImage: proximo ? degradeVivo(escuro, 100, 0.8) : undefined,
        transition: theme.transitions.create(['background-color'], {
          duration: 160,
        }),
        /**
         * Apagado como campo desabilitado, e a capa perde a cor: é o que separa
         * o que já passou do que ainda dá para fazer, sem precisar escrever
         * "encerrado" em cada canto da linha.
         */
        ...(encerrado
          ? { opacity: 0.55, '& img': { filter: 'grayscale(1)' } }
          : {
              '&:hover': { backgroundColor: theme.palette.background.hover },
              '&:hover .titulo-evento': {
                color: theme.palette.primary.main,
              },
            }),
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1.5, sm: 2 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: { xs: '100%', sm: 150 },
            height: { xs: 150, sm: 100 },
            borderRadius: 2,
            overflow: 'hidden',
            backgroundImage: `url(${event.data?.coverUrl || CapaLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* a logo do evento volta para cima da capa, como era no card antigo.
              O véu por baixo dela é o que a mantém legível sobre foto clara, e
              só entra quando existe logo — sem ela, a capa fica limpa */}
          {event.data?.logoUrl && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: alpha('#0B1220', 0.2),
                }}
              />
              <Box
                component="img"
                src={event.data.logoUrl}
                alt={`Logo de ${event.name}`}
                sx={{
                  position: 'relative',
                  /**
                   * `width`/`height` com `contain`, e não `maxWidth`/`maxHeight`:
                   * com máximo a logo só é reduzida, então arquivo pequeno
                   * continuava pequeno na tela. Com tamanho fixo ela cresce até
                   * encostar em um dos lados, mantendo a proporção.
                   */
                  width: '88%',
                  height: '88%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.45))',
                }}
              />
            </>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ mb: 0.5, flexWrap: 'wrap' }}
          >
            {event.status === 'TEST' && (
              <Etiqueta cor={theme.palette.chips.alert}>Teste</Etiqueta>
            )}
            {minhaSituacao && (
              <Etiqueta
                cor={
                  minhaSituacao === 'inscrito'
                    ? theme.palette.chips.success
                    : theme.palette.chips.info
                }
              >
                {minhaSituacao === 'inscrito' ? 'Inscrito' : 'Lista de espera'}
              </Etiqueta>
            )}
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {event.type}
              {contagem ? ` · ${contagem}` : ''}
            </Typography>
          </Stack>

          <Typography
            className="titulo-evento"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              lineHeight: 1.3,
              transition: theme.transitions.create('color', { duration: 160 }),
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </Typography>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            gap={{ xs: 0.4, lg: 2 }}
            sx={{ mt: 0.6, minWidth: 0 }}
          >
            <Meta icone={<CalendarMonthOutlined />}>
              {formatarPeriodo(event.startDate, event.endDate)}
            </Meta>
            {event.data?.localName && (
              <Meta icone={<RoomOutlined />}>{event.data.localName}</Meta>
            )}
          </Stack>
        </Box>

        <Stack
          gap={1}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 150 },
            alignItems: { xs: 'stretch', sm: 'flex-end' },
          }}
        >
          <Button
            variant={proximo ? 'contained' : 'outlined'}
            size="small"
            fullWidth
            disabled={encerrado}
            sx={{ borderRadius: 2, textTransform: 'none' }}
            onClick={(clique) => {
              clique.stopPropagation();
              abrir();
            }}
          >
            {encerrado
              ? 'Encerrado'
              : minhaSituacao
                ? 'Ver meu evento'
                : 'Ver detalhes'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function EsqueletoLinha() {
  return (
    <Paper sx={{ p: 1, borderRadius: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        alignItems="center"
      >
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 2,
            width: { xs: '100%', sm: 150 },
            height: { xs: 150, sm: 100 },
            flexShrink: 0,
          }}
        />
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Skeleton width={90} height={14} />
          <Skeleton width="55%" height={22} />
          <Skeleton width="40%" height={16} />
        </Box>
        <Skeleton
          variant="rectangular"
          sx={{ borderRadius: 2, width: { xs: '100%', sm: 150 }, height: 31 }}
        />
      </Stack>
    </Paper>
  );
}

/**
 * Título de seção da lista. O contador do lado direito responde "quantos são?"
 * sem a pessoa ter que contar as linhas — e some quando a seção não é sobre
 * quantidade, como a dos encerrados.
 */
function TituloSecao({
  children,
  quantidade,
}: {
  children: ReactNode;
  quantidade?: number;
}) {
  return (
    <Stack
      direction="row"
      alignItems="baseline"
      justifyContent="space-between"
      sx={{ mb: 1.25, mt: 0.5 }}
    >
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
        {children}
      </Typography>
      {quantidade !== undefined && (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {quantidade === 1 ? '1 evento' : `${quantidade} eventos`}
        </Typography>
      )}
    </Stack>
  );
}

/**
 * Nenhum evento aberto não é erro: é o estado normal entre dois eventos.
 *
 * Com filtro de igreja ligado o vazio tem outra causa — pode haver evento
 * aberto logo ali, em outra igreja. Aí o texto diz isso e oferece a saída, em
 * vez de mandar a pessoa para as inscrições dela.
 */
function SemEventos({
  igrejaFiltrada,
  onLimparFiltro,
}: {
  /** Nome da igreja escolhida no filtro, quando há uma */
  igrejaFiltrada?: string;
  onLimparFiltro?: () => void;
}) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Paper sx={{ borderRadius: 3, p: 3.5, textAlign: 'center' }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          mx: 'auto',
          mb: 1.5,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        <EventAvailableOutlined sx={{ fontSize: 26 }} />
      </Box>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
        {igrejaFiltrada
          ? `Nenhum evento aberto em ${igrejaFiltrada}`
          : 'Nenhum evento com inscrições abertas'}
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.875rem',
          color: 'text.secondary',
          maxWidth: 420,
          mx: 'auto',
        }}
      >
        {igrejaFiltrada
          ? 'Outras igrejas podem estar com inscrições abertas agora.'
          : 'Assim que um evento novo abrir, ele aparece aqui. Enquanto isso, você pode acompanhar suas inscrições e pagamentos.'}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
        onClick={
          igrejaFiltrada && onLimparFiltro
            ? onLimparFiltro
            : () => navigate('/minhasInscricoes')
        }
      >
        {igrejaFiltrada && onLimparFiltro
          ? 'Ver todas as igrejas'
          : 'Ver minhas inscrições'}
      </Button>
    </Paper>
  );
}

/** Uma igreja na lista do filtro. */
function OpcaoDeIgreja({
  nome,
  quantidade,
  escolhida,
  onClick,
}: {
  nome: string;
  quantidade: number;
  escolhida: boolean;
  onClick: () => void;
}) {
  const theme = useTheme();

  return (
    <Box
      component="li"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.9,
        cursor: 'pointer',
        listStyle: 'none',
        backgroundColor: escolhida
          ? alpha(theme.palette.primary.main, 0.1)
          : 'transparent',
        '&:hover': {
          backgroundColor: escolhida
            ? alpha(theme.palette.primary.main, 0.14)
            : theme.palette.background.hover,
        },
      }}
    >
      <CheckRounded
        sx={{
          fontSize: 17,
          flexShrink: 0,
          // o espaço do certo fica reservado: sem ele a linha escolhida
          // empurrava o nome das outras para o lado
          color: escolhida ? theme.palette.primary.main : 'transparent',
        }}
      />
      <Typography
        noWrap
        sx={{
          flexGrow: 1,
          minWidth: 0,
          fontSize: '0.875rem',
          fontWeight: escolhida ? 600 : 400,
          color: escolhida ? theme.palette.primary.main : 'text.primary',
        }}
      >
        {nome}
      </Typography>
      {quantidade > 0 && (
        <Typography
          sx={{ fontSize: '0.75rem', color: 'text.secondary', flexShrink: 0 }}
        >
          {quantidade}
        </Typography>
      )}
    </Box>
  );
}

/**
 * De qual igreja a pessoa quer ver evento.
 *
 * Uma pastilha que abre a lista, e não um campo de formulário nem uma fileira
 * de fichas. A fileira era bonita com três igrejas e virava parede com trinta;
 * o campo de busca escalava, mas punha um formulário no meio de uma página que
 * é só leitura. A pastilha ocupa o tamanho de um botão em qualquer cadastro,
 * mostra o recorte atual escrito nela e se pinta de cor primária quando há
 * filtro ligado — dá para saber que a lista está recortada sem abrir nada.
 *
 * Dentro, busca no topo e a lista rolando embaixo: com muitas igrejas se
 * digita, com poucas se escolhe direto. O número à direita de cada linha é
 * quantos eventos abertos aquela igreja tem — é o que decide o clique.
 *
 * Só entra na tela com mais de uma igreja no catálogo: com uma só, o filtro
 * seria uma pergunta de resposta única.
 */
function FiltroDeIgreja({
  igrejas,
  valor,
  contagem,
  onChange,
}: {
  igrejas: { id: string; nome: string }[];
  valor: string;
  /** quantos eventos abertos cada igreja tem, e o total em `TODAS_AS_IGREJAS` */
  contagem: Record<string, number>;
  onChange: (igrejaId: string) => void;
}) {
  const theme = useTheme();
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const [busca, setBusca] = useState('');

  const escolhida = igrejas.find((igreja) => igreja.id === valor);
  const filtrando = !!escolhida;

  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? igrejas.filter((igreja) => igreja.nome.toLowerCase().includes(termo))
    : igrejas;

  const fechar = () => {
    setAncora(null);
    setBusca('');
  };

  const escolher = (igrejaId: string) => {
    onChange(igrejaId);
    fechar();
  };

  return (
    <>
      <ButtonBase
        onClick={(clique) => setAncora(clique.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          maxWidth: 260,
          px: 1.5,
          py: 0.7,
          borderRadius: 999,
          border: '1px solid',
          borderColor: filtrando
            ? alpha(theme.palette.primary.main, 0.4)
            : theme.palette.divider,
          backgroundColor: filtrando
            ? alpha(theme.palette.primary.main, 0.1)
            : theme.palette.background.paper,
          color: filtrando ? theme.palette.primary.main : 'text.secondary',
          transition: theme.transitions.create(
            ['background-color', 'border-color'],
            { duration: 160 }
          ),
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
        }}
      >
        <ChurchOutlined sx={{ fontSize: 17, flexShrink: 0 }} />
        <Typography
          noWrap
          sx={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: 0 }}
        >
          {escolhida?.nome ?? 'Todas as igrejas'}
        </Typography>
        <KeyboardArrowDownRounded sx={{ fontSize: 18, flexShrink: 0 }} />
      </ButtonBase>

      <Popover
        open={!!ancora}
        anchorEl={ancora}
        onClose={fechar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { mt: 0.75, width: 290, borderRadius: 3, overflow: 'hidden' },
        }}
      >
        <Box sx={{ p: 1.25 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Buscar igreja"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            InputProps={{
              sx: { borderRadius: 2, fontSize: '0.875rem' },
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider />

        {/* a rolagem é o que faz isto aguentar trinta igrejas sem crescer */}
        <Box
          component="ul"
          sx={{ m: 0, p: 0, py: 0.5, maxHeight: 264, overflowY: 'auto' }}
        >
          <OpcaoDeIgreja
            nome="Todas as igrejas"
            quantidade={contagem[TODAS_AS_IGREJAS] ?? 0}
            escolhida={!filtrando}
            onClick={() => escolher(TODAS_AS_IGREJAS)}
          />

          {visiveis.map((igreja) => (
            <OpcaoDeIgreja
              key={igreja.id}
              nome={igreja.nome}
              quantidade={contagem[igreja.id] ?? 0}
              escolhida={igreja.id === valor}
              onClick={() => escolher(igreja.id)}
            />
          ))}

          {visiveis.length === 0 && (
            <Typography
              sx={{
                px: 1.5,
                py: 1.5,
                fontSize: '0.8125rem',
                color: 'text.secondary',
              }}
            >
              Nenhuma igreja com esse nome.
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
}

function Cards() {
  const { data, isLoading } = useGetEvents({});
  const { isAdmin } = useRole();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data: gruposDoUsuario } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  /**
   * A igreja escolhida volta do storage já no primeiro quadro: quem sempre vê
   * eventos da própria igreja escolhe uma vez, e não toda vez que abre a home.
   */
  const [igrejaEscolhida, setIgrejaEscolhida] = useState(lerIgrejaSalva);
  const igrejas = useMemo(() => igrejasDosEventos(data), [data]);

  /**
   * Igreja salva que não está mais no catálogo (saiu do ar, mudou de nome, a
   * pessoa trocou de conta) não pode esconder a página inteira: vale como
   * "todas" até alguém escolher de novo, e o que está gravado fica quieto.
   */
  const igrejaAtiva = igrejas.some((igreja) => igreja.id === igrejaEscolhida)
    ? igrejaEscolhida
    : TODAS_AS_IGREJAS;

  const escolherIgreja = (igrejaId: string) => {
    setIgrejaEscolhida(igrejaId);
    salvarIgreja(igrejaId);
  };

  /**
   * O recorte é feito no catálogo cru, antes de separar aberto de encerrado:
   * `eventosEncerrados` devolve só os dois últimos, e filtrar depois deles
   * deixaria a seção vazia sempre que os dois últimos fossem de outra igreja.
   */
  const doCatalogo = useMemo(
    () =>
      filtrarPorIgreja(
        Array.isArray(data) ? (data as Event[]) : [],
        igrejaAtiva
      ),
    [data, igrejaAtiva]
  );

  // admin e super admin também enxergam os eventos em teste, marcados na linha
  const eventos = useMemo(
    () => eventosAbertos(doCatalogo, isAdmin),
    [doCatalogo, isAdmin]
  );
  const encerrados = useMemo(() => eventosEncerrados(doCatalogo), [doCatalogo]);

  /**
   * Quantos eventos abertos cada igreja tem — o número que aparece na lista do
   * filtro. Sai do catálogo inteiro, e não do recorte atual: é justamente para
   * a pessoa ver o que existe do outro lado do filtro em que ela está.
   */
  const contagemPorIgreja = useMemo(() => {
    const abertos = eventosAbertos(data, isAdmin);
    const mapa: Record<string, number> = {
      [TODAS_AS_IGREJAS]: abertos.length,
    };

    abertos.forEach((event) => {
      const igrejaId = event.church?.id;
      if (igrejaId) mapa[igrejaId] = (mapa[igrejaId] ?? 0) + 1;
    });

    return mapa;
  }, [data, isAdmin]);

  const filtro = igrejas.length > 1 && (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.75 }}>
      <FiltroDeIgreja
        igrejas={igrejas}
        valor={igrejaAtiva}
        contagem={contagemPorIgreja}
        onChange={escolherIgreja}
      />
    </Box>
  );

  const nomeDaIgrejaAtiva = igrejas.find(
    (igreja) => igreja.id === igrejaAtiva
  )?.nome;

  /**
   * Em quais destes eventos o usuário já está — a linha diz isso na cara, para
   * ninguém tentar se inscrever duas vezes nem precisar abrir "Minhas
   * inscrições" para conferir. Os grupos vêm com o `eventId`, que é o que liga
   * uma coisa na outra.
   */
  const situacaoPorEvento = useMemo(() => {
    const mapa = new Map<string, MinhaSituacao>();

    (gruposDoUsuario?.waitlist || []).forEach((grupo) => {
      if (grupo.eventId) mapa.set(grupo.eventId, 'espera');
    });
    // inscrito ganha da lista de espera: quem tem as duas coisas já está dentro
    (gruposDoUsuario?.present || []).forEach((grupo) => {
      if (grupo.eventId) mapa.set(grupo.eventId, 'inscrito');
    });

    return mapa;
  }, [gruposDoUsuario]);

  const linha = (event: Event, proximo?: boolean, encerrado?: boolean) => (
    <LinhaEvento
      key={event.id}
      event={event}
      proximo={proximo}
      encerrado={encerrado}
      minhaSituacao={situacaoPorEvento.get(event.id) ?? null}
    />
  );

  /**
   * Os que já acabaram fecham a página, depois dos abertos. Ficam fora do
   * caminho de quem veio se inscrever, mas seguram a tela no intervalo entre
   * dois eventos, quando ela ficaria só com o aviso de "nada aberto".
   */
  const secaoEncerrados = encerrados.length > 0 && (
    <Box sx={{ mt: 3 }}>
      <TituloSecao>Eventos encerrados</TituloSecao>
      <Stack gap={1.5}>
        {encerrados.map((event) => linha(event, false, true))}
      </Stack>
    </Box>
  );

  if (isLoading) {
    return (
      <Box>
        <TituloSecao quantidade={2}>Próximos eventos</TituloSecao>
        <Stack gap={1.5}>
          <EsqueletoLinha />
          <EsqueletoLinha />
        </Stack>
      </Box>
    );
  }

  if (eventos.length === 0) {
    return (
      <Box>
        {filtro}
        <SemEventos
          igrejaFiltrada={nomeDaIgrejaAtiva}
          onLimparFiltro={() => escolherIgreja(TODAS_AS_IGREJAS)}
        />
        {secaoEncerrados}
      </Box>
    );
  }

  /**
   * "Próximos" são os que já têm contagem regressiva — até 45 dias, ou já
   * acontecendo. O resto fica em "Outros eventos", que é onde caem as inscrições
   * abertas com muita antecedência.
   *
   * O primeiro da lista entra em "Próximos" de qualquer jeito: se todo evento
   * aberto ainda está longe, a página começaria por "Outros eventos", o que soa
   * estranho para quem chegou.
   */
  const proximos = eventos.filter(
    (event, posicao) =>
      posicao === 0 || contagemRegressiva(event.startDate, event.endDate)
  );
  const outros = eventos.filter((event) => !proximos.includes(event));

  return (
    <Box>
      {filtro}
      <TituloSecao quantidade={proximos.length}>Próximos eventos</TituloSecao>
      <Stack gap={1.5}>
        {proximos.map((event, posicao) => linha(event, posicao === 0))}
      </Stack>

      {outros.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <TituloSecao quantidade={outros.length}>Outros eventos</TituloSecao>
          <Stack gap={1.5}>{outros.map((event) => linha(event))}</Stack>
        </Box>
      )}

      {secaoEncerrados}
    </Box>
  );
}

export { Cards };
