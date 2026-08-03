package com.saikiran.inventory.inventory.dto;

import com.saikiran.inventory.product.enums.UnitType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Safe DTO for GET /api/v1/inventory — structured to match the frontend's expected shape.
 * Avoids Hibernate lazy-proxy serialization by using only primitive/scalar types.
 */
public class InventoryResponse {

    private Long inventoryId;
    private Integer quantity;
    private int reorderLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ProductVariantDto productVariant;
    private Long businessId;

    public InventoryResponse() {}

    /** Constructor used by JPQL projection — unitType comes as enum from HQL */
    public InventoryResponse(
            Long inventoryId,
            Integer quantity,
            int reorderLevel,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Long variantId,
            String sku,
            UnitType unitType,
            BigDecimal unitValue,
            BigDecimal currentPrice,
            String productName,
            String brand,
            String categoryName,
            Long businessId
    ) {
        this.inventoryId = inventoryId;
        this.quantity = quantity;
        this.reorderLevel = reorderLevel;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.businessId = businessId;

        ProductDto product = new ProductDto(productName, brand, new CategoryDto(categoryName));
        this.productVariant = new ProductVariantDto(variantId, sku,
                unitType != null ? unitType.name() : null,
                unitValue, currentPrice, null, product);
    }


    // --- Getters ---

    public Long getInventoryId() { return inventoryId; }
    public Integer getQuantity() { return quantity; }
    public int getReorderLevel() { return reorderLevel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public ProductVariantDto getProductVariant() { return productVariant; }
    public Long getBusinessId() { return businessId; }

    // ---- Nested DTOs ----

    public static class CategoryDto {
        private final String categoryName;
        public CategoryDto(String categoryName) { this.categoryName = categoryName; }
        public String getCategoryName() { return categoryName; }
    }

    public static class ProductDto {
        private final String productName;
        private final String brand;
        private final CategoryDto category;

        public ProductDto(String productName, String brand, CategoryDto category) {
            this.productName = productName;
            this.brand = brand;
            this.category = category;
        }
        public String getProductName() { return productName; }
        public String getBrand() { return brand; }
        public CategoryDto getCategory() { return category; }
    }

    public static class ProductVariantDto {
        private final Long variantId;
        private final String sku;
        private final String unitType;
        private final BigDecimal unitValue;
        private final BigDecimal currentPrice;
        private final Map<String, Object> attributes;
        private final ProductDto product;

        public ProductVariantDto(Long variantId, String sku, String unitType, BigDecimal unitValue,
                                  BigDecimal currentPrice, Map<String, Object> attributes, ProductDto product) {
            this.variantId = variantId;
            this.sku = sku;
            this.unitType = unitType;
            this.unitValue = unitValue;
            this.currentPrice = currentPrice;
            this.attributes = attributes;
            this.product = product;
        }

        public Long getVariantId() { return variantId; }
        public String getSku() { return sku; }
        public String getUnitType() { return unitType; }
        public BigDecimal getUnitValue() { return unitValue; }
        public BigDecimal getCurrentPrice() { return currentPrice; }
        public Map<String, Object> getAttributes() { return attributes; }
        public ProductDto getProduct() { return product; }
    }
}
