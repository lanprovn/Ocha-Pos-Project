"use strict";
/**
 * Shared Types Package - Export all types
 *
 * This package contains TypeScript types shared between Frontend and Backend
 * to ensure type safety and consistency across the application.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Common types
__exportStar(require("./common.types"), exports);
// Product types
__exportStar(require("./product.types"), exports);
// Category types
__exportStar(require("./category.types"), exports);
// Order types
__exportStar(require("./order.types"), exports);
// Stock types
__exportStar(require("./stock.types"), exports);
// Socket.io types
__exportStar(require("./socket.types"), exports);
