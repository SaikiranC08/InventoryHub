package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder,Long> {
        SalesOrder save(SalesOrder salesOrder);
    }

