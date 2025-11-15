/**
 * Order State Machine - PRODUCTION READY
 * Ensures valid order status transitions and prevents invalid states
 */

export type OrderStatus = 
  | 'CREATING' 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'COMPLETED' 
  | 'CANCELLED';

/**
 * Valid state transitions
 */
const ORDER_STATE_MACHINE: Record<OrderStatus, OrderStatus[]> = {
  CREATING: ['PENDING', 'CANCELLED'],
  PENDING: ['CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'], // COMPLETED allowed for verified payments (QR/Cash)
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state - no transitions allowed
  CANCELLED: [], // Terminal state - no transitions allowed
};

/**
 * Check if a state transition is valid
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (!ORDER_STATE_MACHINE[from]) {
    return false;
  }
  return ORDER_STATE_MACHINE[from].includes(to);
}

/**
 * Validate order state transition
 * Throws error if transition is invalid
 */
export function validateTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid order status transition: Cannot transition from "${from}" to "${to}". ` +
      `Valid transitions from "${from}": ${ORDER_STATE_MACHINE[from].join(', ') || 'none (terminal state)'}`
    );
  }
}

/**
 * Get valid next states for a given state
 */
export function getValidNextStates(current: OrderStatus): OrderStatus[] {
  return ORDER_STATE_MACHINE[current] || [];
}

/**
 * Check if state is terminal (no more transitions allowed)
 */
export function isTerminalState(state: OrderStatus): boolean {
  return ORDER_STATE_MACHINE[state]?.length === 0;
}

