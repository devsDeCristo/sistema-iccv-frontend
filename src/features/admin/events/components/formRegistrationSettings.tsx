import {
  alpha,
  Box,
  Chip,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Input } from '../../../../components/input';
import { useState } from 'react';
import {
  Add, Delete, KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
interface FormRegistrationSettingsProps {
  eventTypeSelected?: 'CURSILHO' | 'RETIRO' | undefined;
}
interface GroupRole {
  name: string;
  capacity: number;
  expanded: boolean;
  roles: {
    price: number;
    description: string;
  }[];
}
function FormRegistrationSettings({
  eventTypeSelected,
}: FormRegistrationSettingsProps) {
  // const {
  //   control,
  //   formState: { errors },
  // } = useFormContext<RegistrationSettingsFormType>();

  const groupRolesCursilho: GroupRole[] = [
    {
      name: 'Ingresso',
      capacity: 100,
      expanded: true,
      roles: [
        { price: 20, description: 'Cursilhisto(a)' },
        { price: 20, description: 'Cursilheiro(a)' },
      ],
    },
  ];
  const groupRolesRetiro: GroupRole[] = [
    {
      name: 'Completo',
      capacity: 100,
      expanded: true,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 115, description: '8 a 12 anos' },
        { price: 230, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 1º dia',
      capacity: 30,
      expanded: true,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 2º dia',
      capacity: 30,
      expanded: true,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 3º dia',
      capacity: 30,
      expanded: true,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 4º dia',
      capacity: 30,
      expanded: true,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
  ];

  // const selectGroupRoles = useMemo(() => {
  //   switch (eventTypeSelected) {
  //     case 'CURSILHO':
  //       return groupRolesCursilho;
  //     case 'RETIRO':
  //       return groupRolesRetiro;
  //     default:
  //       return [];
  //   }
  // }, [eventTypeSelected]);
  const [selectGroupRoles, setSelectGroupRoles] = useState<GroupRole[]>(
    eventTypeSelected === 'CURSILHO' ? groupRolesCursilho : groupRolesRetiro
  );

  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontSize={'18px'}>
          Grupos de inscrição e preços
        </Typography>
      </Box>
      {selectGroupRoles.map(({ capacity, name, roles, expanded }, index) => (
        <Box
          key={index}
          sx={{
            padding: 2,
            gap: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.text.primary, 0.08),
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
          }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontSize: 14,
              marginBottom: 2,
              color: alpha(theme.palette.text.secondary, 1),
            }}
          >
            GRUPO {index + 1}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Input
              size="small"
              value={name}
              sx={{ flex: 20, minWidth: '200px' }}
              // onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              label="Nome"
            />

            <Input
              size="small"
              value={capacity}
              sx={{ flex: 8, minWidth: '200px' }}
              // onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              label="Capacidade máxima de inscrições"
            />
          </Box>
          {expanded ? (
            <Divider sx={{ marginY: 2 }}>
              <Chip
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  const updatedGroupRoles = [...selectGroupRoles];
                  updatedGroupRoles[index].expanded = false;
                  setSelectGroupRoles(updatedGroupRoles);
                }}
                icon={<KeyboardArrowUp />}
                label="Recolher"
              />
            </Divider>
          ) : (
            // <Divider
            //   sx={{ marginY: 2, cursor: 'pointer' }}
            //   onClick={() => {
            //     const updatedGroupRoles = [...selectGroupRoles];
            //     updatedGroupRoles[index].expanded = true;
            //     setSelectGroupRoles(updatedGroupRoles);
            //   }}
            // >
            <Divider
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'fit-content',
                marginTop: 2,
              }}
            >
              <Chip
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  const updatedGroupRoles = [...selectGroupRoles];
                  updatedGroupRoles[index].expanded = true;
                  setSelectGroupRoles(updatedGroupRoles);
                }}
                icon={<KeyboardArrowDown />}
                label="Mostrar Regras"
              />
            </Divider>
            // </Divider>
          )}
          <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            {expanded &&
              roles.map(({ price, description }, roleIndex) => (
                <Box
                  key={roleIndex}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  {/* <Grid item xs={12} md={6}>
                  <Typography>Subgrupo: {description}</Typography>
                </Grid> */}
                  <Input
                    size="small"
                    sx={{ flex: 24, minWidth: '200px' }}
                    value={description}
                    // onChange={(event) => onChange(onlyNumber(event.target.value))}
                    required
                    label="Descrição"
                  />

                  <Input
                    sx={{ flex: 3, minWidth: '100px' }}
                    size="small"
                    value={price}
                    // onChange={(event) => onChange(onlyNumber(event.target.value))}
                    required
                    label="Preço (R$)"
                  />
                  {/* </Box> */}
                  {/* <Grid item xs={12} md={1}> */}
                  {/* {roleIndex + 1 < roles.length ? ( */}
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        const updatedGroupRoles = [...selectGroupRoles];
                        updatedGroupRoles[index].roles.splice(roleIndex, 1);
                        setSelectGroupRoles(updatedGroupRoles);
                      }}
                    >
                      <Delete />
                    </IconButton>
                    {/* ) : ( */}
                    {/* <IconButton
                    onClick={() => {
                      const updatedGroupRoles = [...selectGroupRoles];
                      updatedGroupRoles[index].roles.push({
                        price: 0,
                        description: '',
                      });
                      setSelectGroupRoles(updatedGroupRoles);
                    }}
                  >
                    <Add />
                  </IconButton> */}
                  </Box>

                  {/* </Grid> */}
                </Box>
              ))}
          </Box>
          {expanded && (
            <>
              <Divider sx={{ marginY: 2 }} />
              <Box
                sx={{
                  marginTop: 2,
                  display: 'flex',
                  justifyContent: 'start',
                  alignItems: 'center',
                }}
              >
                <Box
                  onClick={() => {
                    const updatedGroupRoles = [...selectGroupRoles];
                    updatedGroupRoles[index].roles.push({
                      price: 0,
                      description: '',
                    });
                    setSelectGroupRoles(updatedGroupRoles);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: '1px solid',
                    width: 'fit-content',
                    backgroundColor: alpha(theme.palette.text.primary, 0.1),
                    borderColor: alpha(theme.palette.text.secondary, 0.5),
                    padding: '6px 12px',
                    // backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.primary, 0.05),
                    },
                  }}
                >
                  <Add />
                  <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    Adicionar Regra
                  </span>
                </Box>
                {/* <IconButton
              onClick={() => {
                const updatedGroupRoles = [...selectGroupRoles];
                updatedGroupRoles[index].roles.push({
                  price: 0,
                  description: '',
                });
                setSelectGroupRoles(updatedGroupRoles);
              }}
            >
              <Add />
              <span style={{ fontSize: '16px' }}>Adicionar Regra</span>
            </IconButton> */}
              </Box>
            </>
          )}
        </Box>
      ))}

      {/*   <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Grupo 1: Cursilhistas
        </Typography>
        <Controller
          control={control}
          name="capacity"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              error={!!errors.capacity}
              errorMessage={errors.capacity?.message}
              label="Capacidade máxima de inscrições para fazer"
            />
          )}
        /> 
      </Grid>*/}
    </Box>
  );
}

export { FormRegistrationSettings };
