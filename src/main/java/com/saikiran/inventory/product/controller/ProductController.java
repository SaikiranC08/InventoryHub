package com.saikiran.inventory.product.controller;

import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.enums.UnitType;
import com.saikiran.inventory.product.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;


    @GetMapping("/unit-types")
    public ResponseEntity<UnitType[]> getUnitTypes() {
        return ResponseEntity.ok(UnitType.values());
    }

    @PostMapping("/create-or-find")
    public ResponseEntity<ProductIdResponse> getOrCreateProductId(@RequestBody ProductIdRequest dto){

        return ResponseEntity.ok(productService.getOrCreateProductId(dto));

    }

    @PostMapping("/product-variant/create-or-find")
    public ResponseEntity<ProductVariantIdResponse> getOrCreateVariantId(@RequestBody ProductVariantIdRequest productVariantIdRequest){

        return ResponseEntity.ok(productService.getOrCreateProductVariantId(productVariantIdRequest));
    }

}
