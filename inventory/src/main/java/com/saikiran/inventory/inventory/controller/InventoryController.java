package com.saikiran.inventory.inventory.controller;


import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.inventory.dto.*;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.inventory.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/inventory")
@Tag(name = "Inventory", description = "Stock movement and inventory search APIs")
public class InventoryController {

    private final ExternalSupplierService externalSupplierService;
    private final ExternalBuyerService externalBuyerService;
    private final StockTransferService stockTransferService;
    private final StockRequestService stockRequestService;
    private final BusinessService businessService;
    private final InventorySearchService searchService;

    @PostMapping("/external-supplier")
    @Operation(summary = "Add stock from supplier", description = "Creates inventory from an external supplier transaction.")
    public ResponseEntity<String> addInventoryStockByExternalSupplier(
            @RequestBody ExternalSupplierDto dto,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId ) {

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setToBusinessId(businessId);
        externalSupplierService.addInventoryStockByExternalSupplier(dto);

        return ResponseEntity.ok("Stock added successfully");
    }

    @PostMapping("/external-buyer")
    @Operation(summary = "Sell stock to buyer", description = "Updates inventory after selling stock to an external buyer.")
    public ResponseEntity<String> updateInventoryStockForExternalBuyer(
            @RequestBody ExternalBuyerDto dto,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setBusinessId(businessId);
        externalBuyerService.updateInventoryStockForExternalBuyer(dto);

        return ResponseEntity.ok(
                "Stock sold successfully"
        );
    }

    @PostMapping("/stock-transfer")
    @Operation(summary = "Transfer stock", description = "Transfers stock from the authenticated business to another business.")
    public ResponseEntity<String> addStockTransfer(
            @RequestBody StockTransferDto dto,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setFromBusinessId(businessId);
        stockTransferService.addStockTransferInventory(dto);

        return ResponseEntity.ok(
                "Stock transferred successfully"
        );
    }

    @PostMapping("/stock-requests")
    @Operation(summary = "Create a stock request", description = "Requests stock from another business.")
    public ResponseEntity<String> stockRequest(
            @RequestBody StockRequestDto dto,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){
        Long businessId = businessService.getBusinessIdForUser(userId);
        dto.setFromBusinessId(businessId);
        stockRequestService.stockRequest(dto);

        return ResponseEntity.ok("Stock requested successfully");
    }

    @GetMapping("/stock-requests")
    @Operation(summary = "List stock requests", description = "Returns stock requests for the authenticated business.")
    public ResponseEntity<List<StockRequestResponse>> stockRequestList(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

        Long businessId = businessService.getBusinessIdForUser(userId);
        return ResponseEntity.ok(stockRequestService.getStockRequestInfo(businessId));
    }

    @PutMapping("/stock-requests/{requestId}")
    @Operation(summary = "Update stock request", description = "Updates the status of a stock request.")
    public ResponseEntity<String> updateRequest(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId,
            @PathVariable
            @Parameter(description = "Stock request id", required = true, example = "100")
            Long requestId,
            @RequestParam
            @Parameter(description = "New request status", required = true)
            StockRequestStatus status){

        Long businessId = businessService.getBusinessIdForUser(userId);
        stockRequestService.updateStockRequest(businessId,requestId,status);
        return ResponseEntity.ok("updated the stock request");
    }


    //searching product
    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Searches products across businesses.")
    public ResponseEntity<List<SearchProductResponse>> searchProducts(
            @RequestParam
            @Parameter(description = "Search query", required = true, example = "rice")
            String query){

        return ResponseEntity.ok(
                searchService.getBusinessInfoForSearchQuery(query)
        );
    }

}
