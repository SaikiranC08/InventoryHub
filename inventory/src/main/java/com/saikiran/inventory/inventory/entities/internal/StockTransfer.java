package com.saikiran.inventory.inventory.entities.internal;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import com.saikiran.inventory.product.entities.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_business_id", nullable = false)
    private Business fromBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_business_id", nullable = false)
    private Business toBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
