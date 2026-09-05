import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AddCircleOutline,
  Close,
  DeleteOutline,
  EditOutlined,
  East,
  History,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';
import CustomChip from '../../../../components/customChip';
import {
  cardTabelaSx,
  dataGridSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatDateTime } from '../../../../utils';
import { useGetUsers } from '../../users/api/getUsers';
import { User } from '../../../../types/user';
import { LogAction, LogChange, LogPerson, useGetLogs } from '../api/getLogs';
import {
  ACTION_CHIP_TONE,
  ACTION_OPTIONS,
  DEFAULT_PERIOD_HOURS,
  MODEL_OPTIONS,
  PERIOD_OPTIONS,
} from '../constants';

const PAGE_SIZE = 25;

/** Campos que cabem na célula antes de virar "+N" — o resto abre no painel */
const CHANGES_VISIVEIS = 2;

const relativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

/**
 * "há 20 min", "há 3 h". O horário exato fica na linha de cima da célula: o
 * relativo é o que o olho usa para varrer a lista, e a hora é o que serve para
 * cruzar com outro registro.
 */
function tempoRelativo(iso: string) {
  const segundos = (Date.now() - new Date(iso).getTime()) / 1000;

  if (segundos < 60) return 'agora';
  if (segundos < 3600)
    return relativo.format(-Math.floor(segundos / 60), 'minute');
  if (segundos < 86400)
    return relativo.format(-Math.floor(segundos / 3600), 'hour');
  return relativo.format(-Math.floor(segundos / 86400), 'day');
}

/**
 * Uma linha do antes/depois.
 *
 * Criação e remoção não mostram seta: em "— → Betel" a metade vazia só ocupa
 * espaço. O valor que saiu fica riscado, o que entrou fica em destaque.
 */
function Mudanca({ change }: { change: LogChange }) {
  const criou = change.before === '—';
  const removeu = change.after === '—';

  return (
    <Stack direction="row" spacing={0.75} alignItems="baseline" minWidth={0}>
      <Typography
        fontSize={11}
        color="text.secondary"
        sx={{
          flexShrink: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {change.label}
      </Typography>

      {!criou && (
        <Typography
          fontSize={12}
          color="text.disabled"
          noWrap
          sx={{ textDecoration: removeu ? 'line-through' : 'none' }}
        >
          {change.before}
        </Typography>
      )}

      {!criou && !removeu && (
        <East sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }} />
      )}

      {!removeu && (
        <Typography fontSize={12} fontWeight={600} noWrap>
          {change.after}
        </Typography>
      )}
    </Stack>
  );
}

/**
 * Quem recebeu a ação. Mostra o primeiro nome com avatar e conta o resto: um
 * `deleteMany` derruba até 28 vínculos de uma vez, e a lista inteira na célula
 * empurraria a coluna de conteúdo para fora da tela. O painel lateral abre
 * todos.
 */
function Atingidos({ targets }: { targets: LogPerson[] }) {
  if (targets.length === 0) {
    return (
      <Typography fontSize={13} color="text.disabled">
        —
      </Typography>
    );
  }

  const [primeiro] = targets;
  const restantes = targets.length - 1;

  return (
    <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
      <UserAvatar
        name={primeiro.name}
        photoUrl={primeiro.photoUrl}
        sx={{ width: 30, height: 30, fontSize: 12 }}
      />
      <Box minWidth={0}>
        <Typography fontSize={13} noWrap>
          {primeiro.name}
        </Typography>
        {restantes > 0 && (
          <Typography fontSize={11} color="text.secondary">
            e mais {restantes}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function ListLogs() {
  const theme = useTheme();

  const [periodoHoras, setPeriodoHoras] =
    useState<number>(DEFAULT_PERIOD_HOURS);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [model, setModel] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const [detalhe, setDetalhe] = useState<LogAction | null>(null);

  const from = useMemo(
    () => new Date(Date.now() - periodoHoras * 60 * 60 * 1000).toISOString(),
    [periodoHoras]
  );

  const { data, isFetching } = useGetLogs({
    from,
    userId: usuario?.id,
    model: model || undefined,
    action: action || undefined,
    page: page + 1,
    limit: PAGE_SIZE,
  });

  const { data: usersData = [] } = useGetUsers({});
  const usuarios = (Array.isArray(usersData) ? usersData : []) as User[];

  const items = (data?.items ?? []) as LogAction[];
  const resumo = data?.summary;

  const corDaAcao = (acao: string, semMudanca: boolean) => {
    // save que não mexeu em nada não é edição: pintar de azul junto com as
    // alterações de verdade era o que fazia a linha se contradizer
    if (semMudanca) return theme.palette.text.disabled;

    const tom = ACTION_CHIP_TONE[acao] ?? 'info';
    if (tom === 'success') return theme.palette.chips.success;
    if (tom === 'error') return theme.palette.chips.canceled;
    return theme.palette.chips.info;
  };

  const cards: StatusCard[] = [
    {
      title: 'Ações no período',
      value: data?.total ?? 0,
      subtitle: 'Agrupadas por operação',
      icon: <History sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Criações',
      value: resumo?.created ?? 0,
      subtitle: 'Registros criados',
      icon: <AddCircleOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      title: 'Alterações',
      value: resumo?.updated ?? 0,
      subtitle: 'Registros editados',
      icon: <EditOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
    },
    {
      title: 'Remoções',
      value: resumo?.deleted ?? 0,
      subtitle: 'Registros apagados',
      icon: <DeleteOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.canceled,
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Quando',
      width: 165,
      renderCell: ({ row }) => (
        <Stack spacing={0} py={1}>
          <Typography fontSize={13}>{formatDateTime(row.createdAt)}</Typography>
          <Typography fontSize={11} color="text.secondary">
            {tempoRelativo(row.createdAt)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'actorName',
      headerName: 'Quem fez',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
          <UserAvatar
            name={row.actorName}
            photoUrl={row.actorPhotoUrl}
            sx={{ width: 30, height: 30, fontSize: 12 }}
          />
          <Typography fontSize={13} noWrap>
            {row.actorName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'targets',
      headerName: 'Quem recebeu',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: ({ row }) => <Atingidos targets={row.targets} />,
    },
    {
      field: 'actionLabel',
      headerName: 'Ação',
      width: 145,
      renderCell: ({ row }) => (
        <CustomChip
          label={row.actionLabel}
          customColor={corDaAcao(row.action, row.noChanges)}
          size="small"
        />
      ),
    },
    {
      field: 'modelLabel',
      headerName: 'Tabela',
      width: 175,
      renderCell: ({ row }) => {
        // a mesma ação escreve em várias tabelas; a linha mostra a principal e
        // conta as outras, que abrem no painel lateral
        const outras = row.tablesCount - 1;

        return (
          <Stack spacing={0} py={1} minWidth={0}>
            <Typography fontSize={13} noWrap>
              {row.modelLabel}
            </Typography>
            {outras > 0 && (
              <Typography fontSize={11} color="text.secondary">
                e mais {outras} {outras === 1 ? 'tabela' : 'tabelas'}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'changes',
      headerName: 'Conteúdo',
      flex: 2,
      minWidth: 340,
      sortable: false,
      renderCell: ({ row }) => {
        const changes = row.changes as LogChange[];

        // o chip já diz "Salvou sem alterar"; repetir a explicação aqui era o
        // que deixava a linha confusa
        if (changes.length === 0) {
          return (
            <Typography fontSize={13} color="text.disabled">
              —
            </Typography>
          );
        }

        const restantes = changes.length - CHANGES_VISIVEIS;

        return (
          <Stack spacing={0.25} py={1} minWidth={0}>
            {changes.slice(0, CHANGES_VISIVEIS).map((change) => (
              <Mudanca key={change.field} change={change} />
            ))}

            {restantes > 0 && (
              <Typography fontSize={11} color="primary" fontWeight={600}>
                +{restantes} {restantes === 1 ? 'campo' : 'campos'}
              </Typography>
            )}
          </Stack>
        );
      },
    },
  ];

  const trocarPeriodo = (horas: number) => {
    setPeriodoHoras(horas);
    setPage(0);
  };

  return (
    <>
      <StatusCards cards={cards} isLoading={isFetching && !data} />

      <Paper sx={{ ...superficieSx, p: 2, mb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {/* três opções fixas: um seletor de lista esconderia atrás de um
              clique o filtro que a tela inteira usa */}
          <ToggleButtonGroup
            exclusive
            size="small"
            value={periodoHoras}
            onChange={(_, valor) => valor && trocarPeriodo(valor)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{ textTransform: 'none', px: 1.75 }}
              >
                {option.short}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Autocomplete
            size="small"
            sx={{ minWidth: 260, flex: 1 }}
            options={usuarios}
            value={usuario}
            onChange={(_, value) => {
              setUsuario(value);
              setPage(0);
            }}
            getOptionLabel={(option) => option.fullName ?? ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <UserAvatar
                    name={option.fullName}
                    photoUrl={option.profilePhotoUrl}
                    disablePreview
                    sx={{ width: 26, height: 26, fontSize: 11 }}
                  />
                  <Typography fontSize={14}>{option.fullName}</Typography>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuário"
                placeholder="Feito por ela ou sobre ela"
              />
            )}
          />

          <TextField
            select
            size="small"
            label="Tabela"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {MODEL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Ação"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 165 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {ACTION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Card sx={cardTabelaSx}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={isFetching}
          getRowId={(row) => row.id}
          rowHeight={72}
          disableRowSelectionOnClick
          onRowClick={({ row }) => setDetalhe(row as LogAction)}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            ...dataGridSx(theme),
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
          // a tabela tem milhares de linhas: quem pagina é o servidor
          paginationMode="server"
          rowCount={data?.total ?? 0}
          paginationModel={{ page, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(modelo) => setPage(modelo.page)}
          pageSizeOptions={[PAGE_SIZE]}
          autoHeight
          slots={{
            noRowsOverlay: () => (
              <Stack
                height="100%"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                py={5}
              >
                <History sx={{ fontSize: 34, color: 'text.disabled' }} />
                <Typography color="text.secondary">
                  Nenhuma atividade no período
                </Typography>
                {periodoHoras === DEFAULT_PERIOD_HOURS && (
                  // dia parado é comum, e o padrão de 24 h devolve vazio: o
                  // caminho de saída fica a um clique
                  <Button size="small" onClick={() => trocarPeriodo(24 * 7)}>
                    Ampliar para 7 dias
                  </Button>
                )}
              </Stack>
            ),
          }}
        />
      </Card>

      {/* O painel não busca nada: a listagem já traz o conteúdo inteiro, e o
          "+N campos" da célula precisava de algum lugar para abrir */}
      <Drawer
        anchor="right"
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 3 } }}
      >
        {detalhe && (
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography fontSize={18} fontWeight={600}>
                  {detalhe.actionLabel} · {detalhe.modelLabel}
                </Typography>
                {detalhe.entriesCount > 1 && (
                  <Typography fontSize={12} color="text.secondary">
                    {detalhe.entriesCount} escritas em {detalhe.tablesCount}{' '}
                    {detalhe.tablesCount === 1 ? 'tabela' : 'tabelas'}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={() => setDetalhe(null)} size="small">
                <Close />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <UserAvatar
                name={detalhe.actorName}
                photoUrl={detalhe.actorPhotoUrl}
                sx={{ width: 38, height: 38 }}
              />
              <Box>
                <Typography fontSize={14} fontWeight={500}>
                  {detalhe.actorName}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {formatDateTime(detalhe.createdAt)} ·{' '}
                  {tempoRelativo(detalhe.createdAt)}
                </Typography>
              </Box>
            </Stack>

            {detalhe.targets.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    fontSize={11}
                    color="text.secondary"
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      mb: 1,
                    }}
                  >
                    Quem recebeu a ação
                  </Typography>
                  <Stack spacing={1}>
                    {detalhe.targets.map((target) => (
                      <Stack
                        key={target.id}
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                      >
                        <UserAvatar
                          name={target.name}
                          photoUrl={target.photoUrl}
                          disablePreview
                          sx={{ width: 26, height: 26, fontSize: 11 }}
                        />
                        <Typography fontSize={14}>{target.name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />

            {/* uma seção por escrita: é onde as outras tabelas da ação
                aparecem, cada uma com o que mudou nela */}
            <Stack spacing={2.5}>
              {detalhe.entries.map((entry) => (
                <Box key={entry.id}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={entry.changes.length > 0 ? 1 : 0}
                  >
                    <CustomChip
                      label={entry.actionLabel}
                      customColor={corDaAcao(entry.action, entry.noChanges)}
                      size="small"
                    />
                    <Typography fontSize={14} fontWeight={500}>
                      {entry.modelLabel}
                    </Typography>
                  </Stack>

                  {entry.changes.length === 0 ? (
                    <Typography fontSize={13} color="text.disabled">
                      Sem campos para mostrar
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {entry.changes.map((change) => (
                        <Box key={change.field}>
                          <Typography
                            fontSize={11}
                            color="text.secondary"
                            sx={{
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {change.label}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography
                              fontSize={14}
                              color="text.disabled"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {change.before}
                            </Typography>
                            <East
                              sx={{ fontSize: 13, color: 'text.disabled' }}
                            />
                            <Typography fontSize={14} fontWeight={600}>
                              {change.after}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Drawer>
    </>
  );
}

export { ListLogs };
