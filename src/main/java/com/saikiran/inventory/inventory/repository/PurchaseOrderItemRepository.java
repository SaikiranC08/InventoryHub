package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem,Long> {
}
