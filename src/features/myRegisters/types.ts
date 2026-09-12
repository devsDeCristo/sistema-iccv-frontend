export interface paymentsWithRoles{
    eventId: string;
    eventName: string;
    /** A igreja dona deste evento cobra online? Ver `Church.modulePayment`. */
    modulePayment: boolean;
    data: object
    registeredRoles: RegisteredRole[];
    waitlistRoles: RegisteredRole[];
    
}
export interface RegisteredRole {
    roleId: string;
    description: string;
    group: string;
    price: number;
    paymentStatus: string;
    paymentMethod: string;
}


