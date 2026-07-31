package com.saikiran.inventory.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryResponse {
    private Long totalProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    private Long pendingStockRequests;
    private Long todayPurchaseOrders;
    private Long todaySalesOrders;
    private Long monthlyPurchaseOrders;
    private Long monthlySalesOrders;
    private Long completedTransfers;
}
