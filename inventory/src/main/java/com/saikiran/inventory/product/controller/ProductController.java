package com.saikiran.inventory.product.controller;

import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.enums.UnitType;
import com.saikiran.inventory.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product lookup and creation APIs")
public class ProductController {

    private final ProductService productService;


    @GetMapping("/unit-types")
    @Operation(summary = "List unit types", description = "Returns all available unit types.")
    public ResponseEntity<UnitType[]> getUnitTypes() {
        return ResponseEntity.ok(UnitType.values());
    }

    @PostMapping("/create-or-find")
    @Operation(summary = "Create or find a product", description = "Returns the existing product id or creates a new one.")
    public ResponseEntity<ProductIdResponse> getOrCreateProductId(@RequestBody ProductIdRequest dto){

        return ResponseEntity.ok(productService.getOrCreateProductId(dto));

    }

    @PostMapping("/product-variant/create-or-find")
    @Operation(summary = "Create or find a product variant", description = "Returns the existing variant id or creates a new one.")
    public ResponseEntity<ProductVariantIdResponse> getOrCreateVariantId(@RequestBody ProductVariantIdRequest productVariantIdRequest){

        return ResponseEntity.ok(productService.getOrCreateProductVariantId(productVariantIdRequest));
    }

}
