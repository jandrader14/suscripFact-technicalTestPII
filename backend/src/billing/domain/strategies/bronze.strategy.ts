import { IBillingStrategy } from './billing-strategy.interface';

export class BronzeStrategy implements IBillingStrategy {
  calculateAmount(planPrice: number): number {
    return planPrice;
  }

  getPlanType(): string {
    return 'BRONZE';
  }
}
