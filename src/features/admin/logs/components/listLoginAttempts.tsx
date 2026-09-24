import { MouseEvent, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  ButtonBase,
  Card,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Check,
  CheckCircleOutline,
  ContentCopy,
  DevicesOther,
  Login,
  PhoneIphone,
  TabletMac,
  WarningAmber,
  Computer,
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
import { formatDateTime, tempoRelativo } from '../../../../utils';
import { useGetUsers } from '../../users/api/getUsers';
import { User } from '../../../../types/user';
import {
  PERIOD_OPTIONS,
  DEFAULT_PERIOD_HOURS,
} from '../constants';
import { LoginAttempt, useGetLoginAttempts } from '../api/getLogs';

const PAGE_SIZE = 25;

const ICONE_DO_DISPOSITIVO = {
  celular: PhoneIphone,
  tablet: TabletMac,
  computador: Computer,
  desconhecido: DevicesOther,
};

const NOME_DO_TIPO = {
  celular: 'Celular',
  tablet: 'Tablet',
  computador: 'Computador',
  desconhecido: 'Não identificado',
};

/** Uma linha do popover. Sem valor, diz que o navegador não informou. */
function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between">
      <Typography fontSize={12.5} color="text.secondary" flexShrink={0}>
        {rotulo}
      </Typography>
      <Typography
        fontSize={12.5}
        fontWeight={valor ? 600 : 400}
        color={valor ? 'text.primary' : 'text.disabled'}
        textAlign="right"
      >
        {valor || 'Não informado'}
      </Typography>
    </Stack>
  );
}

/**
 * Aparelho, sistema e navegador de quem tentou entrar.
 *
 * O detalhe abre num popover ao clicar, e não num tooltip: o texto cru do
 * navegador é longo, e no tooltip ele virava um bloco corrido difícil de ler.
 * Aqui cada dado tem sua linha, e o texto cru fica numa caixa própria, com
 * botão de copiar — é ele que serve de prova numa investigação.
 */
function CelulaDoDispositivo({ row }: { row: LoginAttempt }) {
  const theme = useTheme();
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const [copiado, setCopiado] = useState(false);
  const dispositivo = row.dispositivo;

  if (!row.userAgent || !dispositivo) {
    return <Typography fontSize={13} color="text.secondary">—</Typography>;
  }

  const Icone = ICONE_DO_DISPOSITIVO[dispositivo.tipo];
  const navegador = [dispositivo.navegador, dispositivo.versaoDoNavegador]
    .filter(Boolean)
    .join(' ');

  const abrir = (evento: MouseEvent<HTMLElement>) => {
    // o clique é da célula: sem isto a grade também reage a ele
    evento.stopPropagation();
    setAncora(evento.currentTarget);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(row.userAgent ?? '');
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem permissão de área de transferência: o texto continua selecionável
    }
  };

  return (
    <>
      <ButtonBase
        onClick={abrir}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
          borderRadius: 1.5,
          px: 0.75,
          mx: -0.75,
          py: 0.75,
          '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <Icone sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
          <Stack spacing={0} minWidth={0}>
            <Typography fontSize={13} noWrap>
              {dispositivo.resumo ?? 'Aparelho não identificado'}
            </Typography>
            {navegador && (
              <Typography fontSize={11} color="text.secondary" noWrap>
                {navegador}
              </Typography>
            )}
          </Stack>
        </Stack>
      </ButtonBase>

      <Popover
        open={!!ancora}
        anchorEl={ancora}
        onClose={() => setAncora(null)}
        onClick={(evento) => evento.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 340, borderRadius: 2.5, mt: 0.5 } } }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Icone sx={{ fontSize: 22 }} />
          </Box>
          <Box minWidth={0}>
            <Typography fontSize={14} fontWeight={700} noWrap>
              {dispositivo.resumo ?? 'Aparelho não identificado'}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {[NOME_DO_TIPO[dispositivo.tipo], navegador]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        {/* quando e IP já estão na linha da tabela: aqui fica o que só o
            texto do navegador conta */}
        <Stack spacing={1} sx={{ p: 2 }}>
          <Linha rotulo="Aparelho" valor={dispositivo.aparelho} />
          <Linha rotulo="Sistema" valor={dispositivo.sistema} />
          <Linha rotulo="Versão do sistema" valor={dispositivo.versaoDoSistema} />
          <Linha rotulo="Navegador" valor={dispositivo.navegador} />
          <Linha rotulo="Versão do navegador" valor={dispositivo.versaoDoNavegador} />
          <Linha rotulo="Motor" valor={dispositivo.motor} />
          <Linha rotulo="Arquitetura" valor={dispositivo.arquitetura} />
        </Stack>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
            <Typography fontSize={11} fontWeight={700} letterSpacing="0.06em" color="text.secondary">
              TEXTO ENVIADO PELO NAVEGADOR
            </Typography>
            <Tooltip title={copiado ? 'Copiado' : 'Copiar'}>
              <IconButton size="small" onClick={copiar} aria-label="Copiar texto do navegador">
                {copiado ? (
                  <Check sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <ContentCopy sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography
            component="pre"
            sx={{
              m: 0,
              p: 1.25,
              borderRadius: 1.5,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 11,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.secondary',
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
            }}
          >
            {row.userAgent}
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

function ListLoginAttempts() {
  const theme = useTheme();
  const [periodoHoras, setPeriodoHoras] = useState(DEFAULT_PERIOD_HOURS);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [documento, setDocumento] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const from = useMemo(
    () => new Date(Date.now() - periodoHoras * 60 * 60 * 1000).toISOString(),
    [periodoHoras]
  );
  const { data, isFetching } = useGetLoginAttempts({
    from,
    userId: usuario?.id,
    document: documento || undefined,
    success: success === '' ? undefined : success === 'true',
    page: page + 1,
    limit: PAGE_SIZE,
  });
  const { data: usersData = [] } = useGetUsers({});
  const usuarios = (Array.isArray(usersData) ? usersData : []) as User[];
  const items = data?.items ?? [];

  const cards: StatusCard[] = [
    {
      title: 'Tentativas no período',
      value: data?.total ?? 0,
      subtitle: 'Entradas registradas',
      icon: <Login sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Logins aceitos',
      value: data?.summary.success ?? 0,
      subtitle: 'Credenciais válidas',
      icon: <CheckCircleOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      title: 'Falhas',
      value: data?.summary.failure ?? 0,
      subtitle: 'Entradas recusadas',
      icon: <WarningAmber sx={{ fontSize: 20 }} />,
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
      field: 'user',
      headerName: 'Usuário',
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) =>
        row.user ? (
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <UserAvatar
              name={row.user.name}
              photoUrl={row.user.photoUrl}
              sx={{ width: 30, height: 30, fontSize: 12 }}
            />
            <Typography fontSize={13} noWrap>{row.user.name}</Typography>
          </Stack>
        ) : (
          <Typography fontSize={13} color="text.secondary">Documento não encontrado</Typography>
        ),
    },
    {
      field: 'document',
      headerName: 'Documento digitado',
      width: 180,
      renderCell: ({ value }) => <Typography fontSize={13}>{value}</Typography>,
    },
    {
      field: 'success',
      headerName: 'Resultado',
      width: 150,
      renderCell: ({ row }) => (
        <CustomChip
          label={row.success ? 'Sucesso' : 'Falha'}
          customColor={row.success ? theme.palette.chips.success : theme.palette.chips.canceled}
          size="small"
        />
      ),
    },
    {
      field: 'reason',
      headerName: 'Motivo',
      flex: 1,
      minWidth: 190,
      renderCell: ({ row }) => (
        <Typography fontSize={13} color={row.success ? 'text.disabled' : 'text.primary'}>
          {row.success
            ? '—'
            : row.reason === 'WRONG_PASSWORD'
              ? 'Senha incorreta'
              : 'Documento não encontrado'}
        </Typography>
      ),
    },
    {
      field: 'dispositivo',
      headerName: 'Dispositivo',
      width: 200,
      sortable: false,
      renderCell: ({ row }) => <CelulaDoDispositivo row={row} />,
    },
    {
      field: 'ip',
      headerName: 'IP',
      width: 145,
      renderCell: ({ value }) => <Typography fontSize={13}>{value || '—'}</Typography>,
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
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={periodoHoras}
            onChange={(_, value) => value && trocarPeriodo(value)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} sx={{ textTransform: 'none', px: 1.75 }}>
                {option.short}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Autocomplete
            size="small"
            sx={{ minWidth: 250, flex: 1 }}
            options={usuarios}
            value={usuario}
            onChange={(_, value) => { setUsuario(value); setPage(0); }}
            getOptionLabel={(option) => option.fullName ?? ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Usuário" />}
          />
          <TextField
            size="small"
            label="Documento"
            value={documento}
            onChange={(event) => { setDocumento(event.target.value); setPage(0); }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            select
            size="small"
            label="Resultado"
            value={success}
            onChange={(event) => { setSuccess(event.target.value); setPage(0); }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Sucesso</MenuItem>
            <MenuItem value="false">Falha</MenuItem>
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
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          sx={dataGridSx(theme)}
          paginationMode="server"
          rowCount={data?.total ?? 0}
          paginationModel={{ page, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(model) => setPage(model.page)}
          pageSizeOptions={[PAGE_SIZE]}
          autoHeight
          slots={{
            noRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center" py={5}>
                <Login sx={{ fontSize: 34, color: 'text.disabled' }} />
                <Typography color="text.secondary">Nenhuma tentativa no período</Typography>
              </Stack>
            ),
          }}
        />
      </Card>
    </>
  );
}

export { ListLoginAttempts };