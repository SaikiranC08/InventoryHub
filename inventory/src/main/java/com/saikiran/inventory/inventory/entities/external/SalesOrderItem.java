package com.saikiran.inventory.inventory.entities.external;

import com.saikiran.inventory.product.entities.ProductVariant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;



@Entity
@Table(name = "sales_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long salesOrderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}