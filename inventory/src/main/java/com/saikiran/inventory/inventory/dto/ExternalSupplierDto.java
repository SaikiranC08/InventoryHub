package com.saikiran.inventory.inventory.dto;


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
public class ExternalSupplierDto {
    @Schema(hidden = true)
    private Long toBusinessId;

    @Schema(description = "Supplier name", requiredMode = Schema.RequiredMode.REQUIRED, example = "ABC Traders")
    private String supplierName;

    @Schema(description = "Supplier business id", example = "20")
    private Long fromBusinessId;

    @Schema(description = "Stock status", example = "RECEIVED")
    private String status;

    @Schema(description = "Reorder level", example = "10")
    private int reorderLevel;

    @Schema(description = "Product name", requiredMode = Schema.RequiredMode.REQUIRED, example = "Rice")
    private String productName;

    @Schema(description = "Brand", requiredMode = Schema.RequiredMode.REQUIRED, example = "Aashirvaad")
    private String brand;

    @Schema(description = "Category id", requiredMode = Schema.RequiredMode.REQUIRED, example = "3")
    private Long categoryId;

    @Schema(description = "Product id", example = "100")
    private Long productId;

    @Schema(description = "SKU", requiredMode = Schema.RequiredMode.REQUIRED, example = "SKU-001")
    private String sku;

    @Schema(description = "Unit type", requiredMode = Schema.RequiredMode.REQUIRED, example = "KG")
    private UnitType unitType;

    @Schema(description = "Unit value", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private BigDecimal unitValue;

    @Schema(description = "Current price", requiredMode = Schema.RequiredMode.REQUIRED, example = "120.50")
    private BigDecimal currentPrice;

    @Schema(description = "Additional attributes")
    private Map<String, Object> attributes;

    @Schema(description = "Quantity", requiredMode = Schema.RequiredMode.REQUIRED, example = "5")
    private Integer quantity;

    @Schema(description = "Unit price", requiredMode = Schema.RequiredMode.REQUIRED, example = "120.50")
    private BigDecimal unitPrice;

    @Schema(description = "Total price", requiredMode = Schema.RequiredMode.REQUIRED, example = "602.50")
    private BigDecimal totalPrice;

    @Schema(description = "Remark", example = "Initial stock")
    private String remark;
}
