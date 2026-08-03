package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.inventory.dto.StockMovementResponse;
import com.saikiran.inventory.inventory.repository.StockMovementRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    public List<StockMovementResponse> getMovementsByBusinessId(Long businessId) {
        log.debug("Fetching stock movements for businessId={}", businessId);
        List<StockMovementResponse> result = stockMovementRepository.findMovementsByBusinessId(businessId);
        log.debug("Found {} stock movements for businessId={}", result.size(), businessId);
        return result;
    }
}
