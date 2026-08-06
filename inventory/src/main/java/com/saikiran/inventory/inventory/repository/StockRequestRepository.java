package com.saikiran.inventory.inventory.repository;

import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRequestRepository extends JpaRepository<StockRequest, Long> {

    List<StockRequest> findStockRequestByToBusiness_BusinessIdAndStatus(Long id, StockRequestStatus status);

    List<StockRequest> findStockRequestByToBusiness_BusinessIdOrFromBusiness_BusinessIdOrderByCreatedAtDesc(Long toBusinessId, Long fromBusinessId);

    List<StockRequest> findStockRequestByToBusiness_BusinessId(Long id);

    List<StockRequest> findStockRequestByToBusiness_BusinessIdOrderByCreatedAtDesc(Long toBusinessId);


    Optional<StockRequest> findByStockRequestId(Long stockRequestId);

    boolean existsByFromBusiness_BusinessIdAndToBusiness_BusinessIdAndProductVariant_VariantIdAndStatus(
            Long fromBusinessId, Long toBusinessId, Long productVariantId, StockRequestStatus status
    );

    List<StockRequest> findByConversation_IdOrderByCreatedAtDesc(Long conversationId);
}
