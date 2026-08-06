package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByToBusiness_BusinessIdOrderByCreatedAtDesc(Long businessId);
}
