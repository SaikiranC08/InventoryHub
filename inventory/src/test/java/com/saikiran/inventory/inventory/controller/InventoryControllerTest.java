package com.saikiran.inventory.inventory.controller;



import com.fasterxml.jackson.databind.ObjectMapper;
import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.inventory.dto.ExternalSupplierDto;
import com.saikiran.inventory.inventory.service.ExternalSupplierService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.mockito.ArgumentCaptor;


@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ExternalSupplierService externalSupplierService;

    @MockitoBean
    private BusinessService businessService;

    @Test
    void shouldAddInventoryStockWhenExternalSupplierProvidesStock() throws Exception {

        ExternalSupplierDto supplierDto = ExternalSupplierDto.builder()
                                                             .build();

        when(businessService.getBusinessIdForUser(1L))
                .thenReturn(1L);

        doNothing().when(externalSupplierService)
                   .addInventoryStockByExternalSupplier(any(ExternalSupplierDto.class));

        mockMvc.perform(post("/api/v1/inventory/external-supplier")
                       .header("X-User-Id", 1L)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(supplierDto)))
               .andExpect(status().isOk())
               .andExpect(content().string("Stock added successfully"));

        verify(businessService).getBusinessIdForUser(1L);

        ArgumentCaptor<ExternalSupplierDto> captor =
                ArgumentCaptor.forClass(ExternalSupplierDto.class);

        verify(externalSupplierService)
                .addInventoryStockByExternalSupplier(captor.capture());

        assertEquals(1L, captor.getValue().getToBusinessId());
    }
}
