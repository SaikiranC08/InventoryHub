package com.saikiran.inventory.product.entities;

import com.saikiran.inventory.product.enums.AttributeDataType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "category_attributes",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"category_id", "attribute_key"}
                )
        }
)
public class CategoryAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryAttributeId;

    private String attributeKey;

    @Enumerated(EnumType.STRING)
    private AttributeDataType dataType;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
