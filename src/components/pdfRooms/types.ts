import { Bedroom, EventDetails } from '../../features/admin/events/types';

export interface PdfRoomsProps {
  data: Bedroom[];
  event: EventDetails;
}
