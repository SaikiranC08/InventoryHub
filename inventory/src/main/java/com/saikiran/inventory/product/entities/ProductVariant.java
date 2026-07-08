package com.saikiran.inventory.product.entities;


import com.saikiran.inventory.product.enums.UnitType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "product_variants",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "product_id",
                                "variant_signature"
                        }
                )
        }
)
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long variantId;

    private String sku;
    private String variantSignature;

    @Enumerated(EnumType.STRING)
    private UnitType unitType;
    private BigDecimal unitValue;
    private BigDecimal currentPrice;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
