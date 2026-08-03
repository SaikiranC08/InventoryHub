package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.dto.StockMovementResponse;
import com.saikiran.inventory.inventory.entities.external.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
SELECT new com.saikiran.inventory.inventory.dto.StockMovementResponse(
    sm.stockMovementId,
    sm.quantity,
    sm.unitPrice,
    sm.totalPrice,
    CAST(sm.movementType AS string),
    CAST(sm.referenceType AS string),
    sm.referenceId,
    sm.remark,
    sm.createdAt,
    sm.inventory.inventoryId,
    sm.inventory.productVariant.sku,
    sm.inventory.productVariant.product.productName,
    sm.inventory.productVariant.product.brand,
    sm.inventory.productVariant.product.category.categoryName,
    sm.inventory.business.businessId,
    sm.inventory.business.businessName
)
FROM StockMovement sm
WHERE sm.inventory.business.businessId = :businessId
ORDER BY sm.createdAt DESC
""")
    List<StockMovementResponse> findMovementsByBusinessId(@Param("businessId") Long businessId);
}
