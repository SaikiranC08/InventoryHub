package com.saikiran.inventory.messaging.dto.response;

import lombok.*;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryResponse {

    @Schema(description = "Conversation id", example = "50")
    private Long conversationId;

    @Schema(description = "Other business id", example = "20")
    private Long otherBusinessId;

    @Schema(description = "Other business name", example = "ABC Traders")
    private String otherBusinessName;

    @Schema(description = "Last message", example = "Hello")
    private String lastMessage;

    @Schema(description = "Last message time", example = "2026-07-30T22:55:47")
    private LocalDateTime lastMessageTime;

    @Schema(description = "Last message sender business id", example = "10")
    private Long lastMessageSenderId;

    @Schema(description = "Unread message count", example = "3")
    private Long unreadCount;
}
