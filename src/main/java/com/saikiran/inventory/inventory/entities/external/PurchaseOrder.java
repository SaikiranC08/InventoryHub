package com.saikiran.inventory.inventory.entities.external;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_business_id", nullable = false)
    private Business toBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_business_id")
    private Business fromBusiness;

    private String supplierName;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;




}