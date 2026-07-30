package com.saikiran.inventory.product.dto.response;

import lombok.Builder;
import io.swagger.v3.oas.annotations.media.Schema;

@Builder
public record CategoryResponse(
        @Schema(description = "Category id", example = "3")
        Long categoryId,
        @Schema(description = "Category name", example = "Groceries")
        String categoryName
) {}
