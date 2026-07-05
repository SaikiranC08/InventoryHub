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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class StockTransferService {

    // update the stock transfer table -> update the from business inventory -> update the to business inventory

    private final InventoryMapper inventoryMapper;
    private final StockTransferRepository stockTransferRepository;
    private final InventoryRepository inventoryRepository;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockMovementRepository stockMovementRepository;

    private Business getBusinessInfo(Long id){
        return businessRepository.findBusinessByBusinessId(id)
                .orElseThrow(()-> new RuntimeException("business not found"));
    }

    private ProductVariant getProductVariant(Long id){
        return productVariantRepository.findProductVariantByVariantId(id)
                                       .orElseThrow(()-> new RuntimeException("business not found"));
    }

    //increment the stock
    private Inventory updateToBusinessInventory(StockTransferDto dto,Business tobusiness,ProductVariant variant){
     Inventory inventory =  inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(dto.getToBusinessId(), dto.getProductVariantId())
                                               .orElse(null);

     if(inventory == null){
         //new product for that business
         Inventory inventory1 = new Inventory();

         inventory1.setQuantity(dto.getQuantity());
         inventory1.setBusiness(tobusiness);
         inventory1.setProductVariant(variant);
         inventory1.setReorderLevel(10);
        return inventoryRepository.save(inventory1);
     }
     else {

         inventory.setQuantity(inventory.getQuantity() + dto.getQuantity());
        return inventoryRepository.save(inventory);
     }
    }

    //reduce stock level in from business
    private Inventory updateFromBusinessInventory(StockTransferDto dto){
        Inventory inventory = inventoryRepository.findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(dto.getFromBusinessId(), dto.getProductVariantId())
                .orElseThrow(()->new RuntimeException("inventory not found"));

        if(inventory.getQuantity() >= dto.getQuantity()){
            inventory.setQuantity(inventory.getQuantity() - dto.getQuantity());
        }
        else{
            throw new RuntimeException("stock are less than sale");
        }
        return inventoryRepository.save(inventory);
    }

    private StockTransfer addStockTransfer(StockTransferDto dto,Business toBusiness,Business fromBusiness,ProductVariant variant){
        StockTransfer stockTransfer = inventoryMapper.toStockTransfer(dto);
        stockTransfer.setFromBusiness(fromBusiness);
        stockTransfer.setToBusiness(toBusiness);
        stockTransfer.setVariant(variant);
        stockTransfer.setStatus(OrderStatus.COMPLETED);
        return stockTransferRepository.save(stockTransfer);
    }


    private void createTransferOutMovement(StockTransferDto dto,Inventory inventory,StockTransfer stockTransfer){
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

        if(dto.getFromBusinessId().equals(dto.getToBusinessId())){
            throw new RuntimeException(
                    "Cannot transfer to same business"
            );
        }
        if(dto.getQuantity() <= 0){
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

    }

}
