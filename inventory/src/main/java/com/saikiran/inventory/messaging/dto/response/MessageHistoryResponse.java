package com.saikiran.inventory.messaging.dto.response;

import com.saikiran.inventory.inventory.dto.StockRequestResponse;
import com.saikiran.inventory.messaging.entity.MessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageHistoryResponse {

    @Schema(description = "Message id", example = "500")
    private Long messageId;

    @Schema(description = "Sender business id", example = "10")
    private Long senderBusinessId;

    @Schema(description = "Message content", example = "Hello")
    private String content;

    @Schema(description = "Message type", example = "USER")
    private MessageType type;

    @Schema(description = "Linked stock request details")
    private StockRequestResponse stockRequest;

    @Schema(description = "Client correlation id", example = "uuid-1234")
    private String clientCorrelationId;

    @Schema(description = "Sent time", example = "2026-07-30T22:55:47")
    private LocalDateTime sentAt;
}
