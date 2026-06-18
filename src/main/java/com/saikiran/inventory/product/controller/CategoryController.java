package com.saikiran.inventory.product.controller;


import com.saikiran.inventory.product.dto.response.CategoryAttributeResponse;
import com.saikiran.inventory.product.dto.response.CategoryResponse;
import com.saikiran.inventory.product.service.CategoryService;
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
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(){
        return ResponseEntity.ok(categoryService.getCategories());
    }

    @GetMapping("/{categoryId}/attributes")
    public ResponseEntity<List<CategoryAttributeResponse>> getCategoryAttributeKeys(@PathVariable Long categoryId){

        return ResponseEntity.ok(categoryService.getAttributes(categoryId));
    }

}
