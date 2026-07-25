package com.saikiran.inventory.messaging.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryResponse {

    private Long conversationId;

    private Long otherBusinessId;

    private String otherBusinessName;

    private String lastMessage;

    private LocalDateTime lastMessageTime;

    private Long lastMessageSenderId;
}
