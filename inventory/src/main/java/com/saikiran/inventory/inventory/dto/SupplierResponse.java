package com.saikiran.inventory.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SupplierResponse {
    private String supplierName;
    private Boolean isB2bBusiness;
    private Long b2bBusinessId;
    private Long totalOrders;
    private BigDecimal totalSpend;
    private LocalDateTime lastOrderDate;
    private Integer suppliedProductsCount;
    private List<String> suppliedProducts;
    private List<PurchaseOrderResponse> recentOrders;
}
