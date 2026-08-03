package com.saikiran.inventory.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockMovementResponse {
    private Long stockMovementId;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String movementType;
    private String referenceType;
    private Long referenceId;
    private String remark;
    private LocalDateTime createdAt;

    // from inventory → productVariant
    private Long inventoryId;
    private String sku;
    private String productName;
    private String brand;
    private String categoryName;

    // from inventory → business
    private Long businessId;
    private String businessName;
}
