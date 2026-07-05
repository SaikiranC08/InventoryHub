package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRequestRepository extends JpaRepository<StockRequest,Long> {

    List<StockRequest> findStockRequestByToBusiness_BusinessIdAndStatus(Long id,StockRequestStatus status);

    Optional<StockRequest> findByStockRequestId(Long stockRequestId);
}
