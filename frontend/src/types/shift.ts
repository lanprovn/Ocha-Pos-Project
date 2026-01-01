export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Shift {
  id: string;
  shiftNumber: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string | null;
  openingCash: string;
  closingCash?: string | null;
  expectedCash?: string | null;
  variance?: string | null;
  status: ShiftStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftInput {
  userId: string;
  userName: string;
  openingCash: number;
  notes?: string | null;
}

export interface CloseShiftInput {
  closingCash: number;
  notes?: string | null;
}

export interface UpdateShiftInput {
  notes?: string | null;
}

export interface ShiftFilters {
  userId?: string;
  status?: ShiftStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ShiftSummary {
  shift: Shift;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  qrRevenue: number;
  totalTransactions: number;
}

export interface ShiftPaginationResponse {
  data: Shift[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}



