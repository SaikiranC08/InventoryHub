package com.saikiran.inventory.common.config;


import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@AllArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final BusinessHandshakeHandler businessHandshakeHandler;
    private final BusinessHandshakeInterceptor businessHandshakeInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry stompEndpointRegistry){
        stompEndpointRegistry.addEndpoint("/ws")
                .addInterceptors(businessHandshakeInterceptor)
                .setHandshakeHandler(businessHandshakeHandler);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){

        //telling the spring that this endpoint gets send to application means controller
        registry.setApplicationDestinationPrefixes("/app");

        //any prefixes match then it goes to broker
        registry.enableSimpleBroker("/topics","/queue");
    }
}
