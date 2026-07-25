package com.saikiran.inventory.messaging.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SendMessageRequest {
    private Long conversationId;
    private Long receiverBusinessId;
    private String content;
    private LocalDateTime sentAt;
}
