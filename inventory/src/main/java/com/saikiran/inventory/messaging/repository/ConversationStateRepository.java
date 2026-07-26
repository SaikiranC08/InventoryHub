package com.saikiran.inventory.messaging.repository;

import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.entity.ConversationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ConversationStateRepository extends JpaRepository<ConversationState, Long> {


    Optional<ConversationState> findByConversationAndBusiness_BusinessId(Conversation conversation, Long businessId);
}
