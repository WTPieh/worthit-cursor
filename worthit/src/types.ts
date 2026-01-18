export type IncomeType = 'hourly' | 'salary';

export type User = {
  incomeType: IncomeType;
  hourlyRate: number;
  salary?: number;
  hoursPerWeek?: number;
  taxEnabled: boolean;
  taxRate: number; // 0.0 - 1.0
  netHourlyRate: number; // computed and stored for convenience
};

export type ItemStatus = 'pending' | 'bought' | 'passed';

export type Item = {
  id: string;
  price: number;
  hoursRequired: number;
  createdAt: string; // ISO string
  status: ItemStatus;
  reminderAt?: string; // ISO string
  note?: string;
  link?: string;
};

export type AppState = {
  user: User | null;
  items: Item[];
};

export type FilterStatus = 'all' | ItemStatus;

