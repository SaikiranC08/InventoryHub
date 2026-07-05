package com.saikiran.inventory.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockRequestDto {
    private Long toBusinessId;
    private Long fromBusinessId;
    private Long productVariantId;

    private Integer quantity;
    private BigDecimal offeredUnitPrice;
    private BigDecimal offeredTotalPrice;

}
