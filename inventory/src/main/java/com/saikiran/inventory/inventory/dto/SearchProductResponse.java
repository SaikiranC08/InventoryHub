package com.saikiran.inventory.inventory.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.BigInteger;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchProductResponse {

    private Long productVariantId;
    private Long businessId;
    private String businessName;
    private String productName;
    private String sku;
    private Integer quantity;
    private BigDecimal currentPrice;
}
