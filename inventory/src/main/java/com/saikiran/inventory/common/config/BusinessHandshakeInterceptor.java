package com.saikiran.inventory.common.config;

import com.saikiran.inventory.business.service.BusinessService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
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

        String userId =  request.getHeaders().getFirst("X-User-Id");
        assert userId != null;
        Long id = Long.parseLong(userId);

        Long businessId = businessService.getBusinessIdForUser(id);

        attributes.put("businessId",businessId);


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