package com.saikiran.inventory.business.dto;

import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BusinessResponseDto {

    @Schema(description = "Business id", example = "10")
    private Long businessId;

    @Schema(description = "Business type", example = "RETAIL")
    private BusinessType businessType;

    @Schema(description = "Business domain", example = "GROCERY")
    private BusinessDomain businessDomain;

    @Schema(description = "Business name", example = "Sai Mart")
    private String businessName;

    @Schema(description = "Street address", example = "12 Main Road")
    private String address;
    @Schema(description = "City", example = "Hyderabad")
    private String city;
    @Schema(description = "State", example = "Telangana")
    private String state;
    @Schema(description = "Postal code", example = "500001")
    private String pincode;
    @Schema(description = "Country", example = "India")
    private String country;

    @Schema(description = "Owner user id", example = "1")
    private Long ownerId;
}
