import { Backdrop, Box, Fade, Modal } from '@mui/material';
import { WebcamUpload } from './webcamUpload';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (data: File) => void;
}

function WebcamModal({ isOpen, onClose, onSelectPhoto }: WebcamModalProps) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '90%',
    // coluna flex: a área da câmera fica com toda a altura que sobra
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: '#000',
    bgcolor: 'background.paper',
    boxShadow: 14,
    p: { xs: 2, sm: 4 },
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <Box sx={style}>
          <WebcamUpload onSelectPhoto={onSelectPhoto} />
        </Box>
      </Fade>
    </Modal>
  );
}

export { WebcamModal };
