package com.saikiran.inventory.messaging.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageHistoryResponse {

    private Long messageId;

    private Long senderBusinessId;

    private String content;

    private LocalDateTime sentAt;
}
