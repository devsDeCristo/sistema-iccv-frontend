import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { filterUsers } from '../types';
import { User } from '../../../../types/user';
import {
  FILTROS_VAZIOS,
  diaLocal,
  fazAniversarioNoEvento,
} from '../utils/filtroDeInscritos';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: filterUsers) => void;
  /** os filtros de pé: o modal abre com eles */
  filtros: filterUsers;
  /** os inscritos do evento: deles saem as cidades, os bairros e as contagens */
  inscritos: User[];
  /** as datas do evento: dão a idade e quem faz aniversário nele */
  evento?: { startDate?: string | Date; endDate?: string | Date } | null;
}

/** Um bloco do filtro, com o título pequeno em caixa alta */
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700, letterSpacing: '0.08em', lineHeight: 2.2 }}
      >
        {titulo}
      </Typography>
      <Stack gap={1.5} sx={{ mt: 0.5 }}>
        {children}
      </Stack>
    </Box>
  );
}

/**
 * Os valores de um campo entre os inscritos, com quantos há em cada um, do
 * mais comum para o menos. Grafias diferentes do mesmo nome ("rio verde",
 * "Rio Verde ") contam juntas, com a grafia mais usada.
 */
function valoresComContagem(textos: (string | undefined | null)[]) {
  const grupos = new Map<string, Map<string, number>>();
  for (const texto of textos) {
    const limpo = texto?.trim();
    if (!limpo) continue;
    const chave = limpo.normalize('NFC').toLowerCase();
    const grafias = grupos.get(chave) ?? new Map<string, number>();
    grafias.set(limpo, (grafias.get(limpo) ?? 0) + 1);
    grupos.set(chave, grafias);
  }
  return [...grupos.values()]
    .map((grafias) => {
      const [nome] = [...grafias.entries()].sort((a, b) => b[1] - a[1])[0];
      const total = [...grafias.values()].reduce((a, b) => a + b, 0);
      return { nome, total };
    })
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));
}

const mesmoTexto = (a?: string | null, b?: string | null) =>
  (a ?? '').trim().normalize('NFC').toLowerCase() ===
  (b ?? '').trim().normalize('NFC').toLowerCase();

const numeroOuNulo = (texto: string) => {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? null : Math.max(0, n);
};

/**
 * O filtro dos inscritos: aniversariantes do evento, idade, liberação de
 * menor, saúde e localidade (cidade e bairro escolhidos entre os que existem
 * nos inscritos, com a contagem). A regra de cada um mora em
 * `utils/filtroDeInscritos.ts`.
 */
const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApply,
  filtros,
  inscritos,
  evento,
}) => {
  const [filters, setFilters] = useState<filterUsers>(filtros);

  // abre com o que está aplicado, e não com o rascunho que foi cancelado
  useEffect(() => {
    if (open) setFilters(filtros);
  }, [open]);

  const mudar = (parte: Partial<filterUsers>) =>
    setFilters((atual) => ({ ...atual, ...parte }));

  const aniversariantes = useMemo(
    () =>
      inscritos.filter((u) =>
        fazAniversarioNoEvento(u.birthday, evento?.startDate, evento?.endDate)
      ).length,
    [inscritos, evento]
  );
  const cidades = useMemo(
    () => valoresComContagem(inscritos.map((u) => u.city)),
    [inscritos]
  );
  const bairros = useMemo(
    () =>
      valoresComContagem(
        inscritos
          .filter((u) => !filters.city || mesmoTexto(u.city, filters.city))
          .map((u) => u.neighborhood)
      ),
    [inscritos, filters.city]
  );

  const contagem = (lista: { nome: string; total: number }[], nome: string) =>
    lista.find((item) => mesmoTexto(item.nome, nome))?.total;

  // "05/09": a data do evento é meia-noite UTC, e lida direto cairia no dia
  // anterior
  const diaEMes = (data?: string | Date) =>
    diaLocal(data)?.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }) ?? '';
  const [inicio, fim] = [diaEMes(evento?.startDate), diaEMes(evento?.endDate)];

  const alternarSaude = (item: 'hipertenso' | 'diabetico') =>
    mudar({
      saude: filters.saude.includes(item)
        ? filters.saude.filter((s) => s !== item)
        : [...filters.saude, item],
    });

  const campoDeIdade = (
    rotulo: string,
    valor: number | null,
    aoMudar: (n: number | null) => void
  ) => (
    <TextField
      label={rotulo}
      size="small"
      type="number"
      fullWidth
      value={valor ?? ''}
      inputProps={{ min: 0, max: 120 }}
      InputProps={{
        endAdornment: <InputAdornment position="end">anos</InputAdornment>,
      }}
      onChange={(e) => aoMudar(numeroOuNulo(e.target.value))}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrar inscritos</DialogTitle>
      <DialogContent>
        <Stack gap={2.5}>
          <Secao titulo="Aniversariantes">
            <Box
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={14} fontWeight={600}>
                  Só quem faz aniversário no evento
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {inicio === fim
                    ? `No dia ${inicio}`
                    : `Entre ${inicio} e ${fim}`}{' '}
                  ·{' '}
                  {aniversariantes === 1
                    ? '1 inscrito'
                    : `${aniversariantes} inscritos`}
                </Typography>
              </Box>
              <Switch
                checked={filters.aniversariantes}
                onChange={(e) => mudar({ aniversariantes: e.target.checked })}
                inputProps={{ 'aria-label': 'Aniversariantes do evento' }}
              />
            </Box>
          </Secao>

          <Secao titulo="Idade">
            <Stack direction="row" gap={1.5}>
              {campoDeIdade('De', filters.idadeMin, (n) =>
                mudar({ idadeMin: n })
              )}
              {campoDeIdade('Até', filters.idadeMax, (n) =>
                mudar({ idadeMax: n })
              )}
            </Stack>
            <Typography fontSize={12} color="text.secondary" sx={{ mt: -1 }}>
              A idade no primeiro dia do evento, a mesma da lista.
            </Typography>
          </Secao>

          <Secao titulo="Liberação">
            <TextField
              select
              size="small"
              value={filters.liberacao}
              SelectProps={{ displayEmpty: true }}
              onChange={(e) =>
                mudar({ liberacao: e.target.value as filterUsers['liberacao'] })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="NOT_REQUIRED">Maiores de idade</MenuItem>
              <MenuItem value="PENDING">
                Menores aguardando autorização
              </MenuItem>
              <MenuItem value="APPROVED">Menores autorizados</MenuItem>
              <MenuItem value="REJECTED">Menores recusados</MenuItem>
            </TextField>
          </Secao>

          <Secao titulo="Saúde">
            <Stack direction="row" gap={2} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.saude.includes('hipertenso')}
                    onChange={() => alternarSaude('hipertenso')}
                  />
                }
                label="Hipertensos"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.saude.includes('diabetico')}
                    onChange={() => alternarSaude('diabetico')}
                  />
                }
                label="Diabéticos"
              />
            </Stack>
            <Typography fontSize={12} color="text.secondary" sx={{ mt: -1 }}>
              Só aparece quem informou: o dado de saúde depende do consentimento
              de cada um.
            </Typography>
          </Secao>

          <Secao titulo="Localidade">
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Autocomplete
                size="small"
                fullWidth
                options={cidades.map((c) => c.nome)}
                value={filters.city || null}
                onChange={(_, cidade) =>
                  // trocar a cidade solta o bairro, que era da outra
                  mudar({ city: cidade ?? '', neighborhood: '' })
                }
                renderOption={(props, cidade) => (
                  <li {...props} key={cidade}>
                    <Box sx={{ flex: 1 }}>{cidade}</Box>
                    <Typography fontSize={12} color="text.secondary">
                      {contagem(cidades, cidade)}
                    </Typography>
                  </li>
                )}
                noOptionsText="Nenhuma cidade com esse nome"
                renderInput={(params) => (
                  <TextField {...params} label="Cidade" />
                )}
              />
              <Autocomplete
                size="small"
                fullWidth
                options={bairros.map((b) => b.nome)}
                value={filters.neighborhood || null}
                onChange={(_, bairro) => mudar({ neighborhood: bairro ?? '' })}
                renderOption={(props, bairro) => (
                  <li {...props} key={bairro}>
                    <Box sx={{ flex: 1 }}>{bairro}</Box>
                    <Typography fontSize={12} color="text.secondary">
                      {contagem(bairros, bairro)}
                    </Typography>
                  </li>
                )}
                noOptionsText="Nenhum bairro com esse nome"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Bairro"
                    placeholder={filters.city ? `Em ${filters.city}` : ''}
                  />
                )}
              />
            </Stack>
          </Secao>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, pt: 1 }}>
        <Button onClick={() => setFilters(FILTROS_VAZIOS)}>Limpar</Button>
        <Button
          variant="contained"
          onClick={() => {
            onApply(filters);
            onClose();
          }}
        >
          Aplicar filtros
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
