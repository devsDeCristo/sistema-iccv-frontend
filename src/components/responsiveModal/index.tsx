import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogProps,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Como o modal se comporta no celular:
 * - `fullScreen`: ocupa a tela inteira, com um X no cabeçalho;
 * - `bottomSheet`: sobe pela parte de baixo e fecha ao arrastar a alcinha.
 */
export type ModalMobileMode = 'fullScreen' | 'bottomSheet';

interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Botões do rodapé */
  actions?: ReactNode;
  children: ReactNode;
  mobileMode?: ModalMobileMode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  /** Trava o fechar enquanto algo está rodando (ex.: gerando o PDF) */
  disableClose?: boolean;
}

/** Arraste (em px) a partir do qual soltar a alcinha fecha a folha */
const CLOSE_THRESHOLD = 110;
/** Tempo da saída deslizando, antes de desmontar */
const CLOSE_ANIMATION = 180;

function ResponsiveModal({
  open,
  onClose,
  title,
  actions,
  children,
  mobileMode = 'bottomSheet',
  maxWidth = 'md',
  fullWidth = true,
  disableClose = false,
}: ResponsiveModalProps) {
  const theme = useTheme();
  // sem `noSsr` o primeiro render sai como desktop e o modal abre duas vezes:
  // monta o Dialog, o media query resolve e ele remonta como folha
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const isSheet = isMobile && mobileMode === 'bottomSheet';

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  /** liga a transição própria só no fim do gesto, para o solta-e-volta animar */
  const [isSettling, setIsSettling] = useState(false);
  const dragStart = useRef<number | null>(null);

  // cada abertura recomeça no lugar, senão sobra o arrasto do fechamento
  useEffect(() => {
    if (!open) return;
    setDragY(0);
    setIsDragging(false);
    setIsSettling(false);
  }, [open]);

  const handleClose = () => {
    if (disableClose) return;
    onClose();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    // só desce: puxar para cima não estica a folha
    setDragY(Math.max(0, event.clientY - dragStart.current));
  };

  const onPointerUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setIsDragging(false);
    setIsSettling(true);

    if (dragY > CLOSE_THRESHOLD && !disableClose) {
      // termina o gesto deslizando para fora antes de desmontar; o estado volta
      // ao lugar na próxima abertura, não aqui, senão a folha pula na saída
      setDragY(window.innerHeight);
      setTimeout(onClose, CLOSE_ANIMATION);
      return;
    }

    setDragY(0);
    setTimeout(() => setIsSettling(false), CLOSE_ANIMATION);
  };

  const header = title && (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      sx={{ px: 3, py: isSheet ? 1 : 2 }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {isMobile && !isSheet && (
        <IconButton onClick={handleClose} disabled={disableClose} edge="end">
          <Close />
        </IconButton>
      )}
    </Stack>
  );

  const footer = actions && (
    <>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap={1}
        sx={{ px: 3, py: 2 }}
      >
        {actions}
      </Stack>
    </>
  );

  /** Enquanto o dedo manda na folha, o transform é nosso */
  const isMoving = isDragging || isSettling || dragY > 0;

  if (isSheet) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        PaperProps={{
          // fora do gesto o transform fica com o Slide do MUI: um transform
          // nosso aqui faz a folha descer animada antes de subir, e a abertura
          // parece acontecer duas vezes
          style: isMoving
            ? {
                transform: `translateY(${dragY}px)`,
                transition: isDragging
                  ? 'none'
                  : `transform ${CLOSE_ANIMATION}ms ease-out`,
              }
            : undefined,
          sx: {
            maxHeight: '92vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundImage: 'none',
          },
        }}
      >
        {/* a alcinha: arrastar para baixo fecha a folha */}
        <Box
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1.5,
            cursor: 'grab',
            touchAction: 'none',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: theme.palette.divider,
            }}
          />
        </Box>

        {header}
        <Divider />
        <Box sx={{ px: 3, py: 2, overflowY: 'auto', flex: 1 }}>{children}</Box>
        {footer}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      PaperProps={{ sx: { backgroundImage: 'none' } }}
    >
      {header}
      <Divider />
      <Box sx={{ px: 3, py: 2, overflowY: 'auto', flex: 1 }}>{children}</Box>
      {footer}
    </Dialog>
  );
}

export { ResponsiveModal };
