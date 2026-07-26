package com.saikiran.inventory.messaging.entity;


import com.saikiran.inventory.business.entity.Business;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "business_one_id")
    private Business businessOne;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "business_two_id")
    private Business businessTwo;

    private String lastMessage;

    private Long lastMessageId;

    private Long lastMessageSenderId;

    @CreationTimestamp
    private LocalDateTime lastMessageTime;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
