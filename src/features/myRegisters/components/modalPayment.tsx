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
import { PaymentProductItem } from '../../admin/events/types';
import { descreverItem } from '../../admin/events/products';

interface ModalPaymentProps {
  open: boolean;
  handleClose: () => void;
  payments: {
    /** identifica o item na seleção: inscrição e compra avulsa não colidem */
    key: string;
    /** ingresso: vai para o checkout pela regra */
    roleId?: string;
    /** compra avulsa de produto: vai para o checkout pelo id do pagamento */
    paymentId?: string;
    method: string;
    tipo: 'WAITLIST' | 'REGISTERED';
    status: String;
    name: string;
    groupName: string;
    /** produtos comprados junto deste ingresso: são pagos com ele */
    products?: PaymentProductItem[];
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
      selecionados: [] as string[],
    },
  });
  const selecionados = watch('selecionados');
  const [loading, setLoading] = useState(false);

  const { mutate: mutateCreateCheckoutEvent } = usePostCreateCheckoutEvent({
    onSuccess: (data: any) => {
      const link = data.link;

      window.open(link, '_blank', 'noopener,noreferrer');
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: { selecionados: string[] }) => {
    const escolhidos = payments.filter((item) =>
      data.selecionados.includes(item.key)
    );

    setLoading(true);
    mutateCreateCheckoutEvent({
      data: {
        roleId: escolhidos.flatMap((item) => item.roleId ?? []),
        paymentIds: escolhidos.flatMap((item) => item.paymentId ?? []),
      },
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
              width: '90%',
              maxWidth: 520,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <Typography fontSize={18} fontWeight={600} mb={1}>
              Selecione os pagamentos
            </Typography>

            <Box sx={{ overflowY: 'auto', maxHeight: '55vh', mt: 2 }}>
              <Controller
                name="selecionados"
                control={control}
                render={({ field }) => (
                  <Stack spacing={1.5}>
                    {payments?.map((item) => {
                      const isPaid =
                        item.status === 'PAID' ||
                        item.status == 'IN_ANALYSIS' ||
                        item.tipo === 'WAITLIST' ||
                        (item.status === 'WAITING' && item.method !== 'OTHER');

                      const selected = field.value.includes(item.key);

                      const toggle = () => {
                        if (isPaid) return;

                        if (selected) {
                          field.onChange(
                            field.value.filter((key) => key !== item.key)
                          );
                        } else {
                          field.onChange([...field.value, item.key]);
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

                            {item.groupName && (
                              <Typography fontSize={13} color="text.secondary">
                                {item.groupName}
                              </Typography>
                            )}

                            {!!item.products?.length && (
                              <Typography fontSize={13} color="text.secondary">
                                Produtos:{' '}
                                {item.products.map(descreverItem).join(', ')}
                              </Typography>
                            )}

                            <Stack direction="row" spacing={1} mt={1}>
                              <CustomChip
                                label={
                                  item.paymentId
                                    ? 'Compra avulsa'
                                    : item.tipo === 'REGISTERED'
                                      ? 'Inscrito'
                                      : 'Lista de espera'
                                }
                                customColor={
                                  item.tipo === 'REGISTERED'
                                    ? theme.palette.success.main
                                    : theme.palette.warning.main
                                }
                              />
                              {item.tipo !== 'WAITLIST' && (
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
                              )}
                              {item.method != 'OTHER' &&
                                item.tipo !== 'WAITLIST' && (
                                  <CustomChip
                                    label={
                                      methodPaymentOptions.find(
                                        (option) => option.value === item.method
                                      )?.label || ''
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
                        <Box key={item.key}>{Card}</Box>
                      );
                    })}
                  </Stack>
                )}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                disabled={!selecionados || selecionados.length === 0}
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
