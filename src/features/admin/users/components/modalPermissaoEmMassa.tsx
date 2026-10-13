import {
  Alert,
  AvatarGroup,
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
import {
  AccountBalanceWallet,
  AdminPanelSettings,
  Block,
} from '@mui/icons-material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Role, ROLE_LABELS } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';
import { UserAvatar } from '../../../../components/userAvatar';
import CustomChip from '../../../../components/customChip';
import { useGetChurches } from '../../churches/api/getChurches';
import { Membro } from '../../membros/types';
import {
  ResultadoEmMassa,
  usePutPermissoesEmMassa,
} from '../api/putPermissoesEmMassa';

type Opcao<T> = {
  valor: T;
  titulo: string;
  ajuda: string;
  icone: ReactElement;
  /** a opção que tira acesso: vermelha */
  tira?: boolean;
};

/** `null` tira o perfil na igreja: a pessoa vira usuário comum lá */
const NA_IGREJA: Opcao<number | null>[] = [
  {
    valor: Role.ADMIN,
    titulo: ROLE_LABELS[Role.ADMIN],
    ajuda: 'Administra a igreja: todos os eventos, notícias e membros.',
    icone: <AdminPanelSettings />,
  },
  {
    valor: Role.TESOURARIA,
    titulo: ROLE_LABELS[Role.TESOURARIA],
    ajuda: 'Cuida da tesouraria da igreja e consulta os membros.',
    icone: <AccountBalanceWallet />,
  },
  {
    valor: null,
    titulo: 'Sem perfil nesta igreja',
    ajuda: 'Tira o acesso ao painel da igreja. Continua se inscrevendo.',
    icone: <Block />,
    tira: true,
  },
];

/** Os cartões de escolha, um por opção (um grupo de rádio acessível) */
function Opcoes<T>({
  opcoes,
  valor,
  atual,
  onChange,
  rotulo,
}: {
  opcoes: Opcao<T>[];
  valor: T | undefined;
  /** O que a pessoa já tem (com uma pessoa só): ganha a etiqueta "Atual" */
  atual?: { valor: T };
  onChange: (valor: T) => void;
  rotulo: string;
}) {
  const theme = useTheme();
  return (
    <Stack gap={1} role="radiogroup" aria-label={rotulo}>
      {opcoes.map((opcao) => {
        const marcado = valor === opcao.valor;
        const cor = opcao.tira
          ? theme.palette.error.main
          : theme.palette.primary.main;
        return (
          <Stack
            key={String(opcao.valor)}
            direction="row"
            gap={1.5}
            alignItems="center"
            role="radio"
            aria-checked={marcado}
            tabIndex={0}
            onClick={() => onChange(opcao.valor)}
            onKeyDown={(evento) => {
              if (evento.key === ' ' || evento.key === 'Enter') {
                evento.preventDefault();
                onChange(opcao.valor);
              }
            }}
            sx={{
              p: 1.25,
              borderRadius: 2,
              cursor: 'pointer',
              border: `1px solid ${marcado ? cor : theme.palette.divider}`,
              backgroundColor: marcado ? alpha(cor, 0.08) : 'transparent',
              transition: theme.transitions.create([
                'border-color',
                'background-color',
              ]),
              '&:hover': { borderColor: cor },
              '&:focus-visible': {
                outline: `2px solid ${cor}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 1.5,
                color: marcado ? cor : 'text.secondary',
                backgroundColor: alpha(
                  marcado ? cor : theme.palette.text.primary,
                  0.06
                ),
                '& svg': { fontSize: 20 },
              }}
            >
              {opcao.icone}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: marcado ? cor : 'text.primary',
                  }}
                >
                  {opcao.titulo}
                </Typography>
                {atual && atual.valor === opcao.valor && (
                  <Typography
                    component="span"
                    sx={{
                      px: 0.75,
                      borderRadius: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'text.secondary',
                      backgroundColor: alpha(theme.palette.text.primary, 0.08),
                    }}
                  >
                    Atual
                  </Typography>
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {opcao.ajuda}
              </Typography>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}

/**
 * O mesmo perfil, numa igreja, para os usuários marcados na tabela.
 *
 * Só mexe na igreja escolhida: o que cada pessoa tem nas outras fica como
 * está. O servidor aplica as mesmas travas da edição individual a cada um, e
 * quem ele recusar (a própria conta, super admin, gente de fora do seu
 * alcance) volta listado aqui, sem desfazer o que deu certo. Admin e
 * tesoureiro(a) de um evento se definem no cadastro do evento, e não aqui.
 */
function ModalPermissaoEmMassa({
  open,
  userIds,
  pessoas,
  onClose,
  onConcluir,
  igrejaFixa,
}: {
  open: boolean;
  userIds: string[];
  /**
   * Quem está sendo editado, com o acesso de agora (a tela de Membros tem):
   * com uma pessoa só, o painel mostra o que ela tem e já marca o atual
   */
  pessoas?: Membro[];
  /**
   * A igreja já está decidida (a tela de Membros é de uma igreja): sem a
   * escolha, a janela muda só nela
   */
  igrejaFixa?: string;
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
  const [perfil, setPerfil] = useState<number | null | undefined>();
  const [resultado, setResultado] = useState<ResultadoEmMassa | null>(null);

  const quantos = userIds.length;
  // com uma pessoa só, o painel parte do que ela já tem
  const sozinha = quantos === 1 ? pessoas?.[0] : undefined;

  // `igrejasQueAdministra` chega como lista nova a cada render: depender dela
  // direto refazia este efeito a cada clique e desfazia a escolha. A chave
  // só muda quando as igrejas mudam de fato.
  const chaveDasIgrejas = igrejas.map((igreja) => igreja.id).join();

  useEffect(() => {
    if (!open) return;
    // uma igreja só já vem escolhida; com várias, a pessoa escolhe
    setChurchId(igrejaFixa ?? (igrejas.length === 1 ? igrejas[0].id : ''));
    setPerfil(undefined);
    setResultado(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chaveDasIgrejas, igrejaFixa]);

  const terminou = (resposta: ResultadoEmMassa) => {
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
  };
  const falhou = (erro: any) => {
    toast.error(
      [erro?.response?.data?.message].flat()[0] ??
        'Não foi possível atualizar as permissões.'
    );
  };

  const enviar = () =>
    perfil !== undefined &&
    aplicar(
      { userIds, churchId, role: perfil },
      { onSuccess: terminou, onError: falhou }
    );

  // com uma pessoa só, salvar o que ela já tem não muda nada
  const escolhaFeita =
    !!churchId &&
    perfil !== undefined &&
    (!sozinha || perfil !== sozinha.perfil);

  const fecharResultado = () =>
    onConcluir(resultado?.falhas.map((falha) => falha.userId) ?? []);

  return (
    <Dialog
      open={open}
      onClose={() => !isLoading && (resultado ? fecharResultado() : onClose())}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
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
            <Stack gap={2}>
              {/* quem está sendo editado, e o que já tem */}
              <Stack
                direction="row"
                gap={1.5}
                alignItems="center"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {sozinha ? (
                  <UserAvatar
                    name={sozinha.fullName}
                    photoUrl={sozinha.profilePhotoUrl}
                    disablePreview
                    sx={{ width: 40, height: 40 }}
                  />
                ) : pessoas?.length ? (
                  <AvatarGroup
                    max={4}
                    sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}
                  >
                    {pessoas.map((p) => (
                      <UserAvatar
                        key={p.id}
                        name={p.fullName}
                        photoUrl={p.profilePhotoUrl}
                        disablePreview
                      />
                    ))}
                  </AvatarGroup>
                ) : null}
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} fontSize={14} noWrap>
                    {sozinha
                      ? sozinha.fullName
                      : quantos === 1
                        ? '1 pessoa selecionada'
                        : `${quantos} pessoas selecionadas`}
                  </Typography>
                  {sozinha ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {!sozinha.perfil && (
                        <Typography variant="caption" color="text.secondary">
                          Sem perfil nesta igreja
                        </Typography>
                      )}
                      {sozinha.perfil && (
                        <CustomChip
                          size="small"
                          label={ROLE_LABELS[sozinha.perfil]}
                          customColor={theme.palette.chips.info}
                        />
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {igrejaFixa
                        ? 'Muda só nesta igreja.'
                        : 'Muda só a igreja escolhida; o que cada um tem nas outras fica como está.'}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {!igrejaFixa && (
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Igreja"
                  value={churchId}
                  onChange={(evento) => setChurchId(evento.target.value)}
                >
                  {igrejas.map((igreja) => (
                    <MenuItem key={igreja.id} value={igreja.id}>
                      {igreja.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <Opcoes
                rotulo="Perfil na igreja"
                opcoes={NA_IGREJA}
                valor={perfil}
                atual={sozinha ? { valor: sozinha.perfil } : undefined}
                onChange={setPerfil}
              />
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
              disabled={!escolhaFeita || isLoading}
              // o tema capitaliza botão: "Aplicar A 2"
              sx={{ minWidth: 150, textTransform: 'none' }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : quantos === 1 ? (
                'Salvar'
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
