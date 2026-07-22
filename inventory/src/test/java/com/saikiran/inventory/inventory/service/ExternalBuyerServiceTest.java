package com.saikiran.inventory.inventory.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.inventory.dto.ExternalBuyerDto;
import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import com.saikiran.inventory.inventory.entities.external.StockMovement;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderItemRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderRepository;
import com.saikiran.inventory.inventory.repository.StockMovementRepository;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.enums.UnitType;
import com.saikiran.inventory.product.repository.ProductVariantRepository;

@ExtendWith(MockitoExtension.class)
public class ExternalBuyerServiceTest {
    
    @InjectMocks
    private ExternalBuyerService externalBuyerService;

    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryMapper inventoryMapper;
    @Mock
    private BusinessRepository businessRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private SalesOrderRepository salesOrderRepository;
    @Mock
    private SalesOrderItemRepository salesOrderItemRepository;


    @Test
    void shouldUpdateInventoryWhenExternalBuyerBuysProduct(){

        ExternalBuyerDto externalBuyerDto = ExternalBuyerDto.builder()
                                            .businessId(1L)
                                            .customerName("jack")
                                            .quantity(1)
                                            .totalPrice(BigDecimal.valueOf(20000))
                                            .unitPrice(BigDecimal.valueOf(20000))
                                            .variantId(1L)
                                            .remark("sold to external buyer")
                                            .build();

        ProductVariant productVariant = ProductVariant.builder()
                                            .currentPrice(BigDecimal.valueOf(20000))
                                            .variantId(1L)
                                            .attributes(Map.of("color","black","ram","8gb","storage","128gb"))
                                            .unitType(UnitType.PIECE)
                                            .unitValue(BigDecimal.valueOf(20000))
                                            .build();

        Business business = Business.builder()
                            .businessId(1L)
                            .businessDomain(BusinessDomain.ELECTRONICS)
                            .businessType(BusinessType.STORE)
                            .ownerId(1L)
                            .build();

        SalesOrder salesOrder = SalesOrder.builder()
                                .customerName("jack")
                                .salesOrderId(1L)
                                .build();

        SalesOrderItem salesOrderItem = SalesOrderItem.builder()
                                        .salesOrderItemId(1L)
                                        .salesOrder(salesOrder)
                                        .build();

        Inventory inventory = Inventory.builder()
                                .business(business)
                                .inventoryId(1L)
                                .productVariant(productVariant)
                                .quantity(1)
                                .build();

        Inventory oldInventory = Inventory.builder()
                                .business(business)
                                .inventoryId(1L)
                                .productVariant(productVariant)
                                .quantity(8)
                                .build();

        StockMovement stockMovement = new StockMovement();
        stockMovement.setStockMovementId(1L);


        when(productVariantRepository.findProductVariantByVariantId(anyLong())).thenReturn(Optional.of(productVariant));
        when(businessRepository.findBusinessByBusinessId(anyLong())).thenReturn(Optional.of(business));
        when(inventoryMapper.toSalesOrder(externalBuyerDto)).thenReturn(salesOrder);
        when(salesOrderRepository.save(salesOrder)).thenReturn(salesOrder);
        when(inventoryMapper.toSalesOrderItem(externalBuyerDto)).thenReturn(salesOrderItem);
        when(salesOrderItemRepository.save(salesOrderItem)).thenReturn(salesOrderItem);
        when(inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(1L,1L)).thenReturn(Optional.of(oldInventory));
        when(inventoryMapper.toInventory(externalBuyerDto)).thenReturn(inventory);
        when(inventoryRepository.save(oldInventory)).thenReturn(oldInventory);
        when(inventoryMapper.toStockMovement(externalBuyerDto)).thenReturn(stockMovement);
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(stockMovement);

         externalBuyerService.updateInventoryStockForExternalBuyer(externalBuyerDto);

         verify(inventoryRepository)
         .save(oldInventory);
    }

    @Test
    void shouldThrowExceptionWhenProductVariantDoesNotExist(){

        ExternalBuyerDto buyerDto = ExternalBuyerDto.builder().variantId(1L).build();

        RuntimeException exception = assertThrows(RuntimeException.class,
                ()-> externalBuyerService.updateInventoryStockForExternalBuyer(buyerDto)
                );

            assertEquals("product variant not found",exception.getMessage());

    }

    @Test
    void shouldThrowExceptionWhenBusinessDoesNotExist(){

        ExternalBuyerDto buyerDto = ExternalBuyerDto.builder()
                .businessId(1L)
                .variantId(1L)
                .quantity(1)
                .build();

        ProductVariant productVariant = ProductVariant.builder()
                .variantId(1L)
                .build();

        when(productVariantRepository.findProductVariantByVariantId(anyLong())).thenReturn(Optional.of(productVariant));
        when(businessRepository.findBusinessByBusinessId(anyLong())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> externalBuyerService.updateInventoryStockForExternalBuyer(buyerDto));

        assertEquals(" business not found", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenInventoryDoesNotExist(){

        ExternalBuyerDto buyerDto = ExternalBuyerDto.builder()
                .businessId(1L)
                .variantId(1L)
                .quantity(1)
                .build();

        ProductVariant productVariant = ProductVariant.builder()
                .variantId(1L)
                .build();

        Business business = Business.builder()
                .businessId(1L)
                .build();

        SalesOrder salesOrder = SalesOrder.builder()
                .salesOrderId(1L)
                .customerName("jack")
                .build();

        SalesOrderItem salesOrderItem = SalesOrderItem.builder()
                .salesOrderItemId(1L)
                .build();

        when(productVariantRepository.findProductVariantByVariantId(anyLong())).thenReturn(Optional.of(productVariant));
        when(businessRepository.findBusinessByBusinessId(anyLong())).thenReturn(Optional.of(business));
        when(inventoryMapper.toSalesOrder(buyerDto)).thenReturn(salesOrder);
        when(salesOrderRepository.save(salesOrder)).thenReturn(salesOrder);
        when(inventoryMapper.toSalesOrderItem(buyerDto)).thenReturn(salesOrderItem);
        when(salesOrderItemRepository.save(salesOrderItem)).thenReturn(salesOrderItem);
        when(inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(1L,1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> externalBuyerService.updateInventoryStockForExternalBuyer(buyerDto));

        assertEquals("inventory not found", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenStockIsInsufficient(){

        ExternalBuyerDto buyerDto = ExternalBuyerDto.builder()
                .businessId(1L)
                .variantId(1L)
                .quantity(10)
                .build();

        ProductVariant productVariant = ProductVariant.builder()
                .variantId(1L)
                .build();

        Business business = Business.builder()
                .businessId(1L)
                .build();

        SalesOrder salesOrder = SalesOrder.builder()
                .salesOrderId(1L)
                .customerName("jack")
                .build();

        SalesOrderItem salesOrderItem = SalesOrderItem.builder()
                .salesOrderItemId(1L)
                .build();

        Inventory inventory = Inventory.builder()
                .business(business)
                .productVariant(productVariant)
                .quantity(8)
                .build();

        Inventory inventoryToSave = Inventory.builder()
                .business(business)
                .productVariant(productVariant)
                .quantity(10)
                .build();

        when(productVariantRepository.findProductVariantByVariantId(anyLong())).thenReturn(Optional.of(productVariant));
        when(businessRepository.findBusinessByBusinessId(anyLong())).thenReturn(Optional.of(business));
        when(inventoryMapper.toSalesOrder(buyerDto)).thenReturn(salesOrder);
        when(salesOrderRepository.save(salesOrder)).thenReturn(salesOrder);
        when(inventoryMapper.toSalesOrderItem(buyerDto)).thenReturn(salesOrderItem);
        when(salesOrderItemRepository.save(salesOrderItem)).thenReturn(salesOrderItem);
        when(inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(1L,1L)).thenReturn(Optional.of(inventory));
        when(inventoryMapper.toInventory(buyerDto)).thenReturn(inventoryToSave);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> externalBuyerService.updateInventoryStockForExternalBuyer(buyerDto));

        assertEquals("Insufficient stock", exception.getMessage());
    }

}
