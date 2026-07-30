package com.saikiran.inventory.business.service;


import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.mapper.businessResponseMapper;
import com.saikiran.inventory.business.repository.BusinessRepository;
import com.saikiran.inventory.common.exception.BusinessNotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class BusinessService {

    private final businessResponseMapper businessResponseMapper;
    private final BusinessRepository businessRepository;

    //adding new businessInfo
    public BusinessResponseDto addBusinessInfo(BusinessRequestDto dto){
        log.info("Creating business for ownerId={}, businessName={}", dto.getOwnerId(), dto.getBusinessName());
        Business info = businessResponseMapper.toBusinessEntity(dto);
        businessRepository.save(info);
        log.info("Created business businessId={}, ownerId={}", info.getBusinessId(), info.getOwnerId());
        return businessResponseMapper.toResponseDto(info);
    }

    //getting all business related to ownerId
    public List<BusinessResponseDto> getBusinessInfoByOwnerId(Long id){
        if(id == null){
            log.warn("Business lookup requested without ownerId");
            throw new RuntimeException("send ownerId");
        }
        log.debug("Fetching businesses for ownerId={}", id);
       List<Business> info = businessRepository.findByOwnerId(id);
        log.debug("Found {} businesses for ownerId={}", info.size(), id);

        return info.stream().map(businessResponseMapper::toResponseDto).toList();
    }

    public Optional<Business> getBusinessInfoById(Long id){
        if(id == null){
            log.warn("Business lookup requested without businessId");
            throw new RuntimeException("send ownerId");
        }
        log.debug("Fetching business by businessId={}", id);
        return businessRepository.findBusinessByBusinessId(id);
    }


    //deleting the business info
    @Transactional
    public BusinessResponseDto deleteBusinessInfo(Long id, Long ownerId){
        log.info("Deleting business businessId={}, ownerId={}", id, ownerId);
        Business info = businessRepository.findByOwnerIdAndBusinessId(ownerId,id)
                                          .orElseThrow(() ->
                                                  new BusinessNotFoundException("Business info not found")
                                          );

        businessRepository.deleteByBusinessIdAndOwnerId(id,ownerId);
        log.info("Deleted business businessId={}, ownerId={}", id, ownerId);

        return businessResponseMapper.toResponseDto(info);
    }

    //get business info by business id and owner id
    public BusinessResponseDto getBusinessInfoByOwnerIdAndBusinessId(Long ownerId, Long businessId) {
        log.debug("Fetching business by ownerId={} and businessId={}", ownerId, businessId);
        Business info = businessRepository.findByOwnerIdAndBusinessId(ownerId,businessId)
                                          .orElseThrow(() ->
                                                  new BusinessNotFoundException("Business info not found")
                                          );



        return businessResponseMapper.toResponseDto(info);

    }


    public BusinessResponseDto updateBusinessInfo(BusinessRequestDto dto, Long businessId) {
        log.info("Updating business businessId={} for ownerId={}", businessId, dto.getOwnerId());
        Business info = businessRepository.findByOwnerIdAndBusinessId(dto.getOwnerId(), businessId)
                .orElseThrow(() ->
                        new BusinessNotFoundException("Business info not found")
                );

            businessResponseMapper.updateInfoByDto(dto,info);

            businessRepository.save(info);
            log.info("Updated business businessId={} for ownerId={}", businessId, dto.getOwnerId());

            return businessResponseMapper.toResponseDto(info);
    }

    public Long getBusinessIdForUser(Long userId) {
        log.debug("Resolving businessId for userId={}", userId);
        Long businessId = businessRepository.findBusinessIdByOwnerId(userId)
                                 .orElseThrow(() -> new BusinessNotFoundException("No business found for user: " + userId));
        log.debug("Resolved businessId={} for userId={}", businessId, userId);
        return businessId;
    }
}
