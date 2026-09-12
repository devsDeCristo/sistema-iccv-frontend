import { useState } from 'react';
import {
  Box,
  ButtonBase,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { Check, Church, ExpandMore } from '@mui/icons-material';

import { EscopoDeIgreja } from './useIgrejaSelecionada';

interface Props {
  escopo: EscopoDeIgreja;
  /** O que está sendo configurado, para o aviso na hora de trocar */
  oQueMuda: string;
}

/**
 * Quem responde "de qual igreja é isto que estou vendo".
 *
 * É um alternador de contexto, não um formulário: a igreja não é um campo que
 * se preenche, é o recorte de tudo o que está na tela. Por isso ele não se
 * parece com um `Select` — sem caixa, sem rótulo flutuante e sem fundo, só o
 * nome da igreja entre um ícone e um chevron, do jeito que um seletor de
 * projeto aparece no topo de uma ferramenta.
 *
 * O aviso do que muda ao trocar vive dentro do menu, e não ao lado do
 * controle: ali ele é lido no instante em que importa — quando a pessoa está
 * escolhendo — em vez de virar mais uma linha de texto permanente na tela.
 *
 * Com uma igreja só, o mesmo desenho vira rótulo: sem chevron, sem hover, sem
 * clique. Esconder a linha faria a tela do admin parecer "a configuração do
 * sistema", que é justamente a leitura errada.
 */
function ChurchScopeBar({ escopo, oQueMuda }: Props) {
  const theme = useTheme();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const { igrejas, churchId, escolher, carregando, podeTrocar } = escopo;

  const atual = igrejas.find((igreja) => igreja.id === churchId);

  const styles = {
    base: {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1.2,
      py: 0.7,
       // alinha o texto com o conteúdo da página, e não com o padding
      mt:-1,
      borderRadius: 1.5,
      maxWidth: '100%',
    },
    clicavel: {
      transition: 'background-color .15s',
      '&:hover': { backgroundColor: theme.palette.background.hover },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
    },
    nome: {
      fontSize: 15,
      fontWeight: 600,
      // a mesma altura de linha do ícone ao lado: sem isto o chevron e o texto
      // assentam em bases diferentes e a linha fica torta
      lineHeight: '18px',
      color: theme.palette.text.primary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  if (carregando) {
    return <Skeleton variant="rounded" width={200} height={30} />;
  }

  const conteudo = (
    <>
      {/*
        Um ícone no lugar da palavra "Igreja": os nomes começam quase todos por
        ela, e o rótulo antes do nome produzia "Igreja / Igreja Padrão" — que lê
        mal e ocupa espaço para não dizer nada.

        Preenchido e não vazado: a 19px o contorno da igrejinha vira rabisco. É
        o mesmo ícone que a régua lateral usa para a tela de igrejas.
      */}
      <Church sx={{ fontSize: 19, color: theme.palette.text.secondary }} />

      <Box component="span" sx={styles.nome}>
        {atual?.name ?? '—'}
      </Box>

      {podeTrocar && (
        <ExpandMore sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
      )}
    </>
  );

  if (!podeTrocar) {
    return <Box sx={styles.base}>{conteudo}</Box>;
  }

  return (
    <Box>
      <ButtonBase
        sx={{ ...styles.base, ...styles.clicavel }}
        onClick={(evento) => setMenu(evento.currentTarget)}
      >
        {conteudo}
      </ButtonBase>

      <Menu
        anchorEl={menu}
        open={!!menu}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { minWidth: 240, maxWidth: 320, mt: 0.5 } }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 2,
            pt: 0.5,
            pb: 1,
            color: 'text.secondary',
            whiteSpace: 'normal',
          }}
        >
          Cada igreja tem {oQueMuda}.
        </Typography>

        <Divider />

        {igrejas.map((igreja) => (
          <MenuItem
            key={igreja.id}
            selected={igreja.id === churchId}
            onClick={() => {
              escolher(igreja.id);
              setMenu(null);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              {igreja.id === churchId && (
                <Check fontSize="small" color="primary" />
              )}
            </ListItemIcon>
            <Typography noWrap fontSize={14}>
              {igreja.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}

export { ChurchScopeBar };
