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
import com.saikiran.inventory.inventory.enums.StockRequestStatus;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.StockRequestRepository;
import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.service.MessagingService;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final MessagingService messagingService;

    private Business getBusinessInfo(Long id) {
        log.debug("Loading business for businessId={}", id);
        return businessRepository.findBusinessByBusinessId(id)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with id: " + id));
    }

    private ProductVariant getProductVariant(Long id) {
        log.debug("Loading product variant for variantId={}", id);
        return productVariantRepository.findProductVariantByVariantId(id)
                .orElseThrow(() -> new ProductVariantNotFoundException("Product variant not found with id: " + id));
    }

    @Transactional
    public StockRequestResponse stockRequest(StockRequestDto dto) {
        log.info("Creating stock request fromBusinessId={}, toBusinessId={}, variantId={}, quantity={}",
                dto.getFromBusinessId(), dto.getToBusinessId(), dto.getProductVariantId(), dto.getQuantity());

        // Single active PENDING check
        boolean existsPending = stockRequestRepository
                .existsByFromBusiness_BusinessIdAndToBusiness_BusinessIdAndProductVariant_VariantIdAndStatus(
                        dto.getFromBusinessId(), dto.getToBusinessId(), dto.getProductVariantId(), StockRequestStatus.PENDING);

        if (existsPending) {
            log.warn("Rejected stock request creation: active PENDING request already exists for variantId={}", dto.getProductVariantId());
            throw new InvalidBusinessOperationException("An active pending request already exists for this product variant.");
        }

        Business fromBusiness = getBusinessInfo(dto.getFromBusinessId());
        Business toBusiness = getBusinessInfo(dto.getToBusinessId());
        ProductVariant variant = getProductVariant(dto.getProductVariantId());

        Conversation conversation = messagingService.getOrCreateConversation(dto.getFromBusinessId(), dto.getToBusinessId());

        StockRequest stockRequest = inventoryMapper.toStockRequest(dto);
        stockRequest.setFromBusiness(fromBusiness);
        stockRequest.setToBusiness(toBusiness);
        stockRequest.setProductVariant(variant);
        stockRequest.setConversation(conversation);
        stockRequest.setStatus(StockRequestStatus.PENDING);

        if (stockRequest.getOfferedTotalPrice() == null && stockRequest.getOfferedUnitPrice() != null) {
            stockRequest.setOfferedTotalPrice(stockRequest.getOfferedUnitPrice().multiply(BigDecimal.valueOf(stockRequest.getQuantity())));
        }

        StockRequest saved = stockRequestRepository.save(stockRequest);
        log.info("Created stock request requestId={} linked to conversationId={}", saved.getStockRequestId(), conversation.getId());
        return inventoryMapper.toResponse(saved);
    }

    public List<StockRequestResponse> getStockRequestInfo(Long businessId) {
        log.debug("Fetching stock requests for businessId={}", businessId);
        List<StockRequest> stockRequestList = stockRequestRepository
                .findStockRequestByToBusiness_BusinessIdOrderByCreatedAtDesc(businessId);
        return stockRequestList.stream().map(inventoryMapper::toResponse).toList();
    }


    @Transactional
    public void updateStockRequest(Long businessId, Long requestId, StockRequestStatus status) {
        log.info("Updating stock request requestId={} for businessId={} with status={}", requestId, businessId, status);

        StockRequest stockRequest = stockRequestRepository.findByStockRequestId(requestId)
                .orElseThrow(() -> new StockRequestNotFoundException("Stock request not found with id: " + requestId));

        if (stockRequest.getStatus() != StockRequestStatus.PENDING) {
            throw new InvalidBusinessOperationException("Request is already processed.");
        }

        // Server-side guard: Only toBusiness (seller) can approve or reject
        if (!stockRequest.getToBusiness().getBusinessId().equals(businessId)) {
            throw new InvalidBusinessOperationException("Only the seller business is authorized to process this request.");
        }

        stockRequest.setStatus(status);

        if (status == StockRequestStatus.APPROVED) {
            log.info("Stock request requestId={} approved; executing atomic stock transfer", requestId);
            StockTransferDto dto = inventoryMapper.toStockTransferDto(stockRequest);
            stockTransferService.addStockTransferInventory(dto);
        }

        stockRequestRepository.save(stockRequest);
    }

    @Transactional
    public StockRequestResponse counterStockRequest(Long businessId, Long requestId, BigDecimal counterUnitPrice, Integer counterQuantity) {
        log.info("Countering stock request requestId={} by businessId={} with unitPrice={}, quantity={}",
                requestId, businessId, counterUnitPrice, counterQuantity);

        StockRequest oldRequest = stockRequestRepository.findByStockRequestId(requestId)
                .orElseThrow(() -> new StockRequestNotFoundException("Stock request not found with id: " + requestId));

        if (oldRequest.getStatus() != StockRequestStatus.PENDING) {
            throw new InvalidBusinessOperationException("Only PENDING requests can be countered.");
        }

        boolean isParticipant = oldRequest.getFromBusiness().getBusinessId().equals(businessId) ||
                oldRequest.getToBusiness().getBusinessId().equals(businessId);
        if (!isParticipant) {
            throw new InvalidBusinessOperationException("You are not a participant in this request.");
        }

        // Mark old request as COUNTERED
        oldRequest.setStatus(StockRequestStatus.COUNTERED);
        stockRequestRepository.save(oldRequest);

        int newQty = (counterQuantity != null && counterQuantity > 0) ? counterQuantity : oldRequest.getQuantity();
        BigDecimal newUnitPrice = (counterUnitPrice != null) ? counterUnitPrice : oldRequest.getOfferedUnitPrice();
        BigDecimal newTotalPrice = newUnitPrice.multiply(BigDecimal.valueOf(newQty));

        // Create new PENDING StockRequest
        StockRequest newRequest = new StockRequest();
        newRequest.setFromBusiness(oldRequest.getFromBusiness());
        newRequest.setToBusiness(oldRequest.getToBusiness());
        newRequest.setProductVariant(oldRequest.getProductVariant());
        newRequest.setConversation(oldRequest.getConversation());
        newRequest.setQuantity(newQty);
        newRequest.setOfferedUnitPrice(newUnitPrice);
        newRequest.setOfferedTotalPrice(newTotalPrice);
        newRequest.setStatus(StockRequestStatus.PENDING);

        StockRequest savedNew = stockRequestRepository.save(newRequest);
        return inventoryMapper.toResponse(savedNew);
    }
}
