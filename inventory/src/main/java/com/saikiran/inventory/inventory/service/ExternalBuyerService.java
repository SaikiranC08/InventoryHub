package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.inventory.dto.ExternalBuyerDto;
import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import com.saikiran.inventory.inventory.entities.external.StockMovement;
import com.saikiran.inventory.inventory.enums.MovementType;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import com.saikiran.inventory.inventory.enums.ReferenceType;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderItemRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderRepository;
import com.saikiran.inventory.inventory.repository.StockMovementRepository;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import com.saikiran.inventory.product.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ExternalBuyerService {
    // product id -> product variant id -> sales order -> sales order item -> update inventory -> stock movement

    private final ProductService productService;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;



    private ProductVariant getProductVariant(ExternalBuyerDto dto){
        return productVariantRepository.findProductVariantByVariantId(dto.getVariantId())
                                       .orElseThrow(()->
                                               new RuntimeException("product variant not found"));
    }

    private ProductVariant getProductVariant(Long id){
        return productVariantRepository.findProductVariantByVariantId(id)
                .orElseThrow(()->
                        new RuntimeException("product not found"));
    }

    private Business getBusiness(ExternalBuyerDto dto) {

        return businessRepository.findBusinessByBusinessId(dto.getBusinessId())
                                 .orElseThrow(() ->
                                         new RuntimeException(" business not found"));
    }

    private SalesOrder getSalesOrder(ExternalBuyerDto dto,Business business){
        SalesOrder salesOrder = inventoryMapper.toSalesOrder(dto);
       salesOrder.setFromBusiness(business);
        salesOrder.setStatus(OrderStatus.COMPLETED);
       return salesOrderRepository.save(salesOrder);
    }

    private SalesOrderItem getSalesOrderItem(ExternalBuyerDto dto,ProductVariant productVariant,SalesOrder salesOrder){
        SalesOrderItem salesOrderItem = inventoryMapper.toSalesOrderItem(dto);
        salesOrderItem.setSalesOrder(salesOrder);
        salesOrderItem.setVariant(productVariant);
        return salesOrderItemRepository.save(salesOrderItem);
    }


    private Inventory updateInventory(ExternalBuyerDto dto,Business business,ProductVariant productVariant){
        Inventory inventory = inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(business.getBusinessId(),productVariant.getVariantId())
                .orElseThrow(()->
                        new RuntimeException("inventory not found"));

        Inventory inventory1 = inventoryMapper.toInventory(dto);

        if(inventory.getQuantity() < dto.getQuantity()){
            throw new RuntimeException(
                    "Insufficient stock"
            );
        }

        inventory.setQuantity(inventory.getQuantity() - inventory1.getQuantity());

        return inventoryRepository.save(inventory);
    }

    private void createStockMovement(ExternalBuyerDto dto, Inventory inventory, SalesOrder salesOrder) {

        StockMovement stockMovement = inventoryMapper.toStockMovement(dto);

        stockMovement.setInventory(inventory);

        stockMovement.setMovementType(MovementType.SALE);

        stockMovement.setReferenceType(ReferenceType.SALES_ORDER);

        stockMovement.setReferenceId(salesOrder.getSalesOrderId());

        stockMovementRepository.save(stockMovement);
    }


    @Transactional
    public void updateInventoryStockForExternalBuyer(ExternalBuyerDto dto){
        ProductVariant variant = getProductVariant(dto);
        Business business = getBusiness(dto);
        SalesOrder salesOrder = getSalesOrder(dto,business);
        SalesOrderItem salesOrderItem = getSalesOrderItem(dto,variant,salesOrder);
        Inventory inventory = updateInventory(dto,business,variant);
        createStockMovement(dto,inventory,salesOrder);
    }



}
