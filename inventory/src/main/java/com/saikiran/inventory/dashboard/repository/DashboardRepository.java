package com.saikiran.inventory.dashboard.repository;

import com.saikiran.inventory.dashboard.dto.TopSellingProductResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class DashboardRepository {

    @PersistenceContext
    private EntityManager em;

    public Long countDistinctProductVariants(Long businessId){
        String q = "SELECT COUNT(i) FROM Inventory i WHERE i.business.businessId = :businessId";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).getSingleResult();
    }

    public Long countLowStock(Long businessId){
        String q = "SELECT COUNT(i) FROM Inventory i WHERE i.business.businessId = :businessId AND i.quantity > 0 AND i.quantity <= i.reorderLevel";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).getSingleResult();
    }

    public Long countOutOfStock(Long businessId){
        String q = "SELECT COUNT(i) FROM Inventory i WHERE i.business.businessId = :businessId AND i.quantity = 0";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).getSingleResult();
    }

    public Long countPendingStockRequests(Long businessId){
        String q = "SELECT COUNT(sr) FROM StockRequest sr WHERE sr.toBusiness.businessId = :businessId AND sr.status = com.saikiran.inventory.inventory.enums.StockRequestStatus.PENDING";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).getSingleResult();
    }

    public Long countPurchaseOrdersBetween(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT COUNT(po) FROM PurchaseOrder po WHERE po.toBusiness.businessId = :businessId AND po.createdAt BETWEEN :start AND :end";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).setParameter("start", start).setParameter("end", end).getSingleResult();
    }

    public Long countSalesOrdersBetween(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT COUNT(so) FROM SalesOrder so WHERE so.fromBusiness.businessId = :businessId AND so.createdAt BETWEEN :start AND :end";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).setParameter("start", start).setParameter("end", end).getSingleResult();
    }

    public Long countCompletedTransfers(Long businessId){
        String q = "SELECT COUNT(st) FROM StockTransfer st WHERE (st.fromBusiness.businessId = :businessId OR st.toBusiness.businessId = :businessId) AND st.status = com.saikiran.inventory.inventory.enums.OrderStatus.COMPLETED";
        return em.createQuery(q, Long.class).setParameter("businessId", businessId).getSingleResult();
    }

    public List<TopSellingProductResponse> topSellingProducts(Long businessId, int limit){
        String q = "SELECT new com.saikiran.inventory.dashboard.dto.TopSellingProductResponse(v.variantId, v.product.productName, v.sku, SUM(si.quantity)) " +
                "FROM SalesOrderItem si JOIN si.variant v WHERE si.salesOrder.fromBusiness.businessId = :businessId " +
                "GROUP BY v.variantId, v.product.productName, v.sku ORDER BY SUM(si.quantity) DESC";

        return em.createQuery(q, TopSellingProductResponse.class)
                .setParameter("businessId", businessId)
                .setMaxResults(limit)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregateSalesByHour(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT HOUR(so.createdAt), SUM(si.quantity) FROM SalesOrderItem si JOIN si.salesOrder so " +
                "WHERE so.fromBusiness.businessId = :businessId AND so.createdAt BETWEEN :start AND :end " +
                "GROUP BY HOUR(so.createdAt) ORDER BY HOUR(so.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregatePurchasesByHour(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT HOUR(po.createdAt), SUM(pi.quantity) FROM PurchaseOrderItem pi JOIN pi.purchaseOrder po " +
                "WHERE po.toBusiness.businessId = :businessId AND po.createdAt BETWEEN :start AND :end " +
                "GROUP BY HOUR(po.createdAt) ORDER BY HOUR(po.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregateSalesByDay(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(so.createdAt), MONTH(so.createdAt), DAY(so.createdAt), SUM(si.quantity) FROM SalesOrderItem si JOIN si.salesOrder so " +
                "WHERE so.fromBusiness.businessId = :businessId AND so.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(so.createdAt), MONTH(so.createdAt), DAY(so.createdAt) " +
                "ORDER BY YEAR(so.createdAt), MONTH(so.createdAt), DAY(so.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregatePurchasesByDay(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(po.createdAt), MONTH(po.createdAt), DAY(po.createdAt), SUM(pi.quantity) FROM PurchaseOrderItem pi JOIN pi.purchaseOrder po " +
                "WHERE po.toBusiness.businessId = :businessId AND po.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(po.createdAt), MONTH(po.createdAt), DAY(po.createdAt) " +
                "ORDER BY YEAR(po.createdAt), MONTH(po.createdAt), DAY(po.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregateSalesByMonth(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(so.createdAt), MONTH(so.createdAt), SUM(si.quantity) FROM SalesOrderItem si JOIN si.salesOrder so " +
                "WHERE so.fromBusiness.businessId = :businessId AND so.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(so.createdAt), MONTH(so.createdAt) " +
                "ORDER BY YEAR(so.createdAt), MONTH(so.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregatePurchasesByMonth(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(po.createdAt), MONTH(po.createdAt), SUM(pi.quantity) FROM PurchaseOrderItem pi JOIN pi.purchaseOrder po " +
                "WHERE po.toBusiness.businessId = :businessId AND po.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(po.createdAt), MONTH(po.createdAt) " +
                "ORDER BY YEAR(po.createdAt), MONTH(po.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregateSalesByYear(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(so.createdAt), SUM(si.quantity) FROM SalesOrderItem si JOIN si.salesOrder so " +
                "WHERE so.fromBusiness.businessId = :businessId AND so.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(so.createdAt) " +
                "ORDER BY YEAR(so.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> aggregatePurchasesByYear(Long businessId, LocalDateTime start, LocalDateTime end){
        String q = "SELECT YEAR(po.createdAt), SUM(pi.quantity) FROM PurchaseOrderItem pi JOIN pi.purchaseOrder po " +
                "WHERE po.toBusiness.businessId = :businessId AND po.createdAt BETWEEN :start AND :end " +
                "GROUP BY YEAR(po.createdAt) " +
                "ORDER BY YEAR(po.createdAt)";
        return em.createQuery(q, Object[].class)
                .setParameter("businessId", businessId)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
}