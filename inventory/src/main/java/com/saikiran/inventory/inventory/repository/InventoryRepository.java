package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.dto.InventoryResponse;
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
    List<Inventory> findByBusiness_BusinessId(Long businessId);

    @Query("""
SELECT new com.saikiran.inventory.inventory.dto.InventoryResponse(
    i.inventoryId,
    i.quantity,
    i.reorderLevel,
    i.createdAt,
    i.updatedAt,
    i.productVariant.variantId,
    i.productVariant.sku,
    i.productVariant.unitType,
    i.productVariant.unitValue,
    i.productVariant.currentPrice,
    i.productVariant.product.productName,
    i.productVariant.product.brand,
    i.productVariant.product.category.categoryName,
    i.business.businessId
)
FROM Inventory i
WHERE i.business.businessId = :businessId
""")
    List<InventoryResponse> findInventoryResponseByBusinessId(@Param("businessId") Long businessId);



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

