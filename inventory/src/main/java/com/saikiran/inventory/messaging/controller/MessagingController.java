package com.saikiran.inventory.messaging.controller;


import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class MessagingController {

    @MessageMapping("/chat")
    public void receiveMessage(SendMessageRequest request){


    }
}
