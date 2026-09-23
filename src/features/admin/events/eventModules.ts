import { EventDataJson } from './types';

/**
 * Quais módulos o evento usa.
 *
 * Nem todo evento hospeda gente, monta equipe ou leva ônibus: um encontro de um
 * dia não tem quarto, e um retiro na própria igreja não tem transporte. Ligado
 * ou desligado decide se a aba aparece no painel — e o servidor confere de novo
 * antes de gravar qualquer coisa dentro do módulo.
 *
 * Espelha `src/event/event-modules.ts` no backend. Se a lista mudar lá, muda
 * aqui junto.
 */
export const MODULOS_DO_EVENTO = ['bedrooms', 'teams', 'transport'] as const;

export type ModuloDoEvento = (typeof MODULOS_DO_EVENTO)[number];

export type ModulosDoEvento = Record<ModuloDoEvento, boolean>;

/**
 * Ausente é ligado.
 *
 * Os eventos que já existem não têm esta chave, e os quartos e as equipes deles
 * estão cheios: se a ausência valesse "desligado", subir este código esconderia
 * dado cadastrado sem ninguém ter pedido.
 */
export function moduloAtivo(
  data: EventDataJson | null | undefined,
  modulo: ModuloDoEvento
): boolean {
  return data?.modules?.[modulo] !== false;
}

/**
 * Se os inscritos podem abrir o quadrante.
 *
 * Aqui ausente é desligado, ao contrário dos módulos: o quadrante mostra
 * e-mail, celular e nascimento da equipe inteira, e nenhum evento que já existe
 * abria isso para os inscritos. Espelha `src/event/event-quadrante.ts`.
 */
export function quadranteVisivelParaInscritos(
  data: EventDataJson | null | undefined
): boolean {
  return data?.showQuadrante === true && moduloAtivo(data, 'teams');
}

export function modulosDoEvento(
  data: EventDataJson | null | undefined
): ModulosDoEvento {
  return MODULOS_DO_EVENTO.reduce((mapa, modulo) => {
    mapa[modulo] = moduloAtivo(data, modulo);
    return mapa;
  }, {} as ModulosDoEvento);
}
