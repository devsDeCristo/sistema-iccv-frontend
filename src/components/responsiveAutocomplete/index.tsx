import { Search } from '@mui/icons-material';
import {
  Alert,
  AlertColor,
  Autocomplete,
  AutocompleteProps,
  Box,
  Button,
  createFilterOptions,
  FilterOptionsState,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  ptBR,
} from '@mui/x-data-grid';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ResponsiveModal } from '../responsiveModal';

/** Quantos itens cabem numa página da tabela da folha */
const PAGE_SIZE = 10;
const ROW_HEIGHT = 50;
const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 52;
/** Altura fixa: a paginação não pode dançar conforme a página */
const GRID_HEIGHT = PAGE_SIZE * ROW_HEIGHT + HEADER_HEIGHT + FOOTER_HEIGHT + 2;

const defaultFilter = createFilterOptions<unknown>();

type ResponsiveAutocompleteProps<
  Option,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
> = AutocompleteProps<Option, Multiple, DisableClearable, FreeSolo> & {
  /** Título da folha de seleção no celular */
  mobileTitle?: string;
  /** Recado abaixo da tabela — ex.: capacidade máxima atingida */
  mobileNotice?: ReactNode;
  mobileNoticeSeverity?: AlertColor;
};

/**
 * Autocomplete que no celular vira uma folha por baixo: o campo do formulário
 * só resume o que está escolhido e a escolha acontece numa tabela paginada,
 * com busca no topo. No desktop é o Autocomplete puro, sem mudança nenhuma.
 */
function ResponsiveAutocomplete<
  Option,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>({
  mobileTitle,
  mobileNotice,
  mobileNoticeSeverity = 'warning',
  ...props
}: ResponsiveAutocompleteProps<Option, Multiple, DisableClearable, FreeSolo>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // cada abertura começa sem a busca anterior
  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  const getLabel = (option: Option) =>
    props.getOptionLabel ? props.getOptionLabel(option) : String(option);

  const isEqual = (option: Option, value: Option) =>
    props.isOptionEqualToValue
      ? props.isOptionEqualToValue(option, value)
      : option === value;

  /** O que já está escolhido, sempre lido do valor controlado pelo formulário */
  const selectedValues = useMemo(() => {
    if (props.multiple) return (props.value as Option[]) ?? [];
    return props.value ? [props.value as Option] : [];
  }, [props.value, props.multiple]);

  const filteredOptions = useMemo(() => {
    const state = {
      inputValue: search,
      getOptionLabel: getLabel,
    } as FilterOptionsState<Option>;

    const filter =
      props.filterOptions ??
      (defaultFilter as unknown as (
        options: Option[],
        state: FilterOptionsState<Option>
      ) => Option[]);

    return filter([...props.options], state);
  }, [props.options, props.filterOptions, search]);

  /**
   * Uma linha por opção, com quem já está escolhido no topo: sem isso os
   * selecionados se perdem lá na página 7 e some a noção do que foi marcado.
   */
  const rows = useMemo(() => {
    const isSelected = (option: Option) =>
      selectedValues.some((value) => isEqual(option, value));

    const ordenadas = [
      ...filteredOptions.filter(isSelected),
      ...filteredOptions.filter((option) => !isSelected(option)),
    ];

    return ordenadas.map((option, index) => ({
      id: index,
      option,
      label: getLabel(option),
      group: props.groupBy ? props.groupBy(option) : '',
      selecionavel: !props.getOptionDisabled?.(option),
    }));
  }, [filteredOptions, selectedValues]);

  const selectionModel: GridRowSelectionModel = useMemo(
    () =>
      rows
        .filter((row) =>
          selectedValues.some((value) => isEqual(row.option, value))
        )
        .map((row) => row.id),
    [rows, selectedValues]
  );

  const columns: GridColDef[] = [
    {
      field: 'label',
      headerName: 'Nome',
      flex: 1,
      minWidth: 140,
      sortable: false,
      disableColumnMenu: true,
    },
    ...(props.groupBy
      ? [
          {
            field: 'group',
            headerName: 'Grupo',
            width: 110,
            sortable: false,
            disableColumnMenu: true,
          },
        ]
      : []),
  ];

  const onSelectionChange = (model: GridRowSelectionModel) => {
    const marcados = model
      .map((id) => rows.find((row) => row.id === id)?.option)
      .filter(Boolean) as Option[];

    // quem a busca escondeu continua escolhido: só sumiu da tabela
    const escondidos = selectedValues.filter(
      (value) => !rows.some((row) => isEqual(row.option, value))
    );

    props.onChange?.(
      {} as React.SyntheticEvent,
      [...escondidos, ...marcados] as never,
      'selectOption'
    );
  };

  if (!isMobile) return <Autocomplete {...props} />;

  return (
    <>
      {/*
        O clique é capturado no wrapper: pegar na fase de captura funciona em
        qualquer ponto do campo (chips, ícones, input) e não depende de o
        renderInput de quem usa repassar o onClick adiante.
      */}
      <Box
        onClickCapture={(event) => {
          if (props.disabled) return;
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        sx={{ cursor: props.disabled ? 'default' : 'pointer' }}
      >
        <Autocomplete
          {...props}
          open={false}
          readOnly
          renderInput={(params) =>
            props.renderInput({
              ...params,
              inputProps: { ...params.inputProps, readOnly: true },
            })
          }
        />
      </Box>

      <ResponsiveModal
        open={open}
        onClose={() => setOpen(false)}
        mobileMode="bottomSheet"
        fullHeight
        title={mobileTitle}
        // a folha é aberta de dentro de outro modal e precisa ficar por cima
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        actions={
          <Button variant="contained" fullWidth onClick={() => setOpen(false)}>
            Concluir
          </Button>
        }
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <Box sx={{ height: GRID_HEIGHT, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={props.loading}
            checkboxSelection
            disableColumnMenu
            disableColumnFilter
            rowHeight={ROW_HEIGHT}
            columnHeaderHeight={HEADER_HEIGHT}
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionChange}
            isRowSelectable={(params) => params.row.selecionavel}
            // checkbox apagado não passa a sensação de bloqueado: a linha
            // inteira fica esmaecida
            getRowClassName={(params) =>
              params.row.selecionavel ? '' : 'linha-indisponivel'
            }
            keepNonExistentRowsSelected={false}
            initialState={{
              pagination: { paginationModel: { pageSize: PAGE_SIZE } },
            }}
            pageSizeOptions={[PAGE_SIZE]}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              // a tabela é uma superfície própria: sem isso as linhas ficam
              // transparentes e assumem o fundo escuro da folha
              backgroundColor: theme.palette.background.paperSecondary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              color: theme.palette.text.primary,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'transparent',
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.background.hover,
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: 'transparent',
                borderTop: `1px solid ${theme.palette.divider}`,
                minHeight: FOOTER_HEIGHT,
              },
              '& .linha-indisponivel': {
                color: theme.palette.text.disabled,
                opacity: 0.6,
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
                {
                  outline: 'none',
                },
            }}
          />
        </Box>

        {mobileNotice && (
          <Alert severity={mobileNoticeSeverity} sx={{ mt: 1.5 }}>
            {mobileNotice}
          </Alert>
        )}
      </ResponsiveModal>
    </>
  );
}

export { ResponsiveAutocomplete };
