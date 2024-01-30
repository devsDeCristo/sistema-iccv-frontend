import { User } from "../../types/user";

export interface PdfProps {
    data: User[];
    textFooter: string;
}
export interface UserRectangleProps {
    user: User;
}
export interface FooterProps {
    text: string;
}