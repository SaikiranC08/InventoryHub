package com.saikiran.inventory.business.controller;


import com.saikiran.inventory.business.dto.BusinessRequestDto;
import com.saikiran.inventory.business.dto.BusinessResponseDto;
import com.saikiran.inventory.business.service.BusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Business", description = "Business management APIs")
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping
    @Operation(summary = "Create a business", description = "Creates a business for the authenticated user.")
    public ResponseEntity<BusinessResponseDto> addBusinessInfo(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            @NotNull Long ownerId,
            @RequestBody @Valid BusinessRequestDto BusinessRequestDto
    ){

        BusinessRequestDto.setOwnerId(ownerId);
        BusinessResponseDto dto = businessService.addBusinessInfo(BusinessRequestDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dto);

    }

    @GetMapping
    @Operation(summary = "List my businesses", description = "Returns all businesses owned by the authenticated user.")
    public ResponseEntity<List<BusinessResponseDto>> getBusinessInfo(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            @NotNull Long ownerId
    ){
        return ResponseEntity
                .ok(businessService.getBusinessInfoByOwnerId(ownerId));

    }

    @DeleteMapping("/{businessId}")
    @Operation(summary = "Delete a business", description = "Deletes a business by id for the authenticated user.")
    public ResponseEntity<BusinessResponseDto> deleteBusinessInfo(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            @NotNull Long ownerId,
            @PathVariable
            @Parameter(description = "Business id", required = true, example = "10")
            Long businessId
    ){
        return ResponseEntity.ok(businessService.deleteBusinessInfo(businessId,ownerId));

    }

    @PatchMapping("/{businessId}")
    @Operation(summary = "Update a business", description = "Updates business details for the authenticated user.")
    public ResponseEntity<BusinessResponseDto> updateBusinessInfo(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            @NotNull Long ownerId,
            @PathVariable("businessId")
            @Parameter(description = "Business id", required = true, example = "10")
            Long businessId,
            @RequestBody @Valid BusinessRequestDto dto
    ){

        dto.setOwnerId(ownerId);
        return ResponseEntity.ok(businessService.updateBusinessInfo(dto,businessId));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "Get a business", description = "Returns a business by id for the authenticated user.")
    public ResponseEntity<BusinessResponseDto> getBusinessInfoById(
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long ownerId,
            @PathVariable
            @Parameter(description = "Business id", required = true, example = "10")
            Long businessId
    ){

        return ResponseEntity
                .ok(businessService.getBusinessInfoByOwnerIdAndBusinessId(ownerId,businessId));
    }

}
