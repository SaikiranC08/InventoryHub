package com.saikiran.inventory.business.dto;

import com.saikiran.inventory.business.enums.BusinessDomain;
import com.saikiran.inventory.business.enums.BusinessType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BusinessRequestDto {

    @NotNull(message = "Business type is required")
    @Schema(description = "Business type", requiredMode = Schema.RequiredMode.REQUIRED, example = "RETAIL")
    private BusinessType businessType;

    @NotNull(message = "Business domain is required")
    @Schema(description = "Business domain", requiredMode = Schema.RequiredMode.REQUIRED, example = "GROCERY")
    private BusinessDomain businessDomain;

    @NotBlank(message = "Business name is required")
    @Size(min = 3, max = 50,
            message = "Business name must be between 3 and 100 characters")
    @Schema(description = "Business name", requiredMode = Schema.RequiredMode.REQUIRED, example = "Sai Mart")
    private String businessName;

    @NotBlank(message = "Address is required")
    @Schema(description = "Street address", requiredMode = Schema.RequiredMode.REQUIRED, example = "12 Main Road")
    private String address;

    @NotBlank(message = "City is required")
    @Schema(description = "City", requiredMode = Schema.RequiredMode.REQUIRED, example = "Hyderabad")
    private String city;

    @NotBlank(message = "State is required")
    @Schema(description = "State", requiredMode = Schema.RequiredMode.REQUIRED, example = "Telangana")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Schema(description = "Postal code", requiredMode = Schema.RequiredMode.REQUIRED, example = "500001")
    private String pincode;

    @NotBlank(message = "Country is required")
    @Schema(description = "Country", requiredMode = Schema.RequiredMode.REQUIRED, example = "India")
    private String country;

    @Schema(hidden = true)
    private Long ownerId;
}
