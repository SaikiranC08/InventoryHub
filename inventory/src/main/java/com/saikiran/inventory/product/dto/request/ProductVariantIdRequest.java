package com.saikiran.inventory.product.dto.request;


import com.saikiran.inventory.product.enums.UnitType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantIdRequest {

    @Schema(description = "Product id", requiredMode = Schema.RequiredMode.REQUIRED, example = "100")
    private Long productId;

    @Schema(description = "SKU", requiredMode = Schema.RequiredMode.REQUIRED, example = "SKU-001")
    private String sku;

    @Schema(description = "Unit type", requiredMode = Schema.RequiredMode.REQUIRED, example = "KG")
    private UnitType unitType;

    @Schema(description = "Unit value", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private BigDecimal unitValue;

    @Schema(description = "Current price", requiredMode = Schema.RequiredMode.REQUIRED, example = "120.50")
    private BigDecimal currentPrice;

    @Schema(description = "Variant attributes")
    private Map<String, Object> attributes;
}
