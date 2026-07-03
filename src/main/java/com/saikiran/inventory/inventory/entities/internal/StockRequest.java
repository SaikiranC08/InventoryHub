package com.saikiran.inventory.inventory.entities.internal;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.product.entities.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "stock_request")
public class StockRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_business",nullable = false)
    private Business toBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_business",nullable = false)
    private Business fromBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant",nullable = false)
    private ProductVariant productVariant;

    private Integer quantity;
    private BigDecimal offeredUnitPrice;
    private BigDecimal offeredTotalPrice;
    private StockRequestStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
