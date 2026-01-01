/**
 * Shift Management related types
 */

import { Timestamped } from './common.types';

// ===== Shift Status =====
export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// ===== Shift (Backend API Response) =====
export interface Shift extends Timestamped {
  id: string;
  shiftNumber: string;
  userId: string;
  userName: string;
  startTime: Date | string;
  endTime?: Date | string | null;
  openingCash: number;
  closingCash?: number | null;
  expectedCash?: number | null;
  variance?: number | null;
  status: ShiftStatus;
  notes?: string | null;
}

// ===== Shift Input Types =====
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

// ===== Shift Summary =====
export interface ShiftSummary {
  shift: Shift;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  qrRevenue: number;
  totalTransactions: number;
}



