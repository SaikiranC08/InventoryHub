package com.saikiran.inventory.product.repository;


import com.saikiran.inventory.product.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface productRepository extends JpaRepository<Product,Long> {
    Optional<Product> findProductByNormalizedName(String name);

    Optional<Product> findByProductId(Long productId);
}
