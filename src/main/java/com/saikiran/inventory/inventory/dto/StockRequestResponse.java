package com.saikiran.inventory.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StockRequestResponse {
    private Long toBusinessId;
    private Long fromBusinessId;
    private Long productVariantId;

    private Integer quantity;
    private BigDecimal offeredUnitPrice;
    private BigDecimal offeredTotalPrice;
}
