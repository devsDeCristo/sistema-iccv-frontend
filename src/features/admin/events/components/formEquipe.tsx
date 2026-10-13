import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { useFormContext } from 'react-hook-form';

import { UserAvatar } from '../../../../components/userAvatar';
import { formatCPF } from '../../../../utils';
import {
  buscaValida,
  useBuscarPessoas,
  useGetMembros,
} from '../../membros/api';
import { EquipeFormType, PessoaDaEquipe } from '../types';

/** "Conceição" → "conceicao": a busca nos membros ignora acento e caixa */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

type Opcao = PessoaDaEquipe & { grupo: string };

/**
 * Escolhe alguém para a equipe: os membros da igreja aparecem de cara, e com
 * o CPF completo ou dois nomes a busca vai aos usuários do sistema — quem
 * cuida de um evento não precisa ser membro.
 */
function EscolherPessoa({
  churchId,
  escolhidos,
  rotulo,
  onEscolher,
}: {
  churchId: string | null;
  escolhidos: string[];
  rotulo: string;
  onEscolher: (pessoa: PessoaDaEquipe) => void;
}) {
  const [busca, setBusca] = useState('');
  const [enviada, setEnviada] = useState('');

  // a busca no sistema vai ao servidor: espera a pessoa parar de digitar
  useEffect(() => {
    const id = setTimeout(() => setEnviada(busca), 300);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: lista } = useGetMembros(churchId);
  const { data: encontradas = [], isFetching } = useBuscarPessoas(
    churchId,
    enviada
  );

  const opcoes = useMemo<Opcao[]>(() => {
    const termo = normalizar(busca.trim());
    const digitos = busca.replace(/\D/g, '');
    const membros = lista?.membros ?? [];
    const daIgreja = new Set(membros.map((m) => m.id));
    return [
      ...membros
        .filter(
          (m) =>
            !termo ||
            normalizar(m.fullName).includes(termo) ||
            (digitos.length >= 3 && m.cpf.includes(digitos))
        )
        .map((m) => ({
          id: m.id,
          fullName: m.fullName,
          profilePhotoUrl: m.profilePhotoUrl,
          detalhe: formatCPF(m.cpf),
          grupo: 'Membros da igreja',
        })),
      ...(buscaValida(enviada) ? encontradas : [])
        .filter((p) => !daIgreja.has(p.id))
        .map((p) => ({
          id: p.id,
          fullName: p.fullName,
          profilePhotoUrl: p.profilePhotoUrl,
          detalhe: p.membroDe
            ? `${p.cpf} · membro de ${p.membroDe.name}`
            : p.cpf,
          grupo: 'Usuários do sistema',
        })),
    ];
  }, [lista, encontradas, busca, enviada]);

  return (
    <Autocomplete
      size="small"
      options={opcoes}
      value={null}
      inputValue={busca}
      onInputChange={(_, valor, motivo) =>
        motivo !== 'reset' && setBusca(valor)
      }
      onChange={(_, pessoa) => {
        if (!pessoa) return;
        const { grupo: _grupo, ...escolhida } = pessoa;
        onEscolher(escolhida);
        setBusca('');
      }}
      // a lista já vem filtrada aqui e no servidor
      filterOptions={(x) => x}
      groupBy={(o) => o.grupo}
      loading={isFetching}
      getOptionLabel={(o) => o.fullName}
      getOptionDisabled={(o) => escolhidos.includes(o.id)}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      noOptionsText={
        buscaValida(busca)
          ? 'Ninguém encontrado'
          : 'Nenhum membro com esse nome. Para outros usuários, digite o CPF completo ou nome e sobrenome'
      }
      loadingText="Buscando…"
      renderOption={(props, o) => (
        <Box component="li" {...props} key={o.id}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <UserAvatar
              name={o.fullName}
              photoUrl={o.profilePhotoUrl}
              disablePreview
              sx={{ width: 28, height: 28, fontSize: 12 }}
            />
            <Box>
              <Typography fontSize={14}>{o.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {o.detalhe}
                {escolhidos.includes(o.id) ? ' · já está na lista' : ''}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={rotulo}
          placeholder="Membro, CPF ou nome e sobrenome"
          helperText="Membros aparecem de cara; outros usuários, pelo CPF completo ou nome e sobrenome"
        />
      )}
    />
  );
}

/** Uma linha da lista: quem é, e o que dá para fazer com ela */
function Linha({
  pessoa,
  children,
  onRemover,
  rotuloRemover,
}: {
  pessoa: PessoaDaEquipe;
  children?: React.ReactNode;
  onRemover: () => void;
  rotuloRemover: string;
}) {
  return (
    // no celular o que vem em `children` desce para a linha de baixo, e o
    // nome não fica espremido
    <Stack
      direction="row"
      columnGap={1.25}
      rowGap={1}
      alignItems="center"
      flexWrap="wrap"
    >
      <UserAvatar
        name={pessoa.fullName}
        photoUrl={pessoa.profilePhotoUrl}
        disablePreview
        sx={{ width: 32, height: 32, fontSize: 13 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontSize={14} fontWeight={600} noWrap>
          {pessoa.fullName}
        </Typography>
        {pessoa.detalhe && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            component="div"
          >
            {pessoa.detalhe}
          </Typography>
        )}
      </Box>
      {children && (
        <Box
          sx={{
            order: { xs: 1, sm: 0 },
            flexBasis: { xs: '100%', sm: 'auto' },
            pl: { xs: 5.25, sm: 0 },
          }}
        >
          {children}
        </Box>
      )}
      <Tooltip title={rotuloRemover}>
        <IconButton
          size="small"
          color="error"
          aria-label={`${rotuloRemover}: ${pessoa.fullName}`}
          onClick={onRemover}
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/** Uma das duas colunas: título, o que o papel faz, a busca e a lista */
function Secao({
  titulo,
  descricao,
  vazio,
  children,
}: {
  titulo: string;
  descricao: string;
  vazio: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Stack
      spacing={1.5}
      sx={{
        flex: 1,
        minWidth: 0,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.text.primary, 0.02),
      }}
    >
      <Box>
        <Typography fontWeight={700} fontSize={15}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descricao}
        </Typography>
      </Box>
      {children}
      {vazio && (
        <Typography variant="body2" color="text.disabled">
          Ninguém ainda.
        </Typography>
      )}
    </Stack>
  );
}

/**
 * Quem cuida deste evento sem ser admin da igreja: os admins do evento e os
 * tesoureiros(as). É aqui, no cadastro e na edição do evento, que se dá e se
 * tira esse acesso (a Tesouraria também aloca tesoureiros). Qualquer perfil
 * entra: o vínculo só soma, e vale o maior.
 */
function FormEquipe({ churchId }: { churchId: string | null }) {
  const { watch, setValue } = useFormContext<EquipeFormType>();
  const admins = watch('admins') ?? [];
  const tesoureiros = watch('tesoureiros') ?? [];
  const sujo = { shouldDirty: true };

  return (
    <Stack spacing={2} sx={{ mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Pode ser qualquer usuário do sistema, membro da igreja ou não. O acesso
        vale só para este evento.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Secao
          titulo="Admins do evento"
          descricao="Fazem tudo neste evento, menos apagar, e editam o perfil dos membros. Não veem a tesouraria."
          vazio={!admins.length}
        >
          <EscolherPessoa
            churchId={churchId}
            rotulo="Adicionar admin"
            escolhidos={admins.map((a) => a.id)}
            onEscolher={(pessoa) =>
              setValue('admins', [...admins, pessoa], sujo)
            }
          />
          {admins.map((a) => (
            <Linha
              key={a.id}
              pessoa={a}
              rotuloRemover="Tirar de admin do evento"
              onRemover={() =>
                setValue(
                  'admins',
                  admins.filter((x) => x.id !== a.id),
                  sujo
                )
              }
            />
          ))}
        </Secao>

        <Secao
          titulo="Tesoureiros(as) do evento"
          descricao="Básico vê só a aba Tesouraria deste evento; completo vê também Tesouraria › Eventos, com os eventos dele."
          vazio={!tesoureiros.length}
        >
          <EscolherPessoa
            churchId={churchId}
            rotulo="Adicionar tesoureiro(a)"
            escolhidos={tesoureiros.map((t) => t.id)}
            onEscolher={(pessoa) =>
              setValue(
                'tesoureiros',
                [...tesoureiros, { ...pessoa, kind: 'BASICO' }],
                sujo
              )
            }
          />
          {tesoureiros.map((t) => (
            <Linha
              key={t.id}
              pessoa={t}
              rotuloRemover="Tirar de tesoureiro(a)"
              onRemover={() =>
                setValue(
                  'tesoureiros',
                  tesoureiros.filter((x) => x.id !== t.id),
                  sujo
                )
              }
            >
              <TextField
                select
                size="small"
                label="Tipo"
                value={t.kind}
                onChange={(e) =>
                  setValue(
                    'tesoureiros',
                    tesoureiros.map((x) =>
                      x.id === t.id
                        ? {
                            ...x,
                            kind: e.target.value as 'BASICO' | 'COMPLETO',
                          }
                        : x
                    ),
                    sujo
                  )
                }
                sx={{ width: 130, flexShrink: 0 }}
              >
                <MenuItem value="BASICO">Básico</MenuItem>
                <MenuItem value="COMPLETO">Completo</MenuItem>
              </TextField>
            </Linha>
          ))}
        </Secao>
      </Stack>
    </Stack>
  );
}

/** O que vai para a API: só os ids e o tipo */
const equipeParaEnvio = (equipe: EquipeFormType) => ({
  adminIds: equipe.admins.map((a) => a.id),
  tesoureiros: equipe.tesoureiros.map((t) => ({
    userId: t.id,
    kind: t.kind,
  })),
});

export { FormEquipe, equipeParaEnvio };
