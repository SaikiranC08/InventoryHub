package com.saikiran.inventory.inventory.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchProductResponse {

    @Schema(description = "Product variant id", example = "200")
    private Long productVariantId;
    @Schema(description = "Business id", example = "10")
    private Long businessId;
    @Schema(description = "Business name", example = "Sai Mart")
    private String businessName;
    @Schema(description = "Product name", example = "Rice")
    private String productName;
    @Schema(description = "SKU", example = "SKU-001")
    private String sku;
    @Schema(description = "Available quantity", example = "25")
    private Integer quantity;
    @Schema(description = "Current price", example = "120.50")
    private BigDecimal currentPrice;
}
