package com.saikiran.inventory.product.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record ProductIdResponse(
        @Schema(description = "Product id", example = "100")
        Long productId
) {
}
