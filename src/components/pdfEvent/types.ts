import { Event } from "../../features/events/types";
import { User } from "../../types/user";

export interface PdfProps {
    data: Event[];
    textFooter: string;
}
export interface UserRectangleProps {
    user: User;
}
export interface FooterProps {
    text: string;
}