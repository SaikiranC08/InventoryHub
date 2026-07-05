package com.saikiran.inventory.business.service;


import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.mapper.businessResponseMapper;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.common.exception.BusinessNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class BusinessService {

    private final businessResponseMapper businessResponseMapper;
    private final BusinessRepository businessRepository;

    //adding new businessInfo
    public BusinessResponseDto addBusinessInfo(BusinessRequestDto dto){

        Business info = businessResponseMapper.toBusinessEntity(dto);
        businessRepository.save(info);
        return businessResponseMapper.toResponseDto(info);
    }

    //getting all business related to ownerId
    public List<BusinessResponseDto> getBusinessInfoByOwnerId(Long id){
        if(id == null){
            throw new RuntimeException("send ownerId");
        }
       List<Business> info = businessRepository.findByOwnerId(id);

        return info.stream().map(businessResponseMapper::toResponseDto).toList();
    }

    //deleting the business info
    @Transactional
    public BusinessResponseDto deleteBusinessInfo(Long id, Long ownerId){
        Business info = businessRepository.findByOwnerIdAndBusinessId(ownerId,id)
                                          .orElseThrow(() ->
                                                  new BusinessNotFoundException("Business info not found")
                                          );

        businessRepository.deleteByBusinessIdAndOwnerId(id,ownerId);

        return businessResponseMapper.toResponseDto(info);
    }

    //get business info by business id and owner id
    public BusinessResponseDto getBusinessInfoByOwnerIdAndBusinessId(Long ownerId, Long businessId) {
        Business info = businessRepository.findByOwnerIdAndBusinessId(ownerId,businessId)
                                          .orElseThrow(() ->
                                                  new BusinessNotFoundException("Business info not found")
                                          );



        return businessResponseMapper.toResponseDto(info);

    }


    public BusinessResponseDto updateBusinessInfo(BusinessRequestDto dto, Long businessId) {
        Business info = businessRepository.findByOwnerIdAndBusinessId(dto.getOwnerId(), businessId)
                .orElseThrow(() ->
                        new BusinessNotFoundException("Business info not found")
                );

            businessResponseMapper.updateInfoByDto(dto,info);

            businessRepository.save(info);

            return businessResponseMapper.toResponseDto(info);
    }

    public Long getBusinessIdForUser(Long userId) {
        return businessRepository.findBusinessIdByOwnerId(userId)
                                 .orElseThrow(() -> new BusinessNotFoundException("No business found for user: " + userId));
    }
}
