package com.saikiran.inventory.inventory.dto;


import com.saikiran.inventory.product.enums.UnitType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExternalSupplierDto {
    private Long toBusinessId;
    private String supplierName;
    private Long fromBusinessId;
    private String status;

    //inventory
    private int reorderLevel;


    //product
    private String productName;
    private String brand;
    private Long categoryId;
    //product variant
    private Long productId;
    private String sku;
    private UnitType unitType;
    private BigDecimal unitValue;
    private BigDecimal currentPrice;
    private Map<String, Object> attributes;

    //items

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    //stock movement
    private String remark;


    //product id , product variant id and purchaseOrderId will generate on service layer
}
