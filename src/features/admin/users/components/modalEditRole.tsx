import {
  Alert,
  Backdrop,
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  FormControl,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_USERS } from '../constants';
import { usePutUser } from '../api/putUser';
import { User } from '../../../../types/user';
import { Role, ROLE_LABELS } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';
import { useGetChurches } from '../../churches/api/getChurches';

interface ModalEditRoleProps {
  open: boolean;
  handleClose: () => void;
  userId: string;
  user: User | null;
}

/** Um vínculo em edição na tela: igreja + perfil naquela igreja. */
type Vinculo = { churchId: string; churchName: string; role: number };

const PERFIS_DE_IGREJA = [Role.ADMIN, Role.FINANCE];

/**
 * Permissões de uma pessoa.
 *
 * A permissão é por igreja: a mesma pessoa pode ser admin de uma e financeiro
 * de outra, e cada linha aqui é um desses vínculos. Sem vínculo nenhum ela é
 * usuário comum — não entra no painel, mas continua se inscrevendo em evento de
 * qualquer igreja.
 *
 * O super admin é a exceção que não é de igreja: atravessa todas, então ligá-lo
 * apaga os vínculos.
 */
function ModalEditRole({
  open,
  handleClose,
  userId = '',
  user,
}: ModalEditRoleProps) {
  const { isSuperAdmin, isDev, igrejasQueAdministra } = useRole();

  /**
   * Conta dev não se administra por aqui.
   *
   * Ela não pertence a igreja nenhuma, então o corpo deste modal — que grava
   * `role: USER` quando o interruptor de super admin está desligado —
   * rebaixaria o dev sem ninguém pedir. Para quem não é dev o formulário fica
   * travado (o backend responde 403 do mesmo jeito); para outro dev, o perfil
   * é preservado no salvar.
   */
  const targetIsDev = user?.role === Role.DEV;
  const blockedByDev = targetIsDev && !isDev;
  const { data: todasAsIgrejas = [] } = useGetChurches({
    enabled: open && isSuperAdmin,
  });

  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [novaIgreja, setNovaIgreja] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<number>(Role.ADMIN);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Igrejas que quem está editando pode conceder: o super admin dá em
   * qualquer uma; o admin, só nas que ele mesmo administra.
   */
  const igrejasDisponiveis = useMemo(
    () =>
      isSuperAdmin
        ? todasAsIgrejas.map((igreja) => ({
            id: igreja.id,
            name: igreja.name,
          }))
        : igrejasQueAdministra,
    [isSuperAdmin, todasAsIgrejas, igrejasQueAdministra]
  );

  const igrejasLivres = igrejasDisponiveis.filter(
    (igreja) => !vinculos.some((vinculo) => vinculo.churchId === igreja.id)
  );

  // reabrir precisa recarregar: sem isto a segunda edição abre com a primeira
  useEffect(() => {
    if (!open) return;

    setVinculos(
      (user?.churchRoles ?? []).map((vinculo) => ({
        churchId: vinculo.church.id,
        churchName: vinculo.church.name,
        role: vinculo.role,
      }))
    );
    setSuperAdmin(user?.role === Role.SUPER_ADMIN);
    setNovaIgreja('');
    setNovoPerfil(Role.ADMIN);
    setErro(null);
  }, [open, user]);

  const { mutate: putUser, isLoading: salvando } = usePutUser({
    onSuccess: () => {
      queryClient.invalidateQueries(GET_USERS);
      handleClose();
    },
  });

  /**
   * Vínculo que está montado nos campos mas ainda não entrou na lista.
   *
   * Quem escolhe igreja e perfil e vai direto no Salvar espera que aquilo
   * conte — e contava como nada, sumindo sem aviso. Então ele é somado tanto
   * pelo botão Adicionar quanto na hora de salvar.
   */
  const vinculoPendente = (): Vinculo | null => {
    if (!novaIgreja) return null;

    const igreja = igrejasDisponiveis.find((item) => item.id === novaIgreja);
    if (!igreja) return null;

    return { churchId: igreja.id, churchName: igreja.name, role: novoPerfil };
  };

  const adicionar = () => {
    const pendente = vinculoPendente();

    if (!pendente) {
      setErro('Escolha a igreja do vínculo');
      return;
    }

    setErro(null);
    setVinculos((atuais) => [...atuais, pendente]);
    setNovaIgreja('');
  };

  const remover = (churchId: string) =>
    setVinculos((atuais) =>
      atuais.filter((vinculo) => vinculo.churchId !== churchId)
    );

  const trocarPerfil = (churchId: string, role: number) =>
    setVinculos((atuais) =>
      atuais.map((vinculo) =>
        vinculo.churchId === churchId ? { ...vinculo, role } : vinculo
      )
    );

  const salvar = () => {
    if (!userId || blockedByDev) return;

    const pendente = vinculoPendente();
    const finais = pendente ? [...vinculos, pendente] : vinculos;

    putUser({
      userId,
      data: {
        // super admin apaga os vínculos: ele não é de igreja nenhuma.
        // O dev mantém o próprio perfil — o interruptor de super admin não
        // aparece para ele, e sem esta linha o salvar o rebaixaria a usuário.
        role: targetIsDev
          ? Role.DEV
          : superAdmin
            ? Role.SUPER_ADMIN
            : Role.USER,
        churchRoles: superAdmin
          ? []
          : finais.map((vinculo) => ({
              churchId: vinculo.churchId,
              role: vinculo.role,
            })),
      },
    });
  };

  const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '92%', sm: 520 },
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 14,
    p: 3,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
            Permissões de {user?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A permissão é por igreja. A mesma pessoa pode ser admin de uma e
            financeiro de outra.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack gap={2}>
            {erro && <Alert severity="error">{erro}</Alert>}

            {blockedByDev && (
              <Alert severity="warning">
                Conta Dev: somente outro Dev altera este acesso.
              </Alert>
            )}

            {targetIsDev && !blockedByDev && (
              <Alert severity="info">
                Perfil Dev: atravessa todas as igrejas. Os vínculos abaixo não
                mudam o acesso dele.
              </Alert>
            )}

            {isSuperAdmin && !targetIsDev && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Super admin</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atravessa todas as igrejas; não fica preso a nenhuma.
                  </Typography>
                </Box>
                <Switch
                  checked={superAdmin}
                  onChange={(evento) => setSuperAdmin(evento.target.checked)}
                />
              </Box>
            )}

            {!superAdmin && (
              <>
                <Box>
                  <Typography
                    sx={{
                      mb: 1,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                    }}
                  >
                    Vínculos
                  </Typography>

                  {!vinculos.length && (
                    <Typography variant="body2" color="text.secondary">
                      Sem vínculo: a pessoa é usuário comum e não entra no
                      painel.
                    </Typography>
                  )}

                  <Stack gap={1}>
                    {vinculos.map((vinculo) => (
                      <Box
                        key={vinculo.churchId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          label={vinculo.churchName}
                          size="small"
                          sx={{ maxWidth: 220 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={vinculo.role}
                            onChange={(evento) =>
                              trocarPerfil(
                                vinculo.churchId,
                                Number(evento.target.value)
                              )
                            }
                          >
                            {PERFIS_DE_IGREJA.map((perfil) => (
                              <MenuItem key={perfil} value={perfil}>
                                {ROLE_LABELS[perfil]}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Tooltip title="Remover vínculo">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => remover(vinculo.churchId)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Divider />

                {/* uma igreja só entra uma vez: um perfil por igreja */}
                {igrejasLivres.length > 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <TextField
                      select
                      size="small"
                      label="Igreja"
                      value={novaIgreja}
                      onChange={(evento) => setNovaIgreja(evento.target.value)}
                      sx={{ minWidth: 200, flex: 1 }}
                    >
                      {igrejasLivres.map((igreja) => (
                        <MenuItem key={igreja.id} value={igreja.id}>
                          {igreja.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      size="small"
                      label="Perfil"
                      value={novoPerfil}
                      onChange={(evento) =>
                        setNovoPerfil(Number(evento.target.value))
                      }
                      sx={{ minWidth: 150 }}
                    >
                      {PERFIS_DE_IGREJA.map((perfil) => (
                        <MenuItem key={perfil} value={perfil}>
                          {ROLE_LABELS[perfil]}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={adicionar}
                    >
                      Adicionar
                    </Button>

                    {novaIgreja && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ width: '100%' }}
                      >
                        Este vínculo entra ao clicar em Adicionar — e também se
                        você salvar direto.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {igrejasDisponiveis.length
                      ? 'Todas as igrejas que você administra já estão na lista.'
                      : 'Você não administra nenhuma igreja para conceder permissão.'}
                  </Typography>
                )}
              </>
            )}

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button color="inherit" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={salvar}
                disabled={salvando || blockedByDev}
              >
                Salvar
              </Button>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalEditRole };
