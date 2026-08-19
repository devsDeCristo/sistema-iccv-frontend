import { Box, Chip, Stack, Typography } from '@mui/material';
import { Bed, Groups, Badge as BadgeIcon } from '@mui/icons-material';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  CHECKIN_STATUS_COLOR,
  CHECKIN_STATUS_LABEL,
  horaCurta,
} from '../constants';
import { CheckinParticipant } from '../types';

/**
 * `display` existe por causa do segundo monitor, espelhado e virado para o
 * inscrito: ele confere os próprios dados a mais de um braço de distância da
 * tela, então nome e detalhes precisam ser bem maiores que no uso do operador.
 */
type ParticipantSummaryVariant = 'dense' | 'default' | 'display';

interface ParticipantSummaryProps {
  participant: CheckinParticipant;
  variant?: ParticipantSummaryVariant;
  /** Foto recém-tirada, ainda não salva, para o inscrito já se ver nela */
  previewPhotoUrl?: string | null;
}

const TAMANHO_AVATAR: Record<ParticipantSummaryVariant, number> = {
  dense: 44,
  default: 72,
  display: 128,
};

const VARIANTE_NOME = {
  dense: 'body1',
  default: 'h6',
  display: 'h4',
} as const;

const VARIANTE_DETALHE = {
  dense: 'body2',
  default: 'body2',
  display: 'h6',
} as const;

/** Mostra o CPF só com os dígitos do meio, o suficiente para conferência. */
function cpfParcial(cpf?: string | null) {
  const digitos = (cpf || '').replace(/\D/g, '');
  if (digitos.length !== 11) return cpf || '';

  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

function ParticipantSummary({
  participant,
  variant = 'default',
  previewPhotoUrl,
}: ParticipantSummaryProps) {
  const dense = variant === 'dense';
  const display = variant === 'display';
  const detalhe = VARIANTE_DETALHE[variant];
  const tamanhoChip = display ? 'medium' : 'small';

  return (
    <Stack direction="row" spacing={display ? 3 : 2} alignItems="flex-start">
      <UserAvatar
        name={participant.fullName}
        photoUrl={previewPhotoUrl || participant.profilePhotoUrl}
        sx={{
          width: TAMANHO_AVATAR[variant],
          height: TAMANHO_AVATAR[variant],
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant={VARIANTE_NOME[variant]}
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
          sx={{ mt: display ? 1 : 0.5 }}
        >
          <Chip
            size={tamanhoChip}
            label={CHECKIN_STATUS_LABEL[participant.status]}
            color={CHECKIN_STATUS_COLOR[participant.status]}
          />
          <Typography
            variant={display ? 'body1' : 'caption'}
            color="text.secondary"
          >
            Inscrição nº {participant.registrationNumber}
          </Typography>
          {!dense && (
            <Typography
              variant={display ? 'body1' : 'caption'}
              color="text.secondary"
            >
              CPF {cpfParcial(participant.cpf)}
            </Typography>
          )}
        </Stack>

        {!dense && (
          <Stack spacing={display ? 1 : 0.5} sx={{ mt: 1 }}>
            {participant.badgeName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <BadgeIcon
                  fontSize={display ? 'medium' : 'small'}
                  color="action"
                />
                <Typography variant={detalhe} fontWeight={400}>
                  Crachá: <b>{participant.badgeName}</b>
                </Typography>
              </Stack>
            )}
            {participant.bedroom && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Bed fontSize={display ? 'medium' : 'small'} color="action" />
                <Typography variant={detalhe} fontWeight={400}>
                  Quarto: <b>{participant.bedroom}</b>
                </Typography>
              </Stack>
            )}
            {participant.teams.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Groups fontSize={display ? 'medium' : 'small'} color="action" />
                <Typography variant={detalhe} fontWeight={400}>
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
                  <Chip
                    key={group}
                    size={tamanhoChip}
                    variant="outlined"
                    label={group}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/* rastro de quem fez o quê: resolve discussão de balcão na hora */}
        {participant.badgeDeliveredAt && (
          <Typography
            variant={display ? 'body2' : 'caption'}
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
            variant={display ? 'body2' : 'caption'}
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
