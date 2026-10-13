import { ReactNode, useState } from 'react';
import {
  AccountBalanceWallet,
  ArrowBack,
  Campaign,
  ConfirmationNumber,
  Event,
  EventNote,
  ExpandMore,
  History,
  Menu as MenuIcon,
  MenuOpen,
  Inventory2,
  Login,
  Payments,
  People,
  Send,
  Church,
  WhatsApp,
  SpaceDashboard,
  Gavel,
  Hub,
  HolidayVillage,
  Diversity3,
  WorkspacePremium,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import {
  alpha,
  Box,
  Collapse,
  Drawer,
  IconButton,
  lighten,
  Stack,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Logo from '../../assets/logo-ic.svg?react';
import { useRole } from '../../hooks/useRole';
import { useModulos } from '../../hooks/useModulos';
import { ModuloDaIgreja } from '../../constants/modulos';
import { useFiltroSalvo } from '../../hooks/useFiltroSalvo';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../themes';

/** Largura da régua lateral, a mesma nos dois modos (fixa e gaveta) */
const LARGURA = 260;

/** O módulo do plano por trás de cada item da régua (ver `useModulos`) */
const MODULO_DO_LINK: Record<string, ModuloDaIgreja> = {
  '/admin/eventos': 'EVENTS',
  '/admin/noticias': 'NEWS',
  '/admin/tesouraria': 'TREASURY',
  // as configurações seguem o módulo a que servem
  '/configuracoes/pagamentos': 'EVENTS',
  '/configuracoes/disparadores': 'NEWS',
  '/configuracoes/integracoes': 'TREASURY',
};
/** Recolhida: só a coluna dos ícones */
const LARGURA_RECOLHIDA = 65;

/** Altura da barra do topo, de onde a lateral começa na tela grande */
const ALTURA_APPBAR = 70;

type ItemMenu = {
  link: string;
  icon: ReactNode;
  title: string;
  /** Marca a linha com a etiqueta "Novo!" — para estrear uma tela no menu */
  novo?: boolean;
  /**
   * Módulo anunciado, ainda sem tela: etiqueta "Em breve" em laranja, e a
   * linha não navega (o `link` serve só de chave)
   */
  emBreve?: boolean;
  /**
   * Telas de dentro desta, recuadas sob ela na régua.
   *
   * Existe porque "Disparadores" é um grupo de canais, não uma tela: hoje só o
   * WhatsApp, amanhã e-mail ou SMS. Isso era um `Tabs` dentro da página, e aba
   * esconde o que existe atrás dela — quem abria a tela via "WhatsApp" e não
   * tinha como saber que aquilo era uma escolha entre canais. Na régua os
   * canais ficam listados, cada um com endereço próprio, que dá para favoritar
   * e compartilhar.
   */
  filhos?: ItemMenu[];
};

/**
 * Qual régua está no ar. `configuracoes` é a das configurações do sistema, que
 * tem menu próprio — entra pelo avatar da barra do topo, não pelo painel.
 */
export type AreaSideBar = 'admin' | 'usuario' | 'configuracoes';

type SideBarProps = {
  validRole?: boolean | null;
  isAdmin?: boolean;
  /** Quando ausente, cai no `isAdmin` de sempre */
  area?: AreaSideBar;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
};

/**
 * Cor de destaque do item selecionado: a primária do tema, a mesma da barra do
 * topo e dos botões — a régua não inventa cor própria.
 *
 * No escuro entra a variante clara da primária: o azul cheio sobre o quase-preto
 * do papel fica em 3,4:1 de contraste, baixo demais para texto de 14px.
 */
const corDestaque = (theme: Theme) =>
  theme.palette.mode === 'dark'
    ? theme.palette.primary.light
    : theme.palette.primary.main;

/** Rótulo da seção: só tipografia, sem faixa nem fundo */
function TituloSecao({
  children,
  recolhida = false,
  acao,
}: {
  children: ReactNode;
  recolhida?: boolean;
  /** controle à direita do título — o botão de recolher, na primeira seção */
  acao?: ReactNode;
}) {
  // Recolhida, o nome não cabe. Na primeira seção o lugar dele é do botão de
  // expandir, no centro da coluna; nas outras, um traço curto ainda separa os
  // grupos
  if (recolhida) {
    return acao ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        {acao}
      </Box>
    ) : (
      <Box
        sx={{ mx: 2.5, mb: 1, mt: 1, borderTop: 1, borderColor: 'divider' }}
      />
    );
  }

  const nome = (
    <Typography
      component="div"
      color="text.disabled"
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  );

  // Aberta, o botão fica no canto da régua (10px do topo e da direita), fora
  // do fluxo do título
  return (
    <Box sx={{ pl: 2.5, pr: 2, mb: 1 }}>
      {nome}
      {acao && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>{acao}</Box>
      )}
    </Box>
  );
}

/**
 * Recolher/expandir a régua da tela grande.
 *
 * No topo, na linha do título da primeira seção: é onde se procura um
 * controle da própria régua, e ali ele não abre um vão a mais. Um IconButton
 * simples, sem borda: é ajuste de tela, não ação do dia a dia.
 */
function BotaoRecolher({
  recolhida,
  onClick,
}: {
  recolhida: boolean;
  onClick: () => void;
}) {
  const titulo = recolhida ? 'Expandir menu' : 'Recolher menu';

  return (
    <Tooltip title={titulo} placement="right">
      <IconButton
        size="small"
        onClick={onClick}
        aria-label={titulo}
        aria-expanded={!recolhida}
        sx={{ color: 'text.secondary' }}
      >
        {recolhida ? (
          <MenuIcon fontSize="small" />
        ) : (
          <MenuOpen fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Etiqueta "NOVO!" das linhas que estreiam no menu.
 *
 * Palavra pintada, sem cápsula: o chip criava um segundo bloco dentro de uma
 * linha que já tem ícone, nome e fundo de seleção. Só a palavra em caixa alta
 * chama atenção e continua fazendo parte do item.
 *
 * O degradê usa o par de cores vivas do tema, o mesmo das faixas tingidas — no
 * escuro, clareado, porque violeta cheio sobre o papel quase preto some.
 */
/** O laranja da etiqueta "Em breve": o tom de alerta do sistema, em degradê */
const LARANJA_VIVO = '#F97316';
const AMBAR_VIVO = '#F59E0B';

function Etiqueta({
  texto,
  de,
  ate,
  pequena = false,
}: {
  texto: string;
  /** começo e fim do degradê da letra */
  de: string;
  ate: string;
  /**
   * Na linha de filho, que é recuada: no tamanho cheio, "Em breve" cortava
   * o nome de "Congregações" no meio
   */
  pequena?: boolean;
}) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const inicio = escuro ? lighten(de, 0.35) : de;
  const fim = escuro ? lighten(ate, 0.35) : ate;

  return (
    <Typography
      component="span"
      sx={{
        flexShrink: 0,
        fontSize: pequena ? 10.5 : 12,
        fontWeight: 800,
        letterSpacing: pequena ? '0.03em' : '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1,
        backgroundImage: `linear-gradient(90deg, ${inicio}, ${fim})`,
        /**
         * O degradê vira a tinta da letra: recortado no desenho do texto e com
         * o preenchimento zerado. `WebkitTextFillColor` é o que apaga a cor
         * herdada — sem ele o texto sólido cobre o degradê.
         */
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {texto}
    </Typography>
  );
}

/**
 * Uma linha do menu.
 *
 * O selecionado é pintado por fundo esmaecido e texto na cor de destaque, em vez
 * do traço na borda direita de antes: o traço prendia o item na parede da régua
 * e brigava com o resto do sistema, que já separa as coisas por tom e raio.
 */
function ItemNav({
  item,
  ativo,
  onClick,
  filho = false,
  recolhida = false,
  aberto,
  onAlternar,
}: {
  item: ItemMenu;
  ativo: boolean;
  onClick?: () => void;
  /** Linha de dentro de outra: menor, mais baixa e sem peso de seção */
  filho?: boolean;
  /** Régua recolhida: só o ícone, com o nome na dica ao passar o mouse */
  recolhida?: boolean;
  /** Grupo com filhos: está aberto? (a seta aponta para cima) */
  aberto?: boolean;
  /**
   * Grupo com filhos: a linha abre e fecha o grupo em vez de navegar — o
   * link do grupo só redirecionaria para o primeiro filho
   */
  onAlternar?: () => void;
}) {
  const theme = useTheme();
  const destaque = corDestaque(theme);

  const linha = (
    <Stack
      // "Em breve" ainda não tem tela: a linha aparece, mas não navega
      {...(item.emBreve
        ? { component: 'div', 'aria-disabled': true }
        : onAlternar
          ? {
              component: 'button',
              type: 'button',
              onClick: onAlternar,
              'aria-expanded': aberto,
            }
          : { component: Link, to: item.link, onClick })}
      aria-label={recolhida ? item.title : undefined}
      direction="row"
      alignItems="center"
      gap={filho ? 1.25 : 2}
      sx={{
        minHeight: filho ? 36 : 44,
        px: filho ? 1.5 : 2,
        // recolhida, o ícone fica no meio da coluna
        justifyContent: recolhida ? 'center' : 'flex-start',
        mb: 0.5,
        borderRadius: 2,
        textDecoration: 'none',
        // o grupo é um botão: sem a borda, a fonte e a largura do navegador
        ...(onAlternar && {
          width: '100%',
          border: 0,
          font: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
        }),
        color: ativo ? destaque : theme.palette.text.secondary,
        backgroundColor: ativo ? alpha(destaque, 0.1) : 'transparent',
        transition: theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          backgroundColor: ativo
            ? alpha(destaque, 0.18)
            : theme.palette.background.hover,
          color: ativo ? destaque : theme.palette.text.primary,
        },
        // o ícone acompanha a cor do item; sem isto ele fica preso no tom padrão
        '& svg': { fontSize: filho ? 18 : 22, color: 'inherit' },
        ...(item.emBreve && {
          cursor: 'default',
          color: theme.palette.text.disabled,
          '&:hover': { backgroundColor: 'transparent' },
        }),
      }}
    >
      {item.icon}

      {/* a etiqueta anda junto do nome, e não encostada na parede direita da
          régua: colada no texto ela se lê como parte do item */}
      {!recolhida && (
        <Stack
          width={'100%'}
          direction="row"
          alignItems="center"
          justifyContent={'space-between'}
          sx={{ minWidth: 0 }}
        >
          <Typography
            noWrap
            sx={{
              fontSize: filho ? 13.5 : 14,
              fontWeight: ativo ? 600 : 500,
              color: 'inherit',
            }}
          >
            {item.title}
          </Typography>

          <Stack direction="row" alignItems="center" gap={0.5}>
            {item.emBreve ? (
              <Etiqueta
                texto="Em breve"
                de={LARANJA_VIVO}
                ate={AMBAR_VIVO}
                pequena={filho}
              />
            ) : (
              item.novo && (
                <Etiqueta
                  texto="Novo!"
                  de={AZUL_VIVO}
                  ate={VIOLETA_VIVO}
                  pequena={filho}
                />
              )
            )}
            {onAlternar && (
              <ExpandMore
                sx={{
                  fontSize: '18px !important',
                  transform: aberto ? 'rotate(180deg)' : 'none',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shorter,
                  }),
                }}
              />
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );

  // recolhida, o nome sai da linha e vai para a dica
  return recolhida ? (
    <Tooltip
      placement="right"
      title={item.emBreve ? `${item.title} (em breve)` : item.title}
    >
      {linha}
    </Tooltip>
  ) : (
    linha
  );
}

/**
 * Miolo da régua, um só para os dois modos: na tela grande ele fica fixo ao
 * lado do conteúdo, no celular vai dentro da gaveta. Antes o menu inteiro
 * estava escrito duas vezes no arquivo, e cada ajuste tinha que ser feito nos
 * dois lugares.
 */
/** Um grupo da régua: título em caixa alta e as linhas dele */
interface SecaoMenu {
  /** vazio: a seção não tem título (o "Voltar ao painel" das configurações) */
  titulo: string;
  itens: ItemMenu[];
}

function ConteudoNav({
  secoes,
  onNavigate,
  recolhida = false,
  onAlternar,
}: {
  secoes: SecaoMenu[];
  onNavigate?: () => void;
  /** só ícones (régua da tela grande) */
  recolhida?: boolean;
  /** recolher/expandir; ausente na gaveta do celular, que já abre e fecha */
  onAlternar?: () => void;
}) {
  const { pathname } = useLocation();

  const estaAtivo = (link: string) =>
    pathname === link || pathname.startsWith(`${link}/`);

  /**
   * Os grupos começam recolhidos — menos o da tela aberta, senão o item
   * ativo ficaria escondido. Abrir e fechar à mão vale até a página recarregar.
   */
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const dentroDoGrupo = (item: ItemMenu) =>
    !!item.filhos?.some((filho) => estaAtivo(filho.link));
  const estaAberto = (item: ItemMenu) =>
    abertos[item.link] ?? dentroDoGrupo(item);
  const alternar = (item: ItemMenu) =>
    setAbertos((atual) => ({ ...atual, [item.link]: !estaAberto(item) }));

  /**
   * O grupo acende só fechado, com a tela aberta dentro dele: é o que diz onde
   * a pessoa está. Aberto, quem acende é o filho — duas faixas grudadas não
   * diriam qual das duas é a tela aberta.
   */
  const acendeu = (item: ItemMenu) =>
    item.filhos?.length
      ? !estaAberto(item) && dentroDoGrupo(item)
      : estaAtivo(item.link);

  return (
    /**
     * Cresce até o fim do espaço que sobra, em vez de fixar 100% de altura: na
     * gaveta o miolo divide o papel com a marca em cima. Sair fica no avatar
     * da barra do topo, e não na régua.
     */
    <Stack sx={{ position: 'relative', flexGrow: 1, minHeight: 0, py: 3 }}>
      {secoes
        .filter((secao) => secao.itens.length > 0)
        .map(({ titulo, itens }, indice) => (
          <Box key={titulo} sx={{ mt: indice > 0 ? 1.5 : 0 }}>
            {/* sem título, só a primeira seção monta a linha: é dela o botão
                de recolher */}
            {(titulo || indice === 0) && (
              <TituloSecao
                recolhida={recolhida}
                acao={
                  indice === 0 && onAlternar ? (
                    <BotaoRecolher recolhida={recolhida} onClick={onAlternar} />
                  ) : undefined
                }
              >
                {titulo}
              </TituloSecao>
            )}

            <Box sx={{ px: 1.5 }}>
              {itens.map((item) => (
                <Box key={item.link}>
                  <ItemNav
                    item={item}
                    ativo={acendeu(item)}
                    onClick={onNavigate}
                    recolhida={recolhida}
                    {...(item.filhos?.length && {
                      aberto: estaAberto(item),
                      onAlternar: () => alternar(item),
                    })}
                  />

                  {/* Fio à esquerda em vez de só recuo: com o recuo sozinho, uma
                lista de dois ou três canais lia como itens soltos tortos. */}
                  {item.filhos?.length ? (
                    <Collapse
                      in={estaAberto(item)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box
                        // recolhida, os canais ficam na coluna dos ícones, sem recuo
                        sx={
                          recolhida
                            ? { mb: 0.5 }
                            : {
                                ml: 2.5,
                                pl: 1.25,
                                mb: 0.5,
                                borderLeft: 1,
                                borderColor: 'divider',
                              }
                        }
                      >
                        {item.filhos.map((canal) => (
                          <ItemNav
                            key={canal.link}
                            item={canal}
                            ativo={estaAtivo(canal.link)}
                            onClick={onNavigate}
                            filho
                            recolhida={recolhida}
                          />
                        ))}
                      </Box>
                    </Collapse>
                  ) : null}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
    </Stack>
  );
}

const SideBar: React.FC<SideBarProps> = ({
  validRole = true,
  isAdmin = false,
  area,
  openDrawer,
  setOpenDrawer,
}) => {
  const theme = useTheme();
  const {
    isAdmin: isAdminRole,
    isDev,
    isSuperAdmin,
    isTesouraria,
    soPorEvento,
    temTesoureiroCompleto,
  } = useRole();
  const { temModulo } = useModulos();
  // recolher vale para a régua da tela grande, e é lembrado entre visitas
  const [recolhida, setRecolhida] = useFiltroSalvo(
    'sidebar:recolhida',
    false,
    (valor): valor is boolean => typeof valor === 'boolean'
  );

  const areaAtual: AreaSideBar = area ?? (isAdmin ? 'admin' : 'usuario');

  /**
   * As configurações em grupos, cada uma no módulo a que serve (e que a
   * libera no plano): Pagamentos em Eventos, Disparadores em Notícias,
   * Integrações em Tesouraria. Os termos valem para a plataforma: Sistema.
   */
  // a cobrança é por igreja: quem administra a sua configura a dela, e o
  // super admin escolhe qual na própria tela
  const configuracoesDeEventos: ItemMenu[] = [
    ...(isAdminRole
      ? [
          {
            link: '/configuracoes/pagamentos',
            icon: <Payments />,
            title: 'Pagamentos',
          },
        ]
      : []),
  ];
  // o número do WhatsApp também é por igreja: quem administra a sua pareia o
  // dela e não alcança as outras
  const configuracoesDeNoticias: ItemMenu[] = [
    ...(isAdminRole
      ? [
          {
            link: '/configuracoes/disparadores',
            icon: <Send />,
            title: 'Disparadores',
            filhos: [
              {
                link: '/configuracoes/disparadores/whatsapp',
                icon: <WhatsApp />,
                title: 'WhatsApp',
              },
            ],
          },
        ]
      : []),
  ];
  // também por igreja: a credencial da Pluggy é da igreja que a cadastrou.
  // A tesouraria entra aqui, e só aqui: Integrações alimenta o módulo dela
  const configuracoesDaTesouraria: ItemMenu[] = [
    ...(isAdminRole || isTesouraria
      ? [
          {
            link: '/configuracoes/integracoes',
            icon: <Hub />,
            title: 'Integrações',
          },
        ]
      : []),
  ];
  // os termos valem para a plataforma inteira, e não por igreja: só dev e
  // super admin
  const configuracoesDoSistema: ItemMenu[] = isSuperAdmin
    ? [
        {
          link: '/configuracoes/termos',
          icon: <Gavel />,
          title: 'Termos de Uso',
        },
      ]
    : [];
  // volta para onde a pessoa estava trabalhando; sem isto a única saída das
  // configurações seria o avatar da barra do topo
  const voltarAoPainel: ItemMenu[] = [
    {
      link: '/admin/inicio',
      icon: <ArrowBack />,
      title: 'Voltar ao painel',
    },
  ];

  const itensPainel: ItemMenu[] = isAdmin
    ? [
        // a home é a entrada do painel: primeira linha, antes das telas de
        // trabalho, e o destino do login
        {
          link: '/admin/inicio',
          icon: <SpaceDashboard />,
          title: 'Início',
        },
        // o plano da igreja e os outros, para comparar: de quem trabalha numa
        // igreja (o super admin cuida de todos, em Planos)
        ...(!isSuperAdmin
          ? [
              {
                link: '/admin/meus-planos',
                icon: <WorkspacePremium />,
                title: 'Meus planos',
                novo: true,
              },
            ]
          : []),
        // a lista de usuários é só de dev e super admin: a igreja chega numa
        // pessoa pelos inscritos do evento e pela tela de Membros
        ...(isSuperAdmin
          ? [
              {
                link: '/admin/usuarios',
                icon: <People />,
                title: 'Usuários',
              },
            ]
          : []),
        // a igreja é o tenant do sistema: só o super admin cria e remove
        ...(isSuperAdmin
          ? [
              {
                link: '/admin/igrejas',
                icon: <Church />,
                title: 'Igrejas',
              },
              // o que cada igreja pode usar: decisão de plataforma também
              {
                link: '/admin/planos',
                icon: <WorkspacePremium />,
                title: 'Planos',
                novo: true,
              },
            ]
          : []),
      ]
    : [
        {
          link: '/home',
          icon: <Event />,
          title: 'Pagina Inicial',
        },
        {
          link: '/minhasInscricoes',
          icon: <ConfirmationNumber />,
          title: 'Minhas Inscrições',
        },
        {
          link: '/historicoEventos',
          icon: <EventNote />,
          title: 'Eventos',
        },
      ];

  /**
   * Os módulos do sistema — o que se opera por evento ou por igreja —, num
   * grupo próprio abaixo do de administração (quem acessa, quem administra,
   * o que aconteceu).
   */
  const itensModulos: ItemMenu[] = isAdmin
    ? [
        // primeiro da seção: os membros e as famílias são do admin da igreja;
        // a tesouraria e o tesoureiro(a) de evento só consultam, e o admin de
        // evento edita o perfil
        ...(isAdminRole || isTesouraria || soPorEvento
          ? [
              {
                link: '/admin/membros',
                icon: <Diversity3 />,
                title: 'Membros',
                novo: true,
              },
            ]
          : []),
        {
          link: '/admin/eventos',
          icon: <Event />,
          title: 'Eventos',
        },
        // publicar notícia é do admin; a tesouraria não entra aqui
        ...(isAdminRole
          ? [
              {
                link: '/admin/noticias',
                icon: <Campaign />,
                title: 'Notícias',
                novo: true,
              },
            ]
          : []),
        // grupo: a tesouraria da igreja (o módulo de tesouraria). Admin e
        // tesouraria veem tudo; o tesoureiro(a) completo de evento, só
        // Eventos — a mesma tela, com os eventos dele
        ...(!soPorEvento || temTesoureiroCompleto
          ? [
              {
                link: '/admin/tesouraria',
                icon: <AccountBalanceWallet />,
                title: 'Tesouraria',
                novo: true,
                filhos: [
                  ...(soPorEvento
                    ? []
                    : [
                        {
                          link: '/admin/tesouraria/administrativa',
                          icon: <Church />,
                          title: 'Administrativa',
                        },
                      ]),
                  {
                    link: '/admin/tesouraria/eventos',
                    icon: <Event />,
                    title: 'Eventos',
                    novo: true,
                  },
                  ...(soPorEvento
                    ? []
                    : [
                        {
                          link: '/admin/tesouraria/congregacoes',
                          icon: <HolidayVillage />,
                          title: 'Congregações',
                          novo: true,
                        },
                      ]),
                ],
              },
            ]
          : []),
        ...(soPorEvento
          ? []
          : [
              {
                link: '#patrimonio',
                icon: <Inventory2 />,
                title: 'Patrimônio',
                emBreve: true,
              },
            ]),
        // {
        //   link: '#loja',
        //   icon: <Storefront />,
        //   title: 'Loja',
        //   emBreve: true,
        // },
      ]
    : [];

  /**
   * Manutenção, no fim da régua: os registros do sistema. Não são trabalho do
   * dia a dia do painel, e sim de quem cuida do funcionamento.
   */
  const itensManutencao: ItemMenu[] = isAdmin
    ? [
        // o registro de atividades (antes e depois de qualquer tabela, de
        // todas as igrejas) é de quem já atravessa todas: dev e super admin
        ...(isSuperAdmin
          ? [
              {
                link: '/admin/atividades',
                icon: <History />,
                title: 'Registro de Atividades',
                
              },
            ]
          : []),
        // tentativas de login (documento, IP, aparelho) são investigação de
        // segurança: só o dev
        ...(isDev
          ? [
              {
                link: '/admin/logins',
                icon: <Login />,
                title: 'Registro de Login',
                
              },
            ]
          : []),
      ]
    : [];

  // módulo fora do plano de todas as igrejas da pessoa sai da régua (para o
  // tesoureiro(a) de evento, as igrejas dos eventos dele)
  const doPlano = (itens: ItemMenu[]) =>
    itens.filter(
      (item) =>
        !MODULO_DO_LINK[item.link] || temModulo(MODULO_DO_LINK[item.link])
    );

  const secoes: SecaoMenu[] =
    areaAtual === 'configuracoes'
      ? // grupo sem item (módulo fora do plano, perfil sem acesso) não aparece
        [
          // o voltar fica no topo, sem grupo
          { titulo: '', itens: voltarAoPainel },
          { titulo: 'Eventos', itens: doPlano(configuracoesDeEventos) },
          { titulo: 'Notícias', itens: doPlano(configuracoesDeNoticias) },
          { titulo: 'Tesouraria', itens: doPlano(configuracoesDaTesouraria) },
          { titulo: 'Sistema', itens: configuracoesDoSistema },
        ]
      : areaAtual === 'admin'
        ? [
            // o tesoureiro(a) e o admin de evento não têm igreja: Início e
            // Meus planos são dela, e a régua deles começa nos módulos
            {
              titulo: 'Administrador',
              itens: soPorEvento ? [] : itensPainel,
            },
            { titulo: 'Módulos', itens: doPlano(itensModulos) },
            { titulo: 'Manutenção', itens: itensManutencao },
          ]
        : [{ titulo: 'Inscrições', itens: itensPainel }];

  return (
    <>
      {/* Régua fixa, da tela grande */}
      <Box
        component="nav"
        sx={{
          display: validRole ? { xs: 'none', lg: 'flex' } : 'none',
          flexDirection: 'column',
          flexShrink: 0,
          width: recolhida ? LARGURA_RECOLHIDA : LARGURA,
          transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shorter,
          }),
          overflowX: 'hidden',
          height: `calc(100vh - ${ALTURA_APPBAR}px)`,
          position: 'sticky',
          top: ALTURA_APPBAR,
          overflowY: 'auto',
          backgroundColor: theme.palette.background.paper,
          /**
           * Borda tracejada em vez de linha cheia: separa a régua do conteúdo
           * sem cravar um trilho escuro na tela inteira, e é o detalhe que dá o
           * ar de painel ao layout.
           */
          borderRight: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <ConteudoNav
          secoes={secoes}
          recolhida={recolhida}
          onAlternar={() => setRecolhida(!recolhida)}
        />
      </Box>

      {/* Gaveta do celular */}
      <Drawer
        variant="temporary"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: LARGURA,
            backgroundColor: theme.palette.background.paper,
            // o Paper do tema entra com sombra; aqui ela só sujaria a borda da
            // gaveta, que já se separa do conteúdo pelo overlay do Modal
            boxShadow: 'none',
            borderRadius: 0,
            backgroundImage: 'none',
          },
        }}
      >
        {/* a marca aparece só aqui: na tela grande ela já está na barra do topo */}
        <Stack
          component={Link}
          to={
            !isAdmin
              ? '/home'
              : soPorEvento
                ? '/admin/eventos'
                : '/admin/inicio'
          }
          onClick={() => setOpenDrawer(false)}
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ px: 2.5, pt: 3, textDecoration: 'none' }}
        >
          <Logo
            style={{
              height: '36px',
              width: 'auto',
              fill: theme.palette.text.primary,
            }}
          />
          {/* o mesmo nome da barra do topo: a gaveta é a outra metade dela */}
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            ICCV{' '}
            <Box
              component="span"
              sx={{ fontWeight: 400, color: 'text.secondary' }}
            >
              Eventos
            </Box>
          </Typography>
        </Stack>

        <ConteudoNav secoes={secoes} onNavigate={() => setOpenDrawer(false)} />
      </Drawer>
    </>
  );
};

export default SideBar;
