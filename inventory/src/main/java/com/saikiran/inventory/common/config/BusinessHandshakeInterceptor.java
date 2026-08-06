package com.saikiran.inventory.common.config;

import com.saikiran.inventory.business.service.BusinessService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Component
@Slf4j
public class BusinessHandshakeInterceptor implements HandshakeInterceptor {

    private final BusinessService businessService;

    public BusinessHandshakeInterceptor(BusinessService businessService) {
        this.businessService = businessService;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {

        // 1. Try X-Business-Id header (set by frontend STOMP connectHeaders or Kong)
        String businessHeader = request.getHeaders().getFirst("X-Business-Id");
        if (businessHeader != null) {
            try {
                attributes.put("businessId", Long.parseLong(businessHeader));
                return true;
            } catch (NumberFormatException e) {
                log.warn("Invalid X-Business-Id header value: {}", businessHeader);
            }
        }

        // 2. Try businessId query parameter
        String businessIdParam = UriComponentsBuilder.fromUri(request.getURI())
                .build().getQueryParams().getFirst("businessId");
        if (businessIdParam != null) {
            try {
                attributes.put("businessId", Long.parseLong(businessIdParam));
                return true;
            } catch (NumberFormatException e) {
                log.warn("Invalid businessId query parameter: {}", businessIdParam);
            }
        }

        // 3. Try resolving from X-User-Id header (injected by Kong)
        String userId = request.getHeaders().getFirst("X-User-Id");
        if (userId != null) {
            try {
                Long id = Long.parseLong(userId);
                Long businessId = businessService.getBusinessIdForUser(id);
                attributes.put("businessId", businessId);
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header value: {}", userId);
            } catch (Exception e) {
                log.warn("Could not resolve businessId for userId={}: {}", userId, e.getMessage());
                // Don't fail the handshake — businessId will be set later via STOMP connect headers
            }
        }

        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
    }
}