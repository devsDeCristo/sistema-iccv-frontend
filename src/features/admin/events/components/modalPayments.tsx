import {
  Backdrop,
  Box,
  Button,
  Fade,
  Grid,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
  useTheme,
  Tooltip,
  alpha,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Close, Upload } from '@mui/icons-material';
import { methodPaymentOptions, statusPaymentOptions } from '../constants';

interface ModalPaymentProps {
  open: boolean;
  handleClose: () => void;
  payment: any;
}

const titleMap: Record<string, string> = {
    amount: 'Valor',
    cpf: 'CPF',
    groupName: 'Nome do Grupo',
    id: 'ID do Pagamento',
    status: 'Status',
    method: 'Método de Pagamento',
}

export function ModalPayment({ open, handleClose, payment }: ModalPaymentProps) {
  const theme = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const { control, reset, handleSubmit, setValue } = useForm();
  const receiptFile = useWatch({ control, name: 'receiptFile' });

  const [isDragging, setIsDragging] = useState(false);

  const preview = useMemo(() => {
    if (!receiptFile) return null;
    return URL.createObjectURL(receiptFile);
  }, [receiptFile]);

  useEffect(() => {
    if (payment) {
      reset({
        id: payment.id,
        cpf: payment.cpf,
        amount: payment.amount,
        groupName: payment.groupName,
        status: payment.status,
        method: payment.method,
        receiptFile: null,
      });
    }
  }, [payment, reset]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setValue('receiptFile', file);
  };

  const styles = {
    uploadBox: {
      border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
      borderRadius: 2,
      p: 3,
      cursor: 'pointer',
      textAlign: 'center',
      transition: '0.2s',
      bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderColor: theme.palette.primary.main,
      },
    },
  };

  const Title = ({ title }: { title: string }) => (
    <Typography fontSize={14} fontWeight={500} mb={0.5}>
      {title}
    </Typography>
  );

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition slots={{ backdrop: Backdrop }}>
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 650 },
           
           
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            p: 3,
            boxShadow: 10,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize={20} fontWeight={600}>
              Detalhes do Pagamento
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} mt={1} sx={{overflowY: 'auto', maxHeight: '70vh', pr: 1}}>
              {['id', 'cpf', 'amount', 'groupName'].map((field) => (
                <Grid key={field} item xs={12} md={field === 'groupName' ? 12 : 6}>
                  <Controller
                    name={field}
                    
                    control={control}
                    render={({ field: f }) => (
                      <>
                        <Title title={titleMap[field]} />
                        {field === 'amount' ? (
                          <TextField
                            {...f}
                            value={"R$"+f.value.toFixed(2).replace('.', ',')}
                            disabled
                            fullWidth
                            size="small"
                            InputProps={{ readOnly: true }}
                          />
                        ) : (
                          <TextField {...f} disabled fullWidth size="small" InputProps={{ readOnly: true }} />
                        )}
                      </>
                    )}
                  />
                </Grid>
              ))}

              {/* STATUS */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Title title="Status" />
                      <TextField {...field} select SelectProps={{ native: true }} fullWidth size="small">
                        {statusPaymentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                      </TextField>
                    </>
                  )}
                />
              </Grid>

              {/* METHOD */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="method"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Title title="Método" />
                      <TextField {...field} select SelectProps={{ native: true }} fullWidth size="small">
                            {methodPaymentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                            ))}
                      </TextField>
                    </>
                  )}
                />
              </Grid>

              {/* Upload recibo com layout bonito */}
              <Grid item xs={12}>
                <Title title="Recibo" />

                <Controller
                  name="receiptFile"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <>
                      <input
                        hidden
                        ref={fileRef}
                        type="file"
                         accept="image/png,image/jpeg"
                        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                      />

                      {receiptFile ? (
                        <Box
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            {preview && (
                              <Box
                                component="img"
                                src={preview}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  objectFit: 'contain',
                                  borderRadius: 1,
                                  bgcolor: theme.palette.background.default,
                                }}
                              />
                            )}

                            <Box>
                              <Typography fontWeight={500}>{receiptFile.name}</Typography>
                              <Typography fontSize={13} color="text.secondary">
                                {(receiptFile.size / 1024).toFixed(1)} KB
                              </Typography>
                            </Box>
                          </Stack>

                          <Tooltip title="Remover">
                            <IconButton onClick={() => setValue('receiptFile', null)}>
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box
                          sx={styles.uploadBox}
                          onClick={() => fileRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                        >
                          <Upload fontSize="large" />
                          <Typography fontSize={14}>
                            Clique ou arraste o recibo aqui
                          </Typography>
                          <Typography fontSize={12} color="text.secondary">
                            PNG, JPG ou SVG
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                />
              </Grid>
            </Grid>

            <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>
              Salvar alterações
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
