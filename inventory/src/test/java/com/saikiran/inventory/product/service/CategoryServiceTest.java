package com.saikiran.inventory.product.service;



import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.saikiran.inventory.product.repository.categoryAttributeRepository;
import com.saikiran.inventory.product.repository.categoryRepository;
import com.saikiran.inventory.product.dto.response.CategoryAttributeResponse;
import com.saikiran.inventory.product.dto.response.CategoryResponse;
import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.entities.CategoryAttribute;
import com.saikiran.inventory.product.enums.AttributeDataType;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {
    
    @InjectMocks
    private CategoryService categoryService;

    @Mock
    private categoryRepository categoryRepository;
    @Mock
    private categoryAttributeRepository categoryAttributeRepository;

    @Test
    void shouldGetCategories(){
        Category category = Category.builder().categoryId(1L).categoryName("Clothing").build();

    
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        List<CategoryResponse> result = categoryService.getCategories();

        assertEquals(1L, result.get(0).categoryId());
        verify(categoryRepository).findAll();

    }

    @Test
    void shouldGetAttributies(){
        CategoryAttribute categoryAttribute = CategoryAttribute.builder().categoryAttributeId(1L)
                                                .dataType(AttributeDataType.NUMBER)
                                                .attributeKey("weight")
                                                .build();

        when(categoryAttributeRepository.findByCategoryCategoryId(anyLong())).thenReturn(List.of(categoryAttribute));
        List<CategoryAttributeResponse> result = categoryService.getAttributes(anyLong());

        assertEquals("weight", result.get(0).attributKey());

        verify(categoryAttributeRepository)
        .findByCategoryCategoryId(anyLong());
    }

}
