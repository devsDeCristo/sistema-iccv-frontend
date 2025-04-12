import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { LoginFormType } from '../../../types/login';
import { formatCPF } from '../../../utils';
// import { useState } from 'react';
// import { Visibility, VisibilityOff } from '@mui/icons-material';

function FormLogin() {
  // const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    formState: { errors },
  } = useFormContext<LoginFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Controller
          name="cpf"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="CPF"
              value={value}
              error={!!errors.cpf}
              errorMessage={errors.cpf?.message}
              onChange={(event) => onChange(formatCPF(event.target.value))}
            />
          )}
        />
      </Grid>
      {/* <Grid item xs={12} md={12}>
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              //required
              label="Senha"
              value={value}
              error={!!errors.password}
              errorMessage={errors.password?.message}
              onChange={onChange}
              type={showPassword ? 'text' : 'password'}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  //handleLogin();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid> */}
    </Grid>
  );
}

export { FormLogin };
