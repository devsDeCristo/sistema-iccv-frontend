import { Team } from '../../features/admin/events/types';
import { User } from '../../types/user';

export interface PdfProps {
  data: Team[];
  textFooter: string;
}
export interface UserRectangleProps {
  user: User;
}
export interface FooterProps {
  text: string;
}
