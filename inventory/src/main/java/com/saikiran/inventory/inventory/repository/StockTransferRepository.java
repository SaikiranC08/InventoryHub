package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.internal.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    List<StockTransfer> findByToBusiness_BusinessIdOrderByCreatedAtDesc(Long toBusinessId);
}
