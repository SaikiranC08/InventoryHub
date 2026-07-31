package com.saikiran.inventory.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesChartResponse {
    private String label;
    private Long sales;
    private Long purchases;
}
