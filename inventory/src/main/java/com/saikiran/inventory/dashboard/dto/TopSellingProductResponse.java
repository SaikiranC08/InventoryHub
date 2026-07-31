package com.saikiran.inventory.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopSellingProductResponse {
    private Long productVariantId;
    private String productName;
    private String sku;
    private Long totalQuantitySold;
}
