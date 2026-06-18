package com.saikiran.inventory.business.dto;

import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class BusinessRequestDto {

    @NotNull(message = "Business type is required")
    private BusinessType businessType;

    @NotNull(message = "Business domain is required")
    private BusinessDomain businessDomain;

    @NotBlank(message = "Business name is required")
    @Size(min = 3, max = 50,
            message = "Business name must be between 3 and 100 characters")
    private String businessName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "Country is required")
    private String country;

    private Long ownerId;
}
