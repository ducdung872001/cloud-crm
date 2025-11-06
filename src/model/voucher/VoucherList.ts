export interface IPromotion {
    id?: number;
    name?: string;
    startTime?: string;      
    endTime?: string;
    applyType?: number;
    minAmount?: number;
    perAmount?: number;
    promotionType?: number;
    discount?: number;
    discountType?: number;
    status?: number;
    employeeId?: number;
    branchId?: number;
    bsnId?: number;
}
