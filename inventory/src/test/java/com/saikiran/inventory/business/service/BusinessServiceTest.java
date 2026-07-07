package com.saikiran.inventory.business.service;

import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import com.saikiran.inventory.business.mapper.businessResponseMapper;
import com.saikiran.inventory.business.repository.BusinessRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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

    //deleting business info
    @Test
    void shouldDeleteBusinessInfo(){
        Business business = new Business();
        business.setBusinessId(1L);

        BusinessResponseDto dto = new BusinessResponseDto();
        dto.setBusinessId(1L);

        Mockito.when(businessRepository.findByOwnerIdAndBusinessId(2L,1L)).thenReturn(Optional.of(business));
        Mockito.when(businessResponseMapper.toResponseDto(business)).thenReturn(dto);
        BusinessResponseDto result = businessService.deleteBusinessInfo(1L,2L);

        verify(businessRepository,times(1)).deleteByBusinessIdAndOwnerId(1L,2L);
        assertEquals(1L,result.getBusinessId());
    }

    @Test
    void shouldNotDeleteBusinessInfoWhenBusinessInfoNotFound(){

        RuntimeException exception = assertThrows(RuntimeException.class,
                ()->businessService.deleteBusinessInfo(1L,2L));

        assertEquals("Business info not found",exception.getMessage());

        verifyNoInteractions(businessResponseMapper);
    }

    //specific business info
    @Test
    void shouldGetBusinessInfoWhenBusinessIdAndOwnerIdPresent(){
        Business business = new Business();
        business.setBusinessId(1L);
        business.setOwnerId(2L);

        BusinessResponseDto dto = new BusinessResponseDto();
        dto.setBusinessId(1L);
        dto.setOwnerId(2L);

        Mockito.when(businessRepository.findByOwnerIdAndBusinessId(2L,1L)).thenReturn(Optional.of(business));
        Mockito.when(businessResponseMapper.toResponseDto(business)).thenReturn(dto);

        BusinessResponseDto result = businessService.getBusinessInfoByOwnerIdAndBusinessId(2L,1L);

        assertEquals(1L,result.getBusinessId());
        assertEquals(2L,business.getOwnerId());

        verify(businessRepository).findByOwnerIdAndBusinessId(2L,1L);
        verify(businessResponseMapper).toResponseDto(business);

    }
    @Test
    void shouldUpdateBusinessInfo() {

        // Arrange

        Business business = new Business();
        business.setBusinessId(1L);
        business.setCity("thane");

        BusinessRequestDto request = new BusinessRequestDto();
        request.setOwnerId(2L);
        request.setCity("mumbai");

        BusinessResponseDto responseDto = new BusinessResponseDto();
        responseDto.setBusinessId(1L);
        responseDto.setCity("mumbai");

        when(businessRepository.findByOwnerIdAndBusinessId(2L, 1L))
                .thenReturn(Optional.of(business));

        // Simulate what MapStruct does
        doAnswer(invocation -> {
            BusinessRequestDto dto = invocation.getArgument(0);
            Business entity = invocation.getArgument(1);

            entity.setCity(dto.getCity());

            return null;
        }).when(businessResponseMapper)
          .updateInfoByDto(any(BusinessRequestDto.class), any(Business.class));

        when(businessRepository.save(business))
                .thenReturn(business);

        when(businessResponseMapper.toResponseDto(business))
                .thenReturn(responseDto);

        // Act

        BusinessResponseDto result =
                businessService.updateBusinessInfo(request, 1L);

        // Assert

        assertNotNull(result);
        assertEquals("mumbai", result.getCity());

        verify(businessRepository)
                .findByOwnerIdAndBusinessId(2L, 1L);

        verify(businessResponseMapper)
                .updateInfoByDto(request, business);

        verify(businessRepository)
                .save(business);

        verify(businessResponseMapper)
                .toResponseDto(business);
    }
}