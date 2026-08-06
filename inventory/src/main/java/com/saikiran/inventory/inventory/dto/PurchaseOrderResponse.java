package com.saikiran.inventory.inventory.dto;

import com.saikiran.inventory.inventory.enums.OrderStatus;
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
public class PurchaseOrderResponse {
    private Long purchaseOrderId;
    private Long toBusinessId;
    private String toBusinessName;
    private String supplierName;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<PurchaseOrderItemResponse> items;
    private BigDecimal totalAmount;
}
