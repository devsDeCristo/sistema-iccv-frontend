import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { filterUsers } from '../types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';
import { InputSelect } from '../../../../components/inputSelect';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: filterUsers) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApply,
}) => {
  const [filters, setFilters] = useState<filterUsers>({
    birthday: { startDate: '', endDate: '' },
    city: '',
    neighborhood: '',
  });

  const handleChange = (field: keyof filterUsers, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleBirthdayChange = (
    field: 'startDate' | 'endDate',
    value: string | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      birthday: { ...prev.birthday, [field]: value },
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrar Usuários</DialogTitle>
      <DialogContent>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={'pt-br'}
        >
          <Grid container spacing={2}>
            {/* Período de Aniversário */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data início "
                views={['month', 'day']}
                sx={{ mt: 1 }}
                format="DD/MMMM"
                value={
                  filters.birthday.startDate
                    ? dayjs(filters.birthday.startDate)
                    : null
                }
                onChange={(date) =>
                  handleBirthdayChange(
                    'startDate',
                    date ? date.toISOString() : null
                  )
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data fim"
                format="DD/MMMM"
                views={['day', 'month']}
                sx={{ mt: 1 }}
                value={
                  filters.birthday.endDate
                    ? dayjs(filters.birthday.endDate)
                    : null
                }
                onChange={(date) =>
                  handleBirthdayChange(
                    'endDate',
                    date ? date.toISOString() : null
                  )
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            {/* Cidade */}
            <Grid item xs={12}>
              <TextField
                label="Cidade"
                fullWidth
                value={filters.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </Grid>

            {/* Bairro */}
            <Grid item xs={12}>
              <TextField
                label="Bairro"
                fullWidth
                value={filters.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <InputSelect
                label="Servindo"
                menuOptions={[
                  { value: undefined, name: 'Todos' },
                  { value: true, name: 'Sim' },
                  { value: false, name: 'Não' },
                ]}
                value={filters.worker}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange('worker', value);
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, pt: 0 }}>
        <Button
          onClick={() =>
            setFilters({
              birthday: { startDate: '', endDate: '' },
              city: '',
              neighborhood: '',
              worker: undefined,
            })
          }
        >
          Limpar
        </Button>
        <Button onClick={handleApply} variant="contained">
          Aplicar Filtros
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
