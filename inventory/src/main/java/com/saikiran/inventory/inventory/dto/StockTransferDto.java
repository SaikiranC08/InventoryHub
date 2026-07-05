package com.saikiran.inventory.inventory.dto;

import com.saikiran.inventory.inventory.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockTransferDto {
    private Long toBusinessId;
    private Long fromBusinessId;
    private Long productVariantId;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private OrderStatus orderStatus;
}
