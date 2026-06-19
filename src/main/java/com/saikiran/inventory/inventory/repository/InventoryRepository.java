package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository  extends JpaRepository<Inventory,Long> {
    Optional<Inventory> findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(Long businessBusinessId, Long productVariantVariantId);
}
