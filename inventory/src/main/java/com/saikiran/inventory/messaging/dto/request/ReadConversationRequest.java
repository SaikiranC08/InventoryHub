package com.saikiran.inventory.messaging.dto.request;

import jakarta.validation.constraints.NotNull;
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
    private Long lastReadMessageId;
}
