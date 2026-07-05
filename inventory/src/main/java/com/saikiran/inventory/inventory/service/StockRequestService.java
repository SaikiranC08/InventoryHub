package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.inventory.dto.StockRequestDto;
import com.saikiran.inventory.inventory.dto.StockRequestResponse;
import com.saikiran.inventory.inventory.dto.StockTransferDto;
import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.StockRequestRepository;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class StockRequestService {

    private final StockRequestRepository stockRequestRepository;
    private final InventoryMapper inventoryMapper;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockTransferService stockTransferService;

    private Business getBusinessInfo(Long id){
        return businessRepository.findBusinessByBusinessId(id)
                                 .orElseThrow(()-> new RuntimeException("business not found"));
    }

    private ProductVariant getProductVariant(Long id){
        return productVariantRepository.findProductVariantByVariantId(id)
                                       .orElseThrow(()-> new RuntimeException("business not found"));
    }


    //stock requesting methods
    public void stockRequest(StockRequestDto dto){
        StockRequest stockRequest = inventoryMapper.toStockRequest(dto);
        stockRequest.setFromBusiness(getBusinessInfo(dto.getFromBusinessId()));
        stockRequest.setToBusiness(getBusinessInfo(dto.getToBusinessId()));
        stockRequest.setProductVariant(getProductVariant(dto.getProductVariantId()));
        stockRequest.setStatus(StockRequestStatus.PENDING);
        stockRequestRepository.save(stockRequest);
    }

    public List<StockRequestResponse> getStockRequestInfo(Long businessId){
        List<StockRequest> stockRequestList = stockRequestRepository.findStockRequestByToBusiness_BusinessIdAndStatus(businessId,StockRequestStatus.PENDING);

        if (stockRequestList.isEmpty()){
            throw new RuntimeException("No pending requests found");
        }

        return stockRequestList.stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }


    //stock approval or rejection
    @Transactional
    public void updateStockRequest(Long businessId, Long requestId, StockRequestStatus status) {

        //validating the authorized user approving or rejecting
        StockRequest stockRequest = stockRequestRepository.findByStockRequestId(requestId)
                .orElseThrow(()-> new RuntimeException("stock request not found"));

        if(stockRequest.getStatus() != StockRequestStatus.PENDING){
            throw new RuntimeException(
                    "Request already processed"
            );
        }

        if(!stockRequest.getToBusiness().getBusinessId().equals(businessId)){
            throw new RuntimeException(
                    "You are not authorized to process this request."
            );
        }

        //main logic
        stockRequest.setStatus(status);
        if(status == StockRequestStatus.APPROVED){
            StockTransferDto dto = inventoryMapper.toStockTransferDto(stockRequest);

            stockTransferService.addStockTransferInventory(dto);
        }
        stockRequestRepository.save(stockRequest);

    }



}
