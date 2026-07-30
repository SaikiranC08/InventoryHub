package com.saikiran.inventory.product.dto.response;

import com.saikiran.inventory.product.enums.AttributeDataType;
import io.swagger.v3.oas.annotations.media.Schema;

public record CategoryAttributeResponse(
        @Schema(description = "Attribute key", example = "color")
        String attributKey,
        @Schema(description = "Attribute data type", example = "STRING")
        AttributeDataType dataType) {
}
