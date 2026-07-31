package com.saikiran.inventory.dashboard.controller;

import com.saikiran.inventory.dashboard.dto.DashboardSummaryResponse;
import com.saikiran.inventory.dashboard.dto.SalesChartResponse;
import com.saikiran.inventory.dashboard.dto.TopSellingProductResponse;
import com.saikiran.inventory.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Dashboard APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Dashboard summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Business id", required = true, example = "10")
            @NotNull Long businessId
    ){
        return ResponseEntity.ok(dashboardService.getSummary(businessId));
    }

    @GetMapping("/top-selling-products")
    @Operation(summary = "Top selling products")
    public ResponseEntity<List<TopSellingProductResponse>> topSelling(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Business id", required = true, example = "10")
            @NotNull Long businessId
    ){
        return ResponseEntity.ok(dashboardService.getTopSellingProducts(businessId));
    }

    @GetMapping("/sales-chart")
    @Operation(summary = "Sales vs purchases chart")
    public ResponseEntity<List<SalesChartResponse>> salesChart(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Business id", required = true, example = "10")
            @NotNull Long businessId,
            @RequestParam(value = "range", required = false) String range
    ){
        return ResponseEntity.ok(dashboardService.getSalesChart(businessId, range));
    }
}
