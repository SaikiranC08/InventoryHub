package com.saikiran.inventory.inventory.service;


import com.saikiran.inventory.inventory.dto.SearchProductResponse;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.product.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class InventorySearchService {
    private final ProductService productService;
    private final InventoryRepository inventoryRepository;


    public List<SearchProductResponse> getBusinessInfoForSearchQuery(String name){

        Long productId = productService.getProductIdForSearchQuery(name);

        return  inventoryRepository.findAvailableBusinessesByProductId(productId);
    }
}
