package com.saikiran.inventory.messaging.dto.request;


import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "Conversation id", example = "50")
    private Long conversationId;
    @Schema(description = "Receiver business id", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private Long receiverBusinessId;
    @Schema(description = "Message content", requiredMode = Schema.RequiredMode.REQUIRED, example = "Hello")
    private String content;
    @Schema(hidden = true)
    private LocalDateTime sentAt;
}
