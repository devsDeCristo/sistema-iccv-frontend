import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import PdfBadge from '../../../../../components/pdfBadge';
import PdfEnvelope from '../../../../../components/pdfEnvelope';
import PdfEnvelopePhoto from '../../../../../components/pdfEnvelopePhoto';
import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { SelectField } from '../../../../../components/selectField';
import { PdfNameCase } from '../../../../../types/pdf';
import { User } from '../../../../../types/user';
import { EventDetails, Team } from '../../types';
import { EnvelopeKind, PdfDocType, PdfGroupBy, PdfScope } from './types';
import {
  buildSections,
  filterByGroups,
  filterByTeams,
  userTeamNames,
} from './utils';

interface ModalGeneratePdfProps {
  open: boolean;
  type: PdfDocType | null;
  onClose: () => void;
  event?: EventDetails;
  teams: Team[];
  /** todos os inscritos do evento, sem filtro */
  allUsers: User[];
  /** os que estão na grade agora (busca, filtros e aba de grupo aplicados) */
  filteredUsers: User[];
  /** os marcados no checkbox da grade */
  selectedUsers: User[];
}

const NAME_CASE_OPTIONS: { value: PdfNameCase; label: string }[] = [
  { value: 'capitalize', label: 'Primeira letra maiúscula' },
  { value: 'upper', label: 'MAIÚSCULO' },
  { value: 'lower', label: 'minúsculo' },
];

const GROUP_BY_OPTIONS: { value: PdfGroupBy; label: string }[] = [
  { value: 'none', label: 'Não agrupar' },
  { value: 'registrationGroup', label: 'Grupo de inscrição' },
  { value: 'team', label: 'Equipe' },
];

/** No celular o menu não pode passar da tela */
const MENU_PROPS = { PaperProps: { sx: { maxHeight: 320 } } };

function ModalGeneratePdf({
  open,
  type,
  onClose,
  event,
  teams,
  allUsers,
  filteredUsers,
  selectedUsers,
}: ModalGeneratePdfProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });
  const isBadge = type === 'badge';
  const itemLabel = isBadge ? 'crachás' : 'envelopes';

  const [envelopeKind, setEnvelopeKind] = useState<EnvelopeKind>('letter');
  const [scope, setScope] = useState<PdfScope>('filtered');
  const [scopeTeams, setScopeTeams] = useState<string[]>([]);
  const [scopeGroups, setScopeGroups] = useState<string[]>([]);
  const [blankCount, setBlankCount] = useState<number>(1);
  const [alphabetical, setAlphabetical] = useState(true);
  const [groupBy, setGroupBy] = useState<PdfGroupBy>('none');
  const [nameCase, setNameCase] = useState<PdfNameCase>('capitalize');
  const [withQrCode, setWithQrCode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // cada abertura recomeça do padrão, senão sobra a configuração anterior
  useEffect(() => {
    if (!open) return;
    setEnvelopeKind('letter');
    setScope(selectedUsers.length > 0 ? 'selected' : 'filtered');
    setScopeTeams([]);
    setScopeGroups([]);
    setBlankCount(1);
    setAlphabetical(true);
    setGroupBy('none');
    setNameCase('capitalize');
    setWithQrCode(true);
  }, [open]);

  /** Equipes vêm da query; se ela não carregou, sobra o que os inscritos têm */
  const teamNames = useMemo(() => {
    const fromQuery = (teams ?? []).map((team) => team.name).filter(Boolean);
    if (fromQuery.length > 0) return fromQuery;

    const fromUsers = new Set<string>();
    for (const user of allUsers) {
      for (const name of userTeamNames(user)) fromUsers.add(name);
    }
    return Array.from(fromUsers);
  }, [teams, allUsers]);

  const groupNames = useMemo(
    () => (event?.groupRoles ?? []).map((group) => group.name),
    [event]
  );

  const resolvedUsers = useMemo(() => {
    switch (scope) {
      case 'selected':
        return selectedUsers;
      case 'filtered':
        return filteredUsers;
      case 'all':
        return allUsers;
      case 'teams':
        return filterByTeams(allUsers, scopeTeams);
      case 'groups':
        return filterByGroups(allUsers, scopeGroups);
      default:
        return [];
    }
  }, [scope, scopeTeams, scopeGroups, allUsers, filteredUsers, selectedUsers]);

  const isBlankScope = scope === 'blank';
  /** Envelope de foto não imprime nome: formatação e alfabética não valem */
  const usesNames = isBadge || envelopeKind === 'letter';
  const blanks = isBlankScope ? blankCount : 0;

  async function onGenerate() {
    if (scope === 'teams' && scopeTeams.length === 0) {
      toast.error('Selecione ao menos uma equipe.');
      return;
    }
    if (scope === 'groups' && scopeGroups.length === 0) {
      toast.error('Selecione ao menos um grupo de inscrição.');
      return;
    }
    if (isBlankScope && blankCount < 1) {
      toast.error(`Informe a quantidade de ${itemLabel} sem nome.`);
      return;
    }
    if (!isBlankScope && resolvedUsers.length === 0) {
      toast.error('Nenhum usuário encontrado para os filtros selecionados.');
      return;
    }
    if (!event) return;

    // o envelope não agrupa: a arte ocupa a folha e não sobra lugar para o título
    const sections = isBlankScope
      ? []
      : buildSections(resolvedUsers, isBadge ? groupBy : 'none', alphabetical);

    setIsGenerating(true);
    // o react-pdf trava a tela enquanto monta: dá um frame para o loading pintar
    setTimeout(async () => {
      try {
        let blob: Blob;
        let fileName: string;

        if (isBadge) {
          blob = await pdf(
            <PdfBadge
              data={[]}
              event={event}
              sections={sections}
              nameCase={nameCase}
              blankCount={blanks}
              withQrCode={withQrCode}
            />
          ).toBlob();
          fileName = 'crachas.pdf';
        } else if (envelopeKind === 'letter') {
          blob = await pdf(
            <PdfEnvelope
              data={[]}
              event={event}
              sections={sections}
              nameCase={nameCase}
              blankCount={blanks}
            />
          ).toBlob();
          fileName = 'envelopes-cartas.pdf';
        } else {
          blob = await pdf(
            <PdfEnvelopePhoto
              event={event}
              sections={sections}
              blankCount={blanks}
            />
          ).toBlob();
          fileName = 'envelopes-fotos.pdf';
        }

        FileSaver.saveAs(blob, fileName);
        onClose();
      } catch (error) {
        toast.error('Não foi possível gerar o PDF. Tente novamente.');
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  }

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={isGenerating}
      mobileMode="bottomSheet"
      title={isBadge ? 'PDF Crachás' : 'PDF Envelopes'}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isGenerating}
            fullWidth={isMobile}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onGenerate}
            disabled={isGenerating}
            fullWidth={isMobile}
          >
            {isGenerating ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </>
      }
    >
      <Stack gap={3}>
        {!isBadge && (
          <>
            <FormControl>
              <FormLabel>Tipo</FormLabel>
              <RadioGroup
                row
                value={envelopeKind}
                onChange={(e) =>
                  setEnvelopeKind(e.target.value as EnvelopeKind)
                }
              >
                <FormControlLabel
                  value="letter"
                  control={<Radio size="small" />}
                  label="Cartas (com nome)"
                />
                <FormControlLabel
                  value="photo"
                  control={<Radio size="small" />}
                  label="Fotos (sem nome)"
                />
              </RadioGroup>
            </FormControl>
            <Divider />
          </>
        )}

        <FormControl>
          <FormLabel>Registros a imprimir</FormLabel>
          <RadioGroup
            value={scope}
            onChange={(e) => setScope(e.target.value as PdfScope)}
          >
            <FormControlLabel
              value="selected"
              disabled={selectedUsers.length === 0}
              control={<Radio size="small" />}
              label={`Somente selecionados (${selectedUsers.length})`}
            />
            <FormControlLabel
              value="filtered"
              control={<Radio size="small" />}
              label={`Apenas os mostrados na tela/filtrados (${filteredUsers.length})`}
            />
            <FormControlLabel
              value="all"
              control={<Radio size="small" />}
              label={`Todos os usuários do evento (${allUsers.length}) — ignora os filtros`}
            />

            <FormControlLabel
              value="teams"
              control={<Radio size="small" />}
              label="Selecionar equipe(s)"
            />
            {scope === 'teams' && (
              <Box sx={{ pl: { xs: 0, sm: 4 }, pb: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="pdf-teams-label">Equipes</InputLabel>
                  <Select
                    labelId="pdf-teams-label"
                    multiple
                    value={scopeTeams}
                    onChange={(e) => setScopeTeams(e.target.value as string[])}
                    input={<OutlinedInput label="Equipes" />}
                    MenuProps={MENU_PROPS}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((name) => (
                          <Chip key={name} label={name} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {teamNames.length === 0 && (
                      <MenuItem disabled value="">
                        Nenhuma equipe cadastrada
                      </MenuItem>
                    )}
                    {teamNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={scopeTeams.includes(name)}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <FormControlLabel
              value="groups"
              control={<Radio size="small" />}
              label="Selecionar grupo(s) de inscrição"
            />
            {scope === 'groups' && (
              <Box sx={{ pl: { xs: 0, sm: 4 }, pb: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="pdf-groups-label">
                    Grupos de inscrição
                  </InputLabel>
                  <Select
                    labelId="pdf-groups-label"
                    multiple
                    value={scopeGroups}
                    onChange={(e) => setScopeGroups(e.target.value as string[])}
                    input={<OutlinedInput label="Grupos de inscrição" />}
                    MenuProps={MENU_PROPS}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((name) => (
                          <Chip key={name} label={name} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {groupNames.length === 0 && (
                      <MenuItem disabled value="">
                        Nenhum grupo cadastrado
                      </MenuItem>
                    )}
                    {groupNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          size="small"
                          checked={scopeGroups.includes(name)}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <FormControlLabel
              value="blank"
              control={<Radio size="small" />}
              label={`${isBadge ? 'Crachás' : 'Envelopes'} sem nome`}
            />
            {isBlankScope && (
              <Box sx={{ pl: { xs: 0, sm: 4 }, pb: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  label="Quantidade"
                  value={blankCount}
                  onChange={(e) =>
                    setBlankCount(Math.max(0, Number(e.target.value)))
                  }
                  inputProps={{ min: 1, inputMode: 'numeric' }}
                  sx={{ width: { xs: '100%', sm: 160 } }}
                />
              </Box>
            )}
          </RadioGroup>

          {!isBlankScope && (
            <Typography variant="caption" color="text.secondary" mt={1}>
              {`${resolvedUsers.length} registro(s) selecionado(s)`}
            </Typography>
          )}
        </FormControl>

        <Divider />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={alphabetical}
                  disabled={isBlankScope}
                  onChange={(e) => setAlphabetical(e.target.checked)}
                />
              }
              label="Ordem alfabética"
            />
          </Grid>
          {isBadge && (
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={withQrCode}
                    onChange={(e) => setWithQrCode(e.target.checked)}
                  />
                }
                label="QR code"
              />
            </Grid>
          )}
          {isBadge && (
            <Grid item xs={12} md={4}>
              <SelectField
                label="Agrupar por"
                native={isMobile}
                value={groupBy}
                disabled={isBlankScope}
                onChange={(value) => setGroupBy(value as PdfGroupBy)}
                options={GROUP_BY_OPTIONS}
              />
            </Grid>
          )}
          {usesNames && (
            <Grid item xs={12} md={4}>
              <SelectField
                label="Formatação dos nomes"
                native={isMobile}
                value={nameCase}
                disabled={isBlankScope}
                onChange={(value) => setNameCase(value as PdfNameCase)}
                options={NAME_CASE_OPTIONS}
              />
            </Grid>
          )}
        </Grid>

        {isBadge && !withQrCode && (
          <Alert severity="warning">
            Sem QR code o crachá sai só com o nome, e a entrada não pode ser
            registrada pelo leitor — a conferência tem que ser na lista.
          </Alert>
        )}

        {isBadge && groupBy !== 'none' && !isBlankScope && (
          <Alert severity="info">
            O nome da {groupBy === 'team' ? 'equipe' : 'grupo de inscrição'} sai
            em letra minúscula no cabeçalho de todas as folhas, fora da área do
            crachá. Cada {groupBy === 'team' ? 'equipe' : 'grupo'} começa em uma
            folha nova.
          </Alert>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalGeneratePdf };
