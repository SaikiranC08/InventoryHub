package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.inventory.dto.*;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrder;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrderItem;
import com.saikiran.inventory.inventory.entities.external.SalesOrder;
import com.saikiran.inventory.inventory.entities.external.SalesOrderItem;
import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.entities.internal.StockTransfer;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.inventory.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
@Slf4j
public class OrderQueryService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final StockTransferRepository stockTransferRepository;
    private final StockRequestRepository stockRequestRepository;

    public List<SalesOrderResponse> getSalesOrdersByBusinessId(Long businessId) {
        log.debug("Fetching sales orders for businessId={}", businessId);
        List<SalesOrder> salesOrders = salesOrderRepository.findByFromBusiness_BusinessIdOrderByCreatedAtDesc(businessId);

        return salesOrders.stream().map(order -> {
            List<SalesOrderItem> items = salesOrderItemRepository.findBySalesOrder_SalesOrderId(order.getSalesOrderId());

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
                    .filter(Objects::nonNull)
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
                    .filter(Objects::nonNull)
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

    public List<SupplierResponse> getSuppliersByBusinessId(Long businessId) {
        log.debug("Fetching combined suppliers summary for businessId={}", businessId);

        // Map to hold aggregated supplier details by supplier key (e.g. "EXT_ABC Distributors" or "B2B_10")
        Map<String, SupplierHolder> holderMap = new LinkedHashMap<>();

        // 1. External Purchase Orders
        List<PurchaseOrderResponse> purchaseOrders = getPurchaseOrdersByBusinessId(businessId);
        for (PurchaseOrderResponse po : purchaseOrders) {
            String supplierName = (po.getSupplierName() != null && !po.getSupplierName().trim().isEmpty())
                    ? po.getSupplierName().trim()
                    : "External Supplier";
            String key = "EXT_" + supplierName.toLowerCase();

            SupplierHolder holder = holderMap.computeIfAbsent(key, k -> new SupplierHolder(supplierName, false, null));
            holder.totalOrders++;
            if (po.getTotalAmount() != null) {
                holder.totalSpend = holder.totalSpend.add(po.getTotalAmount());
            }
            if (po.getCreatedAt() != null && (holder.lastOrderDate == null || po.getCreatedAt().isAfter(holder.lastOrderDate))) {
                holder.lastOrderDate = po.getCreatedAt();
            }
            if (po.getItems() != null) {
                for (PurchaseOrderItemResponse item : po.getItems()) {
                    if (item.getProductName() != null) {
                        holder.suppliedProducts.add(item.getProductName());
                    }
                }
            }
            holder.recentOrders.add(po);
        }

        // 2. Internal B2B Stock Transfers (Transfers received where toBusiness == activeBusiness)
        List<StockTransfer> transfersReceived = stockTransferRepository.findByToBusiness_BusinessIdOrderByCreatedAtDesc(businessId);
        for (StockTransfer st : transfersReceived) {
            if (st.getFromBusiness() == null) continue;
            Long fromBizId = st.getFromBusiness().getBusinessId();
            String fromBizName = st.getFromBusiness().getBusinessName() != null ? st.getFromBusiness().getBusinessName() : ("Business #" + fromBizId);
            String key = "B2B_" + fromBizId;

            SupplierHolder holder = holderMap.computeIfAbsent(key, k -> new SupplierHolder(fromBizName, true, fromBizId));
            holder.totalOrders++;
            BigDecimal transferTotal = st.getTotalPrice() != null ? st.getTotalPrice() :
                    (st.getUnitPrice() != null && st.getQuantity() != null ? st.getUnitPrice().multiply(BigDecimal.valueOf(st.getQuantity())) : BigDecimal.ZERO);
            holder.totalSpend = holder.totalSpend.add(transferTotal);

            if (st.getCreatedAt() != null && (holder.lastOrderDate == null || st.getCreatedAt().isAfter(holder.lastOrderDate))) {
                holder.lastOrderDate = st.getCreatedAt();
            }

            if (st.getVariant() != null && st.getVariant().getProduct() != null && st.getVariant().getProduct().getProductName() != null) {
                holder.suppliedProducts.add(st.getVariant().getProduct().getProductName());
            }

            // Convert transfer to PurchaseOrderResponse format for recentOrders UI view
            PurchaseOrderItemResponse itemResp = PurchaseOrderItemResponse.builder()
                    .variantId(st.getVariant() != null ? st.getVariant().getVariantId() : null)
                    .productName(st.getVariant() != null && st.getVariant().getProduct() != null ? st.getVariant().getProduct().getProductName() : null)
                    .sku(st.getVariant() != null ? st.getVariant().getSku() : null)
                    .brand(st.getVariant() != null && st.getVariant().getProduct() != null ? st.getVariant().getProduct().getBrand() : null)
                    .quantity(st.getQuantity())
                    .unitPrice(st.getUnitPrice())
                    .totalPrice(transferTotal)
                    .build();

            PurchaseOrderResponse poResp = PurchaseOrderResponse.builder()
                    .purchaseOrderId(st.getTransferId())
                    .supplierName(fromBizName)
                    .status(st.getStatus())
                    .createdAt(st.getCreatedAt())
                    .items(List.of(itemResp))
                    .totalAmount(transferTotal)
                    .build();

            holder.recentOrders.add(poResp);
        }

        // 3. B2B Stock Requests (Requests sent by activeBusiness where status == APPROVED)
        List<StockRequest> requestsSent = stockRequestRepository.findStockRequestByToBusiness_BusinessIdOrFromBusiness_BusinessIdOrderByCreatedAtDesc(businessId, businessId);
        for (StockRequest req : requestsSent) {
            // Only process requests where activeBusiness is the requester (fromBusiness) and supplying business is toBusiness, and request was APPROVED
            if (req.getFromBusiness() != null && req.getFromBusiness().getBusinessId().equals(businessId)
                    && req.getToBusiness() != null
                    && req.getStatus() == StockRequestStatus.APPROVED) {

                Long supplierBizId = req.getToBusiness().getBusinessId();
                String supplierBizName = req.getToBusiness().getBusinessName() != null ? req.getToBusiness().getBusinessName() : ("Business #" + supplierBizId);
                String key = "B2B_" + supplierBizId;

                SupplierHolder holder = holderMap.computeIfAbsent(key, k -> new SupplierHolder(supplierBizName, true, supplierBizId));
                holder.totalOrders++;
                BigDecimal reqTotal = req.getOfferedTotalPrice() != null ? req.getOfferedTotalPrice() :
                        (req.getOfferedUnitPrice() != null && req.getQuantity() != null ? req.getOfferedUnitPrice().multiply(BigDecimal.valueOf(req.getQuantity())) : BigDecimal.ZERO);
                holder.totalSpend = holder.totalSpend.add(reqTotal);

                LocalDateTime reqDate = req.getUpdatedAt() != null ? req.getUpdatedAt() : req.getCreatedAt();
                if (reqDate != null && (holder.lastOrderDate == null || reqDate.isAfter(holder.lastOrderDate))) {
                    holder.lastOrderDate = reqDate;
                }

                if (req.getProductVariant() != null && req.getProductVariant().getProduct() != null && req.getProductVariant().getProduct().getProductName() != null) {
                    holder.suppliedProducts.add(req.getProductVariant().getProduct().getProductName());
                }

                PurchaseOrderItemResponse itemResp = PurchaseOrderItemResponse.builder()
                        .variantId(req.getProductVariant() != null ? req.getProductVariant().getVariantId() : null)
                        .productName(req.getProductVariant() != null && req.getProductVariant().getProduct() != null ? req.getProductVariant().getProduct().getProductName() : null)
                        .sku(req.getProductVariant() != null ? req.getProductVariant().getSku() : null)
                        .brand(req.getProductVariant() != null && req.getProductVariant().getProduct() != null ? req.getProductVariant().getProduct().getBrand() : null)
                        .quantity(req.getQuantity())
                        .unitPrice(req.getOfferedUnitPrice())
                        .totalPrice(reqTotal)
                        .build();

                PurchaseOrderResponse poResp = PurchaseOrderResponse.builder()
                        .purchaseOrderId(req.getStockRequestId())
                        .supplierName(supplierBizName)
                        .status(com.saikiran.inventory.inventory.enums.OrderStatus.COMPLETED)
                        .createdAt(reqDate)
                        .items(List.of(itemResp))
                        .totalAmount(reqTotal)
                        .build();

                holder.recentOrders.add(poResp);
            }
        }

        return holderMap.values().stream().map(holder -> SupplierResponse.builder()
                .supplierName(holder.supplierName)
                .isB2bBusiness(holder.isB2bBusiness)
                .b2bBusinessId(holder.b2bBusinessId)
                .totalOrders(holder.totalOrders)
                .totalSpend(holder.totalSpend)
                .lastOrderDate(holder.lastOrderDate)
                .suppliedProductsCount(holder.suppliedProducts.size())
                .suppliedProducts(new ArrayList<>(holder.suppliedProducts))
                .recentOrders(holder.recentOrders)
                .build())
                .sorted((s1, s2) -> s2.getTotalSpend().compareTo(s1.getTotalSpend()))
                .toList();
    }

    private static class SupplierHolder {
        String supplierName;
        Boolean isB2bBusiness;
        Long b2bBusinessId;
        long totalOrders = 0;
        BigDecimal totalSpend = BigDecimal.ZERO;
        LocalDateTime lastOrderDate;
        Set<String> suppliedProducts = new LinkedHashSet<>();
        List<PurchaseOrderResponse> recentOrders = new ArrayList<>();

        SupplierHolder(String supplierName, Boolean isB2bBusiness, Long b2bBusinessId) {
            this.supplierName = supplierName;
            this.isB2bBusiness = isB2bBusiness;
            this.b2bBusinessId = b2bBusinessId;
        }
    }
}
