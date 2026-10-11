import { Box } from '@mui/material';
import { Posicao, abreAFamilia } from '../familias';

/** A faixa da família na célula: contínua de uma linha para a outra */
function FaixaDaFamilia({ posicao, cor }: { posicao: Posicao; cor: string }) {
  const abre = abreAFamilia(posicao);
  const fecha = posicao === 'fim' || posicao === 'unica';
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 6,
        top: abre ? 8 : 0,
        bottom: fecha ? 8 : 0,
        width: 4,
        backgroundColor: cor,
        borderTopLeftRadius: abre ? 4 : 0,
        borderTopRightRadius: abre ? 4 : 0,
        borderBottomLeftRadius: fecha ? 4 : 0,
        borderBottomRightRadius: fecha ? 4 : 0,
      }}
    />
  );
}

export { FaixaDaFamilia };
