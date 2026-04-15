export interface IBillingStrategy {
  calculateAmount(
    planPrice: number,
    startDate: Date,
    endDate: Date,
    maxUsers?: number,
  ): number;
  getPlanType(): string;
}
