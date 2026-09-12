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
import { alpha } from '@mui/material/styles';
import { Check, Church, UnfoldMore } from '@mui/icons-material';

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
    /**
     * Raio 8px, o mesmo que o tema dá a todo `Paper` e que os cartões desta
     * tela usam. Já foi pílula (raio total), e destoava: era a única forma
     * totalmente arredondada da interface inteira.
     */
    botao: {
      backgroundColor: theme.palette.background.paperSecondary,
      border: `1px solid ${theme.palette.divider}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.9,
      // menos folga do lado do chevron, que já tem ar próprio no desenho dele
      pl: 1.5,
      pr: 1,
      py: 0.85,
      borderRadius: 1,
      maxWidth: '100%',
      transition: 'background-color .15s, border-color .15s',
      '&:hover': {
        backgroundColor: theme.palette.background.hover,
        borderColor: alpha(theme.palette.text.primary, 0.25),
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
    },
    /**
     * Com uma igreja só não há o que alternar, e aí o desenho perde a caixa:
     * pílula sem chevron continuaria parecendo clicável, e a pessoa ficaria
     * tentando abrir uma lista que não existe.
     */
    rotulo: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.9,
      maxWidth: '100%',
    },
    nome: {
      fontSize: 15,
      fontWeight: 600,
      // a mesma altura de linha do ícone ao lado: sem isto o chevron e o texto
      // assentam em bases diferentes e a linha fica torta
      lineHeight: '18px',
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
      <Church
        sx={{
          fontSize: 18,
          flexShrink: 0,
          color: theme.palette.text.secondary,
        }}
      />

      <Box
        component="span"
        sx={{
          ...styles.nome,
          color: podeTrocar
            ? theme.palette.text.primary
            : theme.palette.text.secondary,
        }}
      >
        {atual?.name ?? '—'}
      </Box>

      {/*
        Seta de duas pontas e não chevron para baixo: o de baixo promete
        "abrir mais coisa embaixo", e o que acontece é trocar o recorte da
        tela inteira. Este é o mesmo sinal que alternador de conta usa.
      */}
      {podeTrocar && (
        <UnfoldMore sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
      )}
    </>
  );

  /**
   * O rótulo em texto, fora do controle.
   *
   * Sem ele o nome da igreja aparecia sozinho no cabeçalho e não dizia o que
   * era — dava para ler como subtítulo da página. Fora e não dentro do botão
   * porque dentro ele empurraria o nome para uma segunda linha.
   *
   * "selecionada" e não só "Igreja": é o que diferencia um rótulo de campo de
   * um recorte já aplicado. O que está ali não é o que você vai escolher, é o
   * que já está valendo para a tela inteira.
   */
  const rotulo = (
    <Typography
      variant="body2"
      sx={{
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      Igreja selecionada
    </Typography>
  );

  if (!podeTrocar) {
    return (
      <Box sx={styles.rotulo}>
        {rotulo}
        <Box sx={{ ...styles.rotulo, minWidth: 0 }}>{conteudo}</Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {rotulo}

      <ButtonBase
        sx={styles.botao}
        onClick={(evento) => setMenu(evento.currentTarget)}
      >
        {conteudo}
      </ButtonBase>

      <Menu
        anchorEl={menu}
        open={!!menu}
        onClose={() => setMenu(null)}
        // Alinhado pela direita, que é a borda em que o controle encosta no
        // cabeçalho: ancorado pela esquerda, o menu crescia para fora da tela
        // e o navegador o empurrava de volta, desencostando do botão.
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            // Sem faixa de fundo no item atual: o check já diz qual é, e a
            // faixa do `selected` do MUI pesa mais que a própria escolha.
            sx={{
              py: 1,
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: theme.palette.background.hover },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              {igreja.id === churchId && (
                <Check fontSize="small" color="primary" />
              )}
            </ListItemIcon>
            <Typography
              noWrap
              fontSize={14}
              fontWeight={igreja.id === churchId ? 600 : 400}
            >
              {igreja.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export { ChurchScopeBar };
