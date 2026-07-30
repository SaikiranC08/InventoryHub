package com.saikiran.inventory.inventory.service;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.inventory.dto.StockTransferDto;
import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.entities.external.StockMovement;
import com.saikiran.inventory.inventory.entities.internal.StockTransfer;
import com.saikiran.inventory.inventory.enums.MovementType;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import com.saikiran.inventory.inventory.enums.ReferenceType;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.inventory.repository.StockMovementRepository;
import com.saikiran.inventory.inventory.repository.StockTransferRepository;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Slf4j
public class StockTransferService {

    // update the stock transfer table -> update the from business inventory -> update the to business inventory

    private final InventoryMapper inventoryMapper;
    private final StockTransferRepository stockTransferRepository;
    private final InventoryRepository inventoryRepository;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockMovementRepository stockMovementRepository;

    private Business getBusinessInfo(Long id){
        log.debug("Loading business for businessId={}", id);
        return businessRepository.findBusinessByBusinessId(id)
                .orElseThrow(()-> new RuntimeException("business not found"));
    }

    private ProductVariant getProductVariant(Long id){
        log.debug("Loading product variant for variantId={}", id);
        return productVariantRepository.findProductVariantByVariantId(id)
                                       .orElseThrow(()-> new RuntimeException("business not found"));
    }

    //increment the stock
    private Inventory updateToBusinessInventory(StockTransferDto dto,Business tobusiness,ProductVariant variant){
     log.debug("Updating destination inventory for businessId={}, variantId={}, quantity={}",
             tobusiness.getBusinessId(), dto.getProductVariantId(), dto.getQuantity());
     Inventory inventory =  inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(dto.getToBusinessId(), dto.getProductVariantId())
                                               .orElse(null);

     if(inventory == null){
         //new product for that business
         log.info("Creating destination inventory for businessId={}, variantId={}", tobusiness.getBusinessId(), dto.getProductVariantId());
         Inventory inventory1 = new Inventory();

         inventory1.setQuantity(dto.getQuantity());
         inventory1.setBusiness(tobusiness);
         inventory1.setProductVariant(variant);
         inventory1.setReorderLevel(10);
        return inventoryRepository.save(inventory1);
     }
     else {

         log.info("Incrementing destination inventory for businessId={}, variantId={}", tobusiness.getBusinessId(), dto.getProductVariantId());
         inventory.setQuantity(inventory.getQuantity() + dto.getQuantity());
        return inventoryRepository.save(inventory);
     }
    }

    //reduce stock level in from business
    private Inventory updateFromBusinessInventory(StockTransferDto dto){
        log.debug("Updating source inventory for businessId={}, variantId={}, quantity={}",
                dto.getFromBusinessId(), dto.getProductVariantId(), dto.getQuantity());
        Inventory inventory = inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(dto.getFromBusinessId(), dto.getProductVariantId())
                .orElseThrow(()->new RuntimeException("inventory not found"));

        if(inventory.getQuantity() >= dto.getQuantity()){
            inventory.setQuantity(inventory.getQuantity() - dto.getQuantity());
        }
        else{
            log.warn("Insufficient stock for transfer from businessId={}, variantId={}, available={}, requested={}",
                    dto.getFromBusinessId(), dto.getProductVariantId(), inventory.getQuantity(), dto.getQuantity());
            throw new RuntimeException("stock are less than sale");
        }
        Inventory saved = inventoryRepository.save(inventory);
        log.debug("Updated source inventory for businessId={}, variantId={}, quantity={}",
                dto.getFromBusinessId(), dto.getProductVariantId(), saved.getQuantity());
        return saved;
    }

    private StockTransfer addStockTransfer(StockTransferDto dto,Business toBusiness,Business fromBusiness,ProductVariant variant){
        log.debug("Creating stock transfer record fromBusinessId={} toBusinessId={} variantId={}",
                fromBusiness.getBusinessId(), toBusiness.getBusinessId(), variant.getVariantId());
        StockTransfer stockTransfer = inventoryMapper.toStockTransfer(dto);
        stockTransfer.setFromBusiness(fromBusiness);
        stockTransfer.setToBusiness(toBusiness);
        stockTransfer.setVariant(variant);
        stockTransfer.setStatus(OrderStatus.COMPLETED);
        StockTransfer saved = stockTransferRepository.save(stockTransfer);
        log.info("Created stock transfer transferId={} fromBusinessId={} toBusinessId={}",
                saved.getTransferId(), fromBusiness.getBusinessId(), toBusiness.getBusinessId());
        return saved;
    }


    private void createTransferOutMovement(StockTransferDto dto,Inventory inventory,StockTransfer stockTransfer){
        log.debug("Creating transfer-out movement for transferId={}, inventoryId={}", stockTransfer.getTransferId(), inventory.getInventoryId());
        StockMovement stockMovement = inventoryMapper.toStockMovement(dto);

        stockMovement.setInventory(inventory);
        stockMovement.setMovementType(MovementType.TRANSFER_OUT);
        stockMovement.setReferenceType(ReferenceType.STOCK_TRANSFER);
        stockMovement.setReferenceId(stockTransfer.getTransferId());
        stockMovement.setRemark(
                "Transferred to business " + stockTransfer.getToBusiness().getBusinessId()
        );
        stockMovementRepository.save(stockMovement);

    }

    private void createTransferInMovement(StockTransferDto dto,Inventory inventory,StockTransfer stockTransfer){
        log.debug("Creating transfer-in movement for transferId={}, inventoryId={}", stockTransfer.getTransferId(), inventory.getInventoryId());
        StockMovement stockMovement = inventoryMapper.toStockMovement(dto);

        stockMovement.setInventory(inventory);
        stockMovement.setMovementType(MovementType.TRANSFER_IN);
        stockMovement.setReferenceType(ReferenceType.STOCK_TRANSFER);
        stockMovement.setReferenceId(stockTransfer.getTransferId());
        stockMovement.setRemark(
                "Received from business " + stockTransfer.getFromBusiness().getBusinessId()
        );
        stockMovementRepository.save(stockMovement);

    }


    @Transactional
    public void addStockTransferInventory(StockTransferDto dto){
        log.info("Starting stock transfer fromBusinessId={}, toBusinessId={}, variantId={}, quantity={}",
                dto.getFromBusinessId(), dto.getToBusinessId(), dto.getProductVariantId(), dto.getQuantity());

        if(dto.getFromBusinessId().equals(dto.getToBusinessId())){
            log.warn("Rejected stock transfer to same businessId={}", dto.getFromBusinessId());
            throw new RuntimeException(
                    "Cannot transfer to same business"
            );
        }
        if(dto.getQuantity() <= 0){
            log.warn("Rejected stock transfer with non-positive quantity fromBusinessId={}, quantity={}",
                    dto.getFromBusinessId(), dto.getQuantity());
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }


        Business toBusiness = getBusinessInfo(dto.getToBusinessId());
        Business fromBusiness = getBusinessInfo(dto.getFromBusinessId());
        ProductVariant variant = getProductVariant(dto.getProductVariantId());

        Inventory fromBusinessInventory = updateFromBusinessInventory(dto);
        Inventory toBusinessInventory =  updateToBusinessInventory(dto,toBusiness,variant);
        StockTransfer stockTransfer = addStockTransfer(dto,toBusiness,fromBusiness,variant);

        createTransferOutMovement(dto,fromBusinessInventory,stockTransfer);
        createTransferInMovement(dto,toBusinessInventory,stockTransfer);
        log.info("Completed stock transfer transferId={} fromBusinessId={} toBusinessId={}",
                stockTransfer.getTransferId(), fromBusiness.getBusinessId(), toBusiness.getBusinessId());

    }

}
