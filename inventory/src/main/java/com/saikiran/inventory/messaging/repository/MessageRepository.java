package com.saikiran.inventory.messaging.repository;

import com.saikiran.inventory.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
}