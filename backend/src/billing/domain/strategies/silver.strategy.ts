import { IBillingStrategy } from './billing-strategy.interface';

const DISCOUNT_RATE = 0.10;
const MONTHS_THRESHOLD = 6;

export class SilverStrategy implements IBillingStrategy {
  calculateAmount(planPrice: number, startDate: Date, endDate: Date): number {
    const months = this.monthsBetween(startDate, endDate);
    if (months > MONTHS_THRESHOLD) {
      return planPrice * (1 - DISCOUNT_RATE);
    }
    return planPrice;
  }

  getPlanType(): string {
    return 'SILVER';
  }

  private monthsBetween(start: Date, end: Date): number {
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    return years * 12 + months;
  }
}
