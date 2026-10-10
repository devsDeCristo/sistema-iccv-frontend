import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Role, ROLE_LABELS } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';
import { useGetChurches } from '../../churches/api/getChurches';
import {
  ResultadoEmMassa,
  usePutPermissoesEmMassa,
} from '../api/putPermissoesEmMassa';

/** `null` tira o perfil na igreja: a pessoa vira usuário comum lá */
const OPCOES: { valor: number | null; titulo: string; ajuda: string }[] = [
  {
    valor: Role.ADMIN,
    titulo: ROLE_LABELS[Role.ADMIN],
    ajuda:
      'Entra no painel da igreja e administra eventos, inscritos e notícias.',
  },
  {
    valor: Role.FINANCE,
    titulo: ROLE_LABELS[Role.FINANCE],
    ajuda: 'Entra no painel só para o financeiro dos eventos.',
  },
  {
    valor: null,
    titulo: 'Sem perfil nesta igreja',
    ajuda:
      'Tira o acesso ao painel desta igreja. A pessoa continua se inscrevendo.',
  },
];

/**
 * O mesmo perfil, numa igreja, para os usuários marcados na tabela.
 *
 * Só mexe na igreja escolhida: o que cada pessoa tem nas outras fica como
 * está. O servidor aplica as mesmas travas da edição individual a cada um, e
 * quem ele recusar (a própria conta, super admin, gente de fora do seu
 * alcance) volta listado aqui, sem desfazer o que deu certo.
 */
function ModalPermissaoEmMassa({
  open,
  userIds,
  churchIdDaTela,
  onClose,
  onConcluir,
}: {
  open: boolean;
  userIds: string[];
  /** a igreja do seletor da tela, para já vir escolhida */
  churchIdDaTela?: string;
  onClose: () => void;
  /** depois de aplicar: os ids que o servidor recusou ficam marcados */
  onConcluir: (recusados: string[]) => void;
}) {
  const theme = useTheme();
  const { isSuperAdmin, igrejasQueAdministra } = useRole();
  const { data: todasAsIgrejas = [] } = useGetChurches({
    enabled: open && isSuperAdmin,
  });
  const { mutate: aplicar, isLoading } = usePutPermissoesEmMassa();

  // o super admin dá em qualquer igreja; o admin, só nas que administra
  const igrejas = useMemo(
    () =>
      isSuperAdmin
        ? todasAsIgrejas.map(({ id, name }) => ({ id, name }))
        : igrejasQueAdministra,
    [isSuperAdmin, todasAsIgrejas, igrejasQueAdministra]
  );

  const [churchId, setChurchId] = useState('');
  const [perfil, setPerfil] = useState<number | null>(Role.ADMIN);
  const [resultado, setResultado] = useState<ResultadoEmMassa | null>(null);

  // `igrejasQueAdministra` chega como lista nova a cada render: depender dela
  // direto refazia este efeito a cada clique e desfazia a escolha. A chave
  // só muda quando as igrejas mudam de fato.
  const chaveDasIgrejas = igrejas.map((igreja) => igreja.id).join();

  useEffect(() => {
    if (!open) return;
    const daTela = igrejas.some((igreja) => igreja.id === churchIdDaTela);
    setChurchId(
      daTela
        ? (churchIdDaTela as string)
        : igrejas.length === 1
          ? igrejas[0].id
          : ''
    );
    setPerfil(Role.ADMIN);
    setResultado(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, churchIdDaTela, chaveDasIgrejas]);

  const quantos = userIds.length;

  const enviar = () =>
    aplicar(
      { userIds, churchId, role: perfil },
      {
        onSuccess: (resposta) => {
          if (!resposta.falhas.length) {
            toast.success(
              resposta.atualizados === 1
                ? 'Permissão atualizada.'
                : `${resposta.atualizados} permissões atualizadas.`
            );
            onConcluir([]);
            return;
          }
          // com recusa, a janela fica aberta mostrando quem e por quê
          setResultado(resposta);
        },
        onError: (erro: any) => {
          toast.error(
            [erro?.response?.data?.message].flat()[0] ??
              'Não foi possível atualizar as permissões.'
          );
        },
      }
    );

  const fecharResultado = () =>
    onConcluir(resultado?.falhas.map((falha) => falha.userId) ?? []);

  return (
    <Dialog
      open={open}
      onClose={() => !isLoading && (resultado ? fecharResultado() : onClose())}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
        Editar permissão
      </DialogTitle>

      {resultado ? (
        <>
          <DialogContent>
            {resultado.atualizados > 0 && (
              <Alert severity="success" sx={{ mb: 1.5 }}>
                {resultado.atualizados === 1
                  ? '1 permissão atualizada.'
                  : `${resultado.atualizados} permissões atualizadas.`}
              </Alert>
            )}
            <Alert severity="warning">
              <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: 14 }}>
                {resultado.falhas.length === 1
                  ? '1 pessoa ficou de fora'
                  : `${resultado.falhas.length} pessoas ficaram de fora`}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {resultado.falhas.map((falha) => (
                  <Typography
                    key={falha.userId}
                    component="li"
                    sx={{ fontSize: 13 }}
                  >
                    <strong>{falha.nome ?? 'Usuário'}</strong>: {falha.motivo}
                  </Typography>
                ))}
              </Box>
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Quem ficou de fora continua marcado na tabela.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button variant="contained" onClick={fecharResultado}>
              Fechar
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {quantos === 1
                ? '1 usuário selecionado'
                : `${quantos} usuários selecionados`}
              . Muda só a igreja escolhida; o que cada um tem nas outras fica
              como está.
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              label="Igreja"
              value={churchId}
              onChange={(evento) => setChurchId(evento.target.value)}
              sx={{ mb: 2 }}
            >
              {igrejas.map((igreja) => (
                <MenuItem key={igreja.id} value={igreja.id}>
                  {igreja.name}
                </MenuItem>
              ))}
            </TextField>

            <Stack gap={1} role="radiogroup" aria-label="Perfil">
              {OPCOES.map((opcao) => {
                const marcado = perfil === opcao.valor;
                const cor =
                  opcao.valor === null
                    ? theme.palette.error.main
                    : theme.palette.primary.main;
                return (
                  <Box
                    key={String(opcao.valor)}
                    role="radio"
                    aria-checked={marcado}
                    tabIndex={0}
                    onClick={() => setPerfil(opcao.valor)}
                    onKeyDown={(evento) => {
                      if (evento.key === ' ' || evento.key === 'Enter') {
                        evento.preventDefault();
                        setPerfil(opcao.valor);
                      }
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${
                        marcado ? cor : theme.palette.divider
                      }`,
                      backgroundColor: marcado
                        ? alpha(cor, 0.08)
                        : 'transparent',
                      transition: theme.transitions.create([
                        'border-color',
                        'background-color',
                      ]),
                      '&:focus-visible': {
                        outline: `2px solid ${cor}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: marcado ? cor : 'text.primary',
                      }}
                    >
                      {opcao.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opcao.ajuda}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color={perfil === null ? 'error' : 'primary'}
              onClick={enviar}
              disabled={!churchId || isLoading}
              // o tema capitaliza botão: "Aplicar A 2"
              sx={{ minWidth: 150, textTransform: 'none' }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Aplicar a ${quantos}`
              )}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export { ModalPermissaoEmMassa };
