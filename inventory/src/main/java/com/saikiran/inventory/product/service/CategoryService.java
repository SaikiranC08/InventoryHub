package com.saikiran.inventory.product.service;

import com.saikiran.inventory.product.dto.response.CategoryAttributeResponse;
import com.saikiran.inventory.product.dto.response.CategoryResponse;
import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.entities.CategoryAttribute;
import com.saikiran.inventory.product.repository.categoryAttributeRepository;
import com.saikiran.inventory.product.repository.categoryRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class CategoryService {

    private final categoryRepository categoryRepository;
    private final categoryAttributeRepository categoryAttributeRepository;


    public List<CategoryResponse> getCategories(){
        log.debug("Fetching categories");
        List<Category> data = categoryRepository.findAll();
        log.debug("Found {} categories", data.size());

        return data.stream()
                .map(category -> new CategoryResponse(category.getCategoryId(), category.getCategoryName()))
                .toList();
    }

    public List<CategoryAttributeResponse> getAttributes(Long id){
        log.debug("Fetching category attributes for categoryId={}", id);
        List<CategoryAttribute> data = categoryAttributeRepository.findByCategoryCategoryId(id);
        log.debug("Found {} attributes for categoryId={}", data.size(), id);

        return data.stream()
                .map(categoryAttribute -> new CategoryAttributeResponse(categoryAttribute.getAttributeKey(),categoryAttribute.getDataType()))
                .toList();

    }
}
