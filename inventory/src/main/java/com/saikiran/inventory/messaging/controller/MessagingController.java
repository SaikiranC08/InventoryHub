package com.saikiran.inventory.messaging.controller;


import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.service.MessagingService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@AllArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @MessageMapping("/chat.send")
    public void receiveMessage(SendMessageRequest request, Principal principal){
        messagingService.sendMessage(request,(BusinessPrincipal) principal);
    }
}
