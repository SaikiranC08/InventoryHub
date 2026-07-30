package com.saikiran.inventory.messaging.dto.request;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReadConversationRequest {

    @NotNull(message = "Last message read id is required")
    @Schema(description = "Last read message id", requiredMode = Schema.RequiredMode.REQUIRED, example = "500")
    private Long lastReadMessageId;
}
