package com.saikiran.inventory.messaging.service;


import com.saikiran.inventory.business.entity.Business;
import com.saikiran.inventory.business.mapper.businessResponseMapper;
import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.config.BusinessPrincipal;
import com.saikiran.inventory.common.exception.BusinessNotFoundException;
import com.saikiran.inventory.messaging.dto.request.SendMessageRequest;
import com.saikiran.inventory.messaging.dto.response.ConversationSummaryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageHistoryResponse;
import com.saikiran.inventory.messaging.dto.response.MessageResponse;
import com.saikiran.inventory.messaging.entity.Conversation;
import com.saikiran.inventory.messaging.entity.Message;
import com.saikiran.inventory.messaging.repository.ConversationRepository;
import com.saikiran.inventory.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final BusinessService businessService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    private void validateParticipant(Conversation conversation, Long businessId) throws AccessDeniedException {

        boolean isParticipant =
                conversation.getBusinessOne().getBusinessId().equals(businessId)
                        ||
                        conversation.getBusinessTwo().getBusinessId().equals(businessId);

        if (!isParticipant) {
            throw new AccessDeniedException("You are not a participant of this conversation.");
        }
    }

    private Conversation loadConversation(Long conversationId){
         return conversationRepository.findConversationById(conversationId)
                                             .orElseThrow(() ->
                                                     new RuntimeException("Conversation not found"));

    }


    public MessageResponse sendMessage(SendMessageRequest request, BusinessPrincipal principal) throws AccessDeniedException {

        Long senderBusinessId = principal.getBusinessId();

        Conversation conversation;

        // First message
        if (request.getConversationId() == null) {

            Optional<Conversation> existingConversation =
                    conversationRepository.findConversationBetweenBusinesses(
                            request.getReceiverBusinessId(),
                            senderBusinessId
                    );

            if (existingConversation.isPresent()) {

                conversation = existingConversation.get();
                conversation.setLastMessage(request.getContent());
                conversation.setLastMessageTime(request.getSentAt());
                conversation.setLastMessageSenderId(principal.getBusinessId());
            } else {

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

        return response;
    }

    public Page<MessageHistoryResponse> getConversationMessages(Long conversationId, Long businessId, int page, int size) throws AccessDeniedException {

        //finding conversation
        Conversation conversation = loadConversation(conversationId);

        //validate the participant
        validateParticipant(conversation, businessId);

        //pagination start here :
        Pageable pageable = PageRequest.of(page,size);

        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId,pageable);

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

        List<Conversation> conversations = conversationRepository.findByBusinessOne_BusinessIdOrBusinessTwo_BusinessIdOrderByLastMessageTimeDesc(businessId,businessId);

        return conversations.stream()
                            .map(conversation -> {

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
                                                                  .build();
                            })
                            .toList();
    }
}