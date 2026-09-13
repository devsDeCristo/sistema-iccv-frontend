import { useParams } from 'react-router-dom';
import { Home } from '../home';

/**
 * A home de uma igreja, aberta pela lista de igrejas.
 *
 * A página é a mesma que o admin da igreja vê ao entrar no sistema — ela é a
 * home **da igreja**, e não a de um perfil. Por isso aqui não há tela: só a
 * igreja saindo da URL e entrando na `Home`, que já sabe desenhar os blocos de
 * uma igreja. Uma cópia da tela para o super admin envelheceria em paralelo, e
 * o que ele visse deixaria de ser o que o admin vê.
 *
 * Quem pode abrir cada igreja quem decide é a API: o `churchId` vem da barra
 * de endereço, e mandar o de outra igreja rende 403.
 */
export function ChurchHome() {
  const { churchId } = useParams();

  return <Home churchId={churchId} />;
}
