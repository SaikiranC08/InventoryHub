package com.saikiran.inventory.business.dto;

import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BusinessResponseDto {

    private Long businessId;

    private BusinessType businessType;

    private BusinessDomain businessDomain;

    private String businessName;

    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;

    private Long ownerId;
}
