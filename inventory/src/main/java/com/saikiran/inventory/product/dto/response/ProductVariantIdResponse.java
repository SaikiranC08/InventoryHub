package com.saikiran.inventory.product.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record ProductVariantIdResponse(
        @Schema(description = "Product variant id", example = "200")
        Long id
) {
}
