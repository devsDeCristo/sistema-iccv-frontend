import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Slide,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AdminPanelSettingsOutlined, Close } from '@mui/icons-material';

/**
 * Barra dos usuários marcados na tabela: a quantidade e o que dá para fazer
 * com eles de uma vez. Flutua no pé da tela, para seguir visível enquanto a
 * pessoa rola e marca mais.
 *
 * Quem usa reserva o espaço dela no fim da página (ver `List`): a página rola
 * o bastante para a tabela e a paginação saírem de trás da barra — no celular,
 * onde ela ocupa a largura, era o que a deixava cobrindo as últimas linhas.
 * No celular o botão diz só "Permissão" e o texto corta antes de quebrar.
 */
function BarraDeSelecao({
  quantos,
  onEditarPermissao,
  onLimpar,
}: {
  quantos: number;
  /** ausente para quem não altera permissão: a barra só conta e limpa */
  onEditarPermissao?: () => void;
  onLimpar: () => void;
}) {
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));

  const barra = (
    <Paper
      elevation={8}
      role="region"
      aria-label="Usuários selecionados"
      sx={{
        pointerEvents: 'auto',
        width: { xs: '100%', sm: 'auto' },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        pl: { xs: 1.5, sm: 2 },
        pr: 1,
        py: 1,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          minWidth: 28,
          height: 28,
          px: 1,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: 'primary.contrastText',
          bgcolor: 'primary.main',
        }}
      >
        {quantos}
      </Box>
      {/* no aperto o texto corta, e não empurra o botão para fora */}
      <Typography noWrap sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}>
        {quantos === 1 ? 'selecionado' : 'selecionados'}
      </Typography>

      {onEditarPermissao && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', sm: 'block' } }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AdminPanelSettingsOutlined />}
            onClick={onEditarPermissao}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {celular ? 'Permissão' : 'Editar permissão'}
          </Button>
        </>
      )}

      <Tooltip title="Limpar seleção">
        <IconButton
          size="small"
          onClick={onLimpar}
          aria-label="Limpar seleção"
          sx={{ flexShrink: 0 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );

  return (
    // o contêiner fixo centraliza; a barra anima dentro dele (o `Slide` usa o
    // `transform`, e centralizar com `translateX` brigaria com a animação)
    <Box
      sx={{
        position: 'fixed',
        zIndex: theme.zIndex.appBar + 1,
        bottom: { xs: 16, sm: 24 },
        left: 0,
        right: 0,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        // a faixa vazia em volta não rouba clique da tabela
        pointerEvents: 'none',
      }}
    >
      <Slide in={quantos > 0} direction="up" mountOnEnter unmountOnExit>
        {barra}
      </Slide>
    </Box>
  );
}

export { BarraDeSelecao };
