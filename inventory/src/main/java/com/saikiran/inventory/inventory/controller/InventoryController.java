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
    private final StockMovementService stockMovementService;
    private final OrderQueryService orderQueryService;


    @GetMapping
    @Operation(summary = "List inventory", description = "Returns all inventory items for the active business.")
    public ResponseEntity<List<InventoryResponse>> getInventory(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId ) {
        return ResponseEntity.ok(searchService.getInventoryByBusinessId(businessId));
    }


    @PostMapping("/external-supplier")
    @Operation(summary = "Add stock from supplier", description = "Creates inventory from an external supplier transaction.")
    public ResponseEntity<String> addInventoryStockByExternalSupplier(
            @RequestBody ExternalSupplierDto dto,
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId ) {

        dto.setToBusinessId(businessId);
        externalSupplierService.addInventoryStockByExternalSupplier(dto);

        return ResponseEntity.ok("Stock added successfully");
    }

    @PostMapping("/external-buyer")
    @Operation(summary = "Sell stock to buyer", description = "Updates inventory after selling stock to an external buyer.")
    public ResponseEntity<String> updateInventoryStockForExternalBuyer(
            @RequestBody ExternalBuyerDto dto,
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

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
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

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
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){
        dto.setFromBusinessId(businessId);
        stockRequestService.stockRequest(dto);

        return ResponseEntity.ok("Stock requested successfully");
    }

    @GetMapping("/stock-requests")
    @Operation(summary = "List stock requests", description = "Returns stock requests for the authenticated business.")
    public ResponseEntity<List<StockRequestResponse>> stockRequestList(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId){

        return ResponseEntity.ok(stockRequestService.getStockRequestInfo(businessId));
    }

    @PutMapping("/stock-requests/{requestId}")
    @Operation(summary = "Update stock request", description = "Updates the status of a stock request.")
    public ResponseEntity<String> updateRequest(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId,
            @PathVariable
            @Parameter(description = "Stock request id", required = true, example = "100")
            Long requestId,
            @RequestParam
            @Parameter(description = "New request status", required = true)
            StockRequestStatus status){

        stockRequestService.updateStockRequest(businessId,requestId,status);
        return ResponseEntity.ok("updated the stock request");
    }

    @PostMapping("/stock-requests/{requestId}/counter")
    @Operation(summary = "Counter stock request", description = "Counters a pending stock request by creating a new pending request with new terms.")
    public ResponseEntity<StockRequestResponse> counterRequest(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId,
            @PathVariable
            @Parameter(description = "Stock request id", required = true, example = "100")
            Long requestId,
            @RequestParam(required = false)
            @Parameter(description = "Counter offered unit price", example = "115.00")
            java.math.BigDecimal counterUnitPrice,
            @RequestParam(required = false)
            @Parameter(description = "Counter quantity", example = "10")
            Integer counterQuantity) {

        return ResponseEntity.ok(stockRequestService.counterStockRequest(businessId, requestId, counterUnitPrice, counterQuantity));
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

    @GetMapping("/movements")
    @Operation(summary = "Stock movement history", description = "Returns all stock movements for the active business ordered by newest first.")
    public ResponseEntity<List<StockMovementResponse>> getMovements(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId) {
        return ResponseEntity.ok(stockMovementService.getMovementsByBusinessId(businessId));
    }

    @GetMapping("/sales-orders")
    @Operation(summary = "List sales orders", description = "Returns all sales orders for the active business.")
    public ResponseEntity<List<SalesOrderResponse>> getSalesOrders(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId) {
        return ResponseEntity.ok(orderQueryService.getSalesOrdersByBusinessId(businessId));
    }

    @GetMapping("/purchase-orders")
    @Operation(summary = "List purchase orders", description = "Returns all purchase orders for the active business.")
    public ResponseEntity<List<PurchaseOrderResponse>> getPurchaseOrders(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId) {
        return ResponseEntity.ok(orderQueryService.getPurchaseOrdersByBusinessId(businessId));
    }

    @GetMapping("/suppliers")
    @Operation(summary = "List supplier summary", description = "Returns supplier procurement summaries grouped by supplier for active business.")
    public ResponseEntity<List<com.saikiran.inventory.inventory.dto.SupplierResponse>> getSuppliers(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId) {
        return ResponseEntity.ok(orderQueryService.getSuppliersByBusinessId(businessId));
    }

    // Testing CI workflow 2

}
