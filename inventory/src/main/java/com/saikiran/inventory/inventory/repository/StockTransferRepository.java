package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.internal.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer,Long> {
}
