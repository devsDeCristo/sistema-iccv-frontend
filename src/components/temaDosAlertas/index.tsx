import { GlobalStyles, alpha, useTheme } from '@mui/material';

/**
 * Os alertas do SweetAlert (confirmações, avisos, "deseja pagar agora?") com a
 * cara dos modais do sistema, no claro e no escuro.
 *
 * Um estilo global, e não um ajuste em cada `Swal.fire`: são dezenas de
 * chamadas, e cada uma tinha a sua cor solta (`#d33`, `#3085d6`, verde,
 * vermelho). Aqui o alerta passa a ler o tema — fundo, texto, borda, raio,
 * fonte — e os botões seguem os do sistema:
 *
 * - confirmar: o botão cheio do tema (o mesmo `contained` do MUI, inclusive a
 *   cor do módulo quando houver);
 * - cancelar: texto, como o "Cancelar" dos modais;
 * - a terceira saída (`deny`): contorno;
 * - ação que apaga alguma coisa: `customClass: { confirmButton: 'swal2-perigo' }`,
 *   no vermelho do tema.
 *
 * As cores passadas na chamada (`confirmButtonColor`…) perdem para estas — é
 * de propósito: o alerta não decide a própria paleta.
 *
 * Tudo centralizado: ícone discreto no alto, título, texto e os botões, com
 * o principal à direita do cancelar.
 */
/** O tamanho do ícone, sobre o original do SweetAlert */
const ZOOM_DO_ICONE = 0.55;

export function TemaDosAlertas() {
  const theme = useTheme();

  // o botão cheio do tema, lido do override do MUI: no escuro ele não é a
  // primária (é quase branco), e o alerta tem que bater com os botões da tela
  const cheio = (theme.components?.MuiButton?.styleOverrides?.contained ??
    {}) as { backgroundColor?: string; color?: string };
  const botao = cheio.backgroundColor ?? theme.palette.primary.main;
  const textoDoBotao = cheio.color ?? theme.palette.primary.contrastText;
  const raio = Number(theme.shape.borderRadius);

  const icone = (cor: string) => ({
    borderColor: `${alpha(cor, 0.35)} !important`,
    color: `${cor} !important`,
  });

  return (
    <GlobalStyles
      styles={{
        '.swal2-container.swal2-backdrop-show': {
          backgroundColor: `${alpha('#000', theme.palette.mode === 'dark' ? 0.6 : 0.45)} !important`,
        },
        '.swal2-popup': {
          width: 'min(460px, calc(100vw - 32px)) !important',
          padding: `${theme.spacing(3)} !important`,
          borderRadius: `${raio * 2}px !important`,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: `${theme.palette.background.paper} !important`,
          color: `${theme.palette.text.primary} !important`,
          boxShadow: theme.shadows[24],
          fontFamily: `${theme.typography.fontFamily} !important`,
        },
        '.swal2-icon': {
          // ícone discreto, centralizado no alto; o do SweetAlert era um
          // círculo enorme. O tamanho é pela
          // variável da própria biblioteca (v11), que aplica `zoom` no ícone.
          '--swal2-icon-zoom': String(ZOOM_DO_ICONE),
          // o `zoom` encolhe a margem junto com o ícone: dividir por ele dá o
          // espaço de verdade até o título
          margin: `0 auto calc(${theme.spacing(2.5)} / ${ZOOM_DO_ICONE}) !important`,
        },
        '.swal2-icon.swal2-success .swal2-success-ring': {
          borderColor: `${alpha(theme.palette.success.main, 0.35)} !important`,
        },
        // O ✓ animado é desenhado com peças que "apagam" parte do anel
        // pintando por cima dele com a cor do fundo — e elas saíam brancas no
        // escuro (o disco branco com traços). Na cor do fundo do alerta,
        // somem como deveriam, inclusive a que passa da borda do ícone.
        '.swal2-icon.swal2-success [class^=swal2-success-circular-line], .swal2-icon.swal2-success .swal2-success-fix':
          {
            backgroundColor: `${theme.palette.background.paper} !important`,
          },
        '.swal2-icon.swal2-success [class^=swal2-success-line]': {
          backgroundColor: `${theme.palette.success.main} !important`,
        },
        '.swal2-icon.swal2-error': icone(theme.palette.error.main),
        '.swal2-icon.swal2-error [class^=swal2-x-mark-line]': {
          backgroundColor: `${theme.palette.error.main} !important`,
        },
        '.swal2-icon.swal2-warning': icone(theme.palette.warning.main),
        '.swal2-icon.swal2-info': icone(theme.palette.info.main),
        '.swal2-icon.swal2-question': icone(theme.palette.primary.main),
        '.swal2-image': {
          margin: `0 auto ${theme.spacing(2)} !important`,
        },
        '.swal2-title': {
          padding: '0 !important',
          textAlign: 'center',
          fontSize: '1.25rem !important',
          fontWeight: '700 !important',
          lineHeight: 1.3,
          color: `${theme.palette.text.primary} !important`,
        },
        // o rótulo de `comSelo`, na cor do ícone do alerta
        '.swal2-selo': {
          display: 'block',
          // o rótulo é do ícone, não do título: sobe para perto do ✓ (a
          // margem do ícone é 20px; sobram 8) e deixa folga até o título
          marginTop: `-${theme.spacing(1.5)}`,
          marginBottom: theme.spacing(1.5),
          fontSize: '0.8rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.palette.text.secondary,
        },
        '.swal2-icon-success .swal2-selo': {
          color: theme.palette.success.main,
        },
        '.swal2-icon-error .swal2-selo': { color: theme.palette.error.main },
        '.swal2-icon-warning .swal2-selo': {
          color: theme.palette.warning.main,
        },
        '.swal2-icon-info .swal2-selo': { color: theme.palette.info.main },
        '.swal2-icon-question .swal2-selo': {
          color: theme.palette.primary.main,
        },
        '.swal2-html-container': {
          margin: `${theme.spacing(1)} 0 0 !important`,
          padding: '0 !important',
          textAlign: 'center',
          fontSize: '0.95rem !important',
          lineHeight: 1.5,
          color: `${theme.palette.text.secondary} !important`,
        },
        '.swal2-actions': {
          width: '100%',
          margin: `${theme.spacing(3)} 0 0 !important`,
          padding: '0 !important',
          gap: theme.spacing(1),
          // a ordem do SweetAlert é confirmar, negar, cancelar; a dos modais
          // é o contrário, com a ação principal na ponta direita
          flexDirection: 'row-reverse',
          justifyContent: 'center !important',
        },
        '.swal2-styled': {
          margin: '0 !important',
          padding: '6px 16px !important',
          borderRadius: `${raio}px !important`,
          fontFamily: `${theme.typography.fontFamily} !important`,
          fontSize: '0.875rem !important',
          fontWeight: 500,
          textTransform: 'capitalize',
          boxShadow: 'none !important',
          border: '1px solid transparent !important',
          transition: 'background-color .15s, border-color .15s',
        },
        '.swal2-styled:focus-visible': {
          boxShadow: `0 0 0 3px ${alpha(botao, 0.35)} !important`,
        },
        '.swal2-styled.swal2-confirm': {
          backgroundColor: `${botao} !important`,
          color: `${textoDoBotao} !important`,
        },
        '.swal2-styled.swal2-confirm:hover': {
          backgroundColor: `${alpha(botao, 0.8)} !important`,
          backgroundImage: 'none !important',
        },
        '.swal2-styled.swal2-confirm.swal2-perigo': {
          backgroundColor: `${theme.palette.error.main} !important`,
          color: `${theme.palette.error.contrastText} !important`,
        },
        '.swal2-styled.swal2-confirm.swal2-perigo:hover': {
          backgroundColor: `${theme.palette.error.dark} !important`,
        },
        '.swal2-styled.swal2-deny': {
          backgroundColor: 'transparent !important',
          color: `${botao} !important`,
          borderColor: `${botao} !important`,
        },
        '.swal2-styled.swal2-deny:hover': {
          backgroundColor: `${alpha(botao, 0.06)} !important`,
          backgroundImage: 'none !important',
        },
        '.swal2-styled.swal2-cancel': {
          backgroundColor: 'transparent !important',
          color: `${theme.palette.text.primary} !important`,
        },
        '.swal2-styled.swal2-cancel:hover': {
          backgroundColor: `${theme.palette.action.hover} !important`,
          backgroundImage: 'none !important',
        },
        '.swal2-close': {
          color: `${theme.palette.text.secondary} !important`,
          fontSize: '2rem !important',
        },
        '.swal2-close:hover': {
          color: `${theme.palette.text.primary} !important`,
        },
        '.swal2-close:focus-visible': {
          boxShadow: `0 0 0 3px ${alpha(botao, 0.35)} !important`,
        },
        '.swal2-loader': {
          borderColor: `${botao} transparent ${botao} transparent !important`,
        },
        '.swal2-input, .swal2-textarea, .swal2-select': {
          margin: `${theme.spacing(2)} 0 0 !important`,
          width: '100% !important',
          borderRadius: `${raio}px !important`,
          border: `1px solid ${theme.palette.divider} !important`,
          backgroundColor: `${theme.palette.background.input} !important`,
          color: `${theme.palette.text.primary} !important`,
          boxShadow: 'none !important',
        },
        '.swal2-validation-message': {
          backgroundColor: `${theme.palette.action.hover} !important`,
          color: `${theme.palette.text.primary} !important`,
        },
        '.swal2-timer-progress-bar': {
          backgroundColor: `${alpha(botao, 0.4)} !important`,
        },
      }}
    />
  );
}
