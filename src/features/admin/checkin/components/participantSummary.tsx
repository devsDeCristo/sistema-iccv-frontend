import { Box, Chip, Stack, Typography } from '@mui/material';
import { Bed, Groups, Badge as BadgeIcon } from '@mui/icons-material';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  CHECKIN_STATUS_COLOR,
  CHECKIN_STATUS_LABEL,
  horaCurta,
} from '../constants';
import { CheckinParticipant } from '../types';

interface ParticipantSummaryProps {
  participant: CheckinParticipant;
  /** Versão compacta usada nos itens da fila */
  dense?: boolean;
}

/** Mostra o CPF só com os dígitos do meio, o suficiente para conferência. */
function cpfParcial(cpf?: string | null) {
  const digitos = (cpf || '').replace(/\D/g, '');
  if (digitos.length !== 11) return cpf || '';

  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

function ParticipantSummary({ participant, dense }: ParticipantSummaryProps) {
  const tamanhoAvatar = dense ? 44 : 72;

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <UserAvatar
        name={participant.fullName}
        photoUrl={participant.profilePhotoUrl}
        sx={{ width: tamanhoAvatar, height: tamanhoAvatar }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant={dense ? 'body1' : 'h6'}
          fontWeight={600}
          sx={{ lineHeight: 1.2 }}
        >
          {participant.fullName}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 0.5 }}
        >
          <Chip
            size="small"
            label={CHECKIN_STATUS_LABEL[participant.status]}
            color={CHECKIN_STATUS_COLOR[participant.status]}
          />
          <Typography variant="caption" color="text.secondary">
            Inscrição nº {participant.registrationNumber}
          </Typography>
          {!dense && (
            <Typography variant="caption" color="text.secondary">
              CPF {cpfParcial(participant.cpf)}
            </Typography>
          )}
        </Stack>

        {!dense && (
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {participant.badgeName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Crachá: <b>{participant.badgeName}</b>
                </Typography>
              </Stack>
            )}
            {participant.bedroom && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Bed fontSize="small" color="action" />
                <Typography variant="body2">
                  Quarto: <b>{participant.bedroom}</b>
                </Typography>
              </Stack>
            )}
            {participant.teams.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Groups fontSize="small" color="action" />
                <Typography variant="body2">
                  Equipe:{' '}
                  <b>
                    {participant.teams
                      .map(
                        (team) =>
                          `${team.name}${
                            team.role === 'LEADER' ? ' (líder)' : ''
                          }`
                      )
                      .join(', ')}
                  </b>
                </Typography>
              </Stack>
            )}
            {participant.groups.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {participant.groups.map((group) => (
                  <Chip key={group} size="small" variant="outlined" label={group} />
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/* rastro de quem fez o quê: resolve discussão de balcão na hora */}
        {participant.badgeDeliveredAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: dense ? 0.5 : 1 }}
          >
            Crachá entregue às {horaCurta(participant.badgeDeliveredAt)}
            {participant.badgeDeliveredBy
              ? ` por ${participant.badgeDeliveredBy}`
              : ''}
          </Typography>
        )}
        {participant.doneAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Concluído às {horaCurta(participant.doneAt)}
            {participant.doneBy ? ` por ${participant.doneBy}` : ''}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export { ParticipantSummary };
