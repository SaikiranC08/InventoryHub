package com.saikiran.inventory.inventory.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockRequestDto {
    @Schema(description = "Target business id", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private Long toBusinessId;

    @Schema(hidden = true)
    private Long fromBusinessId;

    @Schema(description = "Product variant id", requiredMode = Schema.RequiredMode.REQUIRED, example = "200")
    private Long productVariantId;

    @Schema(description = "Quantity", requiredMode = Schema.RequiredMode.REQUIRED, example = "5")
    private Integer quantity;

    @Schema(description = "Offered unit price", requiredMode = Schema.RequiredMode.REQUIRED, example = "120.50")
    private BigDecimal offeredUnitPrice;

    @Schema(description = "Offered total price", requiredMode = Schema.RequiredMode.REQUIRED, example = "602.50")
    private BigDecimal offeredTotalPrice;

}
