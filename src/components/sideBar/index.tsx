import { ReactNode } from 'react';
import {
  Campaign,
  ConfirmationNumber,
  Event,
  Logout,
  People,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import {
  alpha,
  Box,
  Drawer,
  lighten,
  Stack,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import Logo from '../../assets/logo-ic.svg?react';
import { useRole } from '../../hooks/useRole';
import { useUser } from '../../contexts/userContext';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../themes';

/** Largura da régua lateral, a mesma nos dois modos (fixa e gaveta) */
const LARGURA = 260;

/** Altura da barra do topo, de onde a lateral começa na tela grande */
const ALTURA_APPBAR = 70;

type ItemMenu = {
  link: string;
  icon: ReactNode;
  title: string;
  /** Marca a linha com a etiqueta "Novo!" — para estrear uma tela no menu */
  novo?: boolean;
};

type SideBarProps = {
  validRole?: boolean | null;
  isAdmin?: boolean;
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
function TituloSecao({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="div"
      color="text.disabled"
      sx={{
        px: 2.5,
        mb: 1,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
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
function EtiquetaNovo() {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const inicio = escuro ? lighten(AZUL_VIVO, 0.35) : AZUL_VIVO;
  const fim = escuro ? lighten(VIOLETA_VIVO, 0.35) : VIOLETA_VIVO;

  return (
    <Typography
      component="span"
      sx={{

        flexShrink: 0,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.08em',
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
      Novo!
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
}: {
  item: ItemMenu;
  ativo: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();
  const destaque = corDestaque(theme);

  return (
    <Stack
      component={Link}
      to={item.link}
      onClick={onClick}
      direction="row"
      alignItems="center"
      gap={2}
      sx={{
        minHeight: 44,
        px: 2,
        mb: 0.5,
        borderRadius: 2,
        textDecoration: 'none',
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
        '& svg': { fontSize: 22, color: 'inherit' },
      }}
    >
      {item.icon}

      {/* a etiqueta anda junto do nome, e não encostada na parede direita da
          régua: colada no texto ela se lê como parte do item */}
      <Stack width={"100%"} direction="row" alignItems="center" justifyContent={"space-between"} sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            fontSize: 14,
            fontWeight: ativo ? 600 : 500,
            color: 'inherit',
          }}
        >
          {item.title}
        </Typography>

        {item.novo && <EtiquetaNovo />}
      </Stack>
    </Stack>
  );
}

/**
 * Miolo da régua, um só para os dois modos: na tela grande ele fica fixo ao
 * lado do conteúdo, no celular vai dentro da gaveta. Antes o menu inteiro
 * estava escrito duas vezes no arquivo, e cada ajuste tinha que ser feito nos
 * dois lugares.
 */
function ConteudoNav({
  itens,
  titulo,
  onNavigate,
}: {
  itens: ItemMenu[];
  titulo: string;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const { logout } = useUser();

  const estaAtivo = (link: string) =>
    pathname === link || pathname.startsWith(`${link}/`);

  // `logout` do contexto já limpa o storage, zera o usuário e leva para o
  // login — antes a saída era um link que só limpava o storage, e o nome do
  // usuário anterior ficava no ar até a página ser recarregada
  const sair = () => {
    onNavigate?.();
    logout();
  };

  return (
    /**
     * Cresce até o fim do espaço que sobra, em vez de fixar 100% de altura: na
     * gaveta o miolo divide o papel com a marca em cima, e altura cheia somada à
     * marca empurrava o "Sair" para fora da tela.
     */
    <Stack sx={{ flexGrow: 1, minHeight: 0, py: 3 }}>
      <TituloSecao>{titulo}</TituloSecao>

      <Box sx={{ px: 1.5 }}>
        {itens.map((item) => (
          <ItemNav
            key={item.link}
            item={item}
            ativo={estaAtivo(item.link)}
            onClick={onNavigate}
          />
        ))}
      </Box>

      {/* sair fica colado no rodapé da régua, longe do menu do dia a dia */}
      <Box sx={{ mt: 'auto', px: 1.5, pt: 2 }}>
        <ItemNav
          item={{ link: '/login', icon: <Logout />, title: 'Sair' }}
          ativo={false}
          onClick={sair}
        />
      </Box>
    </Stack>
  );
}

const SideBar: React.FC<SideBarProps> = ({
  validRole = true,
  isAdmin = false,
  openDrawer,
  setOpenDrawer,
}) => {
  const theme = useTheme();
  const { isAdmin: isAdminRole } = useRole();

  const itens: ItemMenu[] = isAdmin
    ? [
        // o financeiro não gerencia usuários
        ...(isAdminRole
          ? [
              {
                link: '/admin/usuarios',
                icon: <People />,
                title: 'Usuários',
              },
            ]
          : []),
        {
          link: '/admin/eventos',
          icon: <Event />,
          title: 'Eventos',
        },
        // publicar notícia é do admin; o financeiro não entra aqui
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
      ];

  const titulo = isAdmin ? 'Administrador' : 'Inscrições';

  return (
    <>
      {/* Régua fixa, da tela grande */}
      <Box
        component="nav"
        sx={{
          display: validRole ? { xs: 'none', lg: 'flex' } : 'none',
          flexDirection: 'column',
          flexShrink: 0,
          width: LARGURA,
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
        <ConteudoNav itens={itens} titulo={titulo} />
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
          to={isAdmin ? '/admin/eventos' : '/home'}
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
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            CIDADE VERDE
          </Typography>
        </Stack>

        <ConteudoNav
          itens={itens}
          titulo={titulo}
          onNavigate={() => setOpenDrawer(false)}
        />
      </Drawer>
    </>
  );
};

export default SideBar;
