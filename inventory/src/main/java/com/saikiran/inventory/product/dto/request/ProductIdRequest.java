package com.saikiran.inventory.product.dto.request;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductIdRequest {
    @Schema(description = "Product name", requiredMode = Schema.RequiredMode.REQUIRED, example = "Rice")
    private String productName;
    @Schema(description = "Brand name", requiredMode = Schema.RequiredMode.REQUIRED, example = "Aashirvaad")
    private String brand;
    @Schema(description = "Category id", requiredMode = Schema.RequiredMode.REQUIRED, example = "3")
    private Long categoryId;
}
