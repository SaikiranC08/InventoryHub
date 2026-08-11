package com.saikiran.inventory.common.config;

import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.exception.BusinessAccessDeniedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class BusinessSecurityInterceptor implements HandlerInterceptor {

    private final BusinessService businessService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String businessIdHeader = request.getHeader("X-Business-Id");
        String userIdHeader = request.getHeader("X-User-Id");

        if (businessIdHeader != null && !businessIdHeader.isBlank()) {
            if (userIdHeader == null || userIdHeader.isBlank()) {
                log.warn("Access denied: X-Business-Id header present but X-User-Id missing on path {}", request.getRequestURI());
                throw new BusinessAccessDeniedException("Authenticated user ID missing in request header");
            }

            try {
                Long businessId = Long.parseLong(businessIdHeader);
                Long userId = Long.parseLong(userIdHeader);

                if (!businessService.isUserOwnerOfBusiness(userId, businessId)) {
                    log.warn("Access denied: userId={} does not own businessId={} on path {}", userId, businessId, request.getRequestURI());
                    throw new BusinessAccessDeniedException("User " + userId + " is not authorized to access business " + businessId);
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid format for X-Business-Id or X-User-Id headers on path {}", request.getRequestURI());
                throw new IllegalArgumentException("Invalid X-Business-Id or X-User-Id header format");
            }
        }

        return true;
    }
}
