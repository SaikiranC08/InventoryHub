package com.saikiran.inventory.inventory.service;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.inventory.dto.ExternalSupplierDto;
import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrder;
import com.saikiran.inventory.inventory.entities.external.PurchaseOrderItem;
import com.saikiran.inventory.inventory.entities.external.StockMovement;
import com.saikiran.inventory.inventory.enums.MovementType;
import com.saikiran.inventory.inventory.enums.OrderStatus;
import com.saikiran.inventory.inventory.enums.ReferenceType;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.inventory.repository.InventoryRepository;
import com.saikiran.inventory.inventory.repository.PurchaseOrderItemRepository;
import com.saikiran.inventory.inventory.repository.PurchaseOrderRepository;
import com.saikiran.inventory.inventory.repository.StockMovementRepository;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import com.saikiran.inventory.product.repository.productRepository;
import com.saikiran.inventory.product.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ExternalSupplierService {

    private final ProductService productService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;
    private final BusinessRepository businessRepository;
    private final ProductVariantRepository productVariantRepository;

    //helper methods
    private ProductIdResponse getOrCreateProduct(ExternalSupplierDto dto) {

        return productService.getOrCreateProductId(inventoryMapper.toProductIdDto(dto));
    }

    private ProductVariantIdResponse getOrCreateProductVariant(ExternalSupplierDto dto) {

        return productService.getOrCreateProductVariantId(inventoryMapper.toProductVariantIdDto(dto)
        );
    }

    private Business getBusiness(ExternalSupplierDto dto) {

        return businessRepository.findBusinessByBusinessId(dto.getToBusinessId())
                                 .orElseThrow(() ->
                                         new RuntimeException(" business not found"));
    }

    private PurchaseOrder createPurchaseOrder(ExternalSupplierDto dto, Business business) {

        PurchaseOrder purchaseOrder = inventoryMapper.toPurchaseOrder(dto);

        //set business to purchaseOrder
        purchaseOrder.setToBusiness(business);
        purchaseOrder.setStatus(OrderStatus.COMPLETED);

        //save purchaseOrder
        return purchaseOrderRepository.save(purchaseOrder);
    }

    private ProductVariant getProductVariant(ProductVariantIdResponse productVariantIdResponse) {

        return productVariantRepository
                .findProductVariantByVariantId(productVariantIdResponse.id())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product variant Order not found"));
    }

    private void createPurchaseOrderItem(ExternalSupplierDto dto, PurchaseOrder purchaseOrder, ProductVariant variant) {

        PurchaseOrderItem purchaseOrderItem = inventoryMapper.toPurchaseOrderItem(dto);

        purchaseOrderItem.setPurchaseOrder(purchaseOrder);

        purchaseOrderItem.setVariant(variant);

        //save
        purchaseOrderItemRepository.save(purchaseOrderItem);
    }

    private Inventory createOrUpdateInventory(ExternalSupplierDto dto, Business business, ProductVariant variant,
            ProductVariantIdResponse productVariantIdResponse) {

        Inventory inventory = inventoryRepository
                        .findInventoryByBusiness_BusinessIdAndProductVariant_VariantId(
                                dto.getToBusinessId(),
                                productVariantIdResponse.id()
                        )
                        .orElse(null);

        if (inventory == null) {
            inventory = inventoryMapper.toInventory(dto);
            inventory.setBusiness(business);
            inventory.setProductVariant(variant);

        } else {

            inventory.setQuantity(
                    inventory.getQuantity() + dto.getQuantity()
            );
        }

        return inventoryRepository.save(inventory);
    }

    private void createStockMovement(ExternalSupplierDto dto, Inventory inventory, PurchaseOrder purchaseOrder) {

        StockMovement stockMovement = inventoryMapper.toStockMovement(dto);

        stockMovement.setInventory(inventory);

        stockMovement.setMovementType(MovementType.PURCHASED);

        stockMovement.setReferenceType(ReferenceType.PURCHASE_ORDER);

        stockMovement.setReferenceId(purchaseOrder.getPurchaseOrderId());

        stockMovementRepository.save(stockMovement);
    }


    @Transactional
    public void addInventoryStockByExternalSupplier(ExternalSupplierDto dto) {

        //getting product id -1
        ProductIdResponse productId = getOrCreateProduct(dto);

        dto.setProductId(productId.productId());

        //getting product variant id -2
        ProductVariantIdResponse productVariantIdResponse = getOrCreateProductVariant(dto);

        //purchase order -3
        Business business = getBusiness(dto);

        PurchaseOrder purchaseOrder = createPurchaseOrder(dto, business);

        //purchase oder item -4
        ProductVariant variant = getProductVariant(productVariantIdResponse);

        createPurchaseOrderItem(dto, purchaseOrder, variant);

        //  inventory -5
        Inventory inventory = createOrUpdateInventory(
                dto,
                business,
                variant,
                productVariantIdResponse
        );

        //   stock movement -6
        createStockMovement(dto, inventory, purchaseOrder);
    }
}
