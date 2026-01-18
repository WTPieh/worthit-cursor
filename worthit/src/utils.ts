export const formatCurrency = (value: number): string => {
  if (!isFinite(value)) return '$0.00';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
};

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

export const roundTo = (val: number, decimals: number): number => {
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
};

export const calculateNetHourly = (
  incomeType: 'hourly' | 'salary',
  hourlyRate: number,
  salary?: number,
  hoursPerWeek?: number,
  taxEnabled: boolean = true,
  taxRate: number = 0.25
): number => {
  if (incomeType === 'hourly') {
    const gross = hourlyRate;
    return taxEnabled ? gross * (1 - taxRate) : gross;
  }
  const annual = salary ?? 0;
  const hours = (hoursPerWeek ?? 40) * 52;
  const grossHourly = hours > 0 ? annual / hours : 0;
  return taxEnabled ? grossHourly * (1 - taxRate) : grossHourly;
};

export const computeHoursRequired = (price: number, netHourly: number): number => {
  if (netHourly <= 0) return 0;
  return price / netHourly;
};

export const describeEffort = (hoursRequired: number): string => {
  if (hoursRequired <= 0.25) return '☕ A coffee break worth of work';
  if (hoursRequired <= 2) return '🧰 A couple hours of effort';
  if (hoursRequired <= 8) return '📅 A full work day';
  if (hoursRequired <= 40) return '📆 A full work week';
  if (hoursRequired <= 160) return '🗓️ About a month of grind';
  return '🏔️ A serious time investment';
};

export const humanizeHours = (hours: number): string => {
  if (hours < 8) return `${roundTo(hours, 2)} hours`;
  const days = hours / 8;
  if (days < 5) return `${roundTo(days, 2)} days`;
  const weeks = days / 5;
  return `${roundTo(weeks, 2)} weeks`;
};

export const nowIso = (): string => new Date().toISOString();

export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

