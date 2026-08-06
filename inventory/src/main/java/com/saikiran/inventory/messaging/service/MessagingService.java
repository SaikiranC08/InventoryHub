package com.saikiran.inventory.messaging.service;

import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.common.exception.*;
import com.saikiran.inventory.inventory.entities.internal.StockRequest;
import com.saikiran.inventory.inventory.mapper.InventoryMapper;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.ConversationSummaryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageHistoryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.entity.ConversationState;
import com.saikiran.inventory.messaging.entity.Message;
import com.saikiran.inventory.messaging.entity.MessageType;
import com.saikiran.inventory.messaging.repository.ConversationRepository;
import com.saikiran.inventory.messaging.repository.ConversationStateRepository;
import com.saikiran.inventory.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final BusinessService businessService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ConversationStateRepository conversationStateRepository;
    private final InventoryMapper inventoryMapper;

    private void validateParticipant(Conversation conversation, Long businessId) {
        log.debug("Validating participant businessId={} for conversationId={}", businessId, conversation.getId());
        boolean isParticipant = conversation.getBusinessOne().getBusinessId().equals(businessId)
                || conversation.getBusinessTwo().getBusinessId().equals(businessId);
        if (!isParticipant) {
            log.warn("Rejected conversation access for businessId={} and conversationId={}", businessId, conversation.getId());
            throw new ConversationAccessDeniedException("You are not a participant of this conversation.");
        }
    }

    private Conversation loadConversation(Long conversationId) {
        log.debug("Loading conversation conversationId={}", conversationId);
        return conversationRepository.findConversationById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found"));
    }

    @Transactional
    public Conversation getOrCreateConversation(Long senderBusinessId, Long receiverBusinessId) {
        if (senderBusinessId == null || receiverBusinessId == null) {
            throw new InvalidBusinessOperationException("Both sender and receiver business IDs are required.");
        }

        if (senderBusinessId.equals(receiverBusinessId)) {
            throw new InvalidBusinessOperationException("You cannot start a conversation with your own business.");
        }

        // Normalize business pair order: businessOne is min(id), businessTwo is max(id)
        Long b1Id = Math.min(senderBusinessId, receiverBusinessId);
        Long b2Id = Math.max(senderBusinessId, receiverBusinessId);

        Optional<Conversation> existingConversation = conversationRepository
                .findByBusinessOne_BusinessIdAndBusinessTwo_BusinessId(b1Id, b2Id);

        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        Business busOne = businessService.getBusinessInfoById(b1Id)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found for id: " + b1Id));
        Business busTwo = businessService.getBusinessInfoById(b2Id)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found for id: " + b2Id));

        try {
            Conversation conversation = conversationRepository.saveAndFlush(
                    Conversation.builder()
                            .lastMessage("Conversation started")
                            .lastMessageTime(LocalDateTime.now())
                            .lastMessageSenderId(senderBusinessId)
                            .businessOne(busOne)
                            .businessTwo(busTwo)
                            .build()
            );

            ConversationState stateOne = ConversationState.builder()
                    .conversation(conversation)
                    .business(busOne)
                    .build();
            ConversationState stateTwo = ConversationState.builder()
                    .conversation(conversation)
                    .business(busTwo)
                    .build();

            conversationStateRepository.saveAll(List.of(stateOne, stateTwo));
            return conversation;
        } catch (DataIntegrityViolationException e) {
            log.info("Concurrent conversation creation caught by unique constraint; returning existing pair");
            return conversationRepository
                    .findByBusinessOne_BusinessIdAndBusinessTwo_BusinessId(b1Id, b2Id)
                    .orElseThrow(() -> e);
        }
    }

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderBusinessId) {
        if (senderBusinessId == null) {
            senderBusinessId = request.getSenderBusinessId();
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new InvalidBusinessOperationException("Message content cannot be empty.");
        }

        Conversation conversation;
        if (request.getConversationId() == null) {
            if (senderBusinessId == null || request.getReceiverBusinessId() == null) {
                throw new InvalidBusinessOperationException("Sender and receiver business IDs are required to start a conversation.");
            }
            conversation = getOrCreateConversation(senderBusinessId, request.getReceiverBusinessId());
        } else {
            conversation = loadConversation(request.getConversationId());
            if (senderBusinessId == null) {
                if (request.getReceiverBusinessId() != null) {
                    senderBusinessId = conversation.getBusinessOne().getBusinessId().equals(request.getReceiverBusinessId())
                            ? conversation.getBusinessTwo().getBusinessId()
                            : conversation.getBusinessOne().getBusinessId();
                } else {
                    senderBusinessId = conversation.getBusinessOne().getBusinessId();
                }
            }
            validateParticipant(conversation, senderBusinessId);
        }

        log.info("Sending message from businessId={} conversationId={} receiverBusinessId={}",
                senderBusinessId, conversation.getId(), request.getReceiverBusinessId());

        Business sender = conversation.getBusinessOne().getBusinessId().equals(senderBusinessId)
                ? conversation.getBusinessOne()
                : conversation.getBusinessTwo();
        Business receiver = conversation.getBusinessOne().getBusinessId().equals(senderBusinessId)
                ? conversation.getBusinessTwo()
                : conversation.getBusinessOne();

        MessageType type = request.getType() != null ? request.getType() : MessageType.USER;

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent().trim())
                .type(type)
                .clientCorrelationId(request.getClientCorrelationId())
                .build();

        // 1. Durable write to Database FIRST
        message = messageRepository.save(message);

        conversation.setLastMessage(message.getContent());
        conversation.setLastMessageTime(message.getCreatedAt());
        conversation.setLastMessageSenderId(senderBusinessId);
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);

        // Automatically update sender's ConversationState pointer so sender never gets an unread badge on their own message
        markConversationAsReadInternal(conversation, senderBusinessId, message.getId());

        MessageResponse response = MessageResponse.builder()
                .messageId(message.getId())
                .conversationId(conversation.getId())
                .senderBusinessId(senderBusinessId)
                .content(message.getContent())
                .type(message.getType())
                .clientCorrelationId(message.getClientCorrelationId())
                .sentAt(message.getCreatedAt())
                .build();

        // 2. STOMP Push to BOTH sender and receiver AFTER successful DB write
        try {
            simpMessagingTemplate.convertAndSendToUser(receiver.getBusinessId().toString(), "/queue/messages", response);
            simpMessagingTemplate.convertAndSendToUser(sender.getBusinessId().toString(), "/queue/messages", response);
        } catch (Exception e) {
            log.warn("WebSocket push failed for messageId={}, recipient offline or broker hiccup: {}", message.getId(), e.getMessage());
        }

        return response;
    }

    @Transactional
    public Page<MessageHistoryResponse> getConversationMessages(Long conversationId, Long businessId, int page, int size) {
        log.debug("Fetching conversation messages conversationId={} businessId={} page={} size={}",
                conversationId, businessId, page, size);

        Conversation conversation = loadConversation(conversationId);
        if (businessId != null) {
            validateParticipant(conversation, businessId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        // Auto-mark served messages as read for businessId when fetching page 0
        if (businessId != null && page == 0 && !messages.isEmpty()) {
            Message latestMessageInPage = messages.getContent().get(0);
            try {
                markConversationAsReadInternal(conversation, businessId, latestMessageInPage.getId());
            } catch (Exception e) {
                log.warn("Auto mark-as-read on fetch messages failed: {}", e.getMessage());
            }
        }

        return messages.map(message -> MessageHistoryResponse.builder()
                .messageId(message.getId())
                .senderBusinessId(message.getSender().getBusinessId())
                .content(message.getContent())
                .type(message.getType() != null ? message.getType() : MessageType.USER)
                .stockRequest(message.getStockRequest() != null ? inventoryMapper.toResponse(message.getStockRequest()) : null)
                .clientCorrelationId(message.getClientCorrelationId())
                .sentAt(message.getCreatedAt())
                .build()
        );
    }

    @Transactional
    public List<ConversationSummaryResponse> getConversations(Long businessId) {
        log.debug("Fetching conversations for businessId={}", businessId);
        List<Conversation> conversations = conversationRepository
                .findByBusinessOne_BusinessIdOrBusinessTwo_BusinessIdOrderByLastMessageTimeDesc(businessId, businessId);

        return conversations.stream()
                .map(conversation -> {
                    ConversationState state = conversationStateRepository
                            .findByConversationAndBusiness_BusinessId(conversation, businessId)
                            .orElseGet(() -> {
                                Business bus = businessService.getBusinessInfoById(businessId).orElse(null);
                                ConversationState newState = ConversationState.builder()
                                        .conversation(conversation)
                                        .business(bus)
                                        .build();
                                return conversationStateRepository.save(newState);
                            });

                    Long unreadCount;
                    if (state.getLastReadMessage() == null) {
                        unreadCount = messageRepository.countByConversation_IdAndSender_BusinessIdNot(
                                conversation.getId(), businessId);
                    } else {
                        unreadCount = messageRepository
                                .countByConversation_IdAndIdGreaterThanAndSender_BusinessIdNot(
                                        conversation.getId(), state.getLastReadMessage().getId(), businessId);
                    }

                    Business otherBusiness = conversation.getBusinessOne().getBusinessId().equals(businessId)
                            ? conversation.getBusinessTwo()
                            : conversation.getBusinessOne();

                    return ConversationSummaryResponse.builder()
                            .conversationId(conversation.getId())
                            .otherBusinessId(otherBusiness.getBusinessId())
                            .otherBusinessName(otherBusiness.getBusinessName())
                            .lastMessage(conversation.getLastMessage())
                            .lastMessageTime(conversation.getLastMessageTime())
                            .lastMessageSenderId(conversation.getLastMessageSenderId())
                            .unreadCount(unreadCount)
                            .build();
                })
                .toList();
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long businessId, Long lastReadMessageId) {
        log.info("Marking conversation as read conversationId={} businessId={} lastReadMessageId={}",
                conversationId, businessId, lastReadMessageId);

        Conversation conversation = loadConversation(conversationId);
        validateParticipant(conversation, businessId);

        markConversationAsReadInternal(conversation, businessId, lastReadMessageId);
    }

    private void markConversationAsReadInternal(Conversation conversation, Long businessId, Long lastReadMessageId) {
        Business bus = businessService.getBusinessInfoById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found for id: " + businessId));

        ConversationState state = conversationStateRepository
                .findByConversationAndBusiness_BusinessId(conversation, businessId)
                .orElseGet(() -> ConversationState.builder()
                        .conversation(conversation)
                        .business(bus)
                        .build());

        Message previousMessage = state.getLastReadMessage();
        if (previousMessage != null && lastReadMessageId <= previousMessage.getId()) {
            return;
        }

        Message message = messageRepository.findById(lastReadMessageId)
                .orElseThrow(() -> new MessageNotFoundException("Message not found with id: " + lastReadMessageId));

        if (!message.getConversation().getId().equals(conversation.getId())) {
            throw new InvalidBusinessOperationException("Message does not belong to this conversation.");
        }

        state.setLastReadMessage(message);
        conversationStateRepository.save(state);
        log.info("Updated ConversationState lastReadMessageId={} for businessId={} conversationId={}",
                lastReadMessageId, businessId, conversation.getId());
    }
}