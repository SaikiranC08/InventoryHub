package com.saikiran.inventory.business.mapper;


import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.entity.Business;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface businessResponseMapper {

    @Mapping(target = "businessId" , ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    Business toBusinessEntity(BusinessRequestDto dto);

    BusinessResponseDto toResponseDto(Business dto);

    @Mapping(target = "businessId" , ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt",ignore = true)
    void updateInfoByDto(BusinessRequestDto dto, @MappingTarget Business info);
}
