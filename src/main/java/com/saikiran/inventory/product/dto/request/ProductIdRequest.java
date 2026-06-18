package com.saikiran.inventory.product.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductIdRequest {
    private String productName;
    private String brand;
    private Long categoryId;
}
