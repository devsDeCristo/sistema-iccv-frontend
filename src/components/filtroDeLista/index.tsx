import { InputAdornment } from '@mui/material';
import { FilterAltOutlined } from '@mui/icons-material';

/** O funil no começo de um campo de filtro — o mesmo ícone do botão "Filtros" */
export const iconeDeFiltro = (
  <InputAdornment position="start">
    <FilterAltOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
  </InputAdornment>
);

/**
 * O que todo select de filtro das barras de lista leva (`{...propsDeSelectDeFiltro}`):
 * o funil no começo e `displayEmpty`. Com o ícone o rótulo fica sempre no
 * alto, e o valor vazio ("Todos os produtos") precisa aparecer em vez de um
 * campo em branco.
 */
export const propsDeSelectDeFiltro = {
  InputProps: { startAdornment: iconeDeFiltro },
  SelectProps: { displayEmpty: true },
};
