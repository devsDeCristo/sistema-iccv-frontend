export interface paymentsWithRoles{
    eventId: string;
    eventName: string;
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


