import { IBillingStrategy } from './billing-strategy.interface';

const BASE_DISCOUNT = 0.15;
const VOLUME_DISCOUNT = 0.05;
const VOLUME_THRESHOLD = 10;

export class GoldStrategy implements IBillingStrategy {
  calculateAmount(
    planPrice: number,
    _startDate: Date,
    _endDate: Date,
    maxUsers = 0,
  ): number {
    const discount =
      maxUsers > VOLUME_THRESHOLD
        ? BASE_DISCOUNT + VOLUME_DISCOUNT
        : BASE_DISCOUNT;

    return planPrice * (1 - discount);
  }

  getPlanType(): string {
    return 'GOLD';
  }
}
