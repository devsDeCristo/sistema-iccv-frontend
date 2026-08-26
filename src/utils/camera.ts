/**
 * Diagnóstico de câmera.
 *
 * `getUserMedia` só existe em contexto seguro — HTTPS ou localhost. Servindo o
 * front por IP em HTTP (http://192.168.x.x:5173) o navegador não expõe a API e
 * *não pede permissão nenhuma*: não há o que autorizar. Sem distinguir esse
 * caso de uma permissão negada, a tela manda o operador procurar no lugar
 * errado.
 */

/** Contexto seguro? É o que decide se a câmera é sequer oferecida. */
export function isSecureCameraContext() {
  // o react-webcam cria um `navigator.mediaDevices` vazio como polyfill ao ser
  // importado, então checar por ele daria falso positivo: quem responde a
  // verdade é o isSecureContext
  return typeof window !== 'undefined' && window.isSecureContext;
}

/** Endereço atual, para a mensagem dizer qual origem está sem HTTPS */
export function currentOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * Traduz a falha em algo acionável. O react-webcam entrega uma string quando a
 * API não existe e um DOMException quando o navegador recusou.
 */
export function describeCameraError(error?: unknown) {
  if (!isSecureCameraContext()) {
    return `A câmera exige HTTPS. Este endereço (${currentOrigin()}) é HTTP, então o navegador não libera a câmera nem pede permissão. Abra o sistema por HTTPS ou por localhost.`;
  }

  const nome =
    typeof error === 'object' && error && 'name' in error
      ? String((error as DOMException).name)
      : '';

  switch (nome) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Permissão de câmera negada. Toque no ícone de cadeado ao lado do endereço, libere a Câmera e recarregue a página.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Nenhuma câmera encontrada neste aparelho.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'A câmera está ocupada por outro aplicativo. Feche os outros usos e tente de novo.';
    case 'OverconstrainedError':
      return 'A câmera do aparelho não atende à resolução pedida.';
    default:
      return 'Não foi possível abrir a câmera. Verifique a permissão do navegador e se nenhum outro programa está usando ela.';
  }
}
