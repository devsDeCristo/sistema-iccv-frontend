import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { formatCurrency } from '../../../../utils';
import { useImportarPlanilha, usePreviaDaPlanilha } from '../api';
import { lerPlanilha } from '../planilha';
import { LinhaDaPlanilha, LinhaDaPrevia } from '../types';

const ANO_ATUAL = new Date().getFullYear();
/** quem não é usuário: o dízimo entra só com o nome da planilha */
const SEM_VINCULO = '__sem_vinculo__';
const PULAR = '__pular__';

interface Props {
  open: boolean;
  churchId: string;
  anoInicial: number;
  onClose: () => void;
}

type Linha = LinhaDaPlanilha & { previa: LinhaDaPrevia | null };

/** O que a linha pede: escolher entre homônimos, ou conferir o parecido */
function marca(l: Linha, escolha: string) {
  if (l.anonimo || !l.previa) return null;
  const chip = (label: string, color: 'warning' | 'default') => (
    <Chip
      size="small"
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      label={label}
      sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
    />
  );
  // sem candidato, a linha entra sem vínculo; o chip diz o porquê
  if (!l.previa.candidatos.length && escolha === SEM_VINCULO) {
    return chip('Não encontrado', 'default');
  }
  if (escolha === PULAR && l.previa.escolhido === null) {
    return chip('Escolha', 'warning');
  }
  if (escolha === l.previa.escolhido && !l.previa.exato) {
    return chip('Confira', 'warning');
  }
  return null;
}

/**
 * Importa a planilha de dízimos (uma linha por pessoa, um total por mês). Lê o
 * arquivo aqui, pergunta ao servidor quem é cada nome e mostra a prévia: cada
 * linha com o dizimista escolhido, que a pessoa confere ou troca. Confirmado,
 * cada mês com valor vira um dízimo, e quem não era membro passa a ser.
 *
 * As linhas que pedem atenção (sem dizimista ou escolhido sem o nome igual)
 * vêm primeiro.
 */
function ModalPlanilhaDeDizimos({
  open,
  churchId,
  anoInicial,
  onClose,
}: Props) {
  const previa = usePreviaDaPlanilha();
  const importar = useImportarPlanilha();
  const [ano, setAno] = useState(anoInicial);
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [escolhas, setEscolhas] = useState<string[]>([]);
  const [erro, setErro] = useState('');

  const ocupado = previa.isLoading || importar.isLoading;

  const fechar = () => {
    setLinhas(null);
    setEscolhas([]);
    setErro('');
    // abre de novo no ano que a tela estiver mostrando
    setAno(anoInicial);
    onClose();
  };

  const abrirArquivo = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    setErro('');
    const lidas = await lerPlanilha(arquivo).catch(() => null);
    if (!lidas) {
      setErro(
        'Não reconheci a planilha: a primeira aba precisa de um cabeçalho com "Nome" e os meses (Jan a Dez).'
      );
      return;
    }
    if (!lidas.length) {
      setErro('A planilha não tem nenhuma linha com nome e valor.');
      return;
    }
    const nomes = lidas.filter((l) => !l.anonimo).map((l) => l.nome);
    previa.mutate(
      { churchId, nomes },
      {
        onSuccess: (resposta) => {
          const porNome = new Map(resposta.map((r) => [r.nome, r]));
          const comPrevia = lidas.map((l) => ({
            ...l,
            previa: l.anonimo ? null : (porNome.get(l.nome) ?? null),
          }));
          // não encontrado entra sem vínculo; homônimos esperam a escolha
          const escolha = (l: Linha) =>
            l.anonimo || !l.previa?.candidatos.length
              ? SEM_VINCULO
              : (l.previa.escolhido ?? PULAR);
          const atencao = (l: Linha) =>
            escolha(l) === PULAR || (!l.anonimo && !l.previa?.exato) ? 0 : 1;
          comPrevia.sort((a, b) => atencao(a) - atencao(b));
          setLinhas(comPrevia);
          setEscolhas(comPrevia.map(escolha));
        },
      }
    );
  };

  const vaoEntrar = useMemo(
    () => (linhas ?? []).filter((_, i) => escolhas[i] !== PULAR),
    [linhas, escolhas]
  );
  const total = vaoEntrar.reduce((soma, l) => soma + l.total, 0);

  const enviar = () =>
    linhas &&
    importar.mutate(
      {
        churchId,
        ano,
        linhas: linhas.flatMap((l, i) =>
          escolhas[i] === PULAR
            ? []
            : [
                {
                  nome: l.nome,
                  valores: l.valores,
                  ...(escolhas[i] === SEM_VINCULO
                    ? {}
                    : { userId: escolhas[i] }),
                },
              ]
        ),
      },
      {
        onSuccess: (r) => {
          toast.success(
            `${r.lancamentos} dízimos lançados em ${ano}` +
              (r.novosMembros ? ` · ${r.novosMembros} novos membros` : '') +
              (r.jaExistiam ? ` · ${r.jaExistiam} já existiam` : '')
          );
          if (r.ignorados.length) {
            toast.warning(
              `Ficaram de fora: ${r.ignorados
                .map((x) => `${x.nome} (${x.motivo.toLowerCase()})`)
                .join(', ')}`,
              { autoClose: false }
            );
          }
          fechar();
        },
      }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={fechar}
      disableClose={ocupado}
      maxWidth="md"
      fullWidth
      mobileMode="fullScreen"
      title="Importar planilha de dízimos"
      actions={
        <>
          <Button onClick={fechar} disabled={ocupado} color="inherit">
            Cancelar
          </Button>
          {linhas && (
            <Button
              variant="contained"
              onClick={enviar}
              sx={{ textTransform: 'none' }}
              disabled={ocupado || !vaoEntrar.length}
            >
              {importar.isLoading
                ? 'Importando…'
                : `Importar ${vaoEntrar.length} ${
                    vaoEntrar.length === 1 ? 'linha' : 'linhas'
                  }`}
            </Button>
          )}
        </>
      }
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
        >
          <TextField
            select
            size="small"
            label="Ano da planilha"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            disabled={ocupado}
            sx={{ width: { xs: '100%', sm: 150 } }}
          >
            {Array.from({ length: 5 }, (_, i) => ANO_ATUAL - i).map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
            disabled={ocupado}
            sx={{ textTransform: 'none' }}
          >
            {previa.isLoading
              ? 'Procurando as pessoas…'
              : linhas
                ? 'Trocar arquivo'
                : 'Escolher arquivo (.xlsx)'}
            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                abrirArquivo(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </Button>
        </Stack>

        {erro && <Alert severity="error">{erro}</Alert>}

        {!linhas ? (
          <Typography variant="body2" color="text.secondary">
            Uma linha por pessoa, com o nome e o total de cada mês (Jan a Dez).
            Cada mês com valor vira um dízimo no dia 1º, ligado ao dizimista;
            quem ainda não é membro passa a ser membro desta igreja. Quem não é
            usuário do sistema pode entrar sem vínculo: o dízimo fica só com o
            nome da planilha. Importar de novo não duplica os meses que já
            entraram.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {vaoEntrar.length} de {linhas.length} linhas, somando{' '}
              <b>{formatCurrency(total)}</b> em {ano}. Confira quem é cada um:
              as linhas sem dizimista ou para conferir estão no topo.
            </Typography>
            <Box
              sx={{
                maxHeight: { sm: 420 },
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              {linhas.map((l, i) => (
                <Stack
                  key={`${l.nome}-${i}`}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 2 }}
                  alignItems={{ sm: 'center' }}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} noWrap title={l.nome}>
                      {l.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(l.total)} no ano
                    </Typography>
                  </Box>
                  {marca(l, escolhas[i])}
                  <TextField
                    select
                    size="small"
                    value={escolhas[i]}
                    disabled={ocupado}
                    onChange={(e) =>
                      setEscolhas((atual) =>
                        atual.map((v, j) => (j === i ? e.target.value : v))
                      )
                    }
                    sx={{ width: { xs: '100%', sm: 300 } }}
                    SelectProps={{
                      // no campo, só o nome: o CPF e a situação ficam na lista
                      renderValue: (valor) =>
                        valor === SEM_VINCULO
                          ? 'Sem vínculo (não é usuário)'
                          : valor === PULAR
                            ? 'Não importar'
                            : l.previa?.candidatos.find((c) => c.id === valor)
                                ?.fullName,
                    }}
                  >
                    {(l.previa?.candidatos ?? []).map((c) => {
                      const deOutra =
                        !!c.membroDe && c.membroDe.id !== churchId;
                      return (
                        <MenuItem key={c.id} value={c.id} disabled={deOutra}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontSize={14} noWrap>
                              {c.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              CPF {c.cpf} ·{' '}
                              {deOutra
                                ? `membro de ${c.membroDe?.name}`
                                : c.membroDe
                                  ? 'já é membro'
                                  : 'vira membro'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                    <MenuItem value={SEM_VINCULO}>
                      Sem vínculo (não é usuário)
                    </MenuItem>
                    <MenuItem value={PULAR}>Não importar</MenuItem>
                  </TextField>
                </Stack>
              ))}
            </Box>
          </>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalPlanilhaDeDizimos };
