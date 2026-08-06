package com.saikiran.inventory.messaging.controller;

import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.common.exception.InvalidBusinessOperationException;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Conversations", description = "Messaging and conversation APIs")
public class MessagingController {

    private final MessagingService messagingService;
    private final BusinessService businessService;

    private Long resolveBusinessId(Long businessId, Long userId) {
        if (businessId != null) {
            return businessId;
        }
        if (userId != null) {
            try {
                return businessService.getBusinessIdForUser(userId);
            } catch (Exception e) {
                log.warn("Could not resolve businessId for userId={}", userId);
            }
        }
        return null;
    }

    @MessageMapping("/chat.send")
    public MessageResponse receiveMessage(SendMessageRequest request, Principal principal) {
        Long senderBusinessId = null;
        if (principal instanceof BusinessPrincipal bp) {
            senderBusinessId = bp.getBusinessId();
        }
        if (senderBusinessId == null) {
            senderBusinessId = request.getSenderBusinessId();
        }
        return messagingService.sendMessage(request, senderBusinessId);
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get conversation messages", description = "Returns paginated messages for a conversation.")
    public ResponseEntity<Page<MessageHistoryResponse>> getMessages(
            @PathVariable
            @Parameter(description = "Conversation id", required = true, example = "50")
            Long conversationId,
            @RequestHeader(value = "X-Business-Id", required = false)
            @Parameter(description = "Active business id", example = "10")
            Long businessId,
            @RequestHeader(value = "X-User-Id", required = false)
            @Parameter(description = "Authenticated user id", example = "1")
            Long userId,
            @RequestParam(defaultValue = "0")
            @Parameter(description = "Page index", example = "0")
            int page,
            @RequestParam(defaultValue = "50")
            @Parameter(description = "Page size", example = "50")
            int size
    ) {
        Long activeBusinessId = resolveBusinessId(businessId, userId);
        return ResponseEntity.ok(messagingService.getConversationMessages(conversationId, activeBusinessId, page, size));
    }

    @GetMapping
    @Operation(summary = "List conversations", description = "Returns conversation summaries for the authenticated business.")
    public ResponseEntity<List<ConversationSummaryResponse>> getConversations(
            @RequestHeader(value = "X-Business-Id", required = false)
            @Parameter(description = "Active business id", example = "10")
            Long businessId,
            @RequestHeader(value = "X-User-Id", required = false)
            @Parameter(description = "Authenticated user id", example = "1")
            Long userId) {

        Long activeBusinessId = resolveBusinessId(businessId, userId);
        if (activeBusinessId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(messagingService.getConversations(activeBusinessId));
    }

    @PatchMapping("/{conversationId}/read")
    @Operation(summary = "Mark conversation as read", description = "Marks messages up to the provided id as read.")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable
            @Parameter(description = "Conversation id", required = true, example = "50")
            Long conversationId,
            @RequestHeader(value = "X-Business-Id", required = false)
            @Parameter(description = "Active business id", example = "10")
            Long businessId,
            @RequestHeader(value = "X-User-Id", required = false)
            @Parameter(description = "Authenticated user id", example = "1")
            Long userId,
            @Valid @RequestBody ReadConversationRequest request) {

        Long activeBusinessId = resolveBusinessId(businessId, userId);
        if (activeBusinessId == null) {
            log.error("markConversationAsRead failed: activeBusinessId could not be resolved from headers");
            throw new InvalidBusinessOperationException("Active business ID could not be resolved from request headers.");
        }
        messagingService.markConversationAsRead(conversationId, activeBusinessId, request.getLastReadMessageId());
        return ResponseEntity.noContent().build();
    }
}

