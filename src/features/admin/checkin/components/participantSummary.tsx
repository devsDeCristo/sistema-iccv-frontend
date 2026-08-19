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
  /** Foto recém-tirada, ainda não salva, para o inscrito já se ver nela */
  previewPhotoUrl?: string | null;
}

/** Mostra o CPF só com os dígitos do meio, o suficiente para conferência. */
function cpfParcial(cpf?: string | null) {
  const digitos = (cpf || '').replace(/\D/g, '');
  if (digitos.length !== 11) return cpf || '';

  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

/**
 * Identificação de quem está sendo atendido, no alto do posto de foto.
 *
 * É grande porque esta é a faixa que o segundo monitor mostra ao inscrito: ele
 * confere o próprio nome e os próprios dados a mais de um braço de distância.
 */
function ParticipantSummary({
  participant,
  previewPhotoUrl,
}: ParticipantSummaryProps) {
  return (
    <Stack direction="row" spacing={3} alignItems="flex-start">
      <UserAvatar
        name={participant.fullName}
        photoUrl={previewPhotoUrl || participant.profilePhotoUrl}
        sx={{ width: 128, height: 128 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h4" fontWeight={600} sx={{ lineHeight: 1.2 }}>
          {participant.fullName}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 1 }}
        >
          <Chip
            label={CHECKIN_STATUS_LABEL[participant.status]}
            color={CHECKIN_STATUS_COLOR[participant.status]}
          />
          <Typography variant="body1" color="text.secondary">
            Inscrição nº {participant.registrationNumber}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            CPF {cpfParcial(participant.cpf)}
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {participant.badgeName && (
            <Stack direction="row" spacing={1} alignItems="center">
              <BadgeIcon color="action" />
              <Typography variant="h6" fontWeight={400}>
                Crachá: <b>{participant.badgeName}</b>
              </Typography>
            </Stack>
          )}
          {participant.bedroom && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Bed color="action" />
              <Typography variant="h6" fontWeight={400}>
                Quarto: <b>{participant.bedroom}</b>
              </Typography>
            </Stack>
          )}
          {participant.teams.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Groups color="action" />
              <Typography variant="h6" fontWeight={400}>
                Equipe:{' '}
                <b>
                  {participant.teams
                    .map(
                      (team) =>
                        `${team.name}${team.role === 'LEADER' ? ' (líder)' : ''}`
                    )
                    .join(', ')}
                </b>
              </Typography>
            </Stack>
          )}
          {participant.groups.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {participant.groups.map((group) => (
                <Chip key={group} variant="outlined" label={group} />
              ))}
            </Stack>
          )}
        </Stack>

        {/* rastro de quem fez o quê: resolve discussão de balcão na hora */}
        {participant.badgeDeliveredAt && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            Crachá entregue às {horaCurta(participant.badgeDeliveredAt)}
            {participant.badgeDeliveredBy
              ? ` por ${participant.badgeDeliveredBy}`
              : ''}
          </Typography>
        )}
        {participant.doneAt && (
          <Typography
            variant="body2"
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
