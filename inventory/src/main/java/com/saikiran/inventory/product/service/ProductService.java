package com.saikiran.inventory.product.service;


import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.entities.Product;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import com.saikiran.inventory.product.repository.categoryRepository;
import com.saikiran.inventory.product.repository.productRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
@Slf4j
public class ProductService {

    private final productRepository productRepository;
    private final categoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;

    private String normalized(String productName){
        return productName.toLowerCase()
                    .replaceAll("[^a-z0-9]", "");
    }


    //normalize and create variant signature
    private String generateVariantSignature(Map<String, Object> attributes) {

        Map<String, String> normalizedAttributes =
                attributes.entrySet()
                          .stream()
                          .collect(Collectors.toMap(
                                  e -> normalized(e.getKey()),
                                  e -> normalized(String.valueOf(e.getValue()))
                          ));

        return normalizedAttributes.entrySet()
                                   .stream()
                                   .sorted(Map.Entry.comparingByKey())
                                   .map(e -> e.getKey() + ":" + e.getValue())
                                   .collect(Collectors.joining("|"));
    }




    public ProductIdResponse getOrCreateProductId(ProductIdRequest dto) {
        log.info("Resolving product id for productName={}, categoryId={}", dto.getProductName(), dto.getCategoryId());
        //get normalized string
        String name = normalized(dto.getProductName());

        //db search or create product id
        Product product = productRepository.findProductByNormalizedName(name)
                .orElseGet(() -> {
                    log.info("Creating product for normalizedName={}, categoryId={}", name, dto.getCategoryId());

                    Category category = categoryRepository.findById(dto.getCategoryId())
                                                          .orElseThrow(() ->
                                                                  new RuntimeException("Category not found"));

                    Product p = new Product();
                    p.setProductName(dto.getProductName());
                    p.setNormalizedName(name);
                    p.setBrand(dto.getBrand());
                    p.setCategory(category);

                     return productRepository.save(p);
                });

        log.debug("Resolved productId={} for normalizedName={}", product.getProductId(), name);
        return new ProductIdResponse(product.getProductId());
    }

    public Long getProductIdForSearchQuery(String name){
        String normalizedName = normalized(name);
        log.debug("Resolving product id for search query={}, normalizedName={}", name, normalizedName);

        Optional<Product> product = Optional.ofNullable(productRepository.findProductByNormalizedName(normalizedName)
                                                                          .orElseThrow(() -> new RuntimeException("product not found with existence business store or warehouse")));
        log.debug("Resolved productId={} for search query={}", product.get().getProductId(), name);
        return product.get()
                     .getProductId();
    }


    //variant id request

    public ProductVariantIdResponse getOrCreateProductVariantId(ProductVariantIdRequest dto){
        log.info("Resolving product variant id for productId={}, sku={}", dto.getProductId(), dto.getSku());

        Product p2 = productRepository.findByProductId(dto.getProductId())
                                      .orElseThrow(()-> new RuntimeException("product not found"));

        String signature = generateVariantSignature(dto.getAttributes());
        log.debug("Generated variant signature for productId={} with attributeCount={}", dto.getProductId(),
                dto.getAttributes() == null ? 0 : dto.getAttributes().size());

        ProductVariant productVariant = productVariantRepository.findByProductProductIdAndVariantSignature(dto.getProductId(), signature)
                .orElseGet(
                        ()->{
                            log.info("Creating product variant for productId={}, sku={}", dto.getProductId(), dto.getSku());

                            ProductVariant variant = new ProductVariant();
                            variant.setProduct(p2);
                            variant.setVariantSignature(signature);
                            variant.setSku(dto.getSku());
                            variant.setAttributes(dto.getAttributes());
                            variant.setUnitType(dto.getUnitType());
                            variant.setUnitValue(dto.getUnitValue());
                            variant.setCurrentPrice(dto.getCurrentPrice());

                            return productVariantRepository.save(variant);
                        });

        log.debug("Resolved variantId={} for productId={}", productVariant.getVariantId(), dto.getProductId());
        return new ProductVariantIdResponse(productVariant.getVariantId());

    }
}
