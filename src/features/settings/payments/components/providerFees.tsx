import { Fragment } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

import { ProviderPricing } from '../types';

interface Props {
  pricing: ProviderPricing;
}

/**
 * A tabela de preço da casa, recolhida dentro do cartão.
 *
 * Fechada por padrão: são quatro casas na mesma tela, e quatro tabelas abertas
 * viram uma parede de número que empurra o botão de configurar para fora da
 * dobra. Quem está comparando abre a que interessa.
 *
 * Duas linhas com a mesma forma e prazos diferentes (crédito em 14 e em 30
 * dias) são de propósito — é a escolha que mais muda o custo da igreja, e
 * mostrar só a mais rápida esconderia justamente a mais barata.
 *
 * O aviso do rodapé não é rodapé jurídico: taxa de tabela é a de quem está
 * começando, e a igreja que negocia paga outra. Sem essa linha o número vira
 * promessa, e ela vai conferir no repasse.
 */
function ProviderFees({ pricing }: Props) {
  const theme = useTheme();

  return (
    <Accordion
      disableGutters
      square
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        // O Accordion é um Paper, e o tema carimba uma sombra em todo Paper
        // pelo `styleOverrides.root` — que o `elevation={0}` não desfaz, porque
        // override ganha de prop. Sem isto a tabela ganha uma caixa flutuante
        // dentro de um cartão que já tem a sua.
        boxShadow: 'none',
        // O MUI desenha um filete acima de todo Accordion, para separar um do
        // outro numa pilha. Aqui há um só, dentro de um cartão que já tem
        // borda — o filete só somaria uma linha solta.
        '&::before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
          minHeight: 0,
          px: 0,
          '&.Mui-expanded': { minHeight: 0 },
        },
        '& .MuiAccordionSummary-content': {
          my: 0,
          '&.Mui-expanded': { my: 0 },
        },
        '& .MuiAccordionDetails-root': { px: 0, pt: 1.25, pb: 0 },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
        >
          Taxas de tabela
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: 'grid',
            // O preço alinhado à direita numa coluna própria: é a coluna que a
            // pessoa percorre de cima a baixo para comparar, e ela só se lê de
            // relance quando os números terminam no mesmo lugar.
            gridTemplateColumns: '1fr auto',
            columnGap: 1.5,
            rowGap: 0.25,
            alignItems: 'baseline',
          }}
        >
          {pricing.fees.map((taxa, indice) => (
            // A chave é o índice porque a mesma forma aparece mais de uma vez,
            // com prazos diferentes — e a lista é fixa, nunca reordena.
            <Fragment key={indice}>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {taxa.label}
                {taxa.settlement && (
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    {' · '}
                    {taxa.settlement}
                  </Box>
                )}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  textAlign: 'right',
                  lineHeight: 1.6,
                  fontWeight: taxa.rate ? 600 : 400,
                  fontStyle: taxa.rate ? 'normal' : 'italic',
                  color: taxa.rate
                    ? theme.palette.text.primary
                    : theme.palette.text.disabled,
                  // Sem isto os dígitos têm larguras diferentes e a coluna
                  // desalinha justamente onde ela precisa ser lida em coluna.
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {taxa.rate ?? 'não divulgada'}
              </Typography>
            </Fragment>
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, lineHeight: 1.45 }}
        >
          Tabela de {pricing.checkedAt}. {pricing.note && `${pricing.note} `}
          Toda casa negocia taxa por faturamento — a da sua igreja é a que
          aparece no painel dela.{' '}
          <Link
            href={pricing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Ver tabela
          </Link>
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export { ProviderFees };
