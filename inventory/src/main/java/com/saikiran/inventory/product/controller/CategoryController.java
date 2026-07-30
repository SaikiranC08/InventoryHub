package com.saikiran.inventory.product.controller;


import com.saikiran.inventory.product.dto.response.CategoryAttributeResponse;
import com.saikiran.inventory.product.dto.response.CategoryResponse;
import com.saikiran.inventory.product.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Category lookup APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List categories", description = "Returns all product categories.")
    public ResponseEntity<List<CategoryResponse>> getCategories(){
        return ResponseEntity.ok(categoryService.getCategories());
    }

    @GetMapping("/{categoryId}/attributes")
    @Operation(summary = "List category attributes", description = "Returns the attributes for a category.")
    public ResponseEntity<List<CategoryAttributeResponse>> getCategoryAttributeKeys(
            @PathVariable
            @Parameter(description = "Category id", required = true, example = "3")
            Long categoryId){

        return ResponseEntity.ok(categoryService.getAttributes(categoryId));
    }

}
