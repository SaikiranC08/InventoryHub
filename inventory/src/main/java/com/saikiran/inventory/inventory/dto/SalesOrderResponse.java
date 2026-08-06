package com.saikiran.inventory.inventory.dto;

import com.saikiran.inventory.inventory.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalesOrderResponse {
    private Long salesOrderId;
    private Long fromBusinessId;
    private String fromBusinessName;
    private String customerName;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<SalesOrderItemResponse> items;
    private BigDecimal totalAmount;
}
