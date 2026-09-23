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
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';
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

/** Uma informação curta com ícone, escrita por cima da capa. */
function Meta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          color: alpha('#fff', 0.75),
          '& svg': { fontSize: 15 },
        }}
      >
        {icone}
      </Box>
      <Typography
        noWrap
        sx={{
          fontSize: '0.8125rem',
          color: alpha('#fff', 0.9),
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
          minWidth: 0,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/**
 * O selo de vidro da página do evento, do tamanho de uma etiqueta.
 *
 * `cor` tinge o vidro quando o selo fala de uma situação — inscrito, lista de
 * espera, evento de teste. Sem cor ele é o vidro branco neutro do cartaz, que
 * é o que carrega tipo do evento e contagem regressiva.
 */
function Selo({ cor, children }: { cor?: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.3,
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#fff',
        backgroundColor: alpha(cor ?? '#fff', cor ? 0.34 : 0.18),
        border: `1px solid ${alpha(cor ?? '#fff', cor ? 0.6 : 0.35)}`,
        backdropFilter: 'blur(6px)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Um evento como um cartaz pequeno — a página dele vista de longe.
 *
 * A capa deixou de ser uma miniatura quadrada ao lado do texto e virou o fundo
 * do cartão inteiro, com a mesma montagem do cartaz da página: a foto, o filtro
 * que a assenta, o véu que a enevoa e, por cima, logo, selos, nome e o resumo
 * de quando e onde. Quem chega na home reconhece o evento antes de ler, e
 * abrir a página não muda de assunto — é a mesma imagem, maior.
 *
 * O véu fecha na cor do papel do cartão: a foto não termina num corte reto,
 * ela se dissolve na superfície. O escuro por baixo dele é o que sustenta o
 * texto branco sobre foto clara, do mesmo jeito que o filtro de 38% faz lá.
 */
function CartazDoEvento({
  event,
  minhaSituacao,
  proximo,
  encerrado,
}: {
  event: Event;
  minhaSituacao: MinhaSituacao;
  proximo?: boolean;
  /** Evento que já acabou: o cartaz entra apagado e não abre */
  encerrado?: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const papel = theme.palette.background.paper;
  const abrir = () => navigate(`/eventos/${event.id}`);

  const contagem = contagemRegressiva(event.startDate, event.endDate);

  const styles = {
    cartaz: {
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      borderRadius: 3,
      /**
       * O próximo evento é mais alto que os outros. É o destaque que antes
       * vinha de um tingimento no fundo do card — sobre foto isso não
       * aparecia, e altura é o que ainda dá hierarquia numa lista de cartazes.
       *
       * 150px é o teto: acima disso a lista vira uma pilha de banners e a
       * pessoa rola para ver três eventos. Tudo aqui dentro é medido para
       * caber nele — a logo divide a linha com os selos, o nome tem duas
       * linhas no máximo e o rodapé é de uma só.
       */
      minHeight: proximo ? 150 : 132,
      cursor: encerrado ? 'default' : 'pointer',
      /**
       * Apagado como campo desabilitado, e a capa perde a cor: é o que separa
       * o que já passou do que ainda dá para fazer, sem precisar escrever
       * "encerrado" em cada canto.
       */
      ...(encerrado
        ? { opacity: 0.6, '& .capa-do-evento': { filter: 'grayscale(1)' } }
        : {
            // a capa cresce devagar sob o cartaz parado: o movimento é da
            // foto, e não do bloco inteiro pulando na lista
            '&:hover .capa-do-evento': { transform: 'scale(1.05)' },
          }),
    },
    capa: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${event.data?.coverUrl || CapaLogin})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: theme.transitions.create('transform', { duration: 600 }),
    },
    /** o mesmo 38% da página: é ele que assenta foto clara sob texto branco */
    filtro: {
      position: 'absolute',
      inset: 0,
      backgroundColor: alpha('#000', 0.38),
    },
    /**
     * Duas camadas, e não uma. A escura desce até o rodapé e é quem garante o
     * contraste do nome sobre qualquer foto; a do papel entra só no último
     * quinto, abaixo do texto, e é ela que enevoa a foto na superfície do
     * cartão em vez de cortá-la.
     */
    veu: {
      position: 'absolute',
      inset: 0,
      backgroundImage: [
        `linear-gradient(180deg, transparent 10%, ${alpha(
          '#0B1220',
          0.48
        )} 58%, ${alpha('#0B1220', 0.76)} 100%)`,
        `linear-gradient(180deg, transparent 86%, ${alpha(
          papel,
          0.28
        )} 95%, ${papel} 100%)`,
      ].join(', '),
    },
    conteudo: {
      position: 'relative',
      width: '100%',
      p: 1.5,
      // o respiro de baixo mantém o texto acima da faixa em que a foto vira
      // papel — dentro dela o branco se apagaria
      pb: 1.75,
    },
    /**
     * A logo divide a linha com os selos, em vez de ficar acima deles: em 150px
     * de altura uma faixa só para ela comeria o espaço do nome.
     */
    logo: {
      maxHeight: proximo ? 34 : 28,
      maxWidth: '38%',
      objectFit: 'contain',
      flexShrink: 0,
      filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))',
    },
    nome: {
      color: '#fff',
      fontWeight: 800,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
      fontSize: proximo
        ? { xs: '1.05rem', sm: '1.2rem' }
        : { xs: '0.95rem', sm: '1.05rem' },
      textShadow: '0 2px 14px rgba(0,0,0,0.5)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    /** o botão de vidro do cartaz; no destaque, o degradê da ação principal */
    botao: {
      flexShrink: 0,
      height: 30,
      px: 1.75,
      fontSize: '0.8125rem',
      borderRadius: 999,
      textTransform: 'none',
      fontWeight: 600,
      color: '#fff',
      ...(proximo
        ? {
            backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
            boxShadow: `0 8px 24px -6px ${alpha('#fff', 0.45)}`,
          }
        : {
            border: `1px solid ${alpha('#fff', 0.5)}`,
            backgroundColor: alpha('#000', 0.25),
            backdropFilter: 'blur(6px)',
          }),
      transition: theme.transitions.create(
        ['transform', 'box-shadow', 'background-color'],
        { duration: 220 }
      ),
      '&:hover, &:focus-visible': {
        transform: 'scale(1.04)',
        ...(proximo
          ? { boxShadow: `0 12px 30px -6px ${alpha('#fff', 0.6)}` }
          : { backgroundColor: alpha('#000', 0.42) }),
      },
      '&.Mui-disabled': { color: alpha('#fff', 0.6) },
    },
  };

  return (
    <Paper sx={styles.cartaz} onClick={encerrado ? undefined : abrir}>
      <Box
        className="capa-do-evento"
        sx={styles.capa}
        role="img"
        aria-label={`Capa de ${event.name}`}
      />
      <Box sx={styles.filtro} />
      <Box sx={styles.veu} />

      <Box sx={styles.conteudo}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ mb: 0.75, minWidth: 0 }}
        >
          {event.data?.logoUrl && (
            <Box
              component="img"
              src={event.data.logoUrl}
              alt={`Logo de ${event.name}`}
              sx={styles.logo}
            />
          )}

          <Stack direction="row" gap={0.75} sx={{ flexWrap: 'wrap' }}>
            {event.type && <Selo>{event.type}</Selo>}
            {contagem && <Selo>{contagem}</Selo>}
            {event.status === 'TEST' && (
              <Selo cor={theme.palette.chips.alert}>Teste</Selo>
            )}
            {minhaSituacao && (
              <Selo
                cor={
                  minhaSituacao === 'inscrito'
                    ? theme.palette.chips.success
                    : theme.palette.chips.info
                }
              >
                {minhaSituacao === 'inscrito' ? 'Inscrito' : 'Lista de espera'}
              </Selo>
            )}
          </Stack>
        </Stack>

        <Typography sx={styles.nome}>{event.name}</Typography>

        <Stack
          direction="row"
          gap={1.5}
          alignItems="flex-end"
          justifyContent="space-between"
          sx={{ mt: 1, minWidth: 0 }}
        >
          {/* quando e onde ficam numa linha só, e o que não couber é cortado:
            o cartaz é chamada, o detalhe está a um clique */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={{ xs: 0.25, md: 1.75 }}
            sx={{ minWidth: 0 }}
          >
            <Meta icone={<CalendarMonthOutlined />}>
              {formatarPeriodo(event.startDate, event.endDate)}
            </Meta>
            {event.data?.localName && (
              <Meta icone={<RoomOutlined />}>{event.data.localName}</Meta>
            )}
          </Stack>

          <Button
            size="small"
            disabled={encerrado}
            sx={styles.botao}
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
      </Box>
    </Paper>
  );
}

/** O vazio tem o formato do cartaz, para a lista não pular quando ele chega. */
function EsqueletoDoCartaz({ proximo }: { proximo?: boolean }) {
  return (
    <Skeleton
      variant="rectangular"
      sx={{ borderRadius: 3, height: proximo ? 150 : 132 }}
    />
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

  const cartaz = (event: Event, proximo?: boolean, encerrado?: boolean) => (
    <CartazDoEvento
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
        {encerrados.map((event) => cartaz(event, false, true))}
      </Stack>
    </Box>
  );

  if (isLoading) {
    return (
      <Box>
        <TituloSecao quantidade={2}>Próximos eventos</TituloSecao>
        <Stack gap={1.5}>
          <EsqueletoDoCartaz proximo />
          <EsqueletoDoCartaz />
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
        {proximos.map((event, posicao) => cartaz(event, posicao === 0))}
      </Stack>

      {outros.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <TituloSecao quantidade={outros.length}>Outros eventos</TituloSecao>
          <Stack gap={1.5}>{outros.map((event) => cartaz(event))}</Stack>
        </Box>
      )}

      {secaoEncerrados}
    </Box>
  );
}

export { Cards };
