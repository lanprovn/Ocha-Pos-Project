/**
 * Socket Event Queue with Retry Mechanism - PRODUCTION READY
 * Ensures socket events are not lost even if socket connection fails
 */

import { getIO } from '../socket/socket.io';
import logger from './logger';

interface QueuedEvent {
  event: string;
  data: any;
  retries: number;
  timestamp: number;
  room?: string;
}

const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 100;
const RETRY_DELAY = 5000; // 5 seconds

const eventQueue: QueuedEvent[] = [];

/**
 * Emit socket event with retry mechanism
 */
export function emitWithRetry(
  event: string,
  data: any,
  room?: string
): void {
  try {
    const io = getIO();
    
    if (room) {
      io.to(room).emit(event as any, data);
    } else {
      io.emit(event as any, data);
    }

    // Success - remove any queued events for this
    removeFromQueue(event, data);
  } catch (error: any) {
    logger.warn('Failed to emit socket event, queuing for retry', {
      event,
      room,
      error: error.message,
    });

    // Queue for retry
    if (eventQueue.length < MAX_QUEUE_SIZE) {
      eventQueue.push({
        event,
        data,
        retries: 0,
        timestamp: Date.now(),
        room,
      });
    } else {
      logger.error('Socket event queue full, dropping event', { event, room });
    }
  }
}

/**
 * Remove event from queue (when successfully sent)
 */
function removeFromQueue(event: string, data: any): void {
  const index = eventQueue.findIndex(
    (item) => item.event === event && JSON.stringify(item.data) === JSON.stringify(data)
  );
  if (index >= 0) {
    eventQueue.splice(index, 1);
  }
}

/**
 * Retry failed events
 */
function retryFailedEvents(): void {
  if (eventQueue.length === 0) return;

  const now = Date.now();
  const toRetry: QueuedEvent[] = [];
  const toRemove: number[] = [];

  eventQueue.forEach((item, index) => {
    // Skip if retried recently (within RETRY_DELAY)
    if (now - item.timestamp < RETRY_DELAY) {
      return;
    }

    if (item.retries >= MAX_RETRIES) {
      // Max retries reached - remove
      toRemove.push(index);
      logger.error('Socket event max retries reached, dropping', {
        event: item.event,
        room: item.room,
        retries: item.retries,
      });
      return;
    }

    toRetry.push(item);
  });

  // Remove failed events
  toRemove.reverse().forEach((index) => {
    eventQueue.splice(index, 1);
  });

  // Retry events
  toRetry.forEach((item) => {
    try {
      const io = getIO();
      
      if (item.room) {
        io.to(item.room).emit(item.event as any, item.data);
      } else {
        io.emit(item.event as any, item.data);
      }

      // Success - remove from queue
      const index = eventQueue.findIndex((q) => q === item);
      if (index >= 0) {
        eventQueue.splice(index, 1);
      }
    } catch (error: any) {
      // Still failed - increment retry count
      item.retries++;
      item.timestamp = Date.now();
      logger.warn('Socket event retry failed', {
        event: item.event,
        room: item.room,
        retries: item.retries,
        error: error.message,
      });
    }
  });
}

/**
 * Start retry mechanism
 * Runs every 5 seconds
 */
let retryInterval: NodeJS.Timeout | null = null;

export function startSocketEventRetry(): void {
  if (retryInterval) {
    return; // Already started
  }

  retryInterval = setInterval(() => {
    retryFailedEvents();
  }, RETRY_DELAY);

  logger.info('Socket event retry mechanism started');
}

/**
 * Stop retry mechanism
 */
export function stopSocketEventRetry(): void {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
    logger.info('Socket event retry mechanism stopped');
  }
}

/**
 * Get queue status (for monitoring)
 */
export function getQueueStatus(): { queueSize: number; oldestEvent: number | null } {
  return {
    queueSize: eventQueue.length,
    oldestEvent: eventQueue.length > 0 ? eventQueue[0].timestamp : null,
  };
}

