import { Plan, PlanType } from '../../entities/Plan';

export interface CreatePlanInput {
  name: string;
  type: PlanType;
  price: number;
  description: string;
  maxUsers: number;
}

export interface UpdatePlanInput {
  name?: string;
  price?: number;
  description?: string;
  maxUsers?: number;
  isActive?: boolean;
}

export abstract class ICreatePlanUseCase {
  abstract execute(input: CreatePlanInput): Promise<Plan>;
}

export abstract class IGetAllPlansUseCase {
  abstract execute(): Promise<Plan[]>;
}

export abstract class IGetPlanByIdUseCase {
  abstract execute(id: number): Promise<Plan>;
}

export abstract class IUpdatePlanUseCase {
  abstract execute(id: number, input: UpdatePlanInput): Promise<Plan>;
}

export abstract class IDeletePlanUseCase {
  abstract execute(id: number): Promise<void>;
}
