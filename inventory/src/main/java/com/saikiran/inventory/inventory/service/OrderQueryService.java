package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.inventory.dto.*;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrder;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrderItem;
import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import com.saikiran.inventory.inventory.repository.PurchaseOrderItemRepository;
import com.saikiran.inventory.inventory.repository.PurchaseOrderRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderItemRepository;
import com.saikiran.inventory.inventory.repository.SalesOrderRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class OrderQueryService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    public List<SalesOrderResponse> getSalesOrdersByBusinessId(Long businessId) {
        log.debug("Fetching sales orders for businessId={}", businessId);
        List<SalesOrder> salesOrders = salesOrderRepository.findByFromBusiness_BusinessIdOrderByCreatedAtDesc(businessId);

        return salesOrders.stream().map(order -> {
            List<SalesOrderItem> items = salesOrderItemRepository.findBySalesOrder_SalesOrderId(order.getSalesOrderId());

            BigDecimal totalAmount = BigDecimal.ZERO;
            List<SalesOrderItemResponse> itemResponses = items.stream().map(item -> {
                BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                        (item.getUnitPrice() != null && item.getQuantity() != null ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO);

                return SalesOrderItemResponse.builder()
                        .salesOrderItemId(item.getSalesOrderItemId())
                        .variantId(item.getVariant() != null ? item.getVariant().getVariantId() : null)
                        .productName(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getProductName() : null)
                        .sku(item.getVariant() != null ? item.getVariant().getSku() : null)
                        .brand(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getBrand() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(itemTotal)
                        .build();
            }).toList();

            BigDecimal orderTotal = itemResponses.stream()
                    .map(SalesOrderItemResponse::getTotalPrice)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return SalesOrderResponse.builder()
                    .salesOrderId(order.getSalesOrderId())
                    .fromBusinessId(order.getFromBusiness() != null ? order.getFromBusiness().getBusinessId() : null)
                    .fromBusinessName(order.getFromBusiness() != null ? order.getFromBusiness().getBusinessName() : null)
                    .customerName(order.getCustomerName())
                    .status(order.getStatus())
                    .createdAt(order.getCreatedAt())
                    .items(itemResponses)
                    .totalAmount(orderTotal)
                    .build();
        }).toList();
    }

    public List<PurchaseOrderResponse> getPurchaseOrdersByBusinessId(Long businessId) {
        log.debug("Fetching purchase orders for businessId={}", businessId);
        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByToBusiness_BusinessIdOrderByCreatedAtDesc(businessId);

        return purchaseOrders.stream().map(order -> {
            List<PurchaseOrderItem> items = purchaseOrderItemRepository.findByPurchaseOrder_PurchaseOrderId(order.getPurchaseOrderId());

            List<PurchaseOrderItemResponse> itemResponses = items.stream().map(item -> {
                BigDecimal itemTotal = item.getTotalPrice() != null ? item.getTotalPrice() :
                        (item.getUnitPrice() != null && item.getQuantity() != null ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO);

                return PurchaseOrderItemResponse.builder()
                        .purchaseOrderItemId(item.getPurchaseOrderItemId())
                        .variantId(item.getVariant() != null ? item.getVariant().getVariantId() : null)
                        .productName(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getProductName() : null)
                        .sku(item.getVariant() != null ? item.getVariant().getSku() : null)
                        .brand(item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getBrand() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(itemTotal)
                        .build();
            }).toList();

            BigDecimal orderTotal = itemResponses.stream()
                    .map(PurchaseOrderItemResponse::getTotalPrice)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return PurchaseOrderResponse.builder()
                    .purchaseOrderId(order.getPurchaseOrderId())
                    .toBusinessId(order.getToBusiness() != null ? order.getToBusiness().getBusinessId() : null)
                    .toBusinessName(order.getToBusiness() != null ? order.getToBusiness().getBusinessName() : null)
                    .supplierName(order.getSupplierName())
                    .status(order.getStatus())
                    .createdAt(order.getCreatedAt())
                    .items(itemResponses)
                    .totalAmount(orderTotal)
                    .build();
        }).toList();
    }
}
