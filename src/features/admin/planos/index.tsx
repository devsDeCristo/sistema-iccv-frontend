import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  Check,
  ChurchOutlined,
  Close,
  Delete,
  EditOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { MODULOS } from '../../../constants/modulos';
import { Plano, useGetPlanos, useRemoverPlano } from './api';
import { ModalPlano } from './components/modalPlano';
import { valorDoPlano } from './valor';

/**
 * Os planos das igrejas: o que cada uma pode usar no sistema. Só dev e super
 * admin. O plano de cada igreja se escolhe em Igrejas; igreja sem plano não
 * tem módulo nenhum.
 */
function Planos() {
  const theme = useTheme();
  const { data: planos, isLoading } = useGetPlanos();
  const remover = useRemoverPlano();
  const [editando, setEditando] = useState<Plano | null>(null);
  const [criando, setCriando] = useState(false);
  const [apagando, setApagando] = useState<Plano | null>(null);

  const cartao = (plano: Plano) => (
    <Card
      key={plano.id}
      elevation={0}
      sx={{
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 0 0 1px ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 2.25, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              flexShrink: 0,
            }}
          >
            <WorkspacePremiumOutlined />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap title={plano.name}>
              {plano.name}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              color="text.secondary"
            >
              <ChurchOutlined sx={{ fontSize: 14 }} />
              <Typography variant="caption">
                {plano._count.churches
                  ? `${plano._count.churches} ${
                      plano._count.churches === 1 ? 'igreja' : 'igrejas'
                    }`
                  : 'Nenhuma igreja'}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Typography
          sx={{ mt: 1.5, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}
        >
          {valorDoPlano(plano.price)}
        </Typography>

        {plano.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {plano.description}
          </Typography>
        )}

        {/* todos os módulos, marcados ou não: o que falta também importa */}
        <Stack sx={{ mt: 1.5 }} gap={0.5}>
          {MODULOS.map((modulo) => {
            const tem = plano.modules.includes(modulo.value);
            return (
              <Stack
                key={modulo.value}
                direction="row"
                alignItems="center"
                gap={0.75}
                sx={{ color: tem ? 'text.primary' : 'text.disabled' }}
              >
                {tem ? (
                  <Check
                    sx={{ fontSize: 16, color: theme.palette.chips.success }}
                  />
                ) : (
                  <Close sx={{ fontSize: 16 }} />
                )}
                <Typography fontSize={13}>{modulo.label}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      <Divider />

      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        sx={{ px: 1.25, py: 0.75 }}
      >
        <Chip
          size="small"
          variant="outlined"
          label={`${plano.modules.length} de ${MODULOS.length} módulos`}
          sx={{ mr: 'auto' }}
        />
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => setEditando(plano)}>
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            plano._count.churches
              ? 'Em uso: troque o plano das igrejas dele antes de apagar'
              : 'Apagar'
          }
        >
          {/* span: Tooltip não ouve botão desligado */}
          <span>
            <IconButton
              size="small"
              disabled={!!plano._count.churches}
              onClick={() => setApagando(plano)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Card>
  );

  return (
    <PageStyle>
      <Header
        title="Planos"
        description="O que cada igreja pode usar no sistema"
        acaoAoLado
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCriando(true)}
          sx={{ textTransform: 'none' }}
        >
          Novo plano
        </Button>
      </Header>

      <Alert severity="info" sx={{ mb: 2 }}>
        O plano de cada igreja se escolhe em Igrejas. Igreja sem plano não tem
        módulo nenhum: só o painel básico (Início, Usuários e Membros, que toda
        igreja tem).
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
        }}
      >
        {isLoading
          ? [0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={300}
                sx={{ borderRadius: 3 }}
              />
            ))
          : (planos ?? []).map(cartao)}
      </Box>

      {!isLoading && !planos?.length && (
        <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
          <WorkspacePremiumOutlined
            sx={{ fontSize: 36, color: 'text.disabled' }}
          />
          <Typography color="text.secondary">
            Nenhum plano ainda. Crie o primeiro e escolha-o nas igrejas.
          </Typography>
        </Stack>
      )}

      <ModalPlano
        open={criando || !!editando}
        plano={editando}
        onClose={() => {
          setCriando(false);
          setEditando(null);
        }}
      />

      <ConfirmModal
        open={!!apagando}
        onClose={() => setApagando(null)}
        title="Apagar plano?"
        message={`O plano "${apagando?.name}" sai do sistema. Nenhuma igreja usa ele.`}
        confirmLabel="Apagar"
        onConfirm={() => {
          if (apagando) remover.mutate(apagando.id);
          setApagando(null);
        }}
      />
    </PageStyle>
  );
}

export { Planos };
