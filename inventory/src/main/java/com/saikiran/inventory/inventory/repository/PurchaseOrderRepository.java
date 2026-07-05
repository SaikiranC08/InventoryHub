package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder,Long> {
}
