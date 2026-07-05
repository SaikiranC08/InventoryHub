package com.saikiran.inventory.business.service;

import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import com.saikiran.inventory.business.mapper.businessResponseMapper;
import com.saikiran.inventory.business.repository.BusinessRepository;

import net.bytebuddy.asm.Advice;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessServiceTest {

    @InjectMocks
    private BusinessService businessService;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private businessResponseMapper businessResponseMapper;

    @Test
    void shouldAddBusinessInfo() {

        // Arrange- dto&mock

        BusinessRequestDto request = BusinessRequestDto.builder()
                                                       .businessName("Electro")
                                                       .businessDomain(BusinessDomain.ELECTRONICS)
                                                       .businessType(BusinessType.STORE)
                                                       .city("Thane")
                                                       .state("MH")
                                                       .country("India")
                                                       .address("Sai Nagar")
                                                       .pincode("400601")
                                                       .ownerId(12L)
                                                       .build();

        Business businessEntity = new Business();
        businessEntity.setBusinessName("Electro");

        BusinessResponseDto responseDto = BusinessResponseDto.builder()
                                                             .businessName("Electro")
                                                             .build();

        when(businessResponseMapper.toBusinessEntity(request))
                .thenReturn(businessEntity);

        when(businessRepository.save(businessEntity))
                .thenReturn(businessEntity);

        when(businessResponseMapper.toResponseDto(businessEntity))
                .thenReturn(responseDto);

        //service call

        BusinessResponseDto result =
                businessService.addBusinessInfo(request);

        // Assert

        assertNotNull(result);
        assertEquals("Electro", result.getBusinessName());

        verify(businessResponseMapper)
                .toBusinessEntity(request);

        verify(businessRepository)
                .save(businessEntity);

        verify(businessResponseMapper)
                .toResponseDto(businessEntity);

        verifyNoMoreInteractions(
                businessRepository,
                businessResponseMapper);
    }

    @Test
    void shouldGetBusinessInfoByOwner(){


        BusinessResponseDto info = new BusinessResponseDto();
        info.setBusinessId(1L);

        List<Business> businessList = new ArrayList<>();
        Business info1 = new Business();
        info1.setBusinessId(1L);
        businessList.add(info1);


        Mockito.when(businessRepository.findByOwnerId(1L)).thenReturn(businessList);
        Mockito.when(businessResponseMapper.toResponseDto(info1)).thenReturn(info);

        List<BusinessResponseDto> result = businessService.getBusinessInfoByOwnerId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L,result.getFirst().getBusinessId());
        verify(businessRepository).findByOwnerId(1L);
        verify(businessResponseMapper).toResponseDto(info1);

    }


    @Test
    void shouldReturnEmptyListWhenOwnerHasNoBusinesses(){

        Mockito.when(businessRepository.findByOwnerId(1L)).thenReturn(Collections.emptyList());
        List<BusinessResponseDto> result = businessService.getBusinessInfoByOwnerId(1L);

        assertEquals(0,result.size());
    }

    @Test
    void shouldThrowExceptionWhenOwnerIdIsNull() {


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> businessService.getBusinessInfoByOwnerId(null)
                );

        assertEquals(
                "send ownerId",
                exception.getMessage()
        );

        verifyNoInteractions(
                businessRepository,
                businessResponseMapper
        );
    }
}