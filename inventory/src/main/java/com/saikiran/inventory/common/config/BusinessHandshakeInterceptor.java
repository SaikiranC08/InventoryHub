package com.saikiran.inventory.common.config;

import com.saikiran.inventory.business.service.BusinessService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

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

        String businessHeader = request.getHeaders().getFirst("X-Business-Id");
        if(businessHeader != null){
            attributes.put("businessId", Long.parseLong(businessHeader));
            return true;
        }

        String userId =  request.getHeaders().getFirst("X-User-Id");
        if(userId == null) {
            return true; // let other layers handle missing userId
        }
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