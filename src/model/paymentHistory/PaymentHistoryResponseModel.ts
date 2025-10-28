export interface IPaymentHistoryResponse {
    id: number,
    transDate: string,
    recommenderPhone: string,
    amount: number,
    content: string,
    bill?: string,
}