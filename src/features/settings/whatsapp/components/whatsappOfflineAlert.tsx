import { Alert, AlertTitle, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWhatsappConectado } from '../useWhatsappConectado';

/**
 * Aviso de que o canal está fora do ar.
 *
 * Sem celular conectado a notícia é publicada normalmente no mural, mas não sai
 * nos grupos — e o erro só apareceria depois, na coluna do WhatsApp da lista.
 * Este alerta antecipa isso, antes de a pessoa escrever e publicar.
 */
function WhatsappOfflineAlert() {
  const navigate = useNavigate();
  const { status, semNumero } = useWhatsappConectado();

  // enquanto a primeira consulta não volta — ou se ela falhar — não há o que
  // afirmar: piscar "desconectado" e sumir seria pior que não mostrar nada
  if (!semNumero) return null;

  const conectando = status === 'CONNECTING';

  return (
    <Alert
      severity={conectando ? 'info' : 'warning'}
      sx={{ mt: 2, borderRadius: 2, alignItems: 'center' }}
      action={
        <Button
          color="inherit"
          size="small"
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
          onClick={() => navigate('/configuracoes/disparadores')}
        >
          {conectando ? 'Ver conexão' : 'Conectar número'}
        </Button>
      }
    >
      <AlertTitle sx={{ mb: 0.25 }}>
        {conectando
          ? 'WhatsApp ainda conectando'
          : 'Nenhum celular conectado ao WhatsApp'}
      </AlertTitle>

      {conectando
        ? 'O pareamento não terminou. Até lá, as notícias não saem nos grupos.'
        : 'As notícias continuam no mural dos inscritos, mas não são enviadas nos grupos. Conecte o número em Configurações → Disparadores e use o Reenviar nas que ficaram para trás.'}
    </Alert>
  );
}

export { WhatsappOfflineAlert };
