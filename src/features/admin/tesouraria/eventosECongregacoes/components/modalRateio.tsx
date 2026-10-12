import { useEffect, useState } from 'react';
import { Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { formatCurrency } from '../../../../../utils';
import { LinhaLivre } from '../dados';

/** "2026-10-05" → "05/10": o ano é o do período */
const diaEMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

interface Props {
  /** Os movimentos marcados; vazio fecha a janela */
  linhas: LinhaLivre[];
  /** "para este evento", "para esta congregação" */
  paraEste: string;
  onClose: () => void;
  onTrazer: (partes: { movimentoId: string; valor: number }[]) => void;
}

/**
 * Ratear e trazer: quanto de cada movimento marcado vem para esta tesouraria.
 * Um movimento por aba (com mais de um); começa no que falta distribuir dele,
 * e o que ficar de fora continua a distribuir para outra.
 */
function ModalRateio({ linhas, paraEste, onClose, onTrazer }: Props) {
  const [aba, setAba] = useState(0);
  // em centavos, por movimento: a pessoa digita só números
  const [partes, setPartes] = useState<Record<string, number>>({});

  useEffect(() => {
    setAba(0);
    setPartes(
      Object.fromEntries(
        linhas.map((l) => [l.movimento.id, Math.round(l.restante * 100)])
      )
    );
  }, [linhas]);

  const valida = (l: LinhaLivre) => {
    const c = partes[l.movimento.id] ?? 0;
    return c > 0 && c <= Math.round(l.restante * 100);
  };
  const total =
    linhas.reduce((soma, l) => soma + (partes[l.movimento.id] ?? 0), 0) / 100;
  const atual = linhas[Math.min(aba, linhas.length - 1)];

  return (
    <ResponsiveModal
      open={linhas.length > 0}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Ratear e trazer"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!linhas.every(valida)}
            onClick={() =>
              onTrazer(
                linhas.map((l) => ({
                  movimentoId: l.movimento.id,
                  valor: (partes[l.movimento.id] ?? 0) / 100,
                }))
              )
            }
          >
            Trazer {formatCurrency(total)}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Escolha quanto de cada movimento vem {paraEste}. O que ficar de fora
          continua a distribuir, para outra tesouraria.
        </Typography>

        {linhas.length > 1 && (
          <Tabs
            value={Math.min(aba, linhas.length - 1)}
            onChange={(_, nova) => setAba(nova)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {linhas.map((l) => (
              <Tab
                key={l.movimento.id}
                label={`${diaEMes(l.movimento.data)} · ${formatCurrency(
                  l.restante
                )}`}
                sx={{
                  textTransform: 'none',
                  // aba com valor inválido avisa antes de a pessoa procurar
                  color: valida(l) ? undefined : 'error.main',
                }}
              />
            ))}
          </Tabs>
        )}

        {atual && (
          <Stack spacing={2} key={atual.movimento.id}>
            <div>
              <Typography fontWeight={600} fontSize={14}>
                {atual.movimento.descricao}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {diaEMes(atual.movimento.data)} · {atual.movimento.banco}
                {atual.movimento.pagador
                  ? ` · ${atual.movimento.pagador}`
                  : ''}{' '}
                · falta distribuir {formatCurrency(atual.restante)}
                {atual.restante < atual.movimento.valor
                  ? ` de ${formatCurrency(atual.movimento.valor)}`
                  : ''}
              </Typography>
            </div>
            <TextField
              label={`Quanto vem ${paraEste}`}
              size="small"
              autoFocus
              value={formatCurrency((partes[atual.movimento.id] ?? 0) / 100)}
              onChange={(e) =>
                setPartes((p) => ({
                  ...p,
                  [atual.movimento.id]:
                    Number(e.target.value.replace(/\D/g, '').slice(0, 13)) || 0,
                }))
              }
              inputProps={{ inputMode: 'numeric' }}
              error={!valida(atual)}
              helperText={
                valida(atual)
                  ? `Fica a distribuir: ${formatCurrency(
                      atual.restante - (partes[atual.movimento.id] ?? 0) / 100
                    )}`
                  : `Entre ${formatCurrency(0.01)} e ${formatCurrency(
                      atual.restante
                    )}`
              }
            />
          </Stack>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalRateio };
