package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.external.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement,Long> {
}
