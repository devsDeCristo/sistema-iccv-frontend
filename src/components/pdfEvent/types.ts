import { EventDetails, Team } from '../../features/admin/events/types';
import { User } from '../../types/user';

export interface PdfProps {
  data: Team[];
  textFooter?: string;
  event: EventDetails; // Replace 'any' with the actual type for eventData
}
export interface UserRectangleProps {
  user: User;
}
export interface FooterProps {
  text: string;
}
