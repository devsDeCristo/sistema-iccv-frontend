import {
  Box,
  Button,
  Fade,
  Modal,
  Typography,
  Radio,
  Stack,
  useTheme,
  Chip,
  Tooltip,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { statusPaymentOptions } from '../../admin/events/constants';
import { usePostCreateCheckoutEvent } from '../../admin/events/api/postCreateCheckoutEvent';
import { Navigate, useNavigate } from 'react-router-dom';

interface ModalPaymentProps {
  open: boolean;
  handleClose: () => void;
  payments: {
    roleId: string;
    tipo: 'WAITLIST' | 'REGISTERED';
    status: String ;
    name: string;
    groupName: string;
  }[];
  userId: string;
  eventId: string;
}

export function ModalPayment({
  open,
  handleClose,
  payments,
  userId,
  eventId,
}: ModalPaymentProps) {
  
  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      selectedRoleIds: [] as string[],
    },
  });

  const { mutate: mutateCreateCheckoutEvent } = usePostCreateCheckoutEvent({
      onSuccess: (data: any) => {
        const link = data.link;
        //window.location.href = link;
      },
     
    });

  const onSubmit = (data: any) => {
    mutateCreateCheckoutEvent({ data: { roleId: data.selectedRoleIds }, eventId: eventId, userId: userId });
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            width: '100%',
            maxWidth: 520,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography fontSize={18} fontWeight={600} mb={1}>
            Selecione os pagamentos
          </Typography>


          <Controller
            name="selectedRoleIds"
            control={control}
            render={({ field }) => (
              <Stack spacing={1.5}>
                {payments?.map((item) => {
                  const isPaid = item.status === 'PAID' || item.tipo === 'WAITLIST';
                  const selected = field.value.includes(item.roleId);

                  const toggle = () => {
                    if (isPaid) return;

                    if (selected) {
                      field.onChange(
                        field.value.filter((id) => id !== item.roleId)
                      );
                    } else {
                      field.onChange([...field.value, item.roleId]);
                    }
                  };

                  const Card = (
                    <Box
                      onClick={toggle}
                      sx={{
                        border: '1px solid',
                        borderColor: selected
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        cursor: isPaid ? 'not-allowed' : 'pointer',
                        opacity: isPaid ? 0.45 : 1,
                        bgcolor: selected
                          ? theme.palette.action.selected
                          : 'transparent',
                        transition: '0.2s',
                        '&:hover': {
                          bgcolor: isPaid
                            ? 'transparent'
                            : theme.palette.action.hover,
                        },
                      }}
                    >
                      <Radio checked={selected} disabled={isPaid} />

                      <Box flex={1}>
                        <Typography fontWeight={600}>
                          {item.name}
                        </Typography>

                        <Typography fontSize={13} color="text.secondary">
                          {item.groupName}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip
                            size="small"
                            label={item.tipo==='REGISTERED' ? 'Inscrito' : 'Lista de espera'}
                            color={
                              item.tipo === 'REGISTERED'
                                ? 'primary'
                                : 'default'
                            }
                          />
                          <Chip
                            size="small"
                            label={statusPaymentOptions.find(option => option.value === item.status)?.label || item.status}
                            color={
                              item.status === 'PAID'
                                ? 'success'
                                : 'warning'
                            }
                          />
                        </Stack>
                      </Box>
                    </Box>
                  );

                  return isPaid ? (
                    <Tooltip
                      key={item.roleId}
                      title="Pagamento Indisponível"
                      placement="top"
                    >
                      <Box>{Card}</Box>
                    </Tooltip>
                  ) : (
                    <Box key={item.roleId}>{Card}</Box>
                  );
                })}
              </Stack>
            )}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>
              Realizar Pagamento
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
