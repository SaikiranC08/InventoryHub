package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.dto.SearchProductResponse;
import com.saikiran.inventory.inventory.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository  extends JpaRepository<Inventory,Long> {
    Optional<Inventory> findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(Long businessBusinessId, Long productVariantVariantId);

    @Query("""
SELECT new com.saikiran.inventory.inventory.dto.SearchProductResponse(
    i.productVariant.variantId,
    i.business.businessId,
    i.business.businessName,
    i.productVariant.product.productName,
    i.productVariant.sku,
    i.quantity,
    i.productVariant.currentPrice
)
FROM Inventory i
WHERE i.productVariant.product.productId = :productId
AND i.quantity > 0
""")
    List<SearchProductResponse> findAvailableBusinessesByProductId(@Param("productId") Long productId);

}
