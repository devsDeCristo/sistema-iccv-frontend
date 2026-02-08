import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { formatCPF, formatDate } from '../../../../utils';
import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { User } from '../../../../types/user';
import { useEffect, useMemo, useState } from 'react';

import { toast } from 'react-toastify';
import { useGetUsersWaitlist } from '../api/getUsersWaitlist';
import { ModalSenduserEvent } from './modalSendUserEvent';
import { Delete, ExitToApp } from '@mui/icons-material';
import { useRemoveUserFromWaitlist } from '../api/deleteUserWaitList';
import Swal from 'sweetalert2';
import { GET_EVENT_USERS_WAITLIST } from '../constants';
import { queryClient } from '../../../../config/lib/react-query/query-client';

const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);
  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};

const renderCellWithCopy = (value: string | number) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    //alert('Conteúdo copiado para a área de transferência!');
    toast.success('Conteúdo copiado para a área de transferência!');
  };
  return (
    <Tooltip title="Clique para copiar">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'copy',
        }}
        onClick={handleCopy}
      >
        {value}
      </Box>
    </Tooltip>
  );
};

function ListUsersWaitList({
  search,
  apiRef,
  event,
}: {
  search: string;
  apiRef: React.MutableRefObject<GridApi>;
  event: any;
}) {
  const { id: eventId = '' } = useParams();
  const { data: usersData, isLoading } = useGetUsersWaitlist(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const { mutate: mutateRemoveUserFromWaitlist } = useRemoveUserFromWaitlist({
      onSuccess: () => {
        Swal.fire({
          title: 'Removido!',
          text: 'Usuário removido da lista de espera com sucesso.',
          icon: 'success',
        });
        queryClient.invalidateQueries(GET_EVENT_USERS_WAITLIST);
        ;
      },
      onError: () => {
        Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao remover o usuário da lista de espera, tente novamente.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  const handleRemove = ({event, params}: {event: React.MouseEvent<HTMLButtonElement>, params: GridCellParams          }) => {
    event.stopPropagation(); // Evita que o clique dispare outras ações, como abrir o modal
      Swal.fire({
        title: 'Remover Usuário!', 
        text: 'Deseja remover este usuário da lista de espera? Será permanentemente removido da lista de espera.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover da lista de espera!',
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = '2000';
        },
      }).then((result) => {
        if (result.isConfirmed) {
          mutateRemoveUserFromWaitlist({
            idEvent: eventId,
            idUser: params.row.id,
            roleRegistrationId: params.row.groupsRegistration[0].roles[0]?.id,
          });
        
        }
      });
    };
  const [panel, setPanel] = useState<string>('1');
  const [openModalParams, setOpenModalParams] = useState<GridCellParams | null>(
    null
  );

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'));

  const styles = {
    card: {
      borderRadius: '5px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0px 0px 3px  #0000001a',
      border: 'none',
      '&::before': {
        display: 'none',
      },
    },
    tabs: {
      '& button': {
        color: theme.palette.text.disabled,
        textTransform: 'capitalize',
        minHeight: '20px',
        Height: '100%',
        borderRadius: '5px',
        paddingX: '10px',
      },
      '& .MuiTab-icon': { marginRight: '2px' },

      '& button.Mui-selected': {
        backgroundColor: theme.palette.background.hover,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: 'transparent',
        border: 'none',
      },
    },
  };

  const groupsRules = useMemo(
    () => event?.groupRoles?.map((g: any) => g.name) ?? [],
    [event]
  ) as string[];

  useEffect(() => {
    if (groupsRules.length > 0) {
      setPanel(groupsRules[0]);
    }
  }, [groupsRules]);

  if (!usersData || !Array.isArray(usersData)) {
    return null;
  }

  const columns: GridColDef[] = [
    {
      sortable: false,
      field: 'foto',
      headerName: '',
      width: 60,
      renderCell: (params) => {
        return (
          <Avatar
            alt={params?.row?.fullName}
            src={params?.row?.profilePhotoUrl || '/'}
            sx={{
              width: '30px',
              height: '30px',
            }}
          />
        );
      },
    },
    {
      field: 'fullName',
      headerName: 'Nome/Crachá',
      flex: 2,
      minWidth: 180,
      // maxWidth: 300,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {params.row.badgeName}
          </Typography>
        </Stack>
      ),
    },

    {
      field: 'cpf',
      headerName: 'CPF',
      width: 140,
      renderCell: (params) => renderCellWithCopy(formatCPF(params.row.cpf)),
    },
    {
      field: 'birthday',
      headerName: 'Nascimento',
      width: 130,
      valueGetter: (params) => formatDate(params.row.birthday),
    },

    {
      field: 'city',
      headerName: 'Endereço',

      width: 170,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {params.row.neighborhood}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      width: 128,
    },
    {
      field: 'groupsRegistration',
      headerName: 'Ingresso',
      width: 150,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          {Array.isArray(params.value) &&
            params.value.map((group: any) =>
              group.roles.map((role: any) => (
                <Typography
                  key={role.id}
                  sx={{ fontWeight: 500, fontSize: '0.9rem' }}
                >
                  {group.name} - {role.description}
                </Typography>
              ))
            )}
        </Stack>
      ),
    },

    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: (params: GridCellParams) => {
        return (
          <Stack sx={{ p: 1 }} direction="row" gap={1}>
            <Tooltip title="Registrar no Evento">
              <IconButton
                onClick={() => setOpenModalParams(params)}
                color="primary"
                sx={{
                  backgroundColor: theme.palette.background.hover,
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              >
                <ExitToApp />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover da Lista de Espera">
              <IconButton
                onClick={(event: React.MouseEvent<HTMLButtonElement>)=>handleRemove({event, params})}
                color="error"
                sx={{
                  backgroundColor: theme.palette.background.hover,
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const filteredByGroup = (usersData: User[]) => {
    if (!panel || groupsRules.length === 0) return usersData;
    return usersData.filter((user) => {
      return user.groupsRegistration?.some(
        (group: any) => group.name === panel
      );
    });
  };

  const filteredData = (usersData: User[]) => {
    let filtered = usersData.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.cpf?.includes(search) ||
        user.badgeName?.toLowerCase().includes(search.toLowerCase())
    );
    filtered = filteredByGroup(filtered);
    return filtered;
  };

  return (
    <>
      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack sx={[styles.card, { p: 0.5, height: '50px' }]}>
          <Tabs
            variant={md ? 'fullWidth' : 'scrollable'}
            scrollButtons={md ? false : 'auto'}
            allowScrollButtonsMobile
            value={panel}
            sx={styles.tabs}
            onChange={(_, newValue) => setPanel(newValue)}
          >
            {Array.isArray(groupsRules) &&
              groupsRules.map((groupName) => (
                <Tab key={groupName} label={groupName} value={groupName} />
              ))}
          </Tabs>
        </Stack>
      )}

      <Card>
        <DataGrid
          // disableColumnFilter
          // disableDensitySelector
          // disableColumnSelector
          apiRef={apiRef}
          getRowHeight={() => 'auto'}
          rows={filteredData(usersData || [])}
          columns={columns}
          loading={isLoading}
          autoHeight={true}
          slots={{
            toolbar: GridToolbar,
          }}
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          initialState={{
            columns: {
              columnVisibilityModel: {
                profession: false,
                religion: false,
                indicatedBy: false,
                emergencyContact: false,
                email: false,
                leadershipPosition: false,

                // cpf: false,

                // badgeName: false,
                diabetes: false,
                hypertensive: false,
                notes: false,
                // leadershipPosition: false,
                createdAt: false,
              },
            },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slotProps={{
            toolbar: {
              printOptions: { getRowsToExport: getSelectedRowsToExport },
            },
          }}
          columnHeaderHeight={40}
          sx={{
            p: 2,
            '& .MuiDataGrid-row': {
              borderTop: '1px solid ' + theme.palette.divider,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'transparent', // Altera cor do rodapé
              border: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              height: '40px !important', // Define a altura do rodapé
              minHeight: '40px !important', // Define a altura do rodapé
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
              {
                outline: 'none',
              },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>

      <ModalSenduserEvent
        eventId={eventId}
        handleClose={() => setOpenModalParams(null)}
        open={!!openModalParams}
        params={openModalParams || ({} as GridCellParams)}
      />
    </>
  );
}

export { ListUsersWaitList };
