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
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
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
        //get normalized string
        String name = normalized(dto.getProductName());

        //db search or create product id
        Product product = productRepository.findProductByNormalizedName(name)
                .orElseGet(() -> {

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

        return new ProductIdResponse(product.getProductId());
    }


    //variant id request

    public ProductVariantIdResponse getOrCreateProductVariantId(ProductVariantIdRequest dto){

        Product p2 = productRepository.findByProductId(dto.getProductId())
                                      .orElseThrow(()-> new RuntimeException("product not found"));

        String signature = generateVariantSignature(dto.getAttributes());

        ProductVariant productVariant = productVariantRepository.findByProductProductIdAndVariantSignature(dto.getProductId(), signature)
                .orElseGet(
                        ()->{

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

        return new ProductVariantIdResponse(productVariant.getVariantId());

    }
}
