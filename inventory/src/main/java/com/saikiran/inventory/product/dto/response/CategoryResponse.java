package com.saikiran.inventory.product.dto.response;

import lombok.Builder;

@Builder
public record CategoryResponse(
        Long categoryId,
        String categoryName
) {}
