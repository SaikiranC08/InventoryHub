package com.saikiran.inventory.inventory.service;


import com.saikiran.inventory.inventory.dto.InventoryResponse;
import com.saikiran.inventory.inventory.dto.SearchProductResponse;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.product.service.ProductService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class InventorySearchService {
    private final ProductService productService;
    private final InventoryRepository inventoryRepository;


    public List<InventoryResponse> getInventoryByBusinessId(Long businessId) {
        log.debug("Fetching inventory for businessId={}", businessId);
        return inventoryRepository.findInventoryResponseByBusinessId(businessId);
    }

    public List<SearchProductResponse> getBusinessInfoForSearchQuery(String name){
        log.debug("Searching inventory for query={}", name);

        Long productId = productService.getProductIdForSearchQuery(name);
        log.debug("Resolved productId={} for query={}", productId, name);

        List<SearchProductResponse> results = inventoryRepository.findAvailableBusinessesByProductId(productId);
        log.debug("Found {} inventory search results for query={}", results.size(), name);
        return results;
    }
}

