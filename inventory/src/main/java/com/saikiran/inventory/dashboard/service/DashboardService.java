package com.saikiran.inventory.dashboard.service;

import com.saikiran.inventory.dashboard.dto.DashboardSummaryResponse;
import com.saikiran.inventory.dashboard.dto.SalesChartResponse;
import com.saikiran.inventory.dashboard.dto.TopSellingProductResponse;
import com.saikiran.inventory.dashboard.repository.DashboardRepository;
import com.saikiran.inventory.inventory.repository.StockRequestRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final StockRequestRepository stockRequestRepository;

    public DashboardSummaryResponse getSummary(Long businessId){

        Long totalProducts = dashboardRepository.countDistinctProductVariants(businessId);
        Long lowStockProducts = dashboardRepository.countLowStock(businessId);
        Long outOfStockProducts = dashboardRepository.countOutOfStock(businessId);
        Long pendingStockRequests = dashboardRepository.countPendingStockRequests(businessId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = now;

        Long todayPurchaseOrders = dashboardRepository.countPurchaseOrdersBetween(businessId, startOfToday, endOfToday);
        Long todaySalesOrders = dashboardRepository.countSalesOrdersBetween(businessId, startOfToday, endOfToday);

        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDateTime startOfMonth = firstOfMonth.atStartOfDay();

        Long monthlyPurchaseOrders = dashboardRepository.countPurchaseOrdersBetween(businessId, startOfMonth, endOfToday);
        Long monthlySalesOrders = dashboardRepository.countSalesOrdersBetween(businessId, startOfMonth, endOfToday);

        Long completedTransfers = dashboardRepository.countCompletedTransfers(businessId);

        return new DashboardSummaryResponse(
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                pendingStockRequests,
                todayPurchaseOrders,
                todaySalesOrders,
                monthlyPurchaseOrders,
                monthlySalesOrders,
                completedTransfers
        );
    }

    public List<TopSellingProductResponse> getTopSellingProducts(Long businessId){
        return dashboardRepository.topSellingProducts(businessId,5);
    }

    public List<SalesChartResponse> getSalesChart(Long businessId, String range){
        // determine start/end based on range
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        List<String> labels = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        Map<String, Long> salesMap = new HashMap<>();
        Map<String, Long> purchaseMap = new HashMap<>();

        switch (Optional.ofNullable(range).orElse("MONTH").toUpperCase()){
            case "DAY":
                start = now.minusHours(23).withMinute(0).withSecond(0).withNano(0);
                // labels for each hour
                for(int i=0;i<24;i++){
                    LocalDateTime t = start.plusHours(i);
                    labels.add(String.format("%02d:00", t.getHour()));
                }
                dashboardRepository.aggregateSalesByHour(businessId,start,now).forEach(r->{
                    Integer hour = (Integer) r[0];
                    Long sum = ((Number) r[1]).longValue();
                    salesMap.put(String.format("%02d:00", hour), sum);
                });
                dashboardRepository.aggregatePurchasesByHour(businessId,start,now).forEach(r->{
                    Integer hour = (Integer) r[0];
                    Long sum = ((Number) r[1]).longValue();
                    purchaseMap.put(String.format("%02d:00", hour), sum);
                });
                break;
            case "WEEK":
                start = now.minusDays(6).toLocalDate().atStartOfDay();
                for(int i=0;i<7;i++){
                    LocalDate d = start.toLocalDate().plusDays(i);
                    labels.add(d.format(dayFmt));
                }
                dashboardRepository.aggregateSalesByDay(businessId,start,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Integer d = (Integer) r[2];
                    Long sum = ((Number) r[3]).longValue();
                    String key = LocalDate.of(y,m,d).format(dayFmt);
                    salesMap.put(key,sum);
                });
                dashboardRepository.aggregatePurchasesByDay(businessId,start,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Integer d = (Integer) r[2];
                    Long sum = ((Number) r[3]).longValue();
                    String key = LocalDate.of(y,m,d).format(dayFmt);
                    purchaseMap.put(key,sum);
                });
                break;
            case "YEAR":
                start = now.minusYears(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                // build 12 months labels
                LocalDate base = now.toLocalDate().withDayOfMonth(1).minusMonths(11);
                for(int i=0;i<12;i++){
                    labels.add(base.plusMonths(i).format(monthFmt));
                }
                LocalDateTime monthStart = start;
                dashboardRepository.aggregateSalesByMonth(businessId,monthStart,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Long sum = ((Number) r[2]).longValue();
                    String key = LocalDate.of(y,m,1).format(monthFmt);
                    salesMap.put(key,sum);
                });
                dashboardRepository.aggregatePurchasesByMonth(businessId,monthStart,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Long sum = ((Number) r[2]).longValue();
                    String key = LocalDate.of(y,m,1).format(monthFmt);
                    purchaseMap.put(key,sum);
                });
                break;
            case "MONTH":
            default:
                // Last 30 days grouped by day
                start = now.minusDays(29).toLocalDate().atStartOfDay();
                for(int i=0;i<30;i++){
                    LocalDate d = start.toLocalDate().plusDays(i);
                    labels.add(d.format(dayFmt));
                }
                dashboardRepository.aggregateSalesByDay(businessId,start,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Integer d = (Integer) r[2];
                    Long sum = ((Number) r[3]).longValue();
                    String key = LocalDate.of(y,m,d).format(dayFmt);
                    salesMap.put(key,sum);
                });
                dashboardRepository.aggregatePurchasesByDay(businessId,start,now).forEach(r->{
                    Integer y = (Integer) r[0];
                    Integer m = (Integer) r[1];
                    Integer d = (Integer) r[2];
                    Long sum = ((Number) r[3]).longValue();
                    String key = LocalDate.of(y,m,d).format(dayFmt);
                    purchaseMap.put(key,sum);
                });
                break;
        }

        List<SalesChartResponse> result = new ArrayList<>();
        for(String label: labels){
            Long s = salesMap.getOrDefault(label, 0L);
            Long p = purchaseMap.getOrDefault(label, 0L);
            result.add(new SalesChartResponse(label, s, p));
        }

        return result;
    }
}