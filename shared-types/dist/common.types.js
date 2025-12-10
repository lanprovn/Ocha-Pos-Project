"use strict";
/**
 * Common types and enums shared between Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAlertType = exports.StockTransactionType = exports.UserRole = exports.OrderCreator = exports.PaymentStatus = exports.PaymentMethod = exports.OrderStatus = void 0;
// ===== Order Status =====
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATING"] = "CREATING";
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
// ===== Payment Types =====
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["QR"] = "QR";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// ===== Order Creator =====
var OrderCreator;
(function (OrderCreator) {
    OrderCreator["STAFF"] = "STAFF";
    OrderCreator["CUSTOMER"] = "CUSTOMER";
})(OrderCreator || (exports.OrderCreator = OrderCreator = {}));
// ===== User Role =====
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
// ===== Stock Transaction Types =====
var StockTransactionType;
(function (StockTransactionType) {
    StockTransactionType["SALE"] = "SALE";
    StockTransactionType["PURCHASE"] = "PURCHASE";
    StockTransactionType["ADJUSTMENT"] = "ADJUSTMENT";
    StockTransactionType["RETURN"] = "RETURN";
})(StockTransactionType || (exports.StockTransactionType = StockTransactionType = {}));
// ===== Stock Alert Types =====
var StockAlertType;
(function (StockAlertType) {
    StockAlertType["LOW_STOCK"] = "LOW_STOCK";
    StockAlertType["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    StockAlertType["OVERSTOCK"] = "OVERSTOCK";
})(StockAlertType || (exports.StockAlertType = StockAlertType = {}));
