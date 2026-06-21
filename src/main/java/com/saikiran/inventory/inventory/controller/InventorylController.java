package com.saikiran.inventory.inventory.controller;


import com.saikiran.inventory.inventory.dto.ExternalBuyerDto;
import com.saikiran.inventory.inventory.dto.ExternalSupplierDto;
import com.saikiran.inventory.inventory.dto.StockTransferDto;
import com.saikiran.inventory.inventory.service.ExternalBuyerService;
import com.saikiran.inventory.inventory.service.ExternalSupplierService;
import com.saikiran.inventory.inventory.service.StockTransferService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/inventory")
public class InventorylController {

    private final ExternalSupplierService externalSupplierService;
    private final ExternalBuyerService externalBuyerService;
    private final StockTransferService stockTransferService;

    @PostMapping("/external-supplier")
    public ResponseEntity<String> addInventoryStockByExternalSupplier(
            @RequestBody ExternalSupplierDto dto) {

        externalSupplierService.addInventoryStockByExternalSupplier(dto);

        return ResponseEntity.ok("Stock added successfully");
    }

    @PostMapping("/external-buyer")
    public ResponseEntity<String> updateInventoryStockForExternalBuyer(
            @RequestBody ExternalBuyerDto dto){

        externalBuyerService
                .updateInventoryStockForExternalBuyer(dto);

        return ResponseEntity.ok(
                "Stock sold successfully"
        );
    }

    @PostMapping("/stock-transfer")
    public ResponseEntity<String> addStockTransfer(
            @RequestBody StockTransferDto dto){

        stockTransferService.addStockTransferInventory(dto);

        return ResponseEntity.ok(
                "Stock transferred successfully"
        );
    }

}
