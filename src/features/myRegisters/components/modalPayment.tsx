import {
  Box,
  Button,
  Fade,
  Modal,
  Typography,
  Radio,
  Stack,
  useTheme,
  Skeleton,
  alpha,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import {
  methodPaymentOptions,
  PAYMENT_STATUS_COLOR,
  statusPaymentOptions,
} from '../../admin/events/constants';
import { usePostCreateCheckoutEvent } from '../../admin/events/api/postCreateCheckoutEvent';
import { useState } from 'react';
import CustomChip from '../../../components/customChip';

interface ModalPaymentProps {
  open: boolean;
  handleClose: () => void;
  payments: {
    roleId: string;
    method: string;
    tipo: 'WAITLIST' | 'REGISTERED';
    status: String;
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
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      selectedRoleIds: [] as string[],
    },
  });
  const selectedRoleIds = watch('selectedRoleIds');
  const [loading, setLoading] = useState(false);

  const { mutate: mutateCreateCheckoutEvent } = usePostCreateCheckoutEvent({
    onSuccess: (data: any) => {
      const link = data.link;
      window.location.href = link;
    },
    onError: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    mutateCreateCheckoutEvent({
      data: { roleId: data.selectedRoleIds },
      eventId: eventId,
      userId: userId,
    });
  };

  const Loading = () => (
    <Box
      sx={{
        zIndex: 1500,
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        mt: 'auto',
        ml: 'auto',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: 'blur(4px)',
        backgroundColor: alpha(theme.palette.background.default, 0.8),
      }}
    >
      <Typography variant="h6" gutterBottom>
        Carregando Pagamento...
      </Typography>
      <Skeleton variant="rectangular" width={200} height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width={150} height={20} />
    </Box>
  );

  return (
    <>
      {loading && <Loading />}
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
                    const isPaid =
                      item.status === 'PAID' ||
                      item.status == 'IN_ANALYSIS' ||
                      item.tipo === 'WAITLIST' ||
                      (item.status === 'WAITING' && item.method !== 'OTHER');

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
                          <Typography fontWeight={600}>{item.name}</Typography>

                          <Typography fontSize={13} color="text.secondary">
                            {item.groupName}
                          </Typography>

                          <Stack direction="row" spacing={1} mt={1}>
                            <CustomChip
                              label={
                                item.tipo === 'REGISTERED'
                                  ? 'Inscrito'
                                  : 'Lista de espera'
                              }
                              customColor={
                                item.tipo === 'REGISTERED'
                                  ? theme.palette.success.main
                                  : theme.palette.warning.main
                              }
                            />
                            <CustomChip
                              label={
                                statusPaymentOptions.find(
                                  (option) => option.value === item.status
                                )?.label || item.status
                              }
                              customColor={PAYMENT_STATUS_COLOR(
                                item.status as any,
                                theme
                              )}
                            />
                            {item.method != 'OTHER' && (
                              <CustomChip
                                label={
                                  methodPaymentOptions.find(
                                    (option) => option.value === item.method
                                  )?.label || 'Pagamento Automatico'
                                }
                                customColor={theme.palette.info.main}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    );

                    return isPaid ? (
                      <Box>{Card}</Box>
                    ) : (
                      <Box key={item.roleId}>{Card}</Box>
                    );
                  })}
                </Stack>
              )}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                disabled={!selectedRoleIds || selectedRoleIds.length === 0}
                variant="contained"
                onClick={handleSubmit(onSubmit)}
              >
                Realizar Pagamento
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
