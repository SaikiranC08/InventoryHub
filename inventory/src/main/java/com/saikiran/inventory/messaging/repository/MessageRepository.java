package com.saikiran.inventory.messaging.repository;

import com.saikiran.inventory.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    Long countByConversation_IdAndIdGreaterThanAndSender_BusinessIdNot(Long conversationId,Long lastReadMessageId,Long businessId);

    Long countByConversation_IdAndSender_BusinessIdNot(Long id, Long businessId);
}