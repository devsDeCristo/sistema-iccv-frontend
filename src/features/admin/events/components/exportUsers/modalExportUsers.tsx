import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { EventDetails, Team } from '../../types';
import { User } from '../../../../../types/user';
import {
  ALL_GROUPS,
  CUSTOM_TEMPLATE_ID,
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
  GROUPING_OPTIONS,
  ORIENTATION_OPTIONS,
  PDF_TEMPLATES,
  SORT_OPTIONS,
} from './constants';
import { buildFileName, exportCsv, exportXlsx } from './exportFile';
import { PdfUsersExport } from './pdfUsersExport';
import {
  ExportFormat,
  ExportGrouping,
  ExportOrientation,
  ExportScope,
  ExportSort,
} from './types';
import {
  buildGroups,
  buildLeaderByTeam,
  buildSheetData,
  filterByBirthdayMonths,
  filterByRegistrationGroup,
  getColumns,
  getEventMonths,
  withTeamRole,
} from './utils';

interface ModalExportUsersProps {
  open: boolean;
  format: ExportFormat | null;
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

const FORMAT_LABEL: Record<ExportFormat, string> = {
  csv: '.csv',
  xlsx: '.xlsx',
  pdf: '.pdf',
};

function ModalExportUsers({
  open,
  format,
  onClose,
  event,
  teams,
  allUsers,
  filteredUsers,
  selectedUsers,
}: ModalExportUsersProps) {
  const isPdf = format === 'pdf';

  const [scope, setScope] = useState<ExportScope>('filtered');
  const [templateId, setTemplateId] = useState<string>(CUSTOM_TEMPLATE_ID);
  const [grouping, setGrouping] = useState<ExportGrouping>('none');
  const [registrationGroup, setRegistrationGroup] =
    useState<string>(ALL_GROUPS);
  const [sort, setSort] = useState<ExportSort>('alphabetical');
  const [orientation, setOrientation] =
    useState<ExportOrientation>('landscape');
  const [showLeader, setShowLeader] = useState(true);
  const [fields, setFields] = useState<string[]>(DEFAULT_EXPORT_COLUMNS);
  const [isExporting, setIsExporting] = useState(false);

  // cada abertura recomeça do padrão, senão sobra a configuração anterior
  useEffect(() => {
    if (!open) return;
    setScope(selectedUsers.length > 0 ? 'selected' : 'filtered');
    setTemplateId(CUSTOM_TEMPLATE_ID);
    setGrouping('none');
    setRegistrationGroup(ALL_GROUPS);
    setSort('alphabetical');
    setOrientation('landscape');
    setShowLeader(true);
    setFields(DEFAULT_EXPORT_COLUMNS);
  }, [open]);

  const template = PDF_TEMPLATES.find((item) => item.id === templateId);

  function onChangeTemplate(id: string) {
    setTemplateId(id);
    const selected = PDF_TEMPLATES.find((item) => item.id === id);
    if (!selected) return;
    // o modelo apenas pré-preenche: tudo continua editável
    setGrouping(selected.grouping);
    setSort(selected.sort);
    setFields(selected.columns);
  }

  const groupNames = useMemo(
    () => (event?.groupRoles ?? []).map((group) => group.name),
    [event]
  );

  const usersByScope: Record<ExportScope, User[]> = {
    selected: selectedUsers,
    filtered: filteredUsers,
    all: allUsers,
  };

  /** Usuários finais já com função na equipe e filtros do modal aplicados */
  const resolvedUsers = useMemo(() => {
    let users = withTeamRole(usersByScope[scope] ?? [], teams);

    if (isPdf) {
      users = filterByRegistrationGroup(users, registrationGroup);

      if (template?.onlyBirthdaysInEventMonths) {
        users = filterByBirthdayMonths(
          users,
          getEventMonths(event?.startDate, event?.endDate)
        );
      }
    }

    return users;
  }, [
    scope,
    teams,
    isPdf,
    registrationGroup,
    template,
    event,
    allUsers,
    filteredUsers,
    selectedUsers,
  ]);

  function toggleField(field: string) {
    setFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  }

  async function onExport() {
    if (fields.length === 0) {
      toast.error('Selecione ao menos uma coluna para exportar.');
      return;
    }
    if (resolvedUsers.length === 0) {
      toast.error('Nenhum usuário encontrado para os filtros selecionados.');
      return;
    }

    const columns = getColumns(fields);
    const eventName = event?.name ?? 'Evento';
    setIsExporting(true);

    try {
      if (format === 'pdf') {
        // o líder sai do elenco completo da equipe, não dos usuários filtrados
        const leaderByTeam =
          grouping === 'team' && showLeader
            ? buildLeaderByTeam(teams)
            : undefined;
        const groups = buildGroups(resolvedUsers, grouping, sort, {
          leaderByTeam,
        });
        const groupingLabel = GROUPING_OPTIONS.find(
          (option) => option.value === grouping
        )?.label;
        const subtitle = [
          `${resolvedUsers.length} registro(s)`,
          grouping !== 'none' ? `Agrupado: ${groupingLabel}` : null,
          registrationGroup !== ALL_GROUPS
            ? `Grupo: ${registrationGroup}`
            : null,
        ]
          .filter(Boolean)
          .join('  •  ');

        const blob = await pdf(
          <PdfUsersExport
            eventName={eventName}
            subtitle={subtitle}
            groups={groups}
            columns={columns}
            markLeaders={grouping === 'team'}
            orientation={orientation}
            logo={event?.data?.logoBase64}
          />
        ).toBlob();

        FileSaver.saveAs(blob, buildFileName(eventName, 'pdf'));
      } else {
        const data = buildSheetData(resolvedUsers, columns);

        if (format === 'xlsx') {
          exportXlsx(data, buildFileName(eventName, 'xlsx'));
        } else {
          exportCsv(data, buildFileName(eventName, 'csv'));
        }
      }

      onClose();
    } catch (error) {
      toast.error('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {`Exportar ${format ? FORMAT_LABEL[format] : ''}`}
      </DialogTitle>

      <DialogContent dividers>
        <Stack gap={3}>
          {isPdf && (
            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <RadioGroup
                value={templateId}
                onChange={(e) => onChangeTemplate(e.target.value)}
              >
                {PDF_TEMPLATES.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    value={item.id}
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body2">{item.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
                <FormControlLabel
                  value={CUSTOM_TEMPLATE_ID}
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2">Personalizado</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Monte o agrupamento e as colunas do zero.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          )}

          {isPdf && <Divider />}

          <FormControl>
            <FormLabel>Registros a exportar</FormLabel>
            <RadioGroup
              value={scope}
              onChange={(e) => setScope(e.target.value as ExportScope)}
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
            </RadioGroup>
          </FormControl>

          {isPdf && (
            <>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="export-grouping">Agrupamento</InputLabel>
                    <Select
                      labelId="export-grouping"
                      label="Agrupamento"
                      value={grouping}
                      onChange={(e) =>
                        setGrouping(e.target.value as ExportGrouping)
                      }
                    >
                      {GROUPING_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="export-group">
                      Grupo de inscrição
                    </InputLabel>
                    <Select
                      labelId="export-group"
                      label="Grupo de inscrição"
                      value={registrationGroup}
                      onChange={(e) => setRegistrationGroup(e.target.value)}
                    >
                      <MenuItem value={ALL_GROUPS}>Todos</MenuItem>
                      {groupNames.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="export-sort">Ordenação</InputLabel>
                    <Select
                      labelId="export-sort"
                      label="Ordenação"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as ExportSort)}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="export-orientation">Orientação</InputLabel>
                    <Select
                      labelId="export-orientation"
                      label="Orientação"
                      value={orientation}
                      onChange={(e) =>
                        setOrientation(e.target.value as ExportOrientation)
                      }
                    >
                      {ORIENTATION_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {grouping === 'team' && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={showLeader}
                          onChange={(e) => setShowLeader(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Mostrar líder ao lado do nome da equipe
                        </Typography>
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}

          <Divider />

          <FormControl>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>{`Colunas (${fields.length})`}</FormLabel>
              <Button
                size="small"
                onClick={() =>
                  setFields(
                    fields.length === EXPORT_COLUMNS.length
                      ? []
                      : EXPORT_COLUMNS.map((column) => column.field)
                  )
                }
              >
                {fields.length === EXPORT_COLUMNS.length
                  ? 'Limpar todas'
                  : 'Selecionar todas'}
              </Button>
            </Stack>
            <Grid container>
              {EXPORT_COLUMNS.map((column) => (
                <Grid item xs={12} sm={6} md={4} key={column.field}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={fields.includes(column.field)}
                        onChange={() => toggleField(column.field)}
                      />
                    }
                    label={
                      <Typography variant="body2">{column.label}</Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onExport} disabled={isExporting}>
          {isExporting ? 'Gerando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { ModalExportUsers };
