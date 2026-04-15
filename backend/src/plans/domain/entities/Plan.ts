export enum PlanType {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export interface PlanProps {
  id?: number;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  maxUsers: number;
  isActive?: boolean;
  createdAt?: Date;
}

export interface PublicPlan {
  id: number;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  maxUsers: number;
  isActive: boolean;
  createdAt: Date;
}

export class Plan {
  readonly id: number | undefined;
  readonly name: string;
  readonly type: PlanType;
  readonly price: number;
  readonly description: string;
  readonly maxUsers: number;
  readonly isActive: boolean;
  readonly createdAt: Date;

  constructor(props: PlanProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.price = props.price;
    this.description = props.description;
    this.maxUsers = props.maxUsers;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  isAvailable(): boolean {
    return this.isActive;
  }

  toPublic(): PublicPlan {
    return {
      id: this.id ?? 0,
      name: this.name,
      type: this.type,
      price: this.price,
      description: this.description,
      maxUsers: this.maxUsers,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}
