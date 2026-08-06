package com.saikiran.inventory.inventory.dto;

import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class StockRequestResponse {
    @Schema(description = "Stock request id", example = "1")
    private Long requestId;
    @Schema(description = "Target business id", example = "20")
    private Long toBusinessId;
    @Schema(description = "Target business name", example = "Test Seller")
    private String toBusinessName;
    @Schema(description = "Source business id", example = "10")
    private Long fromBusinessId;
    @Schema(description = "Source business name", example = "Test Buyer")
    private String fromBusinessName;
    @Schema(description = "Product variant id", example = "200")
    private Long productVariantId;
    @Schema(description = "Product name", example = "iPhone 15")

    private String productName;
    @Schema(description = "SKU", example = "IPHONE15-256")
    private String sku;
    @Schema(description = "Conversation id", example = "50")
    private Long conversationId;
    @Schema(description = "Quantity", example = "5")
    private Integer quantity;
    @Schema(description = "Offered unit price", example = "120.50")
    private BigDecimal offeredUnitPrice;
    @Schema(description = "Offered total price", example = "602.50")
    private BigDecimal offeredTotalPrice;
    @Schema(description = "Request status", example = "PENDING")
    private StockRequestStatus status;
}
