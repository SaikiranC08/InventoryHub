package com.saikiran.inventory.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StockRequestResponse {
    @Schema(description = "Target business id", example = "20")
    private Long toBusinessId;
    @Schema(description = "Source business id", example = "10")
    private Long fromBusinessId;
    @Schema(description = "Product variant id", example = "200")
    private Long productVariantId;

    @Schema(description = "Quantity", example = "5")
    private Integer quantity;
    @Schema(description = "Offered unit price", example = "120.50")
    private BigDecimal offeredUnitPrice;
    @Schema(description = "Offered total price", example = "602.50")
    private BigDecimal offeredTotalPrice;
}
