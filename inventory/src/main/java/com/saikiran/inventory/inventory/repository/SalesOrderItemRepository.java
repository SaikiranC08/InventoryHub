package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesOrderItemRepository extends JpaRepository<SalesOrderItem,Long> {
}
