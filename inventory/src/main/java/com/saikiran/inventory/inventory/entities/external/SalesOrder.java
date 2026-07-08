package com.saikiran.inventory.inventory.entities.external;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "sales_orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long salesOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_business_id", nullable = false)
    private Business fromBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_business_id")
    private Business toBusiness;

    private String customerName;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;


}
