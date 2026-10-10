import {
  alpha,
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  Close,
  Delete,
  EditOutlined,
  Search,
  ChurchOutlined,
  SpaceDashboard,
  PersonOutline,
  EventOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import { sombraSuperficie } from '../../../themes';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../components/listPageStyles';
import CustomChip from '../../../components/customChip';
import { useGetChurches, Church } from './api/getChurches';
import { useSaveChurch } from './api/saveChurch';
import { useDeleteChurch } from './api/deleteChurch';
import { useGetUsers } from '../users/api/getUsers';
import { User } from '../../../types/user';
import {
  CHURCH_STATUS_LABELS,
  CHURCH_STATUS_OPTIONS,
  ChurchStatus,
} from './constants';

const contarEventos = (church: Church) => church._count?.events ?? 0;
const contarAdmins = (church: Church) => church._count?.users ?? 0;

/** Igreja com evento ou administrador vinculado não sai do sistema. */
const temVinculos = (church: Church) =>
  contarEventos(church) > 0 || contarAdmins(church) > 0;

/**
 * Gestão das igrejas — o tenant do sistema.
 *
 * Cada igreja é um painel separado: os eventos, os inscritos deles e as
 * notícias de uma não aparecem para o admin da outra. Mexer nesta lista mexe no
 * recorte de todos os painéis, por isso a tela é só do super admin.
 */
export function Churches() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useGetChurches();

  const [busca, setBusca] = useState('');
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Church | null>(null);
  const [nome, setNome] = useState('');
  const [situacao, setSituacao] = useState<ChurchStatus>('ACTIVE');
  const [liderId, setLiderId] = useState<string | null>(null);
  const [erroDoNome, setErroDoNome] = useState<string | null>(null);

  // a lista de pessoas só é buscada com o formulário aberto: a tela de igrejas
  // não precisa dela para nada além de escolher o líder
  const { data: usuarios, isLoading: carregandoUsuarios } = useGetUsers(
    {},
    { enabled: formAberto }
  );
  const pessoas = (Array.isArray(usuarios) ? usuarios : []) as User[];

  const fecharForm = () => {
    setFormAberto(false);
    setEmEdicao(null);
    setNome('');
    setSituacao('ACTIVE');
    setLiderId(null);
    setErroDoNome(null);
  };

  const { mutate: salvar, isLoading: salvando } = useSaveChurch({
    onSuccess: fecharForm,
  });
  const { mutate: excluir } = useDeleteChurch();

  const abrirForm = (church?: Church) => {
    setEmEdicao(church ?? null);
    setNome(church?.name ?? '');
    // igreja nova nasce ativa: é para isso que alguém cria uma
    setSituacao(church?.status ?? 'ACTIVE');
    setLiderId(church?.spiritualLeader?.id ?? null);
    setErroDoNome(null);
    setFormAberto(true);
  };

  const enviar = () => {
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3) {
      setErroDoNome('O nome precisa de pelo menos 3 caracteres');
      return;
    }

    salvar({
      id: emEdicao?.id,
      name: nomeLimpo,
      status: situacao,
      spiritualLeaderId: liderId,
    });
  };

  const confirmarExclusao = (church: Church) => {
    Swal.fire({
      title: 'Remover igreja?',
      text: `"${church.name}" sai do sistema e não pode ser recuperada.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      if (resultado.isConfirmed) excluir(church.id);
    });
  };

  const motivoDaRemocao = (church: Church) => {
    if (contarEventos(church) > 0) {
      return 'Tem evento vinculado: removê-la apagaria os eventos junto';
    }

    if (contarAdmins(church) > 0) {
      return 'Tem administrador vinculado: mude o perfil deles antes';
    }

    return 'Remover igreja';
  };

  /**
   * Uma igreja por cartão. A tabela tinha cinco colunas para no máximo uma
   * dúzia de igrejas, e no celular virava rolagem lateral; o cartão mostra o
   * mesmo — nome, situação, líder, eventos e quem administra — e as ações
   * ficam no rodapé dele.
   *
   * O acabamento é o dos cards de resumo (`StatusCards`): aro e tinta suave na
   * cor da situação, e o cartão sobe um pouco no hover. Quatro por linha na
   * tela grande deixa o cartão estreito, por isso os números vêm um embaixo
   * do outro, rótulo à esquerda e valor à direita, e não lado a lado.
   */
  const cartao = (church: Church) => {
    const cor =
      church.status === 'ACTIVE'
        ? theme.palette.chips.success
        : church.status === 'TEST'
          ? theme.palette.chips.alert
          : theme.palette.chips.canceled;
    const escuro = theme.palette.mode === 'dark';

    const numero = (icone: ReactNode, rotulo: string, valor: number) => (
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          color: 'text.secondary',
          '& svg': { fontSize: 16 },
        }}
      >
        {icone}
        <Typography sx={{ fontSize: '0.8125rem', flex: 1 }} noWrap>
          {rotulo}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'text.primary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {valor}
        </Typography>
      </Stack>
    );

    return (
      <Card
        key={church.id}
        elevation={0}
        sx={{
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 0 0 1px ${alpha(cor, 0.24)}, ${sombraSuperficie(
            escuro
          )}`,
          backgroundImage: `linear-gradient(160deg, ${alpha(
            cor,
            0.1
          )}, transparent 55%)`,
          transition: theme.transitions.create(['transform', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 0 0 1px ${alpha(cor, 0.4)}, 0 12px 28px -8px ${alpha(
              cor,
              0.32
            )}`,
          },
          // inativa fica apagada: continua na lista, mas fora do ar
          opacity: church.status === 'INACTIVE' ? 0.75 : 1,
        }}
      >
        <Box
          sx={{ p: 2.25, flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={1}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                color: cor,
                backgroundColor: alpha(cor, 0.14),
              }}
            >
              <ChurchOutlined />
            </Box>
            <CustomChip
              label={CHURCH_STATUS_LABELS[church.status] ?? '—'}
              // as mesmas cores do status do evento: teste em atenção, porque
              // é uma igreja que existe mas ainda não está no ar
              customColor={cor}
              size="small"
            />
          </Stack>

          <Typography
            title={church.name}
            sx={{
              mt: 1.75,
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {church.name}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{ mt: 0.5, color: 'text.secondary', minWidth: 0 }}
          >
            <PersonOutline sx={{ fontSize: 16, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.8125rem' }} noWrap>
              {church.spiritualLeader?.fullName ?? 'Sem líder definido'}
            </Typography>
          </Stack>

          {/* não é "pessoas": inscrito não pertence a igreja nenhuma, o que
              conta aqui é quem entra no painel dela — admin e financeiro.
              No pé do cartão (`mt: auto`): os da mesma linha da grade têm a
              mesma altura, então os números alinham com nome curto ou longo */}
          <Stack gap={0.75} sx={{ mt: 'auto', pt: 2 }}>
            {numero(<EventOutlined />, 'Eventos', contarEventos(church))}
            {numero(
              <AdminPanelSettingsOutlined />,
              'Administradores',
              contarAdmins(church)
            )}
          </Stack>
        </Box>

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          sx={{ px: 1.25, py: 0.75 }}
        >
          {/*
            Primeiro e com texto porque é o que se faz com uma igreja no dia a
            dia: abri-la. Editar e remover são os raros, e ficam como ícone.
          */}
          <Button
            size="small"
            startIcon={<SpaceDashboard fontSize="small" />}
            onClick={() => navigate(`/admin/igrejas/${church.id}`)}
            sx={{ mr: 'auto', textTransform: 'none', fontWeight: 600 }}
          >
            Abrir painel
          </Button>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={() => abrirForm(church)}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={motivoDaRemocao(church)}>
            <span>
              <IconButton
                size="small"
                color="error"
                aria-label="Remover igreja"
                disabled={temVinculos(church)}
                onClick={() => confirmarExclusao(church)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Card>
    );
  };

  const termo = busca.trim().toLowerCase();
  const linhas = (data ?? []).filter(
    (church) => !termo || church.name.toLowerCase().includes(termo)
  );

  const styles = {
    boxFiltro: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      marginY: 2,
      padding: 2,
      ...superficieSx,
      // no celular, busca, selects e botões ocupam a linha inteira
      ...barraLarguraCheiaNoCelularSx,
    },
    campo: {
      width: { xs: '100%', sm: '380px' },
    },
    botao: {
      width: { xs: '100%', sm: 'fit-content' },
      borderRadius: 2,
    },
    grade: {
      display: 'grid',
      gap: 2,
      gridTemplateColumns: {
        xs: 'minmax(0, 1fr)',
        sm: 'repeat(2, minmax(0, 1fr))',
        md: 'repeat(3, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))',
      },
    },
  };

  return (
    <PageStyle>
      <Header
        title="Igrejas"
        description="Cada igreja tem o próprio painel: eventos, inscritos e notícias de uma não aparecem para o admin da outra"
      />

      <Paper sx={styles.boxFiltro}>
        <TextField
          placeholder="Pesquisar por nome"
          variant="outlined"
          size="small"
          value={busca}
          sx={styles.campo}
          onChange={(evento) => setBusca(evento.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: busca ? (
              <InputAdornment position="end">
                <Close
                  sx={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setBusca('')}
                />
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={styles.botao}
          onClick={() => abrirForm()}
        >
          Nova igreja
        </Button>
      </Paper>

      {isLoading ? (
        <Box sx={styles.grade}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={236}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : linhas.length ? (
        <Box sx={styles.grade}>{linhas.map(cartao)}</Box>
      ) : (
        <Paper sx={{ ...superficieSx, p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {termo
              ? 'Nenhuma igreja com esse nome'
              : 'Nenhuma igreja cadastrada'}
          </Typography>
        </Paper>
      )}

      <Dialog
        open={formAberto}
        onClose={fecharForm}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ py: 2 }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {emEdicao ? 'Editar igreja' : 'Nova igreja'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emEdicao
              ? 'O nome aparece na escolha da igreja ao criar evento e ao dar permissão.'
              : 'Ela nasce vazia: depois é só criar o admin e os eventos dela.'}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nome da igreja"
            placeholder="Ex: Igreja Primeira Assembleia"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              if (erroDoNome) setErroDoNome(null);
            }}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') enviar();
            }}
            error={!!erroDoNome}
            helperText={erroDoNome}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Situação"
            sx={{ mt: 2.5 }}
            value={situacao}
            onChange={(evento) =>
              setSituacao(evento.target.value as ChurchStatus)
            }
            helperText={
              CHURCH_STATUS_OPTIONS.find((opcao) => opcao.value === situacao)
                ?.ajuda
            }
          >
            {CHURCH_STATUS_OPTIONS.map((opcao) => (
              <MenuItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            fullWidth
            size="small"
            sx={{ mt: 2.5 }}
            options={pessoas}
            loading={carregandoUsuarios}
            // enquanto a lista não chega, o líder gravado aparece pelo nome que
            // veio com a igreja — sem isso o campo piscaria vazio na edição
            value={
              pessoas.find((pessoa) => pessoa.id === liderId) ??
              (liderId && emEdicao?.spiritualLeader?.id === liderId
                ? ({ ...emEdicao.spiritualLeader, email: '' } as User)
                : null)
            }
            onChange={(_, pessoa) => setLiderId(pessoa?.id ?? null)}
            getOptionLabel={(pessoa) => pessoa.fullName}
            isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
            // nome repetido é comum: o e-mail desempata na lista
            renderOption={(props, pessoa) => (
              <li {...props} key={pessoa.id}>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.9375rem' }} noWrap>
                    {pessoa.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {pessoa.email}
                  </Typography>
                </Stack>
              </li>
            )}
            noOptionsText="Nenhuma pessoa com esse nome"
            loadingText="Carregando pessoas…"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Líder espiritual"
                placeholder="Buscar pelo nome"
                helperText="Assina o e-mail dos eventos desta igreja e vira admin dela."
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={fecharForm} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={enviar} disabled={salvando}>
            {emEdicao ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageStyle>
  );
}
