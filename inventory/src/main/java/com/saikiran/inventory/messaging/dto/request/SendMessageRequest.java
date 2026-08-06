package com.saikiran.inventory.messaging.dto.request;

import com.saikiran.inventory.messaging.entity.MessageType;
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

    @Schema(description = "Sender business id", example = "10")
    private Long senderBusinessId;

    @Schema(description = "Receiver business id", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private Long receiverBusinessId;

    @Schema(description = "Message content", requiredMode = Schema.RequiredMode.REQUIRED, example = "Hello")
    private String content;

    @Schema(description = "Message type", example = "USER")
    private MessageType type;

    @Schema(description = "Linked stock request id", example = "10")
    private Long stockRequestId;

    @Schema(description = "Client correlation id for deduplication", example = "uuid-1234")
    private String clientCorrelationId;

    @Schema(hidden = true)
    private LocalDateTime sentAt;
}
