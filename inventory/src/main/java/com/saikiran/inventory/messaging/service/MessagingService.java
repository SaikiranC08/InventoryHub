package com.saikiran.inventory.messaging.service;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.common.exception.BusinessNotFoundException;
import com.saikiran.inventory.common.exception.ConversationAccessDeniedException;
import com.saikiran.inventory.common.exception.ConversationNotFoundException;
import com.saikiran.inventory.common.exception.ConversationStateNotFoundException;
import com.saikiran.inventory.common.exception.InvalidBusinessOperationException;
import com.saikiran.inventory.common.exception.MessageNotFoundException;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.ConversationSummaryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageHistoryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.entity.ConversationState;
import com.saikiran.inventory.messaging.entity.Message;
import com.saikiran.inventory.messaging.repository.ConversationRepository;
import com.saikiran.inventory.messaging.repository.ConversationStateRepository;
import com.saikiran.inventory.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

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


    private void validateParticipant(Conversation conversation, Long businessId) {
        log.debug("Validating participant businessId={} for conversationId={}", businessId, conversation.getId());

        boolean isParticipant =
                conversation.getBusinessOne().getBusinessId().equals(businessId)
                        ||
                        conversation.getBusinessTwo().getBusinessId().equals(businessId);

        if (!isParticipant) {
           log.warn("Rejected conversation access for businessId={} and conversationId={}", businessId, conversation.getId());
           throw new ConversationAccessDeniedException("You are not a participant of this conversation.");
        }
    }

    private Conversation loadConversation(Long conversationId){
         log.debug("Loading conversation conversationId={}", conversationId);
         return conversationRepository.findConversationById(conversationId)
                                             .orElseThrow(() ->
                                                     new ConversationNotFoundException("Conversation not found"));

    }


    public MessageResponse sendMessage(SendMessageRequest request, BusinessPrincipal principal) {
        log.info("Sending message from businessId={} conversationId={} receiverBusinessId={}",
                principal.getBusinessId(), request.getConversationId(), request.getReceiverBusinessId());

        Long senderBusinessId = principal.getBusinessId();

        Conversation conversation;

        // First message
        if (request.getConversationId() == null) {
            log.debug("Processing first message for senderBusinessId={} receiverBusinessId={}",
                    senderBusinessId, request.getReceiverBusinessId());

            Optional<Conversation> existingConversation =
                    conversationRepository.findConversationBetweenBusinesses(
                            request.getReceiverBusinessId(),
                            senderBusinessId
                    );

            if (existingConversation.isPresent()) {

                conversation = existingConversation.get();
                log.info("Reusing existing conversationId={} for senderBusinessId={} receiverBusinessId={}",
                        conversation.getId(), senderBusinessId, request.getReceiverBusinessId());
                conversation.setLastMessage(request.getContent());
                conversation.setLastMessageTime(request.getSentAt());
                conversation.setLastMessageSenderId(principal.getBusinessId());
            } else {
                log.info("Creating new conversation for senderBusinessId={} receiverBusinessId={}",
                        senderBusinessId, request.getReceiverBusinessId());

                Business sender = businessService.getBusinessInfoById(senderBusinessId)
                                                 .orElseThrow(() ->
                                                         new BusinessNotFoundException("Sender business not found"));

                Business receiver = businessService.getBusinessInfoById(request.getReceiverBusinessId())
                                                   .orElseThrow(() ->
                                                           new BusinessNotFoundException("Receiver business not found"));


                conversation = conversationRepository.save(
                        Conversation.builder()
                                    .lastMessage(request.getContent())
                                    .lastMessageTime(request.getSentAt())
                                    .lastMessageSenderId(sender.getBusinessId())
                                    .businessOne(sender)
                                    .businessTwo(receiver)
                                    .build()
                );
                log.info("Created conversationId={} for senderBusinessId={} receiverBusinessId={}",
                        conversation.getId(), senderBusinessId, request.getReceiverBusinessId());

                ConversationState stateOne =
                        ConversationState.builder()
                                         .conversation(conversation)
                                         .business(sender)
                                         .build();

                ConversationState stateTwo =
                        ConversationState.builder()
                                         .conversation(conversation)
                                         .business(receiver)
                                         .build();

                conversationStateRepository.saveAll(List.of(stateOne, stateTwo));
            }

        }

        // Existing conversation finding and validating participant
        else {

            conversation = loadConversation(request.getConversationId());

            validateParticipant(conversation, senderBusinessId);
        }


        Business sender = conversation.getBusinessOne()
                                      .getBusinessId()
                                      .equals(senderBusinessId)
                ? conversation.getBusinessOne()
                : conversation.getBusinessTwo();

        Business receiver = conversation.getBusinessOne()
                                        .getBusinessId()
                                        .equals(senderBusinessId)
                ? conversation.getBusinessTwo()
                : conversation.getBusinessOne();

        Message message = Message.builder()
                                 .conversation(conversation)
                                 .sender(sender)
                                 .content(request.getContent())
                                 .build();


        message = messageRepository.save(message);
        log.info("Saved message messageId={} conversationId={} senderBusinessId={}",
                message.getId(), conversation.getId(), senderBusinessId);

        MessageResponse response = MessageResponse.builder()
                                                  .messageId(message.getId())
                                                  .conversationId(conversation.getId())
                                                  .senderBusinessId(senderBusinessId)
                                                  .content(message.getContent())
                                                  .sentAt(message.getCreatedAt())
                                                  .build();

        // Send to receiver
        simpMessagingTemplate.convertAndSendToUser(
                receiver.getBusinessId()
                        .toString(),
                "/queue/messages",
                response
        );

        // Send acknowledgement to sender
        simpMessagingTemplate.convertAndSendToUser(
                sender.getBusinessId()
                      .toString(),
                "/queue/messages",
                response
        );
        log.debug("Delivered messageId={} to senderBusinessId={} and receiverBusinessId={}",
                message.getId(), sender.getBusinessId(), receiver.getBusinessId());

        return response;
    }

    public Page<MessageHistoryResponse> getConversationMessages(Long conversationId, Long businessId, int page, int size) {
        log.debug("Fetching conversation messages conversationId={} businessId={} page={} size={}",
                conversationId, businessId, page, size);

        //finding conversation
        Conversation conversation = loadConversation(conversationId);

        //validate the participant
        validateParticipant(conversation, businessId);

        //pagination start here :
        Pageable pageable = PageRequest.of(page,size);

        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId,pageable);
        log.debug("Found {} messages for conversationId={}", messages.getNumberOfElements(), conversationId);

        return messages.map(
                message -> MessageHistoryResponse.builder()
                        .messageId(message.getId())
                         .senderBusinessId(message.getSender().getBusinessId())
                         .content(message.getContent())
                         .sentAt(message.getCreatedAt())
                         .build()
        );
    }

    public List<ConversationSummaryResponse> getConversations(Long businessId) {
        log.debug("Fetching conversations for businessId={}", businessId);

        List<Conversation> conversations = conversationRepository.findByBusinessOne_BusinessIdOrBusinessTwo_BusinessIdOrderByLastMessageTimeDesc(businessId,businessId);
        log.debug("Found {} conversations for businessId={}", conversations.size(), businessId);


        return conversations.stream()
                            .map(conversation -> {

                                ConversationState state = conversationStateRepository.findByConversationAndBusiness_BusinessId(conversation,businessId)
                                        .orElseThrow(()-> new ConversationStateNotFoundException("Conversation state not found"));

                                Long unreadCount;
                                if(state.getLastReadMessage() == null){
                                    unreadCount = messageRepository.countByConversation_IdAndSender_BusinessIdNot(
                                                    conversation.getId(),
                                                    businessId);
                                }
                                else{
                                    unreadCount = messageRepository
                                            .countByConversation_IdAndIdGreaterThanAndSender_BusinessIdNot(
                                                    conversation.getId(),
                                                    state.getLastReadMessage().getId(),
                                                    businessId);
                                }


                                Business otherBusiness =
                                        conversation.getBusinessOne().getBusinessId().equals(businessId)
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

    public void markConversationAsRead(Long conversationId,Long businessId, Long lastReadMessageId) {
        log.info("Marking conversation as read conversationId={} businessId={} lastReadMessageId={}",
                conversationId, businessId, lastReadMessageId);

        Conversation conversation = loadConversation(conversationId);

        validateParticipant(conversation, businessId);

        ConversationState state = conversationStateRepository
                .findByConversationAndBusiness_BusinessId(conversation, businessId)
                .orElseThrow(() -> new ConversationStateNotFoundException("Conversation state not found."));

        Message previousMessage = state.getLastReadMessage();

        if (previousMessage != null &&
                lastReadMessageId < previousMessage.getId()) {
            log.warn("Rejected backwards read position for conversationId={} businessId={} previousMessageId={} requestedMessageId={}",
                    conversationId, businessId, previousMessage.getId(), lastReadMessageId);
            throw new InvalidBusinessOperationException(
                    "Cannot move read position backwards.");
        }

        if (previousMessage != null &&
                previousMessage.getId().equals(lastReadMessageId)) {
            log.debug("Conversation already marked read conversationId={} businessId={} messageId={}",
                    conversationId, businessId, lastReadMessageId);
            return;
        }

        Message message = messageRepository.findById(lastReadMessageId)
                                           .orElseThrow(() -> new MessageNotFoundException(
                                                   "Message not found with id: " + lastReadMessageId));

        if (!message.getConversation().getId().equals(conversationId)) {
            log.warn("Rejected read update for mismatched message conversationId={} messageId={}", conversationId, lastReadMessageId);
            throw new InvalidBusinessOperationException(
                    "Message does not belong to this conversation.");
        }

        state.setLastReadMessage(message);

        conversationStateRepository.save(state);
        log.info("Updated read position conversationId={} businessId={} lastReadMessageId={}",
                conversationId, businessId, lastReadMessageId);
    }
}