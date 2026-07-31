package com.saikiran.inventory.messaging.controller;


import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.messaging.dto.request.ReadConversationRequest;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.ConversationSummaryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageHistoryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.service.MessagingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversations", description = "Messaging and conversation APIs")
public class MessagingController {

    private final MessagingService messagingService;
    private final BusinessService businessService;




    @MessageMapping("/chat.send")
    public MessageResponse receiveMessage(SendMessageRequest request, Principal principal) {
        return messagingService.sendMessage(request,(BusinessPrincipal) principal);
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get conversation messages", description = "Returns paginated messages for a conversation.")
    public ResponseEntity<Page<MessageHistoryResponse>> getMessages(
            @PathVariable
            @Parameter(description = "Conversation id", required = true, example = "50")
            Long conversationId,
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId,
            @RequestParam(defaultValue = "0")
            @Parameter(description = "Page index", example = "0")
            int page,
            @RequestParam(defaultValue = "20")
            @Parameter(description = "Page size", example = "20")
            int size
    ) {

        return ResponseEntity.ok(messagingService.getConversationMessages(conversationId,businessId,page,size));

    }

    @GetMapping
    @Operation(summary = "List conversations", description = "Returns conversation summaries for the authenticated business.")
    public List<ConversationSummaryResponse> getConversations(
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId) {

        return messagingService.getConversations(businessId);
    }

    @PatchMapping("/{conversationId}/read")
    @Operation(summary = "Mark conversation as read", description = "Marks messages up to the provided id as read.")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable
            @Parameter(description = "Conversation id", required = true, example = "50")
            Long conversationId,
            @RequestHeader("X-Business-Id")
            @Parameter(description = "Active business id", required = true, example = "10")
            Long businessId,
            @RequestHeader("X-User-Id")
            @Parameter(description = "Authenticated user id", required = true, example = "1")
            Long userId,
            @Valid @RequestBody ReadConversationRequest request) {

        messagingService.markConversationAsRead(conversationId, businessId, request.getLastReadMessageId());

        return ResponseEntity.noContent().build();
    }
}
