export interface paymentsWithRoles{
    eventId: string;
    eventName: string;
    /** A igreja dona deste evento cobra online? Ver `Church.modulePayment`. */
    modulePayment: boolean;
    data: object
    registeredRoles: RegisteredRole[];
    waitlistRoles: RegisteredRole[];
    /** compras de produto feitas depois da inscrição, cada uma com seu pagamento */
    productPurchases?: ProductPurchase[];
    
}
export interface RegisteredRole {
    roleId: string;
    description: string;
    group: string;
    price: number;
    paymentStatus: string;
    paymentMethod: string;
    /** produtos comprados junto deste ingresso */
    products?: {
        id: string;
        quantity: number;
        unitPrice: number;
        variant: { id: string; name: string; product: { id: string; name: string } };
    }[];
}



export interface ProductPurchase {
    /** id do pagamento: é por ele que a compra vai para o checkout */
    id: string;
    status: string;
    method: string;
    amount: number;
    createdAt: string;
    productItems: PaymentProductItemSummary[];
}
export type PaymentProductItemSummary = NonNullable<RegisteredRole['products']>[number];
