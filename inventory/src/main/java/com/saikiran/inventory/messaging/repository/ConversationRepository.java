package com.saikiran.inventory.messaging.repository;

import com.saikiran.inventory.messaging.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation,Long> {

    @Query("""
        SELECT c
        FROM Conversation c
        WHERE
        (
            c.businessOne.businessId = :businessOneId
            AND
            c.businessTwo.businessId = :businessTwoId
        )
        OR
        (
            c.businessOne.businessId = :businessTwoId
            AND
            c.businessTwo.businessId = :businessOneId
        )
        """)
    Optional<Conversation> findConversationBetweenBusinesses(
            Long businessOneId,
            Long businessTwoId
    );

    Optional<Conversation> findConversationById(Long id);

    List<Conversation> findByBusinessOne_BusinessIdOrBusinessTwo_BusinessIdOrderByLastMessageTimeDesc(Long businessOne,Long businessTwo);
}
