-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_items_orderId_productId_idx" ON "order_items"("orderId", "productId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_customerPhone_idx" ON "orders"("customerPhone");

-- CreateIndex
CREATE INDEX "orders_orderCreator_idx" ON "orders"("orderCreator");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isAvailable_idx" ON "products"("isAvailable");

-- CreateIndex
CREATE INDEX "products_isPopular_idx" ON "products"("isPopular");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "products_categoryId_isAvailable_idx" ON "products"("categoryId", "isAvailable");

-- CreateIndex
CREATE INDEX "stock_alerts_isRead_idx" ON "stock_alerts"("isRead");

-- CreateIndex
CREATE INDEX "stock_alerts_timestamp_idx" ON "stock_alerts"("timestamp");

-- CreateIndex
CREATE INDEX "stock_alerts_type_idx" ON "stock_alerts"("type");

-- CreateIndex
CREATE INDEX "stock_alerts_productId_isRead_idx" ON "stock_alerts"("productId", "isRead");

-- CreateIndex
CREATE INDEX "stock_alerts_ingredientId_isRead_idx" ON "stock_alerts"("ingredientId", "isRead");

-- CreateIndex
CREATE INDEX "stock_transactions_timestamp_idx" ON "stock_transactions"("timestamp");

-- CreateIndex
CREATE INDEX "stock_transactions_type_idx" ON "stock_transactions"("type");

-- CreateIndex
CREATE INDEX "stock_transactions_productId_timestamp_idx" ON "stock_transactions"("productId", "timestamp");

-- CreateIndex
CREATE INDEX "stock_transactions_ingredientId_timestamp_idx" ON "stock_transactions"("ingredientId", "timestamp");

-- CreateIndex
CREATE INDEX "stock_transactions_userId_idx" ON "stock_transactions"("userId");
