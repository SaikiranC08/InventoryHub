package com.saikiran.inventory.business.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import com.saikiran.inventory.business.service.BusinessService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.springframework.http.MediaType;

@WebMvcTest(BusinessController.class)
public class BusinessControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private BusinessService businessService;
    @Autowired
    private ObjectMapper objectMapper;


    @Test
    void shouldAddBusinessSuccessfully()throws Exception{

        BusinessRequestDto requestDto = BusinessRequestDto.builder()
        .businessType(BusinessType.STORE)
        .businessDomain(BusinessDomain.ELECTRONICS)
        .businessName("Gadgets shop")
        .address("Main Road")
        .city("Mumbai")
        .state("Maharashtra")
        .pincode("400001")
        .country("India")
        .build();

        BusinessResponseDto responseDto = new BusinessResponseDto();
        responseDto.setBusinessName("Gadgets shop");
        responseDto.setOwnerId(1L);
        responseDto.setBusinessId(1L);
        responseDto.setCity("Mumbai");

        when(businessService.addBusinessInfo(any(BusinessRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/business")
                        .header("X-User-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))

                .andExpect(status().isCreated())

                .andExpect(jsonPath("$.businessId").value(1))

                .andExpect(jsonPath("$.businessName").value("Gadgets shop"))

                .andExpect(jsonPath("$.city").value("Mumbai"));

        verify(businessService)
                .addBusinessInfo(any(BusinessRequestDto.class));

    }

    @Test
    void shouldGetBusinessInfo() throws Exception {

            List<BusinessResponseDto> responseDtos = List.of(
                    BusinessResponseDto.builder()
                            .businessId(1L)
                            .businessName("Gadgets")
                            .build()
            );

            when(businessService.getBusinessInfoByOwnerId(1L))
                    .thenReturn(responseDtos);

            mockMvc.perform(get("/api/v1/business")
                            .header("X-User-Id", 1L))

                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].businessId").value(1))
                    .andExpect(jsonPath("$[0].businessName").value("Gadgets"));

            verify(businessService)
                    .getBusinessInfoByOwnerId(1L);
}

        @Test
        void shouldUpdateBusinessInfo() throws Exception{

                BusinessRequestDto requestDto = BusinessRequestDto.builder()
                .businessType(BusinessType.STORE)
                .businessDomain(BusinessDomain.ELECTRONICS)
                .businessName("Electronics shop")
                .address("Main Road")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400001")
                .country("India")
                .build();

                BusinessResponseDto responseDto = new BusinessResponseDto();
                responseDto.setBusinessName("Electronics shop");
                responseDto.setOwnerId(1L);
                responseDto.setBusinessId(1L);
                responseDto.setCity("Mumbai");

                when(businessService.updateBusinessInfo(
                any(BusinessRequestDto.class),
                eq(1L)))
                 .thenReturn(responseDto);

                mockMvc.perform(patch("/api/v1/business/{businessId}", 1L)
                .header("X-User-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessId").value(1))
                .andExpect(jsonPath("$.businessName").value("Electronics shop"))
                .andExpect(jsonPath("$.city").value("Mumbai"));

                verify(businessService)
                .updateBusinessInfo(any(BusinessRequestDto.class), eq(1L));

        
        }


}
