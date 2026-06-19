package com.saikiran.inventory.inventory.entities.external;


import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.enums.MovementType;
import com.saikiran.inventory.inventory.enums.ReferenceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_movement")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockMovementId;

    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    private Long referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id",nullable = false)
    private Inventory inventory;

    private String remark;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
