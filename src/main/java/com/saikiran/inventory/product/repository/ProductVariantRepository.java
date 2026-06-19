package com.saikiran.inventory.product.repository;

import com.saikiran.inventory.product.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant,Long> {

    Optional<ProductVariant> findByProductProductIdAndVariantSignature(Long productId,String variantSignature);
    Optional<ProductVariant> findProductVariantByVariantId(Long variantId);
}
