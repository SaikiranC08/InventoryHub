package com.saikiran.inventory.messaging.entity;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_business_id")
    private Business sender;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageType type = MessageType.USER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_request_id")
    private StockRequest stockRequest;

    @Column(name = "client_correlation_id")
    private String clientCorrelationId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
