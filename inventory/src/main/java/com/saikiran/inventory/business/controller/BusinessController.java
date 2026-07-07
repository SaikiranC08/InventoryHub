package com.saikiran.inventory.business.controller;


import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.service.BusinessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/business")
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping
    public ResponseEntity<BusinessResponseDto> addBusinessInfo(
            @RequestHeader("X-User-Id") @NotNull Long ownerId,
            @RequestBody @Valid BusinessRequestDto BusinessRequestDto
    ){

        BusinessRequestDto.setOwnerId(ownerId);
        BusinessResponseDto dto = businessService.addBusinessInfo(BusinessRequestDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dto);

    }

    @GetMapping
    public ResponseEntity<List<BusinessResponseDto>> getBusinessInfo(
            @RequestHeader("X-User-Id") @NotNull Long ownerId
    ){
        return ResponseEntity
                .ok(businessService.getBusinessInfoByOwnerId(ownerId));

    }

    @DeleteMapping("/{businessId}")
    public ResponseEntity<BusinessResponseDto> deleteBusinessInfo(
            @RequestHeader("X-User-Id") @NotNull Long ownerId,
            @PathVariable Long businessId
    ){
        return ResponseEntity.ok(businessService.deleteBusinessInfo(businessId,ownerId));

    }

    @PatchMapping("/{businessId}")
    public ResponseEntity<BusinessResponseDto> updateBusinessInfo(
            @RequestHeader("X-User-Id") @NotNull Long ownerId,
            @PathVariable("businessId") Long businessId,
            @RequestBody @Valid BusinessRequestDto dto
    ){

        dto.setOwnerId(ownerId);
        return ResponseEntity.ok(businessService.updateBusinessInfo(dto,businessId));
    }

    @GetMapping("/{businessId}")
    public ResponseEntity<BusinessResponseDto> getBusinessInfoById(
            @RequestHeader("X-User-Id") Long ownerId,
            @PathVariable Long businessId
    ){

        return ResponseEntity
                .ok(businessService.getBusinessInfoByOwnerIdAndBusinessId(ownerId,businessId));
    }

}
