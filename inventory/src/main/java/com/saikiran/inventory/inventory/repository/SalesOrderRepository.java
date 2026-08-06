package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByFromBusiness_BusinessIdOrderByCreatedAtDesc(Long businessId);
}

