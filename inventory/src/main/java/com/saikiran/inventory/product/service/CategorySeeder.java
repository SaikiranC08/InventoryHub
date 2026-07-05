package com.saikiran.inventory.product.service;

import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.repository.categoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@RequiredArgsConstructor
public class CategorySeeder implements CommandLineRunner {

    private final categoryRepository categoryRepository;

    @Override
    public void run(String... args) {

        if (categoryRepository.count() > 0) {
            return;
        }

        categoryRepository.save(
                new Category(null, "Mobile", null, null));

        categoryRepository.save(
                new Category(null, "Clothing", null, null));

        categoryRepository.save(
                new Category(null, "Grocery", null, null));

        categoryRepository.save(
                new Category(null, "Electronics", null, null));
    }
}
