package com.saikiran.inventory.product.service;

import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.entities.CategoryAttribute;
import com.saikiran.inventory.product.enums.AttributeDataType;
import com.saikiran.inventory.product.repository.categoryAttributeRepository;
import com.saikiran.inventory.product.repository.categoryRepository;

import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
@AllArgsConstructor
public class CategoryAttributeSeeder implements CommandLineRunner {

    private final categoryRepository categoryRepository;
    private final categoryAttributeRepository categoryAttributeRepository;

    @Override
    public void run(String... args) {

        if (categoryAttributeRepository.count() > 0) {
            return;
        }

        Category mobile = categoryRepository
                .findByCategoryName("Mobile")
                .orElseThrow();

        Category electronics = categoryRepository
                .findByCategoryName("Electronics")
                .orElseThrow();

        Category clothing = categoryRepository
                .findByCategoryName("Clothing")
                .orElseThrow();

        Category grocery = categoryRepository
                .findByCategoryName("Grocery")
                .orElseThrow();

        // Mobile
        saveAttribute(mobile, "ram", AttributeDataType.TEXT);
        saveAttribute(mobile, "storage", AttributeDataType.TEXT);
        saveAttribute(mobile, "color", AttributeDataType.TEXT);
        saveAttribute(mobile, "battery", AttributeDataType.TEXT);
        saveAttribute(mobile, "screen_size", AttributeDataType.TEXT);
        saveAttribute(mobile, "processor", AttributeDataType.TEXT);
        saveAttribute(mobile, "camera", AttributeDataType.TEXT);

        // Electronics
        saveAttribute(electronics, "brand", AttributeDataType.TEXT);
        saveAttribute(electronics, "model", AttributeDataType.TEXT);
        saveAttribute(electronics, "color", AttributeDataType.TEXT);
        saveAttribute(electronics, "warranty_months", AttributeDataType.NUMBER);
        saveAttribute(electronics, "power_rating", AttributeDataType.TEXT);

        // Clothing
        saveAttribute(clothing, "size", AttributeDataType.TEXT);
        saveAttribute(clothing, "color", AttributeDataType.TEXT);
        saveAttribute(clothing, "fabric", AttributeDataType.TEXT);
        saveAttribute(clothing, "gender", AttributeDataType.TEXT);
        saveAttribute(clothing, "fit_type", AttributeDataType.TEXT);

        // Grocery
        saveAttribute(grocery, "weight", AttributeDataType.NUMBER);
        saveAttribute(grocery, "unit", AttributeDataType.TEXT);
        saveAttribute(grocery, "brand", AttributeDataType.TEXT);
        saveAttribute(grocery, "expiry_required", AttributeDataType.BOOLEAN);
        saveAttribute(grocery, "organic", AttributeDataType.BOOLEAN);
    }

    private void saveAttribute(
            Category category,
            String attributeKey,
            AttributeDataType dataType
    ) {
        categoryAttributeRepository.save(
                new CategoryAttribute(
                        null,
                        attributeKey,
                        dataType,
                        category
                )
        );
    }
}