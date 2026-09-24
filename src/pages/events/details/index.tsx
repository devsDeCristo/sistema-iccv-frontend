import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import GoogleMap from '../../../components/mapWord';

import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { EventDetails } from '../../../features/admin/events/types';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import Confuso from '../../../assets/confuso.svg?react';
import {
  CalendarMonthOutlined,
  ArrowBack,
  ConfirmationNumber,
  EditOutlined,
  GroupsOutlined,
  PlaceOutlined,
  ShoppingBagOutlined,
  VisibilityOutlined,
  WhatsApp,
} from '@mui/icons-material';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import ReactQuillViewer from '../../../components/reactQuill';
import { temDisponivel } from '../../../features/admin/events/products';
import {
  contagemRegressiva,
  formatarPeriodo,
  ocupacao,
} from '../../../features/events/utils';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';
import { ehCorHex } from '../../../features/admin/events/eventColors';
import { quadranteAtivo } from '../../../features/admin/events/eventModules';
import { useRole } from '../../../hooks/useRole';
import { Role } from '../../../constants/roles';

function EventsDetails() {
  const { id = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data: groupsData } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );
  const groups = groupsData?.present || [];
  const { data: eventData, isLoading } = useGetEvents(
    { eventId: id },
    { enabled: !!id }
  );
  const event = eventData as EventDetails;
  const { isSuperAdmin, perfilNaIgreja } = useRole();

  /**
   * Admin da igreja dona deste evento.
   *
   * Ele chega aqui pelo mesmo link que todo mundo — e, para corrigir uma data
   * ou conferir os inscritos, tinha que voltar ao painel e procurar o evento na
   * lista. Super admin e dev administram qualquer igreja, então entram junto.
   */
  const podeAdministrar =
    isSuperAdmin ||
    (!!event?.churchId && perfilNaIgreja(event.churchId) === Role.ADMIN);

  /**
   * Grupos deste evento em que o usuário está inscrito e que possuem link.
   * O link deixou de ser por evento e passou a ser por grupo, então quem está
   * em mais de um grupo vê um botão para cada.
   */
  const registeredGroupsWithLink = useMemo(() => {
    if (!event || groups.length === 0) return [];

    return groups.filter(
      (group) =>
        !!group.link?.trim() &&
        event.groupRoles?.some((eventGroup) => eventGroup.id === group.id)
    );
  }, [event, groups]);

  /**
   * Comprar produto fora da inscrição é só para quem está confirmado no
   * evento — a mesma regra que o servidor aplica. Estar só na lista de espera
   * não conta: `present` são os grupos com vaga garantida.
   */
  const inscrito = useMemo(
    () =>
      !!event &&
      groups.some((group) =>
        event.groupRoles?.some((eventGroup) => eventGroup.id === group.id)
      ),
    [event, groups]
  );

  /** com o quadrante ligado no evento, abrem o admin e os inscritos */
  const podeVerQuadrante =
    !!event && quadranteAtivo(event.data) && (podeAdministrar || inscrito);

  const podeComprarProdutos = useMemo(() => {
    if (!event) return false;

    const temProdutoAVenda = (event.products ?? []).some((produto) =>
      produto.variants.some((variante) => temDisponivel(variante.available))
    );

    return inscrito && temProdutoAVenda;
  }, [event, inscrito]);

  const scrollToTop = () => {
    const outlet = document.getElementById('layout-scroll');
    if (outlet) {
      outlet.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }
    const target = document.scrollingElement || document.documentElement;
    target.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToTop();
  }, []);

  /**
   * Quanto as fichas sobem sobre o cartaz, em unidades de espaçamento (8px).
   *
   * É metade da altura delas: assim a dobra do degradê passa por trás dos
   * cartões — o vidro deixa a capa aparecer atrás da metade de cima e o fundo
   * da página fecha a metade de baixo. É o mesmo número no respiro do bloco de
   * texto e na subida do corpo; mexer num sem o outro põe as fichas sobre os
   * botões.
   */
  const SOBREPOSICAO_DAS_FICHAS = 7;

  const escuro = theme.palette.mode === 'dark';
  const fundo = theme.palette.background.default;
  /** Evento com texto de apresentação: é ele que ocupa a coluna larga */
  const temSobre = !!event?.data?.description?.trim();
  /** Evento com logo: é ela que dá altura ao bloco sobre a capa */
  const temLogo = !!event?.data?.logoUrl;

  /**
   * A paleta cadastrada no evento.
   *
   * Sem ela nada muda: a página segue no azul e violeta do sistema, que é como
   * todos os eventos antigos já aparecem. Com ela, a primária manda nos botões
   * e nos detalhes, e as três se dividem entre as fichas — uma para cada, que é
   * onde a paleta aparece inteira sem virar arco-íris.
   */
  const corOuPadrao = (cor: string | undefined, padrao: string) =>
    ehCorHex(cor) ? cor : padrao;

  const paleta = event?.data?.colors;
  const temPaleta =
    ehCorHex(paleta?.primary) ||
    ehCorHex(paleta?.secondary) ||
    ehCorHex(paleta?.tertiary);
  const corPrimaria = corOuPadrao(paleta?.primary, AZUL_VIVO);
  const corSecundaria = corOuPadrao(paleta?.secondary, corPrimaria);
  const corTerciaria = corOuPadrao(paleta?.tertiary, corPrimaria);

  const styles = useMemo(
    () => ({
      /**
       * O cartaz sangra até a borda da tela.
       *
       * `PageStyle` dá 32px de respiro à página inteira, e é justamente esse
       * respiro que fazia a capa parecer uma figura colada num formulário. As
       * margens negativas devolvem a largura cheia — a imagem encosta nas
       * bordas e a página começa por ela, não por uma moldura.
       */
      cartaz: {
        position: 'relative',
        mx: -4,
        mt: -4,
        minHeight: { xs: 400, sm: 440, md: 480 },
        display: 'flex',
        /**
         * Com logo, o bloco é alto e se apoia no rodapé do cartaz. Sem ela, ele
         * encolhe e o mesmo apoio deixava um vazio em cima do primeiro selo —
         * então o bloco vai para o meio da capa, e a sobra se divide em cima e
         * embaixo em vez de ficar toda de um lado.
         */
        alignItems: temLogo ? 'flex-end' : 'center',
        overflow: 'hidden',
      },
      botaoVoltar: {
        position: 'absolute',
        top: { xs: 32, sm: 40 },
        left: 'max(32px, calc((100% - 1200px) / 2))',
        zIndex: 2,
        minWidth: 'auto',
        px: 1.5,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: '1rem',
        color: '#fff',
        textTransform: 'none',
        backgroundColor: alpha('#000', 0.28),
        backdropFilter: 'blur(6px)',
        '&:hover': {
          color: '#fff',
          backgroundColor: alpha('#000', 0.5),
        },
      },
      // os atalhos do admin espelham o voltar, na outra ponta da mesma régua
      atalhosDoAdmin: {
        position: 'absolute',
        top: { xs: 32, sm: 40 },
        right: 'max(32px, calc((100% - 1200px) / 2))',
        zIndex: 2,
        display: 'flex',
        gap: 0.25,
        p: 0.25,
        borderRadius: 1.5,
        backgroundColor: alpha('#000', 0.28),
        backdropFilter: 'blur(6px)',
      },
      atalho: {
        color: '#fff',
        borderRadius: 1.25,
        '&:hover': { backgroundColor: alpha('#000', 0.4) },
      },
      capa: {
        position: 'absolute',
        inset: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      /**
       * A capa é foto de qualquer coisa, e o nome do evento é branco por cima
       * dela. Com 20% a arte clara — céu, parede, fundo bege — comia a letra;
       * 38% assenta a foto sem apagá-la, e é o que sustenta o contraste sem
       * depender só da sombra do texto.
       */
      filtro: {
        position: 'absolute',
        inset: 0,
        backgroundColor: alpha('#000', 0.38),
      },
      /**
       * O véu fecha no rodapé do cartaz, mas a virada é lenta de propósito: as
       * fichas sobem por cima dos últimos ~56px, e é essa faixa em transição
       * que aparece atrás do vidro delas.
       */
      veu: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(180deg, transparent 38%, ${alpha(
          fundo,
          0.22
        )} 66%, ${alpha(fundo, 0.62)} 86%, ${fundo} 100%)`,
      },
      conteudoDoCartaz: {
        position: 'relative',
        width: 'calc(100% - 64px)',
        maxWidth: 1200,
        mx: 'auto',
        px: 0,
        /**
         * O respiro de cima reserva a faixa do botão Voltar, que flutua sobre a
         * capa: com nome de duas linhas o bloco cresce para cima, e a logo ia
         * parar atrás do botão.
         *
         * Centrado, o bloco pede o mesmo respiro dos dois lados; apoiado no
         * rodapé, ganha mais folga por baixo, onde a capa vira página.
         */
        pt: { xs: 11, md: 12 },
        pb: temLogo
          ? {
              xs: 6 + SOBREPOSICAO_DAS_FICHAS,
              md: 8 + SOBREPOSICAO_DAS_FICHAS,
            }
          : {
              xs: 11 + SOBREPOSICAO_DAS_FICHAS,
              md: 12 + SOBREPOSICAO_DAS_FICHAS,
            },
      },
      logo: {
        maxHeight: { xs: 72, sm: 96 },
        maxWidth: '60%',
        objectFit: 'contain',
        mb: 0.5,
        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))',
      },
      nome: {
        color: '#fff',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.05,
        fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
        textShadow: '0 2px 18px rgba(0,0,0,0.45)',
        maxWidth: 760,
      },
      selo: {
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
        whiteSpace: 'nowrap',
      },
      botaoPrincipal: {
        height: 50,
        px: 3.5,
        borderRadius: 1.5,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 700,
        color: '#fff',
        // o botão fica fora da paleta do evento, no azul-violeta do sistema: a
        // cor cadastrada pinta as fichas e os detalhes, e não a ação principal
        boxShadow: `0 10px 26px -8px ${alpha(AZUL_VIVO, 0.8)}`,
        backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
        // no hover o botão cresce um pouco e a sombra acompanha; o fundo fica
        // onde está
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: 220,
        }),
        '&:hover, &:focus-visible': {
          transform: 'scale(1.035)',
          boxShadow: `0 14px 34px -8px ${alpha(VIOLETA_VIVO, 0.85)}`,
        },
      },
      botaoVidro: {
        height: 50,
        px: 3,
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 600,
        color: '#fff',
        borderColor: alpha('#fff', 0.5),
        backgroundColor: alpha('#000', 0.2),
        backdropFilter: 'blur(6px)',
        '&:hover': {
          borderColor: '#fff',
          backgroundColor: alpha('#000', 0.35),
        },
      },

      /** O conteúdo volta para a régua da página, já sem o sangramento */
      corpo: {
        maxWidth: 1200,
        mx: 'auto',
        // sobe sobre o rodapé do cartaz: é o que põe as fichas em cima da
        // virada do degradê, em vez de depois dela
        mt: -SOBREPOSICAO_DAS_FICHAS,
        position: 'relative',
        zIndex: 1,
      },
      /**
       * As fichas montam na borda do cartaz: elas são o resumo que a pessoa
       * procura primeiro — quando, onde, quanto ainda cabe.
       */
      fichas: {
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
      },
      ficha: {
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2,
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
        // vidro: deixa a cor do cartaz atravessar por baixo, e é o que amarra
        // as fichas à imagem em vez de as deixar boiando
        backgroundColor: alpha(theme.palette.background.paper, 0.86),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.common.white, escuro ? 0.12 : 0.6)}`,
        boxShadow: `0 12px 28px -22px ${alpha('#000', 0.55)}`,
      },
      // a cor vem de fora: cada ficha leva uma das três do evento
      selinho: {
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: 1.5,
        display: 'grid',
        placeItems: 'center',
      },

      secao: { mt: { xs: 5, md: 7 } },
      tituloDeSecao: {
        fontSize: { xs: '1.3rem', sm: '1.6rem' },
        fontWeight: 800,
        letterSpacing: '-0.01em',
      },
      risco: {
        width: 46,
        height: 4,
        borderRadius: 999,
        mb: 1.5,
        ...(temPaleta
          ? { backgroundColor: corPrimaria }
          : {
              backgroundImage: `linear-gradient(90deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
            }),
      },

      /**
       * Descrição e grupos lado a lado: são as duas perguntas de quem chega —
       * o que é isso, e onde eu entro. Empilhados, a lista de grupos ficava
       * depois de um texto que pode ser longo, e o convite sumia da dobra.
       *
       * Sem descrição não há o que emparelhar: aí os grupos tomam a largura
       * toda, em vez de deixar metade da tela vazia.
       */
      duasColunas: {
        display: 'grid',
        gap: { xs: 4, md: 4 },
        alignItems: 'start',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1.85fr) minmax(250px, 0.75fr)',
        },
      },
      sobre: {
        display: 'flex',
        flexDirection: 'column',
        ...(temSobre
          ? {}
          : { minHeight: { xs: 160, md: 260 }, height: '100%' }),
      },
      estadoVazio: {
        width: '100%',
        boxSizing: 'border-box',
        flex: 1,
        minHeight: { xs: 110, md: 170 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary',
        textAlign: 'center',
        px: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, escuro ? 0.3 : 0.55),
      },
      grade: {
        display: 'grid',
        gap: 1,
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
        },
      },
      cartaoDeGrupo: {
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create([
          'border-color',
          'background-color',
        ]),
        '&:hover, &:focus-visible': {
          borderColor: alpha(corPrimaria, 0.6),
          backgroundColor: theme.palette.action.hover,
        },
      },
      barra: {
        height: 5,
        borderRadius: 999,
        backgroundColor: alpha(theme.palette.text.primary, 0.08),
      },
      // a barra do grupo com vaga segue a cor do evento; esgotado continua no
      // laranja de alerta, que é aviso e não identidade
      barraDoEvento: {
        height: 5,
        borderRadius: 999,
        backgroundColor: alpha(theme.palette.text.primary, 0.08),
        '& .MuiLinearProgress-bar': { backgroundColor: corPrimaria },
      },
      moldura: {
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      },
      localResumo: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mt: 1.5,
        mb: 2,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.45),
      },
      localLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0,
      },
      localTexto: {
        minWidth: 0,
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
      },
      botao: {
        height: 46,
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 600,
      },
      whatsapp: {
        color: 'white',
        backgroundColor: '#25D366',
        '&:hover': { backgroundColor: '#1ebe5d' },
      },
    }),
    [theme, escuro, fundo, temSobre, temLogo, temPaleta, corPrimaria]
  );

  const contagem = contagemRegressiva(event?.startDate, event?.endDate);

  const havaOneFieldLocal = !!(
    event?.data?.localName ||
    event?.data?.address ||
    event?.data?.neighborhood ||
    event?.data?.city ||
    event?.data?.state ||
    event?.data?.zipCode
  );

  /** O endereço em uma linha só, sem os campos que o evento não preencheu */
  const enderecoCompleto = [
    event?.data?.address,
    event?.data?.neighborhood,
    event?.data?.city,
    event?.data?.state,
    event?.data?.zipCode,
  ]
    .filter((parte) => !!parte?.trim())
    .join(' · ');

  const cidade =
    [event?.data?.city, event?.data?.state]
      .filter((parte) => !!parte?.trim())
      .join(' · ') || event?.data?.localName;

  /** Vagas restantes somando todos os grupos — o número da ficha */
  const vagasRestantes = (event?.groupRoles ?? []).reduce((soma, group) => {
    const inscritos = group.roles.reduce(
      (total, role) => total + (role?.registered || 0),
      0
    );

    return soma + ocupacao(inscritos, group.capacity).restantes;
  }, 0);

  const irParaInscricao = () => navigate(`/eventos/${event.id}/inscricao`);

  const Ficha = ({
    icone,
    rotulo,
    valor,
    apoio,
    cor = corPrimaria,
  }: {
    icone: ReactNode;
    rotulo: string;
    valor: string;
    apoio?: string | null;
    /** cor do selo: é o que dá uma das três do evento a cada ficha */
    cor?: string;
  }) => (
    <Paper elevation={0} sx={styles.ficha}>
      <Box
        sx={{
          ...styles.selinho,
          color: cor,
          backgroundColor: alpha(cor, 0.12),
        }}
      >
        {icone}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {rotulo}
        </Typography>
        <Typography fontWeight={700} sx={{ lineHeight: 1.3 }}>
          {valor}
        </Typography>
        {apoio && (
          <Typography variant="caption" color="text.secondary">
            {apoio}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  if (isLoading) {
    return (
      <PageStyle>
        <Skeleton variant="rectangular" sx={{ ...styles.cartaz, mb: 0 }} />

        <Box sx={styles.corpo}>
          <Box sx={styles.fichas}>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={86} />
            ))}
          </Box>

          <Box sx={styles.secao}>
            <Skeleton variant="text" width="40%" height={36} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="92%" />
            <Skeleton variant="text" width="70%" />
          </Box>

          <Box sx={{ ...styles.secao, ...styles.grade }}>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={120} />
            ))}
          </Box>
        </Box>
      </PageStyle>
    );
  }

  return (
    <PageStyle>
      <Box sx={styles.cartaz}>
        <Button
          startIcon={<ArrowBack />}
          aria-label="Voltar"
          onClick={() => navigate('/home')}
          sx={styles.botaoVoltar}
        >
          Voltar
        </Button>

        {podeAdministrar && (
          <Box sx={styles.atalhosDoAdmin}>
            <Tooltip title="Editar evento">
              <IconButton
                size="small"
                aria-label="Editar evento"
                sx={styles.atalho}
                onClick={() => navigate(`/admin/eventos/${id}/editar`)}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Ver no painel">
              <IconButton
                size="small"
                aria-label="Ver o evento no painel"
                sx={styles.atalho}
                onClick={() =>
                  navigate(`/admin/eventos/${id}/detalhes/usuarios`)
                }
              >
                <VisibilityOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Box
          sx={{
            ...styles.capa,
            backgroundImage: `url(${event?.data?.coverUrl || CapaLogin})`,
          }}
          role="img"
          aria-label={`Capa de ${event?.name ?? 'evento'}`}
        />
        <Box sx={styles.filtro} />
        <Box sx={styles.veu} />

        <Box sx={styles.conteudoDoCartaz}>
          {event?.data?.logoUrl && (
            <Box
              component="img"
              src={event.data.logoUrl}
              alt={`Logo de ${event?.name ?? 'evento'}`}
              sx={styles.logo}
            />
          )}

          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
            {event?.type && <Box sx={styles.selo}>{event.type}</Box>}
            {contagem && <Box sx={styles.selo}>{contagem}</Box>}
            {event?.status === 'TEST' && (
              <Box sx={styles.selo}>Evento de teste</Box>
            )}
          </Stack>

          <Typography component="h1" sx={styles.nome}>
            {event?.name}
          </Typography>

          {event?.data?.shortDescription && (
            <Typography
              sx={{
                // colada no nome: as duas frases são o mesmo anúncio, e o vão
                // de antes as lia como blocos separados
                mt: 0.25,
                maxWidth: 620,
                color: alpha('#fff', 0.88),
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.55,
              }}
            >
              {event.data.shortDescription}
            </Typography>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1.5}
            sx={{ mt: 1.5 }}
          >
            <Button
              startIcon={<ConfirmationNumber />}
              /**
               * Aqui em cima a sombra é branca, e só aqui: a da cor do botão
               * cai sobre uma foto escura e colorida e simplesmente some. O
               * halo claro separa o botão do que está atrás sem inventar cor
               * nova. O resto — degradê e o crescer no hover — é o do estilo
               * base, igual ao da coluna dos grupos.
               */
              sx={{
                ...styles.botaoPrincipal,
                boxShadow: `0 10px 30px -6px ${alpha('#fff', 0.5)}`,
                '&:hover, &:focus-visible': {
                  ...styles.botaoPrincipal['&:hover, &:focus-visible'],
                  boxShadow: `0 14px 38px -6px ${alpha('#fff', 0.65)}`,
                },
              }}
              onClick={irParaInscricao}
            >
              Inscreva-se
            </Button>

            {podeComprarProdutos && (
              <Button
                variant="outlined"
                startIcon={<ShoppingBagOutlined />}
                sx={styles.botaoVidro}
                onClick={() => navigate(`/eventos/${event.id}/produtos`)}
              >
                Produtos do evento
              </Button>
            )}

            {podeVerQuadrante && (
              <Button
                variant="outlined"
                startIcon={<GroupsOutlined />}
                sx={styles.botaoVidro}
                onClick={() => navigate(`/eventos/${event.id}/quadrante`)}
              >
                Quadrante
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <Box sx={styles.corpo}>
        <Box sx={styles.fichas}>
          <Ficha
            icone={<CalendarMonthOutlined fontSize="small" />}
            rotulo="Quando"
            valor={formatarPeriodo(event?.startDate, event?.endDate, {
              comAno: true,
            })}
            apoio={contagem}
          />
          <Ficha
            cor={corSecundaria}
            icone={<PlaceOutlined fontSize="small" />}
            rotulo="Onde"
            valor={cidade || 'Local a definir'}
            apoio={
              event?.data?.localName !== cidade ? event?.data?.localName : null
            }
          />
          <Ficha
            cor={corTerciaria}
            icone={<ConfirmationNumber fontSize="small" />}
            rotulo="Tipos de ingresso"
            valor={
              event?.groupRoles?.length
                ? `${event.groupRoles.length} ${
                    event.groupRoles.length === 1
                      ? 'tipo disponível'
                      : 'tipos disponíveis'
                  }`
                : 'Ingressos em breve'
            }
            apoio={
              event?.data?.hideVacancies
                ? 'Inscrições abertas'
                : vagasRestantes > 0
                  ? 'Vagas disponíveis'
                  : 'Lista de espera'
            }
          />
        </Box>

        <Box sx={{ ...styles.secao, ...styles.duasColunas }}>
          <Box sx={styles.sobre}>
              <Box sx={styles.risco} />
              <Typography sx={styles.tituloDeSecao}>Sobre o evento</Typography>
              {temSobre && (
                <Box sx={{ mt: 1.5 }}>
                  <ReactQuillViewer value={event?.data?.description ?? ''} />
                </Box>
              )}
              {!temSobre && (
                <Box sx={styles.estadoVazio}>
                  <Box
                    component={Confuso}
                    sx={{
                      width: { xs: 54, md: 66 },
                      height: { xs: 54, md: 66 },
                      color: 'text.secondary',
                    }}
                  />
                  <Typography fontSize={"18px"} variant="body2" color="text.secondary">
                    Hmm... ainda não nos contaram sobre este evento.
                  </Typography>
                  
                </Box>
              )}
          </Box>

          <Box>
            <Box sx={styles.risco} />
            <Typography sx={styles.tituloDeSecao}>Escolha seu ingresso</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Escolha o tipo de ingresso e veja a disponibilidade de cada opção.
            </Typography>

            {event?.groupRoles?.length ? (
              <Box sx={styles.grade}>
                {event.groupRoles.map((group) => {
                  const inscritos = group.roles.reduce(
                    (soma, role) => soma + (role?.registered || 0),
                    0
                  );
                  const { percentual, restantes, situacao } = ocupacao(
                    inscritos,
                    group.capacity
                  );
                  const esgotado = situacao === 'esgotado';

                  return (
                    // o cartão inteiro é o botão: com o nome, a barra e as vagas
                    // já dizendo tudo, um "Quero este" dentro de cada um só
                    // acrescentava altura à lista
                    <Paper
                      key={group.id}
                      elevation={0}
                      role="button"
                      tabIndex={0}
                      sx={styles.cartaoDeGrupo}
                      onClick={irParaInscricao}
                      onKeyDown={(evento: React.KeyboardEvent) => {
                        if (evento.key === 'Enter' || evento.key === ' ') {
                          evento.preventDefault();
                          irParaInscricao();
                        }
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          noWrap
                          sx={{ minWidth: 0 }}
                        >
                          {group.name}
                        </Typography>

                        {!event.data?.hideVacancies && (
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ flexShrink: 0 }}
                            color={
                              esgotado || situacao === 'ultimas'
                                ? 'warning.main'
                                : 'text.secondary'
                            }
                          >
                            {esgotado
                              ? 'Lista de espera'
                              : `${restantes} vagas`}
                          </Typography>
                        )}
                      </Stack>

                      {/* a barra mostra o quanto já foi tomado: número sozinho
                        não diz se 20 vagas é muito ou pouco */}
                      {!event.data?.hideVacancies && (
                        <LinearProgress
                          variant="determinate"
                          value={percentual}
                          color={esgotado ? 'warning' : 'primary'}
                          sx={esgotado ? styles.barra : styles.barraDoEvento}
                        />
                      )}
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                As inscrições deste evento ainda não foram abertas.
              </Typography>
            )}

            {/* empilhados: a coluna é estreita, e lado a lado os dois
                botões perderiam o rótulo em reticências */}
            <Stack gap={1} sx={{ mt: 2 }}>
              <Button
                fullWidth
                startIcon={<ConfirmationNumber />}
                sx={styles.botaoPrincipal}
                onClick={irParaInscricao}
              >
                Inscreva-se
              </Button>

              {registeredGroupsWithLink.map((group) => (
                <Button
                  key={group.id}
                  fullWidth
                  variant="contained"
                  startIcon={<WhatsApp />}
                  sx={{ ...styles.botao, ...styles.whatsapp }}
                  onClick={() =>
                    window.open(
                      group.link || '',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  {registeredGroupsWithLink.length > 1
                    ? `Ingresso: ${group.name}`
                    : 'Entre no grupo do evento'}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        {havaOneFieldLocal && (
          <Box sx={styles.secao}>
            <Box sx={styles.risco} />
            <Typography sx={styles.tituloDeSecao}>Como chegar</Typography>

            <Box sx={styles.localLayout}>
              <Box sx={styles.localResumo}>
              <Box sx={styles.localTexto}>
                <PlaceOutlined sx={{ mt: 0.25, color: corPrimaria }} />
                <Box sx={{ minWidth: 0 }}>
                {event?.data?.localName && (
                  <Typography fontWeight={800}>
                    {event.data.localName}
                  </Typography>
                )}
                {enderecoCompleto && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {enderecoCompleto}
                  </Typography>
                )}
                </Box>
              </Box>
              </Box>

              {event?.data?.linkMaps && (
                <Box sx={styles.moldura}>
                  <GoogleMap
                    linkMap={event?.data?.linkMaps as string}
                    width="100%"
                  />
                </Box>
              )}
            </Box>

          </Box>
        )}
      </Box>
    </PageStyle>
  );
}

export { EventsDetails };
