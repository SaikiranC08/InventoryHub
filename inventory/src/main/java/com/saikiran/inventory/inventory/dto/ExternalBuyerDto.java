package com.saikiran.inventory.inventory.dto;
import lombok.Builder;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Data
@Builder
public class ExternalBuyerDto {

    @Schema(hidden = true)
    private Long businessId;

    @Schema(description = "Customer name", requiredMode = Schema.RequiredMode.REQUIRED, example = "John")
    private String customerName;

    @Schema(description = "Product variant id", requiredMode = Schema.RequiredMode.REQUIRED, example = "200")
    private Long variantId;

    @Schema(description = "Quantity", requiredMode = Schema.RequiredMode.REQUIRED, example = "2")
    private Integer quantity;

    @Schema(description = "Unit price", requiredMode = Schema.RequiredMode.REQUIRED, example = "150.00")
    private BigDecimal unitPrice;

    @Schema(description = "Total price", requiredMode = Schema.RequiredMode.REQUIRED, example = "300.00")
    private BigDecimal totalPrice;

    @Schema(description = "Remark", example = "Sold at counter")
    private String remark;
}

