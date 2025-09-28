import {  Team } from '../../features/admin/events/types';
import { User } from '../../types/user';

export interface UserTeamPdf extends Team {
  usersLeaders: User[];
  usersMembers: User[];
}

export interface PdfTeamsProps {
  data: UserTeamPdf[];
}
