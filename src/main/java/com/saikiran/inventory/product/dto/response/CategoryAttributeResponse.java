package com.saikiran.inventory.product.dto.response;

import com.saikiran.inventory.product.enums.AttributeDataType;

public record CategoryAttributeResponse (String attributKey, AttributeDataType dataType){
}
