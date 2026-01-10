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
import { useEffect, useState } from 'react';
import {
  Add,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { EventType, GroupRole, RegistrationSettingsFormType } from '../types';
import { Controller, useFormContext } from 'react-hook-form';
interface FormRegistrationSettingsProps {
  eventTypeSelected?: EventType | undefined;
}
interface GroupRoleExtended extends GroupRole {
  expanded: boolean;
}

function FormRegistrationSettings({
  eventTypeSelected,
}: FormRegistrationSettingsProps) {
  const {
    control,
    reset,
    // formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();

  const groupRolesCursilho: GroupRole[] = [
    {
      name: 'Ingresso',
      capacity: 100,
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
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 115, description: '8 a 12 anos' },
        { price: 230, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 1º dia',
      capacity: 30,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 2º dia',
      capacity: 30,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 3º dia',
      capacity: 30,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
    {
      name: 'Dária: 4º dia',
      capacity: 30,
      roles: [
        { price: 0, description: '0 a 7 anos' },
        { price: 45, description: '8 a 12 anos' },
        { price: 70, description: '13 a 20 anos' },
      ],
    },
  ];

  useEffect(() => {
    reset(
      eventTypeSelected === 'CURSILHO'
        ? {
            groupRoles: groupRolesCursilho,
          }
        : {
            groupRoles: groupRolesRetiro,
          }
    );
  }, [eventTypeSelected]);

  const [selectGroupRoles, setSelectGroupRoles] = useState<GroupRoleExtended[]>(
    (eventTypeSelected === 'CURSILHO'
      ? groupRolesCursilho
      : groupRolesRetiro
    ).map((groupRole) => ({
      ...groupRole,
      expanded: true,
    }))
  );

  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontSize={'18px'}>
          Grupos de pessoas e regras de inscrição
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'Defina os grupos e suas regras de inscrição para definir como os participantes poderão se inscrever no evento.\n'
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'Os grupos servem para separar os participantes em diferentes categorias, como "Cursilhistas" e "Cursilheiros" em um Cursilho, ou "Completo" e "Dárias" em um Retiro.'
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'As regras servem para definir diferentes valores de ingresso dentro de um grupo.'
          }
        </Typography>
      </Box>
      {selectGroupRoles.map(({ roles, expanded }, index) => (
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
            <Controller
              control={control}
              name={`groupRoles.${index}.name`}
              render={({ field: { onChange, value } }) => (
                <Input
                  size="small"
                  value={value}
                  onChange={onChange}
                  sx={{ flex: 20, minWidth: '200px' }}
                  // onChange={(event) => onChange(onlyNumber(event.target.value))}
                  required
                  label="Nome"
                />
              )}
            />
            <Controller
              control={control}
              name={`groupRoles.${index}.capacity`}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="number"
                  size="small"
                  value={value}
                  onChange={onChange}
                  sx={{ flex: 8, minWidth: '200px' }}
                  // onChange={(event) => onChange(onlyNumber(event.target.value))}
                  required
                  label="Capacidade máxima de inscrições"
                />
              )}
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
              roles.map(({ description }, roleIndex) => (
                <Box
                  key={roleIndex}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <Controller
                    control={control}
                    name={`groupRoles.${index}.roles.${roleIndex}.description`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        size="small"
                        required
                        placeholder={`Ex: ${description}`}
                        sx={{ flex: 24, minWidth: '200px' }}
                        value={value}
                        onChange={onChange}
                        label="Descrição"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`groupRoles.${index}.roles.${roleIndex}.price`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        sx={{ flex: 3, minWidth: '100px' }}
                        size="small"
                        required
                        value={value}
                        onChange={onChange}
                        label="Preço (R$)"
                      />
                    )}
                  />
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
                  </Box>
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
    </Box>
  );
}

export { FormRegistrationSettings };
