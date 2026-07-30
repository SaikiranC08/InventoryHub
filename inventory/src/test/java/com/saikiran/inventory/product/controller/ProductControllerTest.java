package com.saikiran.inventory.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saikiran.inventory.product.dto.request.ProductIdRequest;
import com.saikiran.inventory.product.dto.request.ProductVariantIdRequest;
import com.saikiran.inventory.product.dto.response.ProductIdResponse;
import com.saikiran.inventory.product.dto.response.ProductVariantIdResponse;
import com.saikiran.inventory.product.enums.UnitType;
import com.saikiran.inventory.product.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService productService;

    @Test
    void shouldReturnUnitTypes() throws Exception {
        mockMvc.perform(get("/api/v1/products/unit-types"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().string(org.hamcrest.Matchers.containsString(UnitType.BOX.name())));
    }

    @Test
    void shouldCreateOrFindProductId() throws Exception {
        ProductIdRequest request = ProductIdRequest.builder()
                .productName("Rice")
                .brand("Aashirvaad")
                .categoryId(3L)
                .build();

        when(productService.getOrCreateProductId(any(ProductIdRequest.class)))
                .thenReturn(new ProductIdResponse(100L));

        mockMvc.perform(post("/api/v1/products/create-or-find")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(100));

        verify(productService).getOrCreateProductId(any(ProductIdRequest.class));
    }

    @Test
    void shouldCreateOrFindVariantId() throws Exception {
        ProductVariantIdRequest request = ProductVariantIdRequest.builder()
                .productId(100L)
                .sku("SKU-001")
                .unitType(UnitType.BOX)
                .unitValue(BigDecimal.ONE)
                .currentPrice(BigDecimal.valueOf(120))
                .attributes(Map.of("color", "red"))
                .build();

        when(productService.getOrCreateProductVariantId(any(ProductVariantIdRequest.class)))
                .thenReturn(new ProductVariantIdResponse(200L));

        mockMvc.perform(post("/api/v1/products/product-variant/create-or-find")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(200));

        verify(productService).getOrCreateProductVariantId(any(ProductVariantIdRequest.class));
    }
}
