import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Código impresso no QR do crachá: o id do inscrito em hex maiúsculo, sem
 * hífen.
 *
 * O formato não é enfeite. Hífen e letra minúscula jogam o QR para o modo byte
 * (8 bits por caractere); só dígito e letra maiúscula cabem no modo
 * alfanumérico (11 bits por par). O mesmo uuid sai de 33 para 25 módulos só
 * por causa disso — e menos módulos no mesmo tamanho impresso significa módulo
 * maior, que é o que a câmera precisa.
 *
 * O evento saiu do código de propósito: com ele eram 37 módulos. A bipagem não
 * perdeu nada, porque quem confere se a inscrição é deste evento é a busca na
 * lista do evento aberto — crachá de outro evento cai no aviso de "não está
 * nesta lista".
 */
export function buildBadgeCode(userId: string) {
  const hex = (userId || '').replace(/-/g, '').toUpperCase();
  // qualquer coisa fora de um uuid de 32 dígitos hex não vira código: melhor
  // crachá sem QR que QR que não casa com ninguém
  return /^[0-9A-F]{32}$/.test(hex) ? hex : '';
}

/**
 * Lê o que veio do QR e devolve o id do inscrito na forma canônica, para casar
 * com o `id` que a API entrega.
 *
 * Aceita três formatos: o compacto atual, um uuid com hífen (QR gerado à mão) e
 * o antigo `eventId:userId` — crachá já impresso continua funcionando.
 */
export function parseBadgeCode(raw: string): string | null {
  const bruto = (raw || '').trim();
  if (!bruto) return null;

  // no formato antigo o id do inscrito era a última parte
  const ultima = bruto.split(':').pop() || '';
  const hex = ultima.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return null;

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/** QR já pronto para o `<Svg>` do react-pdf: o traçado e o lado do viewBox */
export interface QrCodePath {
  path: string;
  cells: number;
}

/**
 * O react-pdf não renderiza componentes de DOM, então o `QRCodeSVG` — o mesmo
 * gerador usado no modal de QR — é renderizado para markup só para extrair o
 * traçado, que vira um `<Path>` do PDF. Sai vetor, não bitmap: imprime nítido
 * em qualquer tamanho.
 *
 * A zona de silêncio (`marginSize`) vai dentro do próprio código; quem desenha
 * completa com a moldura branca ao redor. Sem uma das duas o leitor não engata
 * no código encostado na arte do crachá.
 */
export function buildQrCodePath(
  value: string,
  marginSize = 2
): QrCodePath | null {
  if (!value) return null;

  const markup = renderToStaticMarkup(
    createElement(QRCodeSVG, { value, level: 'M', marginSize })
  );

  const cells = Number(markup.match(/viewBox="0 0 (\d+) \d+"/)?.[1]);
  if (!cells) return null;

  // o QRCodeSVG emite dois paths: o fundo (retângulo do tamanho todo) e os
  // módulos. Descartar o fundo pelo traçado conhecido é mais seguro que
  // confiar na ordem
  const fundo = `M0,0 h${cells}v${cells}H0z`;
  const paths = Array.from(markup.matchAll(/ d="([^"]+)"/g)).map(
    ([, d]) => d
  );
  const modulos = paths.find((d) => d !== fundo);

  return modulos ? { path: modulos, cells } : null;
}
