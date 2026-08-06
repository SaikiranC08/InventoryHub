package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem, Long> {
    List<SalesOrderItem> findBySalesOrder_SalesOrderId(Long salesOrderId);
}
