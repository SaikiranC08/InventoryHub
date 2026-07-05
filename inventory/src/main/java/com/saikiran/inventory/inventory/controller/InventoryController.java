package com.saikiran.inventory.inventory.controller;


import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.inventory.dto.*;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.inventory.service.*;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final ExternalSupplierService externalSupplierService;
    private final ExternalBuyerService externalBuyerService;
    private final StockTransferService stockTransferService;
    private final StockRequestService stockRequestService;
    private final BusinessService businessService;
    private final InventorySearchService searchService;

    @PostMapping("/external-supplier")
    public ResponseEntity<String> addInventoryStockByExternalSupplier(@RequestBody ExternalSupplierDto dto,@RequestHeader("X-User-Id") Long userId ) {

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setToBusinessId(businessId);
        externalSupplierService.addInventoryStockByExternalSupplier(dto);

        return ResponseEntity.ok("Stock added successfully");
    }

    @PostMapping("/external-buyer")
    public ResponseEntity<String> updateInventoryStockForExternalBuyer(@RequestBody ExternalBuyerDto dto,@RequestHeader("X-User-Id") Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setBusinessId(businessId);
        externalBuyerService.updateInventoryStockForExternalBuyer(dto);

        return ResponseEntity.ok(
                "Stock sold successfully"
        );
    }

    @PostMapping("/stock-transfer")
    public ResponseEntity<String> addStockTransfer(@RequestBody StockTransferDto dto,@RequestHeader("X-User-Id") Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setFromBusinessId(businessId);
        stockTransferService.addStockTransferInventory(dto);

        return ResponseEntity.ok(
                "Stock transferred successfully"
        );
    }

    @PostMapping("/stock-requests")
    public ResponseEntity<String> stockRequest(@RequestBody StockRequestDto dto,@RequestHeader("X-User-Id") Long userId){
        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setFromBusinessId(businessId);
        stockRequestService.stockRequest(dto);

        return ResponseEntity.ok("Stock requested successfully");
    }

    @GetMapping("/stock-requests")
    public ResponseEntity<List<StockRequestResponse>> stockRequestList(@RequestHeader("X-User-Id") Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        return ResponseEntity.ok(stockRequestService.getStockRequestInfo(businessId));
    }

    @PutMapping("/stock-requests/{requestId}")
    public ResponseEntity<String> updateRequest(@RequestHeader("X-User-Id") Long userId,@PathVariable Long requestId, StockRequestStatus status){

        Long businessId = businessService.getBusinessIdForUser(userId);
        stockRequestService.updateStockRequest(businessId,requestId,status);
        return ResponseEntity.ok("updated the stock request");
    }


    //searching product
    @GetMapping("/search")
    public ResponseEntity<List<SearchProductResponse>> searchProducts(
            @RequestParam String query){

        return ResponseEntity.ok(
                searchService.getBusinessInfoForSearchQuery(query)
        );
    }

}
