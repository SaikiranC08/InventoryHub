package com.saikiran.inventory.inventory.service;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.common.exception.BusinessNotFoundException;
import com.saikiran.inventory.common.exception.InvalidBusinessOperationException;
import com.saikiran.inventory.common.exception.ProductVariantNotFoundException;
import com.saikiran.inventory.common.exception.StockRequestNotFoundException;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class StockRequestService {

    private final StockRequestRepository stockRequestRepository;
    private final InventoryMapper inventoryMapper;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockTransferService stockTransferService;

    private Business getBusinessInfo(Long id){
        log.debug("Loading business for businessId={}", id);
        return businessRepository.findBusinessByBusinessId(id)
                                 .orElseThrow(()-> new BusinessNotFoundException("business not found"));
    }

    private ProductVariant getProductVariant(Long id){
        log.debug("Loading product variant for variantId={}", id);
        return productVariantRepository.findProductVariantByVariantId(id)
                                       .orElseThrow(()-> new ProductVariantNotFoundException("business not found"));
    }


    //stock requesting methods
    public void stockRequest(StockRequestDto dto){
        log.info("Creating stock request fromBusinessId={}, toBusinessId={}, variantId={}, quantity={}",
                dto.getFromBusinessId(), dto.getToBusinessId(), dto.getProductVariantId(), dto.getQuantity());
        StockRequest stockRequest = inventoryMapper.toStockRequest(dto);
        stockRequest.setFromBusiness(getBusinessInfo(dto.getFromBusinessId()));
        stockRequest.setToBusiness(getBusinessInfo(dto.getToBusinessId()));
        stockRequest.setProductVariant(getProductVariant(dto.getProductVariantId()));
        stockRequest.setStatus(StockRequestStatus.PENDING);
        StockRequest saved = stockRequestRepository.save(stockRequest);
        log.info("Created stock request requestId={} fromBusinessId={} toBusinessId={}",
                saved.getStockRequestId(), dto.getFromBusinessId(), dto.getToBusinessId());
    }

    public List<StockRequestResponse> getStockRequestInfo(Long businessId){
        log.debug("Fetching pending stock requests for businessId={}", businessId);
        List<StockRequest> stockRequestList = stockRequestRepository.findStockRequestByToBusiness_BusinessIdAndStatus(businessId,StockRequestStatus.PENDING);

        if (stockRequestList.isEmpty()){
            log.warn("No pending stock requests found for businessId={}", businessId);
            throw new InvalidBusinessOperationException("No pending requests found");
        }
        log.debug("Found {} pending stock requests for businessId={}", stockRequestList.size(), businessId);

        return stockRequestList.stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }


    //stock approval or rejection
    @Transactional
    public void updateStockRequest(Long businessId, Long requestId, StockRequestStatus status) {
        log.info("Updating stock request requestId={} for businessId={} with status={}", requestId, businessId, status);

        //validating the authorized user approving or rejecting
        StockRequest stockRequest = stockRequestRepository.findByStockRequestId(requestId)
                .orElseThrow(()-> new StockRequestNotFoundException("stock request not found"));

        if(stockRequest.getStatus() != StockRequestStatus.PENDING){
            log.warn("Rejected stock request update because requestId={} is already processed", requestId);
            throw new InvalidBusinessOperationException(
                    "Request already processed"
            );
        }

        if(!stockRequest.getToBusiness().getBusinessId().equals(businessId)){
            log.warn("Rejected stock request update because businessId={} is not authorized for requestId={}", businessId, requestId);
            throw new InvalidBusinessOperationException(
                    "You are not authorized to process this request."
            );
        }

        //main logic
        stockRequest.setStatus(status);
        if(status == StockRequestStatus.APPROVED){
            log.info("Stock request requestId={} approved; triggering transfer", requestId);
            StockTransferDto dto = inventoryMapper.toStockTransferDto(stockRequest);

            stockTransferService.addStockTransferInventory(dto);
        }
        stockRequestRepository.save(stockRequest);
        log.info("Updated stock request requestId={} to status={}", requestId, status);

    }



}
