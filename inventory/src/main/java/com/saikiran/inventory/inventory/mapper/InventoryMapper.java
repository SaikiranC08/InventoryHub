package com.saikiran.inventory.inventory.mapper;



import com.saikiran.inventory.inventory.dto.*;
import com.saikiran.inventory.inventory.entities.Inventory;
import com.saikiran.inventory.inventory.entities.external.*;
import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.entities.internal.StockTransfer;
import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {


    ProductIdRequest toProductIdDto(ExternalSupplierDto dto);

    ProductVariantIdRequest toProductVariantIdDto(ExternalSupplierDto dto);

    @Mapping(target = "purchaseOrderId" , ignore = true)
    @Mapping(target = "toBusiness", ignore = true)
    @Mapping(target = "fromBusiness", ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    PurchaseOrder toPurchaseOrder(ExternalSupplierDto dto);

    @Mapping(target = "purchaseOrderItemId" , ignore = true)
    @Mapping(target = "purchaseOrder", ignore = true)
    @Mapping(target = "variant", ignore = true)
    PurchaseOrderItem toPurchaseOrderItem(ExternalSupplierDto dto);

    //external buyer
    @Mapping(target = "toBusiness", ignore = true)
    @Mapping(target = "fromBusiness", ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    SalesOrder toSalesOrder(ExternalBuyerDto dto);

    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "salesOrder", ignore = true)
    SalesOrderItem toSalesOrderItem(ExternalBuyerDto dto);


    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "business",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    @Mapping(target = "inventoryId",ignore = true)
    Inventory toInventory(ExternalSupplierDto dto);

    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "business",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    @Mapping(target = "inventoryId",ignore = true)
    Inventory toInventory(ExternalBuyerDto dto);


    @Mapping(target = "stockMovementId" , ignore = true)
    @Mapping(target = "inventory",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    StockMovement toStockMovement(ExternalSupplierDto dto);

    @Mapping(target = "stockMovementId", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    StockMovement toStockMovement(ExternalBuyerDto dto);


    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "toBusiness",ignore = true)
    @Mapping(target = "fromBusiness",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    StockTransfer toStockTransfer(StockTransferDto dto);

    @Mapping(target = "stockMovementId", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    StockMovement toStockMovement(StockTransferDto dto);

    //stock requesting
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "toBusiness",ignore = true)
    @Mapping(target = "fromBusiness",ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    StockRequest toStockRequest(StockRequestDto dto);

    @Mapping(target = "fromBusinessId", source = "fromBusiness.businessId")
    @Mapping(target = "toBusinessId", source = "toBusiness.businessId")
    @Mapping(target = "productVariantId", source = "productVariant.variantId")
    StockRequestResponse toResponse(StockRequest entity);

    //stock request entity to stock transfer dto
    @Mapping(target = "fromBusinessId", source = "fromBusiness.businessId")
    @Mapping(target = "toBusinessId", source = "toBusiness.businessId")
    @Mapping(target = "productVariantId", source = "productVariant.variantId")
    @Mapping(target = "unitPrice" , source = "offeredUnitPrice")
    @Mapping(target = "totalPrice" , source = "offeredTotalPrice")
    @Mapping(target = "orderStatus",ignore = true)
    StockTransferDto toStockTransferDto(StockRequest entity);
}
