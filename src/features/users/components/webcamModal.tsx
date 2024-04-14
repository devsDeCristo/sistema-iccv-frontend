import { Backdrop, Box, Fade, Modal } from '@mui/material';
import { WebcamUpload } from './webcamUpload';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (data: File | null) => void;
}

function WebcamModal({ isOpen, onClose, onSavePhoto }: WebcamModalProps) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 750,
    color: '#000',
    bgcolor: 'background.paper',
    boxShadow: 14,
    p: 4,
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
          <WebcamUpload onSavePhoto={onSavePhoto} />
        </Box>
      </Fade>
    </Modal>
  );
}

export { WebcamModal };
