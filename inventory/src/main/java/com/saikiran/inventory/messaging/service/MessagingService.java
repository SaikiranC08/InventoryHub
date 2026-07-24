package com.saikiran.inventory.messaging.service;

import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.repository.ConversationRepository;
import com.saikiran.inventory.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final BusinessService businessService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    public MessageResponse sendMessage(SendMessageRequest request, BusinessPrincipal principal) {

        Long senderBusinessId = principal.getBusinessId();

        Conversation conversation;

        if (request.getConversationId() == null) {

            // find existing conversation

            // create if absent

        } else {

            // load conversation

        }

        // create message

        // save message

        // build response

        // send to sender

        // send to receiver

        return response;
    }
}
