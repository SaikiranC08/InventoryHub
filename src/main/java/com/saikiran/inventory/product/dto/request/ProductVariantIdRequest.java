package com.saikiran.inventory.product.dto.request;


import com.saikiran.inventory.product.enums.UnitType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantIdRequest {

    private Long productId;

    private String sku;

    private UnitType unitType;

    private int unitValue;

    private BigDecimal currentPrice;

    private Map<String, Object> attributes;
}
