package com.saikiran.inventory.inventory.dto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExternalBuyerDto {

    private Long businessId;

    private String customerName;

    private Long variantId;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private String remark;
}


