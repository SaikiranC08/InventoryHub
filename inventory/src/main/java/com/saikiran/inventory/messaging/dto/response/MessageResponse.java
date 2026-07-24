package com.saikiran.inventory.messaging.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {

    private Long conversationId;

    private Long messageId;

    private Long senderBusinessId;

    private String content;

    private LocalDateTime sentAt;
}
