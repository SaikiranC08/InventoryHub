package com.saikiran.inventory.messaging.controller;


import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.messaging.dto.request.ReadConversationRequest;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.ConversationSummaryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageHistoryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;
    private final BusinessService businessService;




    @MessageMapping("/chat.send")
    public MessageResponse receiveMessage(SendMessageRequest request, Principal principal) throws AccessDeniedException {
        return messagingService.sendMessage(request,(BusinessPrincipal) principal);
    }

    @MessageMapping("/{conversationId}/messages")
    public ResponseEntity<Page<MessageHistoryResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) throws AccessDeniedException {

        Long businessId =  businessService.getBusinessIdForUser(userId);

        return ResponseEntity.ok(messagingService.getConversationMessages(conversationId,businessId,page,size));

    }

    @GetMapping
    public List<ConversationSummaryResponse> getConversations(
            @RequestHeader("X-User-Id") Long userId) {

        Long businessId = businessService.getBusinessIdForUser(userId);

        return messagingService.getConversations(businessId);
    }

    @PatchMapping("/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ReadConversationRequest request) throws AccessDeniedException {

        Long businessId = businessService.getBusinessIdForUser(userId);

        messagingService.markConversationAsRead(conversationId, businessId, request.getLastReadMessageId());

        return ResponseEntity.noContent().build();
    }
}
