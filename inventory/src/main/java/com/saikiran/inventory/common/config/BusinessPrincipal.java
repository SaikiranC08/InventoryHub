package com.saikiran.inventory.common.config;

import java.security.Principal;


public class BusinessPrincipal implements Principal {

    private final Long businessId;

    public BusinessPrincipal(Long businessId){
        this.businessId = businessId;
    }
    public Long getBusinessId() {
        return businessId;
    }

    @Override
    public String getName() {
        return businessId.toString();
    }

    @Override
    public String toString() {
        return "BusinessPrincipal{businessId=" + businessId + '}';
    }
}
