//import { Event } from "../../features/events/types";
import { EventDetails } from "../../features/admin/events/types";
import { User } from "../../types/user";

export interface PdfProps {
    data: User[] ;
    event: EventDetails;
}