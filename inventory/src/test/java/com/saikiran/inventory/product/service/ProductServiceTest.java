package com.saikiran.inventory.product.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.entities.Category;
import com.saikiran.inventory.product.entities.Product;
import com.saikiran.inventory.product.entities.ProductVariant;
import com.saikiran.inventory.product.enums.UnitType;
import com.saikiran.inventory.product.repository.ProductVariantRepository;
import com.saikiran.inventory.product.repository.categoryRepository;
import com.saikiran.inventory.product.repository.productRepository;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {
    
    @InjectMocks
    private ProductService productService;
    @Mock
    private productRepository productRepository;
    @Mock
    private categoryRepository categoryRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;


    @Test
    void shouldGetProductId(){

        ProductIdRequest productIdRequest = ProductIdRequest.builder()
                                            .brand("Apple")
                                            .categoryId(1L)
                                            .productName("Iphone 13 pro")
                                            .build();


        Category category = Category.builder()
                                .categoryId(1L).build();

        Product product = Product.builder()
                            .brand("Apple")
                            .productId(1L)
                            .category(category)
                            .productName("Iphone 13 pro")
                            .normalizedName("iphone13pro")
                            .build();
                    
        when(productRepository.findProductByNormalizedName(anyString())).thenReturn(Optional.of(product));
        ProductIdResponse result = productService.getOrCreateProductId(productIdRequest);

        assertEquals(1L, result.productId());
        verifyNoInteractions(categoryRepository);
    }

    @Test
    void shouldCreateProductId(){

        ProductIdRequest productIdRequest = ProductIdRequest.builder()
                                            .brand("Apple")
                                            .categoryId(1L)
                                            .productName("Iphone 13 pro")
                                            .build();

        Category category = Category.builder()
                                .categoryId(1L).build();
        
        Product product = Product.builder()
                            .brand("Apple")
                            .productId(1L)
                            .productName("Iphone 13 pro")
                            .build();  
                            
         when(productRepository.findProductByNormalizedName(anyString())).thenReturn(Optional.empty());
         when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));                   
         when(productRepository.save(any(Product.class))).thenReturn(product);
         ProductIdResponse result = productService.getOrCreateProductId(productIdRequest);

         assertEquals(1L, result.productId());
         verify(productRepository).save(any(Product.class));
    }

    @Test
    void shouldGetProductVariantId(){


            ProductVariantIdRequest variantIdRequest = ProductVariantIdRequest.builder()
                                                            .productId(1L)
                                                            .unitType(UnitType.BOX)
                                                            .unitValue(BigDecimal.valueOf(10000))
                                                            .attributes(Map.of("color","red","ram","8GB","storage","128GB"))
                                                            .build();

            Product product = Product.builder()
                                .productId(1L)
                                .productName("nothing xr")
                                .brand("nothing")
                                .build();
                        
            ProductVariant productVariant = ProductVariant.builder()
                                            .product(product)
                                            .variantId(1L)
                                            .variantSignature("color:red|ram:8GB|storage:128GB") 
                                            .unitType(UnitType.BOX)
                                            .unitValue(BigDecimal.valueOf(10000))
                                            .build();

           when(productRepository.findByProductId(1L)).thenReturn(Optional.of(product));
           when(productVariantRepository.findByProductProductIdAndVariantSignature(anyLong(),anyString())).thenReturn(Optional.of(productVariant));
            ProductVariantIdResponse result = productService.getOrCreateProductVariantId(variantIdRequest);

            assertEquals(1L, result.id());
            verify(productRepository).findByProductId(1L);

            verify(productVariantRepository)
                    .findByProductProductIdAndVariantSignature(anyLong(), anyString());

            verify(productVariantRepository, never()).save(any(ProductVariant.class));

    }

        @Test
        void shouldThrowExceptionWhenProductNotFound() {

                // Arrange
                ProductVariantIdRequest request = ProductVariantIdRequest.builder()
                        .productId(1L)
                        .unitType(UnitType.BOX)
                        .unitValue(BigDecimal.valueOf(10000))
                        .attributes(Map.of(
                                "color", "red",
                                "ram", "8GB",
                                "storage", "128GB"))
                        .build();

                when(productRepository.findByProductId(1L))
                        .thenReturn(Optional.empty());

                // Act & Assert
                RuntimeException exception = assertThrows(
                        RuntimeException.class,
                        () -> productService.getOrCreateProductVariantId(request)
                );

                assertEquals("product not found", exception.getMessage());

                verify(productRepository).findByProductId(1L);

                verifyNoInteractions(productVariantRepository);
            }
}
